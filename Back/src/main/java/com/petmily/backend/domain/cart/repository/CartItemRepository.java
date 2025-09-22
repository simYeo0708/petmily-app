package com.petmily.backend.domain.cart.repository;

import com.petmily.backend.domain.cart.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    
    // 사용자의 장바구니 아이템 조회 (상품 정보 포함)
    @Query("SELECT ci FROM CartItem ci LEFT JOIN FETCH ci.product p LEFT JOIN FETCH p.category WHERE ci.userId = :userId ORDER BY ci.createTime DESC")
    List<CartItem> findByUserIdWithProducts(@Param("userId") Long userId);
    
    // 특정 사용자의 특정 상품 장바구니 아이템 조회
    Optional<CartItem> findByUserIdAndProductId(Long userId, Long productId);
    
    // 사용자의 장바구니 아이템 개수
    @Query("SELECT COUNT(ci) FROM CartItem ci WHERE ci.userId = :userId")
    int countByUserId(@Param("userId") Long userId);
    
    // 사용자의 선택된 장바구니 아이템들 조회
    @Query("SELECT ci FROM CartItem ci LEFT JOIN FETCH ci.product WHERE ci.userId = :userId AND ci.isSelected = true")
    List<CartItem> findSelectedItemsByUserId(@Param("userId") Long userId);
    
    // 특정 사용자의 장바구니 아이템 삭제
    void deleteByUserIdAndId(Long userId, Long id);
    
    // 특정 사용자의 모든 장바구니 아이템 삭제
    void deleteByUserId(Long userId);
    
    // 특정 사용자의 여러 장바구니 아이템 삭제
    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.userId = :userId AND ci.id IN :itemIds")
    void deleteByUserIdAndIdIn(@Param("userId") Long userId, @Param("itemIds") List<Long> itemIds);
    
    // 특정 사용자의 선택된 아이템들 삭제
    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.userId = :userId AND ci.isSelected = true")
    void deleteSelectedItemsByUserId(@Param("userId") Long userId);
    
    // 장바구니 아이템 수량 업데이트
    @Modifying
    @Query("UPDATE CartItem ci SET ci.quantity = :quantity WHERE ci.id = :itemId AND ci.userId = :userId")
    int updateQuantity(@Param("itemId") Long itemId, @Param("userId") Long userId, @Param("quantity") Integer quantity);
    
    // 장바구니 아이템 선택 상태 토글
    @Modifying
    @Query("UPDATE CartItem ci SET ci.isSelected = :isSelected WHERE ci.id = :itemId AND ci.userId = :userId")
    int updateSelection(@Param("itemId") Long itemId, @Param("userId") Long userId, @Param("isSelected") Boolean isSelected);
    
    // 모든 아이템 선택 상태 변경
    @Modifying
    @Query("UPDATE CartItem ci SET ci.isSelected = :isSelected WHERE ci.userId = :userId")
    int updateAllSelection(@Param("userId") Long userId, @Param("isSelected") Boolean isSelected);
    
    // 사용자의 장바구니 총 금액 계산 (선택된 아이템만)
    @Query("SELECT COALESCE(SUM(ci.quantity * p.price * (1 - COALESCE(p.discountRate, 0) / 100)), 0) " +
           "FROM CartItem ci JOIN ci.product p WHERE ci.userId = :userId AND ci.isSelected = true")
    Double calculateSelectedItemsTotal(@Param("userId") Long userId);
    
    // 특정 상품이 장바구니에 있는지 확인
    boolean existsByUserIdAndProductId(Long userId, Long productId);
    
    // ID 목록으로 장바구니 아이템 조회 (사용자 검증 포함)
    @Query("SELECT ci FROM CartItem ci LEFT JOIN FETCH ci.product WHERE ci.id IN :itemIds AND ci.userId = :userId")
    List<CartItem> findByIdInAndUserId(@Param("itemIds") List<Long> itemIds, @Param("userId") Long userId);
}