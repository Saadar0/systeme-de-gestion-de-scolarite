package com.ensab.service.de.scolarite.controller;

import com.ensab.service.de.scolarite.dto.auth.LoginRequestDTO;
import com.ensab.service.de.scolarite.service.impl.CustomUserDetailsService;
import com.ensab.service.de.scolarite.util.JwtUtil;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5174", allowCredentials = "true")
@AllArgsConstructor
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequestDTO loginRequest) {

        // Authenticate the user
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()));

        // If authentication is successful, generate JWT
        UserDetails userDetails = userDetailsService.loadUserByUsername(loginRequest.getUsername());
        String role = userDetails.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        String access_token = jwtUtil.generateToken(userDetails.getUsername(), role);

        // Return token and role in response
        return ResponseEntity.ok(Map.of("token", access_token, "role", role));
    }
}