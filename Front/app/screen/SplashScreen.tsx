import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

const SplashScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 2,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}>
        <View style={styles.logoWrapper}>
          {/* 임시 아이콘 - 실제 아이콘으로 교체 필요 */}
          <View style={styles.pawIconPlaceholder}>
            <Text style={styles.pawIconText}>🐾</Text>
          </View>
          <Text style={styles.logoText}>PetMily</Text>
        </View>
        <Text style={styles.tagline}>
          Companion for every chapter of your pet&apos;s life
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#D5CDC9",
  },
  logoContainer: {
    alignItems: "center",
  },
  logoWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  pawIconPlaceholder: {
    width: 50,
    height: 50,
    marginRight: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  pawIconText: {
    fontSize: 40,
  },
  logoText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#4A4A4A",
  },
  tagline: {
    fontSize: 16,
    color: "#6B6B6B",
    textAlign: "center",
    paddingHorizontal: 40,
    fontStyle: "italic",
  },
});

export default SplashScreen;
