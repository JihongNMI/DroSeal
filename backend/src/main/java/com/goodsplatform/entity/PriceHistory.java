package com.goodsplatform.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "PriceHistory",
    indexes = {
        @Index(name = "idx_price_history_name", columnList = "item_name_raw"),
        @Index(name = "idx_price_item_date", columnList = "item_id, recorded_at DESC")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PriceHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "history_id")
    private Long historyId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private CollectionItem item;

    @Column(name = "item_name_raw", nullable = false, length = 100)
    private String itemNameRaw;

    @Column(name = "price_recorded", nullable = false, precision = 15, scale = 2)
    private BigDecimal priceRecorded;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type")
    @Builder.Default
    private SourceType sourceType = SourceType.INTERNAL;

    @CreationTimestamp
    @Column(name = "recorded_at", nullable = false, updatable = false)
    private LocalDateTime recordedAt;
}
