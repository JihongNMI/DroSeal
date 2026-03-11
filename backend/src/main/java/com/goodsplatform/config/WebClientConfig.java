package com.goodsplatform.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Bean(name = "geminiWebClient")
    public WebClient geminiWebClient() {
        return WebClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com")
                .build();
    }

    @Bean(name = "fastApiWebClient")
    public WebClient fastApiWebClient() {
        return WebClient.builder()
                .baseUrl("http://localhost:8000")
                .build();
    }
}