import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RootStackParamList } from "../index";
import AuthService from "../services/AuthService";
import DevTools from "../utils/DevTools";
import { Ionicons } from "@expo/vector-icons";
import { IconImage } from "../components/IconImage";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;
type ErrorModalContent = {
  title: string;
  message: string;
  detail?: string;
  suggestions?: string[];
};
const LoginScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorModalContent, setErrorModalContent] = useState<ErrorModalContent>({
    title: "",
    message: "",
  });

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

  const showLoginErrorModal = () => {
    setErrorModalContent({
      title: "로그인에 실패했어요",
      message: "입력하신 아이디 또는 비밀번호가 일치하지 않습니다.",
      detail: "대소문자를 확인한 뒤 다시 시도하거나, 테스트 계정으로 빠르게 접속할 수 있어요.",
      suggestions: [
        "Caps Lock이 켜져 있는지 확인해 보세요.",
        "비밀번호를 잊었다면 관리자에게 초기화를 요청해 주세요.",
        "테스트 계정을 사용하면 바로 체험할 수 있습니다.",
      ],
    });
    setErrorModalVisible(true);
  };

  const handleRetryLogin = () => {
    setErrorModalVisible(false);
  };

  const handleUseTestAccount = async () => {
    setErrorModalVisible(false);
    setIsLoading(true);
    try {
      const result = await DevTools.setupTestAuth();
      if (result) {
        Alert.alert("테스트 계정 로그인", "테스트 계정으로 로그인했습니다.", [
          {
            text: "확인",
            onPress: () => navigation.navigate("Main"),
          },
        ]);
      } else {
        Alert.alert(
          "로그인 실패",
          "테스트 계정을 사용할 수 없습니다. 백엔드 상태를 확인해 주세요."
        );
      }
    } catch (error) {
      console.error("[DEV] 테스트 계정 로그인 실패:", error);
      Alert.alert(
        "로그인 실패",
        "테스트 계정으로 로그인하는 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
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
      showLoginErrorModal();
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
      <StatusBar backgroundColor="#000000" barStyle="light-content" translucent={false} />
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
                <IconImage name="paw" size={36} />
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

      <Modal
        animationType="fade"
        transparent
        visible={errorModalVisible}
        onRequestClose={handleRetryLogin}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIconCircle}>
              <Text style={styles.modalIconText}>⚠️</Text>
            </View>
            <Text style={styles.modalTitle}>{errorModalContent.title}</Text>
            <Text style={styles.modalMessage}>{errorModalContent.message}</Text>
            {errorModalContent.detail ? (
              <Text style={styles.modalDetail}>{errorModalContent.detail}</Text>
            ) : null}
            {errorModalContent.suggestions?.map((suggestion, index) => (
              <View
                key={`${suggestion}-${index}`}
                style={styles.modalSuggestionRow}>
                <View style={styles.modalSuggestionDot} />
                <Text style={styles.modalSuggestionText}>{suggestion}</Text>
              </View>
            ))}

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalSecondaryButton}
                onPress={handleRetryLogin}
                disabled={isLoading}>
                <Text style={styles.modalSecondaryButtonText}>다시 입력할게요</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalPrimaryButton,
                  isLoading && styles.modalButtonDisabled,
                ]}
                onPress={handleUseTestAccount}
                disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalPrimaryButtonText}>테스트 계정 사용</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 12,
  },
  modalIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FCEDEC",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  modalIconText: {
    fontSize: 36,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    color: "#3B3B3B",
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: "center",
    color: "#484848",
    lineHeight: 22,
  },
  modalDetail: {
    fontSize: 14,
    textAlign: "center",
    color: "#6B6B6B",
    marginTop: 12,
    lineHeight: 20,
  },
  modalSuggestionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 10,
  },
  modalSuggestionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#C59172",
    marginTop: 6,
    marginRight: 8,
  },
  modalSuggestionText: {
    flex: 1,
    fontSize: 14,
    color: "#585858",
    lineHeight: 20,
  },
  modalButtonRow: {
    flexDirection: "row",
    marginTop: 24,
  },
  modalPrimaryButton: {
    flex: 1,
    backgroundColor: "#C59172",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  modalPrimaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalSecondaryButton: {
    flex: 1,
    backgroundColor: "#EFEFEF",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  modalSecondaryButtonText: {
    color: "#555555",
    fontSize: 16,
    fontWeight: "600",
  },
  modalButtonDisabled: {
    opacity: 0.6,
  },
});

export default LoginScreen;
