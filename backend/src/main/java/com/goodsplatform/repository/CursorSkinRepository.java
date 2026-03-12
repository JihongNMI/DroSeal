package com.goodsplatform.repository;

import com.goodsplatform.entity.CursorSkin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CursorSkinRepository extends JpaRepository<CursorSkin, Long> {
    List<CursorSkin> findByIsActiveTrue();
}
