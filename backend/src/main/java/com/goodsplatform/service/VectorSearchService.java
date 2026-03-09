package com.goodsplatform.service;

import com.goodsplatform.entity.CollectionItem;
import com.goodsplatform.dto.GoodsAnalyzeRequest;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class VectorSearchService {
    public Optional<CollectionItem> findExistingGoods(GoodsAnalyzeRequest request) {
        return Optional.empty();
    }
}