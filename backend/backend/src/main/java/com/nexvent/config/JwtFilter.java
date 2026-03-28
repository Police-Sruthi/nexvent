package com.nexvent.config;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import org.springframework.context.annotation.Lazy;

@Component
public class JwtFilter extends OncePerRequestFilter {

  @Autowired
  private JwtUtil jwtUtil;

  @Autowired
  @Lazy
  private UserDetailsService userDetailsService;

  @Override
  protected void doFilterInternal(HttpServletRequest request,
      HttpServletResponse response,
      FilterChain chain)
      throws ServletException, IOException {

    // Step 1: Get the Authorization header
    // It looks like: "Bearer eyJhbGciOiJIUzI1..."
    String authHeader = request.getHeader("Authorization");

    // Step 2: If no token found, just continue
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      chain.doFilter(request, response);
      return;
    }

    // Step 3: Remove "Bearer " and get just the token
    String token = authHeader.substring(7);

    // Step 4: Get email from inside the token
    String email = jwtUtil.extractEmail(token);

    // Step 5: If email found and not already authenticated
    if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

      // Load user from database
      UserDetails userDetails = userDetailsService.loadUserByUsername(email);

      // Step 6: Check token is valid
      if (jwtUtil.isTokenValid(token)) {

        // Step 7: Tell Spring this user is authenticated
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
            userDetails, null, userDetails.getAuthorities());
        authToken.setDetails(
            new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authToken);
      }
    }

    // Step 8: Continue to the actual controller
    chain.doFilter(request, response);
  }
}