import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RootStackParamList } from "../index";
import { authService } from "../../services/authService";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;
const LoginScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const checkPetInfo = async () => {
    try {
      const petInfo = await AsyncStorage.getItem("petInfo");
      return petInfo !== null && petInfo !== "";
    } catch (error) {
      console.error("Failed to check pet info:", error);
      return false;
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("오류", "모든 필드를 입력해주세요");
      return;
    }

    setIsLoading(true);
    try {
      await authService.login({ username, password });

      const hasPetInfo = await checkPetInfo();

      if (!hasPetInfo) {
        Alert.alert(
          "반려동물 정보 등록",
          "반려동물 정보를 먼저 등록해주세요!\n더 나은 서비스를 제공할 수 있습니다.",
          [
            {
              text: "등록하기",
              onPress: () => {
                navigation.navigate("Main", { initialTab: "MyPetTab" });
              },
            },
          ],
          { cancelable: false }
        );
      } else {
        navigation.navigate("Main");
      }
    } catch (error: any) {
      Alert.alert("로그인 실패", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!username || !name || !email || !password || !confirmPassword) {
      Alert.alert("오류", "모든 필드를 입력해주세요");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("오류", "비밀번호가 일치하지 않습니다");
      return;
    }

    setIsLoading(true);
    try {
      await authService.signup({ username, name, email, password });
      Alert.alert("회원가입 성공", "계정이 생성되었습니다. 로그인해주세요.");
      setIsLogin(true);
    } catch (error: any) {
      Alert.alert("회원가입 실패", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}>
          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}>
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <View style={styles.logoIconPlaceholder}>
                <Text style={styles.logoIconText}>🐾</Text>
              </View>
              <Text style={styles.logoTitle}>PetMily</Text>
              <Text style={styles.welcomeText}>
                {isLogin ? "Welcome Back!" : "Create Account"}
              </Text>
            </View>

            {/* Form Section */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={isLogin ? "Username" : "Username"}
                placeholderTextColor="#999"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />

              {!isLogin && (
                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  placeholderTextColor="#999"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              )}

              {!isLogin && (
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              )}

              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              {!isLogin && (
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor="#999"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              )}

              <TouchableOpacity
                style={[styles.mainButton, isLoading && { opacity: 0.7 }]}
                onPress={isLogin ? handleLogin : handleSignup}
                disabled={isLoading}>
                <Text style={styles.mainButtonText}>
                  {isLoading ? "처리 중..." : (isLogin ? "Login" : "Sign Up")}
                </Text>
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.divider} />
              </View>

              {/* Social Login Buttons */}
              <View style={styles.socialContainer}>
                <TouchableOpacity style={styles.socialButton}>
                  <Text style={styles.socialIcon}>G</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <Text style={styles.socialIcon}>f</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <Text style={styles.socialIcon}>A</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.switchContainer}>
                <Text style={styles.switchText}>
                  {isLogin
                    ? "Don't have an account? "
                    : "Already have an account? "}
                </Text>
                <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                  <Text style={styles.switchButton}>
                    {isLogin ? "Sign Up" : "Login"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#D5CDC9",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 40,
  },
  formContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    marginHorizontal: 20,
    borderRadius: 30,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoIconPlaceholder: {
    width: 60,
    height: 60,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  logoIconText: {
    fontSize: 50,
  },
  logoTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#4A4A4A",
    marginBottom: 5,
  },
  welcomeText: {
    fontSize: 20,
    color: "#6B6B6B",
    marginTop: 10,
  },
  inputContainer: {
    width: "100%",
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    color: "#333",
  },
  mainButton: {
    backgroundColor: "#C59172",
    borderRadius: 25,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  mainButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "#999",
    fontSize: 14,
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 20,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  socialIcon: {
    fontSize: 20,
    fontWeight: "bold",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  switchText: {
    color: "#6B6B6B",
    fontSize: 14,
  },
  switchButton: {
    color: "#C59172",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default LoginScreen;
