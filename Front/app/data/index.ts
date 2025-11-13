/**
 * 샘플 데이터 중앙 관리 파일
 * 
 * 이 파일을 통해 모든 샘플 데이터를 import할 수 있습니다.
 * 
 * 사용 예시:
 * import { PRODUCTS, WALKERS, WALKING_REQUESTS, ADVERTISEMENTS } from '@/app/data';
 */

// 상품 데이터
export { 
  PRODUCTS,
  getProductsByCategory,
  type Product 
} from './products';

// 워커 데이터
export {
  WALKER_SELECTION_DATA,
  WALKER_MATCHING_DATA,
  type Walker,
  type WalkerReview
} from './walkers';

// 산책 요청 데이터
export {
  WALKING_REQUESTS,
  CURRENT_WALKING,
  type WalkingRequest,
  type WalkingRequestUser,
  type WalkingRequestPet,
  type CurrentWalking,
  type WalkerInfo
} from './walkingRequests';

// 광고 배너 데이터
export {
  ADVERTISEMENTS,
  type Advertisement
} from './advertisements';

/**
 * 데이터 구조 요약:
 * 
 * - products.ts: 펫 쇼핑몰 상품 데이터
 * - walkers.ts: 워커 프로필 및 매칭 데이터
 * - walkingRequests.ts: 산책 요청 및 현재 진행 중인 산책 데이터
 * - advertisements.ts: 홈 화면 광고 배너 데이터
 */

