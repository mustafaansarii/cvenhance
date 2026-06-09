package com.docservice.careerhub.security;

import com.docservice.careerhub.config.AuthProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

/** Issues and parses HS256 JWTs. Subject = email, id (jti) = the server-side session id. */
@Service
public class JwtService {

    private final SecretKey key;
    private final long expiryMs;

    public JwtService(AuthProperties authProperties) {
        this.key = Keys.hmacShaKeyFor(authProperties.getJwt().getSecret().getBytes(StandardCharsets.UTF_8));
        this.expiryMs = authProperties.getJwt().getExpiryMs();
    }

    public String generate(String email, String tokenId, List<String> roles) {
        Date now = new Date();
        return Jwts.builder()
                .setId(tokenId)
                .setSubject(email)
                .claim("roles", roles)
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + expiryMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean valid(String token) {
        try {
            parse(token);
            return true;
        } catch (Exception exception) {
            return false;
        }
    }

    public String getEmail(String token) {
        return parse(token).getSubject();
    }

    public String getTokenId(String token) {
        return parse(token).getId();
    }

    @SuppressWarnings("unchecked")
    public List<String> getRoles(String token) {
        Object roles = parse(token).get("roles");
        return roles instanceof List ? (List<String>) roles : List.of();
    }

    private Claims parse(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
    }
}
