package com.petmily.backend.domain.walker.repository;

import com.petmily.backend.domain.walker.entity.WalkerReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WalkerReportRepository extends JpaRepository<WalkerReport, Long> {

    List<WalkerReport> findByReporterUserIdOrderByCreateTimeDesc(Long reporterUserId);

    List<WalkerReport> findByReportedWalkerIdOrderByCreateTimeDesc(Long reportedWalkerId);

    List<WalkerReport> findByStatusOrderByCreateTimeDesc(WalkerReport.ReportStatus status);

    boolean existsByReporterUserIdAndBookingId(Long reporterUserId, Long bookingId);
}