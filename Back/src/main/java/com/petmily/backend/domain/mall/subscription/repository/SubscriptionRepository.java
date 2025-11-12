package com.petmily.backend.domain.mall.subscription.repository;

import com.petmily.backend.domain.mall.subscription.entity.Subscription;
import com.petmily.backend.domain.mall.subscription.entity.SubscriptionStatus;
import com.petmily.backend.domain.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    Page<Subscription> findByUser(User user, Pageable pageable);

    Page<Subscription> findByUserAndStatus(User user, SubscriptionStatus status, Pageable pageable);

    List<Subscription> findByStatusAndNextDeliveryDate(Subscription status, LocalDate nextDeliveryDate);

    @Query("SELECT s FROM Subscription s WHERE s.user.id = :userId AND s.status = :status")
    List<Subscription> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") SubscriptionStatus status);

    long countByUserAndStatus(User user, SubscriptionStatus status);
}
