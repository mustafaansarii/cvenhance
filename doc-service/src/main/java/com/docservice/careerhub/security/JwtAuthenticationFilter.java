package com.docservice.careerhub.security;

import com.docservice.careerhub.service.AuthService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Objects;

/**
 * Authenticates a request from the access-token cookie (or Bearer header): validates the JWT,
 * confirms the session still exists, and sets the security context. The session id (jti) is
 * carried as the authentication credentials so logout can revoke exactly this device.
 */
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final AuthService authService;
    private final String cookieName;

    public JwtAuthenticationFilter(JwtService jwtService, AuthService authService, String cookieName) {
        this.jwtService = jwtService;
        this.authService = authService;
        this.cookieName = cookieName;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String token = fromCookie(request);
        if (Objects.isNull(token)) {
            token = fromAuthorizationHeader(request);
        }
        if (Objects.nonNull(token) && jwtService.valid(token)
                && Objects.isNull(SecurityContextHolder.getContext().getAuthentication())) {
            String tokenId = jwtService.getTokenId(token);
            if (authService.isSessionActive(tokenId)) {
                authenticate(request, token, tokenId);
            }
        }
        chain.doFilter(request, response);
    }

    private void authenticate(HttpServletRequest request, String token, String tokenId) {
        List<SimpleGrantedAuthority> authorities = jwtService.getRoles(token).stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                .toList();
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(jwtService.getEmail(token), tokenId, authorities);
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    private String fromCookie(HttpServletRequest request) {
        if (Objects.isNull(request.getCookies())) {
            return null;
        }
        for (Cookie cookie : request.getCookies()) {
            if (cookieName.equals(cookie.getName()) && Objects.nonNull(cookie.getValue()) && !cookie.getValue().isBlank()) {
                return cookie.getValue();
            }
        }
        return null;
    }

    private String fromAuthorizationHeader(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (Objects.nonNull(header) && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
