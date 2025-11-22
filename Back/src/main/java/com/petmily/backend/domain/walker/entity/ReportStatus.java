package com.petmily.backend.domain.walker.entity;

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
