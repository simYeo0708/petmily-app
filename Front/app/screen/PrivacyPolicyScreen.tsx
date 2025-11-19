import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../index";
import { headerStyles } from "../styles/HomeScreenStyles";
import { Ionicons } from "@expo/vector-icons";

type Props = NativeStackScreenProps<RootStackParamList, "PrivacyPolicy">;

const PrivacyPolicyScreen: React.FC<Props> = ({ navigation }) => {
  const privacyPolicyContent = `
제1조 (개인정보의 처리 목적)

Petmily는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보 보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.

1. 홈페이지 회원 가입 및 관리
회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 서비스 부정이용 방지 목적으로 개인정보를 처리합니다.

2. 재화 또는 서비스 제공
서비스 제공, 콘텐츠 제공, 본인인증을 목적으로 개인정보를 처리합니다.

3. 마케팅 및 광고에의 활용
신규 서비스(제품) 개발 및 맞춤 서비스 제공, 이벤트 및 광고성 정보 제공 및 참여기회 제공을 목적으로 개인정보를 처리합니다.

제2조 (개인정보의 처리 및 보유기간)

1. Petmily는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.

2. 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.
- 홈페이지 회원 가입 및 관리: 회원 탈퇴 시까지
- 재화 또는 서비스 제공: 재화·서비스 공급완료 및 요금결제·정산 완료 시까지
- 마케팅 및 광고에의 활용: 회원 탈퇴 시까지

제3조 (처리하는 개인정보의 항목)

Petmily는 다음의 개인정보 항목을 처리하고 있습니다.

1. 홈페이지 회원 가입 및 관리
- 필수항목: 이메일, 비밀번호, 이름, 전화번호
- 선택항목: 프로필 사진

2. 재화 또는 서비스 제공
- 필수항목: 이름, 전화번호, 주소, 결제정보
- 선택항목: 배송 메시지

제4조 (개인정보의 제3자 제공)

Petmily는 원칙적으로 정보주체의 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다.

1. 정보주체로부터 별도의 동의를 받은 경우
2. 법령에 특별한 규정이 있는 경우
3. 서비스 제공에 따른 요금정산을 위해 필요한 경우

제5조 (개인정보처리의 위탁)

Petmily는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.

1. 결제 처리: 결제 서비스 제공업체
2. 배송 서비스: 배송 대행업체

제6조 (정보주체의 권리·의무 및 행사방법)

정보주체는 Petmily에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.

1. 개인정보 처리정지 요구
2. 개인정보 열람 요구
3. 개인정보 정정·삭제 요구
4. 개인정보 처리정지 요구

제7조 (개인정보의 파기)

Petmily는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.

제8조 (개인정보 보호책임자)

Petmily는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.

- 개인정보 보호책임자: Petmily 고객센터
- 연락처: support@petmily.com

제9조 (개인정보 처리방침 변경)

이 개인정보 처리방침은 2024년 1월 1일부터 적용됩니다.
`;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      {/* Header */}
      <View style={[headerStyles.header, { backgroundColor: "#fff" }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={[headerStyles.logoText, { flex: 1, textAlign: "center" }]}>
          개인정보 처리방침
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.text}>{privacyPolicyContent}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  backButton: {
    padding: 4,
    width: 40,
  },
  textContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
  },
  text: {
    fontSize: 14,
    lineHeight: 24,
    color: "#333",
  },
});

export default PrivacyPolicyScreen;

