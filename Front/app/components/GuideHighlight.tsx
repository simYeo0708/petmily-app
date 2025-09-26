import React from "react";
import { View } from "react-native";

interface GuideHighlightProps {
  children: React.ReactNode;
  isActive: boolean;
}

const GuideHighlight: React.FC<GuideHighlightProps> = ({ children, isActive }) => {
  if (!isActive) {
    return <>{children}</>;
  }

  return (
    <View
      style={{
        position: "relative",
        zIndex: 1001,
      }}>
      {/* Highlight Border */}
      <View
        style={{
          position: "absolute",
          top: -4,
          left: -4,
          right: -4,
          bottom: -4,
          borderRadius: 16,
          borderWidth: 2,
          borderColor: "#4A90E2",
          backgroundColor: "rgba(74, 144, 226, 0.1)",
          shadowColor: "#4A90E2",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6,
          shadowRadius: 8,
          elevation: 8,
          zIndex: -1,
        }}
      />

      {/* Inner Highlight Glow */}
      <View
        style={{
          position: "absolute",
          top: -2,
          left: -2,
          right: -2,
          bottom: -2,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: "rgba(74, 144, 226, 0.8)",
          backgroundColor: "transparent",
          zIndex: -1,
        }}
      />

      {children}
    </View>
  );
};

export default GuideHighlight;
