package com.petmily.backend.domain.walker.entity;

import com.petmily.backend.domain.common.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "walker_reports")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class WalkerReport extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reporter_user_id", nullable = false)
    private Long reporterUserId;

    @Column(name = "reported_walker_id", nullable = false)
    private Long reportedWalkerId;

    @Column(name = "booking_id")
    private Long bookingId;

    @Enumerated(EnumType.STRING)
    @Column(name = "report_type", nullable = false)
    private ReportType reportType;

    @Column(name = "reason", length = 500)
    private String reason;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private ReportStatus status = ReportStatus.PENDING;

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    public enum ReportType {
        INAPPROPRIATE_BEHAVIOR("부적절한 행동"),
        NO_SHOW("노쇼"),
        POOR_SERVICE("서비스 불량"),
        SAFETY_ISSUE("안전 문제"),
        COMMUNICATION_ISSUE("의사소통 문제"),
        OTHER("기타");

        private final String displayName;

        ReportType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    public enum ReportStatus {
        PENDING("검토중"),
        RESOLVED("해결완료"),
        DISMISSED("기각");

        private final String displayName;

        ReportStatus(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }
}