package com.goodsplatform.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "CollectionItems", indexes = @Index(name = "idx_collection_item_name", columnList = "name"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CollectionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id")
    private Long itemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "collection_id", nullable = false)
    private Collection collection;

    @Column(name = "item_number")
    private Integer itemNumber;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "rarity")
    private Rarity rarity;

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    @Column(name = "vector_id", unique = true, length = 36)
    private String vectorId;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_hash", length = 64)
    private String imageHash;

    @Column(name = "is_official", nullable = false)
    @Builder.Default
    private Boolean isOfficial = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
