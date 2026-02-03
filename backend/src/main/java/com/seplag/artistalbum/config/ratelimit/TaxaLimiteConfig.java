package com.seplag.artistalbum.config.ratelimit;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
public class TaxaLimiteConfig {

    @Bean
    public Bucket criarNovoBucket() {
        // 10 requisições por minuto
        return Bucket.builder()
//                .addLimit(Bandwidth.classic(10000, Refill.intervally(10000, Duration.ofMinutes(1))))
                .addLimit(Bandwidth.classic(10, Refill.intervally(10, Duration.ofMinutes(1))))
                .build();
    }
}

