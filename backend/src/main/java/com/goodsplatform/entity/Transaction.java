package com.goodsplatform.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "Transactions", indexes = {
        @Index(name = "idx_tx_seller", columnList = "seller_id, status"),
        @Index(name = "idx_tx_buyer", columnList = "buyer_id, status"),
        @Index(name = "idx_tx_date", columnList = "transaction_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_id")
    private Long transactionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id")
    private User seller;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id")
    private User buyer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_id")
    private InventoryItem inventory;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false)
    private TransactionType transactionType;

    @Column(name = "price", nullable = false, precision = 15, scale = 2)
    private BigDecimal price;

    @Column(name = "platform", length = 50)
    private String platform;

    @Column(name = "receipt_image_url", length = 255)
    private String receiptImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private TransactionStatus status = TransactionStatus.COMPLETED;

    @Column(name = "transaction_date")
    private LocalDate transactionDate;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
