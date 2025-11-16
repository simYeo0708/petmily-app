package com.petmily.backend.domain.walker.entity;

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
