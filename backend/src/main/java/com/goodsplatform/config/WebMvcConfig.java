package com.goodsplatform.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // uploads 폴더의 절대 경로를 가져옴
        Path uploadDir = Paths.get("uploads").toAbsolutePath().normalize();

        // /uploads/** 로 들어오는 요청을 로컬 uploads/ 디렉토리로 매핑 (file:/// URI 스킴 사용)
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:///" + uploadDir.toString() + "/");
    }
}
