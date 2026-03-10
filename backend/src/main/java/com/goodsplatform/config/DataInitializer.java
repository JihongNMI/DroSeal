package com.goodsplatform.config;

import com.goodsplatform.entity.User;
import com.goodsplatform.entity.InventoryCategory;
import com.goodsplatform.repository.InventoryCategoryRepository;
import com.goodsplatform.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final InventoryCategoryRepository InventoryCategoryRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    @Transactional
    public void init() {
        try {
            jdbcTemplate.execute("ALTER TABLE Transactions MODIFY inventory_id BIGINT NULL");
            jdbcTemplate.execute("ALTER TABLE Transactions MODIFY seller_id BIGINT NULL");
            log.info("Transactions 테이블의 inventory_id 및 seller_id 제약조건이 NULL 허용으로 정상 변경됨.");
        } catch (Exception e) {
            log.warn("테이블 ALTER 실패 (이미 적용됐거나 테이블이 생성 전일 수 있음): {}", e.getMessage());
        }

        // 테스트용 Mock User 생성 로직은 실제 운영을 위해 주석 처리함
        /*
         * if (userRepository.findById(1L).isEmpty() &&
         * userRepository.findByUsername("testUser").isEmpty()) {
         * User testUser = User.builder()
         * .username("testUser")
         * .email("test@example.com")
         * .passwordHash(passwordEncoder.encode("1234"))
         * .build();
         * userRepository.save(testUser);
         * log.info("테스트용 Mock User(testUser)가 생성되었습니다. (비밀번호: 1234)");
         * }
         */

        // 기본 제공 카테고리 자동화 (DB가 비어있을 경우)
        if (InventoryCategoryRepository.count() == 0) {
            String[] defaultCategories = { "씰", "카드", "굿즈", "피규어", "책", "기본" };
            for (String categoryName : defaultCategories) {
                InventoryCategory category = InventoryCategory.builder()
                        .name(categoryName)
                        .level(1)
                        .path("")
                        .build();
                InventoryCategoryRepository.save(category);

                // path 설정
                category.setPath(String.valueOf(category.getCategoryId()));
            }
            log.info("기본 제공 카테고리가 자동으로 생성되었습니다.");
        }
    }
}
