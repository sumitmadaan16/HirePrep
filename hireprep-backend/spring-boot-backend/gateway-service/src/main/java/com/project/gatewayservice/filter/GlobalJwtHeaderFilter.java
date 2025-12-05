package com.project.gatewayservice.filter;

import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

@Configuration
public class GlobalJwtHeaderFilter {

    @Bean
    public GlobalFilter customGlobalFilter() {
        return (exchange, chain) -> ReactiveSecurityContextHolder.getContext()
                .map(securityContext -> securityContext.getAuthentication())
                .flatMap(authentication -> {
                    if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
                        String username = jwt.getSubject();
                        String role = jwt.getClaim("role");
                        var mutatedRequest = exchange.getRequest().mutate()
                                .header("X-User", username != null ? username : "")
                                .header("X-Role", role != null ? role : "")
                                .build();

                        return chain.filter(exchange.mutate().request(mutatedRequest).build());
                    }
                    return chain.filter(exchange);
                })
                .switchIfEmpty(chain.filter(exchange));
    }
}