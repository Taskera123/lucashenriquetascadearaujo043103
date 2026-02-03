package com.seplag.artistalbum.config.ratelimit;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class TaxaLimiteWebConfig implements WebMvcConfigurer {

    private final TaxaLimiteInterceptor taxaLimiteInterceptor;

    public TaxaLimiteWebConfig(TaxaLimiteInterceptor taxaLimiteInterceptor) {
        this.taxaLimiteInterceptor = taxaLimiteInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(taxaLimiteInterceptor)
                .addPathPatterns("/v1/**")
                .excludePathPatterns("/ws/**");
    }
}
