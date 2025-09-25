package com.petmily.backend.domain.walker.repository;

import com.petmily.backend.domain.walker.entity.WalkerProfile;
import com.petmily.backend.domain.walker.entity.WalkerStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WalkerProfileRepository extends JpaRepository<WalkerProfile, Long> {
    
    List<WalkerProfile> findByIsAvailableTrue();
    
    @Query("SELECT w FROM WalkerProfile w WHERE w.location LIKE %:location% AND w.isAvailable = true")
    List<WalkerProfile> findByLocationAndAvailable(@Param("location") String location);
    
    @Query("SELECT w FROM WalkerProfile w WHERE w.hourlyRate <= :maxRate AND w.isAvailable = true")
    List<WalkerProfile> findByHourlyRateLessThanEqualAndAvailable(@Param("maxRate") Double maxRate);
    
    Optional<WalkerProfile> findByUserId(Long userId);
    
    // 모바일 최적화용 지역 기반 검색 (페이징 지원)
    @Query("SELECT w FROM WalkerProfile w WHERE w.location LIKE %:location% AND w.isAvailable = true ORDER BY w.rating DESC")
    List<WalkerProfile> findTopRatedByLocationAndAvailable(@Param("location") String location);
    
    // 가격대별 검색 (페이징 지원)
    @Query("SELECT w FROM WalkerProfile w WHERE w.hourlyRate BETWEEN :minRate AND :maxRate AND w.isAvailable = true ORDER BY w.hourlyRate ASC")
    List<WalkerProfile> findByPriceRangeAndAvailable(@Param("minRate") Double minRate, @Param("maxRate") Double maxRate);
    
    // 최고 평점 워커 검색
    @Query("SELECT w FROM WalkerProfile w WHERE w.isAvailable = true AND w.rating >= :minRating ORDER BY w.rating DESC, w.totalWalks DESC")
    List<WalkerProfile> findTopRatedWalkers(@Param("minRating") Double minRating);

    // 즐겨찾기 워커 필터용
    List<WalkerProfile> findByIdInAndStatusAndIsAvailable(List<Long> ids, WalkerStatus status, Boolean isAvailable);

}

