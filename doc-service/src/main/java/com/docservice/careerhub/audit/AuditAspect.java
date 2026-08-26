package com.docservice.careerhub.audit;

import com.docservice.careerhub.service.AuditService;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.expression.MethodBasedEvaluationContext;
import org.springframework.core.DefaultParameterNameDiscoverer;
import org.springframework.core.ParameterNameDiscoverer;
import org.springframework.expression.Expression;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;

@Aspect
@Component
public class AuditAspect {

    private static final Logger logger = LoggerFactory.getLogger(AuditAspect.class);

    private final AuditService auditService;
    private final ExpressionParser parser = new SpelExpressionParser();
    private final ParameterNameDiscoverer parameterNameDiscoverer = new DefaultParameterNameDiscoverer();

    public AuditAspect(AuditService auditService) {
        this.auditService = auditService;
    }

    @AfterReturning(pointcut = "@annotation(auditable)", returning = "result")
    public void record(JoinPoint joinPoint, Auditable auditable, Object result) {
        try {
            Method method = ((MethodSignature) joinPoint.getSignature()).getMethod();
            MethodBasedEvaluationContext context = new MethodBasedEvaluationContext(
                    joinPoint.getTarget(), method, joinPoint.getArgs(), parameterNameDiscoverer);
            context.setVariable("result", result);

            String actor = auditable.actor().isBlank()
                    ? currentPrincipal()
                    : evaluate(auditable.actor(), context);
            String targetType = auditable.targetType().isBlank() ? null : auditable.targetType();
            String targetId = evaluate(auditable.targetId(), context);
            String detail = evaluate(auditable.detail(), context);

            auditService.record(auditable.action(), actor, targetType, targetId, detail);
        } catch (Exception e) {
            logger.warn("Audit for {} failed", auditable.action(), e);
        }
    }

    private String evaluate(String expression, MethodBasedEvaluationContext context) {
        if (expression == null || expression.isBlank()) {
            return null;
        }
        try {
            Expression parsed = parser.parseExpression(expression);
            Object value = parsed.getValue(context);
            return value != null ? value.toString() : null;
        } catch (Exception e) {
            logger.warn("Failed to evaluate audit expression '{}'", expression, e);
            return null;
        }
    }

    private String currentPrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }
        String name = auth.getName();
        return "anonymousUser".equals(name) ? null : name;
    }
}
