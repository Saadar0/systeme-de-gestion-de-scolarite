package com.ensab.service.de.scolarite.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springdoc.core.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Service de scolarite API")
                        .version("1.0")
                        .description("API documentation for Service de scolarite project"));
    }

    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi.builder()
                .group("service-de-scolarite")
                .packagesToScan("com.ensab.service.de.scolarite.controller")
                .build();
    }
}