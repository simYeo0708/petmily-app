import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { RootStackParamList } from "../index";
import AuthService from "../services/AuthService";
import DevTools from "../utils/DevTools";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;
const LoginScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

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
    setLoginError(""); // 에러 메시지 초기화
    
    if (!username || !password) {
      setLoginError("아이디와 비밀번호를 입력해주세요");
      return;
    }

    setIsLoading(true);
    
    try {
      // AuthService를 통해 로그인
      const authResponse = await AuthService.login(username, password);
      
      console.log('로그인 성공! 토큰:', authResponse.accessToken.substring(0, 20) + '...');
      
      // 홈 화면으로 이동
      navigation.navigate("Main");
    } catch (error: any) {
      console.error("로그인 에러:", error);
      setLoginError("잘못된 아이디이거나 비밀번호입니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert("오류", "모든 필드를 입력해주세요");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("오류", "비밀번호가 일치하지 않습니다");
      return;
    }

    setIsLoading(true);
    
    try {
      // AuthService를 통해 회원가입
      const authResponse = await AuthService.signup({
        username,
        password,
        email,
        name: username, // name 필드 추가
      });
      
      console.log('회원가입 성공! 토큰:', authResponse.accessToken.substring(0, 20) + '...');
      
      Alert.alert(
        "회원가입 완료",
        "환영합니다! 로그인되었습니다.",
        [
          {
            text: "확인",
            onPress: () => navigation.navigate("Main"),
          },
        ]
      );
    } catch (error: any) {
      console.error("회원가입 에러:", error);
      Alert.alert(
        "회원가입 실패",
        error.message || "회원가입 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 🔧 개발용: 빠른 로그인 (asdf 계정)
  const handleDevLogin = async () => {
    setIsLoading(true);
    try {
      const result = await DevTools.loginAsAsdf();
      if (result) {
        console.log('✅ [DEV] 개발용 로그인 성공!');
        navigation.navigate("Main");
      } else {
        Alert.alert("개발 로그인 실패", "백엔드가 실행 중인지 확인해주세요.");
      }
    } catch (error) {
      console.error('[DEV] 개발 로그인 에러:', error);
      Alert.alert("오류", "개발 로그인에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#C59172" barStyle="light-content" translucent={false} />
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
                placeholder={isLogin ? "아이디 (Username)" : "Username"}
                placeholderTextColor="#999"
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  setLoginError(""); // 입력 시 에러 메시지 제거
                }}
                autoCapitalize="none"
              />

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
                placeholder={isLogin ? "비밀번호 (Password)" : "Password"}
                placeholderTextColor="#999"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setLoginError(""); // 입력 시 에러 메시지 제거
                }}
                secureTextEntry
              />

              {/* 로그인 에러 메시지 */}
              {isLogin && loginError && (
                <Text style={styles.errorMessage}>{loginError}</Text>
              )}

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
                style={[styles.mainButton, isLoading && styles.mainButtonDisabled]}
                onPress={isLogin ? handleLogin : handleSignup}
                disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.mainButtonText}>
                    {isLogin ? "로그인" : "회원가입"}
                  </Text>
                )}
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

              {/* 🔧 개발용 빠른 로그인 버튼 */}
              {isLogin && (
                <TouchableOpacity
                  style={styles.devButton}
                  onPress={handleDevLogin}
                  disabled={isLoading}>
                  <Text style={styles.devButtonText}>
                    🔧 개발용 빠른 로그인 (asdf)
                  </Text>
                </TouchableOpacity>
              )}
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
  mainButtonDisabled: {
    backgroundColor: "#CCC",
  },
  mainButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  errorMessage: {
    color: "#FF6B6B",
    fontSize: 14,
    marginTop: 8,
    marginBottom: 8,
    paddingLeft: 4,
    fontWeight: "500",
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
    marginBottom: 15,
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
  // 🔧 개발용 버튼 스타일
  devButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    borderWidth: 2,
    borderColor: "#45a049",
  },
  devButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default LoginScreen;
