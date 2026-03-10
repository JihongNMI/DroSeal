package com.goodsplatform.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "inventory_categories",
    indexes = @Index(name = "idx_inventory_category_path", columnList = "path")
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_id")
    private Long categoryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private InventoryCategory parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    @Builder.Default
    private List<InventoryCategory> children = new ArrayList<>();

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "path", nullable = false, length = 500, columnDefinition = "VARCHAR(500) DEFAULT '' COMMENT '계층 구조 경로'")
    @Builder.Default
    private String path = "";

    @Column(name = "level")
    @Builder.Default
    private Integer level = 1;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
