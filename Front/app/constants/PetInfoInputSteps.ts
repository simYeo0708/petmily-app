export interface PetInfoInputStep {
  id: string;
  title: string;
  description: string;
  fields: string[];
  isRequired: boolean;
}

export const PET_INFO_INPUT_STEPS: PetInfoInputStep[] = [
  {
    id: "basic_info",
    title: "기본 정보",
    description: "반려동물의 기본 정보를 입력해주세요",
    fields: ["name", "species", "breed"],
    isRequired: true,
  },
  {
    id: "detail_info",
    title: "상세 정보",
    description: "추가 정보를 입력해주세요",
    fields: ["age", "weight", "gender", "neutered"],
    isRequired: true,
  },
  {
    id: "optional_info",
    title: "추가 정보",
    description: "선택 사항입니다",
    fields: ["photoUri", "temperaments", "description"],
    isRequired: false,
  },
  {
    id: "safety_info",
    title: "보험 및 안전 안내",
    description: "산책 서비스 이용 전 확인해주세요",
    fields: [],
    isRequired: false,
  },
];

export const REQUIRED_FIELDS = ["name", "species", "breed", "age", "weight", "gender", "neutered"];
export const OPTIONAL_FIELDS = ["photoUri", "temperaments", "description"];

export const SAFETY_INFO = {
  insurance: {
    title: "🛡️ 반려동물 보험",
    items: [
      "산책 중 발생할 수 있는 사고에 대비하여 보험 가입을 권장합니다",
      "워커는 기본 보험에 가입되어 있습니다",
      "추가 보험은 마이페이지에서 가입 가능합니다",
    ],
  },
  safety: {
    title: "⚠️ 안전 수칙",
    items: [
      "산책 전 반려동물의 건강 상태를 확인해주세요",
      "목줄과 배변봉투는 워커가 준비합니다",
      "특이사항이나 알러지가 있다면 반드시 기재해주세요",
      "긴급 상황 시 연락 가능한 번호를 등록해주세요",
    ],
  },
  emergency: {
    title: "🚨 긴급 연락",
    items: [
      "산책 중 문제 발생 시 워커가 즉시 연락드립니다",
      "비상 연락처는 마이페이지에서 설정 가능합니다",
      "24시간 고객센터: 1588-0000",
    ],
  },
};





