package com.goodsplatform.entity;

import com.goodsplatform.dto.request.ProfilePutRequestDto;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username;

    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    public void updateProfile(ProfilePutRequestDto dto){
        this.username = dto.getNickname();
        this.passwordHash = dto.getPassword();
    }
}
