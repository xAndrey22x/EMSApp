package com.energyChat.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**").
                allowedOrigins("http://localhost:3000", "http://localhost:5173",
                        "http://localhost:5174", "http://localhost:5050", "http://energy-app.localhost").
                allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "HEAD").
                allowedHeaders("*").
                allowCredentials(true);
    }

}
