package com.goodsplatform.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "AI_Analysis_Logs",
    indexes = {
        @Index(name = "idx_ai_log_queue", columnList = "status, created_at"),
        @Index(name = "idx_ai_log_status", columnList = "user_id, status")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiAnalysisLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id")
    private Long logId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private AnalysisStatus status = AnalysisStatus.PROCESSING;

    @Column(name = "raw_image_url", nullable = false, length = 255)
    private String rawImageUrl;

    @Column(name = "yolo_results", columnDefinition = "JSON")
    private String yoloResults;

    @Column(name = "gemini_raw_json", columnDefinition = "JSON")
    private String geminiRawJson;

    @Column(name = "candidate_ids", columnDefinition = "JSON")
    private String candidateIds;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
