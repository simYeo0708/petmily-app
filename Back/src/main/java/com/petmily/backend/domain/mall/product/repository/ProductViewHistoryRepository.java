package com.petmily.backend.domain.mall.product.repository;

import com.petmily.backend.domain.mall.product.entity.Product;
import com.petmily.backend.domain.mall.product.entity.ProductViewHistory;
import com.petmily.backend.domain.user.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductViewHistoryRepository extends JpaRepository<ProductViewHistory, Long> {

    Optional<ProductViewHistory> findByUserAndProduct(User user, Product product);

    List<ProductViewHistory> findByUserOrderByUpdatedAtDesc(User user, Pageable pageable);

    @Query("SELECT pvh.product.category, COUNT(pvh) as viewCount " +
           "FROM ProductViewHistory pvh " +
           "WHERE pvh.user = :user " +
           "GROUP BY pvh.product.category " +
           "ORDER BY viewCount DESC")
    List<Object[]> findCategoryViewCountsByUser(@Param("user") User user);

    @Query("SELECT COUNT(DISTINCT pvh.product.category) " +
           "FROM ProductViewHistory pvh " +
           "WHERE pvh.user = :user")
    Long countDistinctCategoriesByUser(@Param("user") User user);

    void deleteByUser(User user);

    @Query("SELECT pvh FROM ProductViewHistory pvh " +
           "WHERE pvh.user = :user " +
           "ORDER BY pvh.updatedAt DESC")
    List<ProductViewHistory> findAllByUserOrderByUpdatedAtDesc(@Param("user") User user, Pageable pageable);
}

