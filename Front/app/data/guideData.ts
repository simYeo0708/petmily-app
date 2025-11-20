// const guideSteps: Array<GuideStepType & { iconName: IconName }> = [
//     {
//       id: "pet_walker_button",
//       title: "Pet Walker 서비스",
//       description: "신뢰할 수 있는 워커가 반려동물과 함께\n안전하고 즐거운 산책을 도와드려요!",
//       nextButtonText: "다음",
//       iconName: "walker",
//     },
//     {
//       id: "pet_mall_button",
//       title: "Pet Mall 서비스",
//       description: "반려동물에게 필요한 모든 용품을\n한 곳에서 편리하게 쇼핑하세요!",
//       nextButtonText: "다음",
//       iconName: "shop",
//     },
//     {
//       id: "walk_booking",
//       title: "반려동물 정보 입력",
//       description: "산책 예약을 위해 먼저 반려동물 정보를\n입력해주세요!",
//       nextButtonText: "정보 입력하기",
//       iconName: "paw",
//     },
//   ];

import { IconName } from "../components/IconImage";
import { GuideStep as GuideStepType } from "../types/HomeScreen";

export const guideSteps : Array<GuideStepType & { iconName : IconName}> = [
    {
              id: "pet_walker_button",
              title: "Pet Walker 서비스",
              description: "신뢰할 수 있는 워커가 반려동물과 함께\n안전하고 즐거운 산책을 도와드려요!",
              nextButtonText: "다음",
              iconName: "walker",
            },
            {
              id: "pet_mall_button",
              title: "Pet Mall 서비스",
              description: "반려동물에게 필요한 모든 용품을\n한 곳에서 편리하게 쇼핑하세요!",
              nextButtonText: "다음",
              iconName: "shop",
            },
            {
              id: "walk_booking",
              title: "반려동물 정보 입력",
              description: "산책 예약을 위해 먼저 반려동물 정보를\n입력해주세요!",
              nextButtonText: "정보 입력하기",
              iconName: "paw",
            },
]