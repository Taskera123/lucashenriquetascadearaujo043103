package com.seplag.artistalbum.config.security;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    public static final String SECURITY_SCHEME_NAME = "bearerAuth";

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("API PARA SELETIVO SEPLAG/MT 2026")
                        .version("1.0")
                        .description("API SIMULANDO UM GERENCIAMENTO DE ARTISTAS E SEUS ALBUNS")
                        .contact(new Contact()
                                .name("LUCAS HENRIQUE TASCA DE ARAUJO")
                                .email("tascalucas6@gmail.com")))
                .servers(List.of(
                        new Server().url("http://localhost:8080/albumartistaapi").description("Servidor Local"),
                        new Server().url("http://localhost:3001").description("Interface Web Local")
                ))// 1) Declara o esquema de segurança (Bearer JWT)
                .components(new Components().addSecuritySchemes(SECURITY_SCHEME_NAME,
                        new SecurityScheme()
                                .name(SECURITY_SCHEME_NAME)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                ))
                // 2) Aplica segurança por padrão em todas as operações
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME));
    }
}
