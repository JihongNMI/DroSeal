package com.goodsplatform.config;

import com.goodsplatform.entity.User;
import com.goodsplatform.entity.InventoryCategory;
import com.goodsplatform.repository.InventoryCategoryRepository;
import com.goodsplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final InventoryCategoryRepository inventoryCategoryRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void init() {
        log.info("DataInitializer 실행 시작...");

        // 1. 테이블 구조 보정 (ALTER)
        try {
            jdbcTemplate.execute("ALTER TABLE Transactions MODIFY inventory_id BIGINT NULL");
            jdbcTemplate.execute("ALTER TABLE Transactions MODIFY seller_id BIGINT NULL");
            jdbcTemplate.execute("ALTER TABLE Collections MODIFY category_id BIGINT NULL");
            jdbcTemplate.execute("ALTER TABLE InventoryItems MODIFY user_image_url VARCHAR(1024)");
            log.info("테이블 제약조건 및 컬럼 길이가 정상 변경됨.");
        } catch (Exception e) {
            log.warn("테이블 ALTER 실패 (테이블 미생성 혹은 이미 반영됨): {}", e.getMessage());
        }

        // 2. 테스트용 Mock User 생성 (주석 해제 및 안전하게 실행)
        try {
            if (userRepository.findById(1L).isEmpty() &&
                    userRepository.findByUsername("testUser").isEmpty()) {
                User testUser = User.builder()
                        .username("testUser")
                        .email("test@example.com")
                        .passwordHash(passwordEncoder.encode("1234"))
                        .build();
                userRepository.save(testUser);
                log.info("테스트용 Mock User(testUser)가 생성되었습니다. (비밀번호: 1234)");
            }
        } catch (Exception e) {
            log.warn("Mock User 생성 실패 (Users 테이블이 아직 생성되지 않았을 수 있음): {}", e.getMessage());
        }

        // 3. 기본 제공 카테고리 자동화
        try {
            if (inventoryCategoryRepository.count() == 0) {
                String[] defaultCategories = { "씰", "카드", "굿즈", "피규어", "책", "기본" };
                for (String categoryName : defaultCategories) {
                    InventoryCategory category = InventoryCategory.builder()
                            .name(categoryName)
                            .level(1)
                            .path("")
                            .build();
                    inventoryCategoryRepository.save(category);

                    // path 설정
                    category.setPath(String.valueOf(category.getCategoryId()));
                    inventoryCategoryRepository.save(category);
                }
                log.info("기본 제공 카테고리가 자동으로 생성되었습니다.");
            }
        } catch (Exception e) {
            log.warn("기본 카테고리 생성 중 오류 발생 (테이블이 아직 생성되지 않았을 수 있음): {}", e.getMessage());
        }

        // 4. 기존 컬렉션 카테고리 마이그레이션 (ManyToOne -> ManyToMany)
        try {
            int migratedCount = jdbcTemplate.update(
                    "INSERT INTO Collections_Categories (collection_id, category_id) " +
                            "SELECT collection_id, category_id FROM Collections " +
                            "WHERE category_id IS NOT NULL " +
                            "AND collection_id NOT IN (SELECT DISTINCT collection_id FROM Collections_Categories)");
            if (migratedCount > 0) {
                log.info("기존 도감 데이터 {}건의 카테고리 정보가 성공적으로 마이그레이션되었습니다.", migratedCount);
            }
        } catch (Exception e) {
            log.debug("기존 카테고리 마이그레이션 스킵 (이미 처리되었거나 컬럼이 없음): {}", e.getMessage());
        }

        log.info("DataInitializer 실행 종료.");
    }
}
