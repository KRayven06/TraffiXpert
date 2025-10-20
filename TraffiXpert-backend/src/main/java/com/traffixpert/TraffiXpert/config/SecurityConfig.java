package com.traffixpert.TraffiXpert.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer; // For csrf(AbstractHttpConfigurer::disable)
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration // Marks this class as a source of bean definitions
@EnableWebSecurity // Enables Spring Security's web security support
public class SecurityConfig {

    @Bean // Defines a bean that Spring manages
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Apply CORS configuration defined below
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // Disable CSRF protection - common for stateless APIs (ensure you understand implications if using sessions)
            .csrf(AbstractHttpConfigurer::disable)
            // Configure authorization rules
            .authorizeHttpRequests(authz -> authz
                // Allow unauthenticated access to H2 console (for development)
                .requestMatchers("/h2-console/**").permitAll()
                // Allow unauthenticated access to all API endpoints under /api/
                .requestMatchers("/api/**").permitAll()
                // Any other request requires authentication (though we've permitted most relevant ones)
                .anyRequest().authenticated()
            )
             // Required for H2 console frames to work
            .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.sameOrigin()));

         // Note: Default login form is implicitly enabled if not explicitly configured otherwise,
         // but permitting /api/** means it won't be triggered for API calls.

        return http.build();
    }

    @Bean // Defines the global CORS configuration
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Allow requests from your Next.js frontend origin
        configuration.setAllowedOrigins(List.of("http://localhost:9002"));
        // Allow common HTTP methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        // Allow common headers
        configuration.setAllowedHeaders(List.of("*")); // Allows all headers, including Authorization later
        // Allow credentials (like cookies, authorization headers) - might be needed later
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Apply this configuration to all paths ("/**")
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
