package com.goodsplatform.service;

import com.goodsplatform.dto.JwtResponse;
import com.goodsplatform.dto.LoginRequest;
import com.goodsplatform.dto.SignupRequest;
import com.goodsplatform.dto.request.ProfilePutRequestDto;
import com.goodsplatform.dto.response.ProfileResponseDTO;
import com.goodsplatform.entity.User;
import com.goodsplatform.repository.UserRepository;
import com.goodsplatform.security.CustomUserDetails;
import com.goodsplatform.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder();
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManagerBuilder authenticationManagerBuilder;

    @Transactional
    public void registerUser(SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            throw new RuntimeException("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        User user = User.builder()
                .username(signUpRequest.getUsername())
                .email(signUpRequest.getEmail())
                .passwordHash(bCryptPasswordEncoder.encode(signUpRequest.getPassword()))
                .build();

        userRepository.save(user);
    }

    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManagerBuilder.getObject().authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtTokenProvider.generateToken(authentication);

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        return new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUser().getUsername(),
                userDetails.getUser().getEmail());
    }
    public ProfileResponseDTO getUserProfile(String email) {
        User user = userRepository.findByEmail(email).get();
        return ProfileResponseDTO.builder()
                .email(user.getEmail())
                .nickname(user.getUsername())
                .build();
    }
    @Transactional
    public void editProfile(ProfilePutRequestDto dto) {
        User user = userRepository.findByEmail(dto.getEmail()).get();
        dto.setPassword(bCryptPasswordEncoder.encode(dto.getPassword()));
        user.updateProfile(dto);
    }
}
