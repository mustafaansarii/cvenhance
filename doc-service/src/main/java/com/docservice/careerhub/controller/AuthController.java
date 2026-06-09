package com.docservice.careerhub.controller;

import com.docservice.careerhub.dto.request.SigninRequest;
import com.docservice.careerhub.dto.request.SignupRequest;
import com.docservice.careerhub.dto.response.MessageResponse;
import com.docservice.careerhub.dto.response.UserResponse;
import com.docservice.careerhub.dtoApi.AuthDtoApi;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthDtoApi authDtoApi;

    @PostMapping("/signup")
    public MessageResponse signup(@RequestBody SignupRequest signupRequest) {
        return authDtoApi.signup(signupRequest);
    }

    @PostMapping("/register")
    public UserResponse register(@RequestBody SignupRequest registerRequest) {
        return authDtoApi.register(registerRequest);
    }

    @PostMapping("/signin")
    public UserResponse signin(@RequestBody SigninRequest signinRequest,
                               HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        return authDtoApi.signin(signinRequest, httpRequest, httpResponse);
    }

    @PostMapping("/logout")
    public MessageResponse logout(Authentication authentication, HttpServletResponse httpResponse) {
        return authDtoApi.logout(authentication, httpResponse);
    }

    @GetMapping("/me")
    public UserResponse me(Authentication authentication) {
        return authDtoApi.me(authentication);
    }
}
