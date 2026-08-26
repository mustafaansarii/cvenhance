package com.docservice.careerhub.audit;

import com.docservice.careerhub.dto.constants.AuditAction;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Auditable {

    AuditAction action();

    String actor() default "";

    String targetType() default "";

    String targetId() default "";

    String detail() default "";
}
