import { SearchResult } from '../types/HomeScreen';
import { ServiceMode } from '../constants/ServiceModes';
import { IconName } from '../components/IconImage';

export const generateSearchResults = (query: string, mode: ServiceMode): SearchResult[] => {
  const lowerQuery = query.toLowerCase();
  
  const commonResults: SearchResult[] = [
    {
      id: 'my_pet',
      title: '반려동물 정보',
      description: '반려동물 프로필 관리',
      type: 'screen',
      iconName: 'paw',
      action: () => console.log('Navigate to My Pet'),
    },
    {
      id: 'settings',
      title: '설정',
      description: '앱 설정 및 계정 관리',
      type: 'screen',
      iconName: 'setting',
      action: () => console.log('Navigate to Settings'),
    },
  ];

  const petWalkerResults: SearchResult[] = [
    {
      id: 'walker_request',
      title: '산책 요청',
      description: '새로운 산책 요청하기',
      type: 'feature',
      iconName: 'walker',
      action: () => console.log('Navigate to Walker Request'),
    },
    {
      id: 'walker_matching',
      title: '워커 매칭',
      description: '산책 워커 찾기',
      type: 'feature',
      iconName: 'paw',
      action: () => console.log('Navigate to Walker Matching'),
    },
    {
      id: 'walk_history',
      title: '산책 기록',
      description: '과거 산책 내역 보기',
      type: 'feature',
      iconName: 'map',
      action: () => console.log('Navigate to Walk History'),
    },
  ];

  const petMallResults: SearchResult[] = [
    {
      id: 'food_category',
      title: '사료',
      description: '사료 및 간식 카테고리',
      type: 'service',
      iconName: 'food',
      action: () => console.log('Navigate to Food Category'),
    },
    {
      id: 'toy_category',
      title: '장난감',
      description: '장난감 및 놀이용품',
      type: 'service',
      iconName: 'toy',
      action: () => console.log('Navigate to Toy Category'),
    },
    {
      id: 'health_category',
      title: '건강용품',
      description: '건강 관리 용품',
      type: 'service',
      iconName: 'grooming' as IconName,
      action: () => console.log('Navigate to Health Category'),
    },
  ];

  let modeResults: SearchResult[] = [];
  if (mode === 'PW') {
    modeResults = petWalkerResults;
  } else if (mode === 'PM') {
    modeResults = petMallResults;
  }

  const allResults = [...commonResults, ...modeResults];
  
  return allResults.filter((result) =>
    result.title.toLowerCase().includes(lowerQuery) ||
    result.description.toLowerCase().includes(lowerQuery)
  );
};
