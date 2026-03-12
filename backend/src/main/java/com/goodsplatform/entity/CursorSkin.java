package com.goodsplatform.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "cursor_skins")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CursorSkin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "character_name", nullable = false, length = 100)
    private String characterName;

    @Column(name = "folder_path", nullable = false, length = 500)
    private String folderPath;

    @Column(name = "frame_count", nullable = false)
    private Integer frameCount;

    @Column(name = "frame_time", nullable = false)
    private Integer frameTime;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
