package com.docservice.careerhub.config;

import com.docservice.careerhub.service.DocTemplateCompiler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.SchedulingConfigurer;
import org.springframework.scheduling.config.IntervalTask;
import org.springframework.scheduling.config.ScheduledTaskRegistrar;

import java.time.Duration;

@Configuration
public class SchedulingConfig implements SchedulingConfigurer {

    @Autowired
    private AppProperties appProperties;

    @Autowired
    private DocTemplateCompiler docTemplateCompiler;

    @Override
    public void configureTasks(ScheduledTaskRegistrar registrar) {
        registrar.addFixedDelayTask(new IntervalTask(
                docTemplateCompiler::compilePending,
                Duration.ofMillis(appProperties.getDocTemplatesCompilePollMs()),
                Duration.ofMillis(appProperties.getDocTemplatesCompileInitialMs())));
    }
}
