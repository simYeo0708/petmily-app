import { useState, useEffect, useRef, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SearchResult } from "../types/HomeScreen";
import { searchProducts, BackendSearchResult } from "../services/SearchService";
import { ServiceMode } from "../constants/ServiceModes";
import { RootStackParamList } from "../index";

const SHOP_CATEGORY_MAP: Record<string, string> = {
  '사료': '강아지 사료',
  '간식': '강아지 간식',
  '장난감': '장난감',
  '용품': '외출 용품',
  '패션': '의류',
  '건강관리': '미용 용품',
  '위생용품': '배변용품',
  '기타': '전체',
};

export const useHomeSearch = (serviceMode: ServiceMode) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const generateWalkerSearchResults = useCallback((query: string): SearchResult[] => {
    const lowerQuery = query.toLowerCase();
    
    const walkerResults: SearchResult[] = [
      {
        id: '1',
        type: 'feature',
        title: '산책 요청하기',
        description: '워커와 매칭하여 산책 서비스를 요청하세요',
        iconName: 'walker',
        action: () => navigation.navigate('WalkingRequest'),
      },
      {
        id: '2',
        type: 'feature',
        title: '산책 지도',
        description: '실시간 위치 추적과 산책 경로를 확인하세요',
        iconName: 'map',
        action: () => navigation.navigate('WalkingMap'),
      },
      {
        id: '3',
        type: 'feature',
        title: '워커 매칭',
        description: '나에게 맞는 워커를 찾아보세요',
        iconName: 'paw',
        action: () => navigation.navigate('WalkerMatching', { 
          bookingData: { timeSlot: '선택된 시간', address: '선택된 주소' } 
        }),
      },
    ];

    return walkerResults.filter(item => 
      item.title.toLowerCase().includes(lowerQuery) || 
      item.description.toLowerCase().includes(lowerQuery)
    );
  }, [navigation]);

  const mapProductResultToSearchResult = useCallback((item: BackendSearchResult): SearchResult => {
    const metadata = (item.metadata ?? {}) as Record<string, unknown>;
    const rawPrice = metadata.price;
    const numericPrice =
      typeof rawPrice === 'number'
        ? rawPrice
        : typeof rawPrice === 'string' && !Number.isNaN(Number(rawPrice))
        ? Number(rawPrice)
        : undefined;

    const formattedPrice = typeof numericPrice === 'number' ? `${numericPrice.toLocaleString()}원` : undefined;
    const descriptionPieces = [
      formattedPrice,
      item.description ?? undefined,
    ].filter(Boolean);

    const categoryDisplay = typeof metadata.category === 'string' ? metadata.category : undefined;
    const categoryForNavigation =
      (categoryDisplay && SHOP_CATEGORY_MAP[categoryDisplay]) || '전체';

    return {
      id: item.id,
      type: 'service',
      title: item.title ?? '상품',
      description: descriptionPieces.join(' • ') || '상품 상세 보기',
      iconName: 'shop',
      action: () => navigation.navigate('Shop', { category: categoryForNavigation }),
    };
  }, [navigation]);

  // 검색어 변경 시 디바운스 적용
  useEffect(() => {
    let cancelled = false;
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const runSearch = async () => {
      const trimmed = searchQuery.trim();

      if (trimmed.length === 0) {
        if (!cancelled) {
          setSearchResults([]);
          setShowSearchResults(false);
          setIsSearching(false);
        }
        return;
      }

      if (serviceMode === "PW") {
        const localResults = generateWalkerSearchResults(trimmed);
        if (!cancelled) {
          setSearchResults(localResults);
          setShowSearchResults(true);
          setIsSearching(false);
        }
        return;
      }

      if (!cancelled) {
        setIsSearching(true);
        setShowSearchResults(true);
      }
      
      try {
        const backendResults = await searchProducts(trimmed);
        if (cancelled) {
          return;
        }

        const mapped = backendResults.map(mapProductResultToSearchResult);
        if (!cancelled) {
          setSearchResults(mapped);
        }
      } catch (error) {
        console.error("Search error:", error);
        if (!cancelled) {
          setSearchResults([]);
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    };

    searchTimeoutRef.current = setTimeout(() => {
      runSearch();
    }, 300);

    return () => {
      cancelled = true;
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, serviceMode, generateWalkerSearchResults, mapProductResultToSearchResult]);

  // 화면 포커스 해제 시 검색 결과 숨기기
  useFocusEffect(
    useCallback(() => {
      return () => {
        setShowSearchResults(false);
        setSearchQuery("");
      };
    }, [])
  );

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    showSearchResults,
    setShowSearchResults,
    isSearching,
    setIsSearching,
  };
};

