import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface GuideTooltipProps {
  isVisible: boolean;
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right";
  onNext?: () => void;
  onSkip?: () => void;
  onClose?: () => void;
  currentStep?: number;
  totalSteps?: number;
  nextButtonText?: string;
  skipButtonText?: string;
  children?: React.ReactNode;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const GuideTooltip: React.FC<GuideTooltipProps> = ({
  isVisible,
  title,
  description,
  position,
  onNext,
  onSkip,
  onClose,
  currentStep = 1,
  totalSteps = 1,
  nextButtonText = "다음",
  skipButtonText = "건너뛰기",
  children,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, fadeAnim, scaleAnim]);

  if (!isVisible) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
      }}>
      {/* Background Overlay */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          opacity: fadeAnim,
        }}>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Highlighted Content */}
      {children}

      {/* Tooltip */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: 100,
          left: 20,
          right: 20,
          backgroundColor: "white",
          borderRadius: 16,
          padding: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 16,
          elevation: 10,
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}>
        {/* Step Indicator */}
        {totalSteps > 1 && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginBottom: 12,
            }}>
            {Array.from({ length: totalSteps }, (_, index) => (
              <View
                key={index}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: currentStep === index + 1 ? "#4A90E2" : "#E0E0E0",
                  marginHorizontal: 3,
                }}
              />
            ))}
          </View>
        )}

        {/* Content */}
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: "#333",
            marginBottom: 8,
            textAlign: "center",
          }}>
          {title}
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#666",
            lineHeight: 20,
            textAlign: "center",
            marginBottom: 16,
          }}>
          {description}
        </Text>

        {/* Buttons */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
          <TouchableOpacity
            onPress={onSkip}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 16,
            }}>
            <Text style={{ color: "#999", fontSize: 14 }}>{skipButtonText}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onNext}
            style={{
              backgroundColor: "#4A90E2",
              borderRadius: 8,
              paddingVertical: 10,
              paddingHorizontal: 20,
            }}>
            <Text style={{ color: "white", fontSize: 14, fontWeight: "600" }}>
              {nextButtonText}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

export default GuideTooltip;
