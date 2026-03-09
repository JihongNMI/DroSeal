package com.goodsplatform.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "Friends",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "friend_user_id"}),
    indexes = @Index(name = "idx_friends_reverse", columnList = "friend_user_id, user_id")
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Friend {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "friendship_id")
    private Long friendshipId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "friend_user_id", nullable = false)
    private User friendUser;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private FriendshipStatus status = FriendshipStatus.PENDING;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    @PreUpdate
    private void validateNotSelfFriend() {
        if (user != null && friendUser != null
                && user.getUserId() != null
                && user.getUserId().equals(friendUser.getUserId())) {
            throw new IllegalStateException("자기 자신과 친구가 될 수 없습니다.");
        }
    }
}
