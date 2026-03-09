package com.goodsplatform.repository;

import com.goodsplatform.entity.AiAnalysisLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AiAnalysisLogRepository extends JpaRepository<AiAnalysisLog, Long> {
}
