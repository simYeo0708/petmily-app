import { useState, useCallback } from 'react';
import { SearchResult } from '../types/HomeScreen';
import { ServiceMode } from '../constants/ServiceModes';
import { generateSearchResults } from '../utils/SearchUtils';

export const useSearch = (serviceMode: ServiceMode) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === "") {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    console.log("🔍 [DEBUG] Searching for:", query);
    console.log("🔍 [DEBUG] Service mode:", serviceMode);
    
    const results = generateSearchResults(query, serviceMode);
    setSearchResults(results);
    setShowSearchResults(true);
    
    console.log("🔍 [DEBUG] Search results:", results);
  }, [serviceMode]);

  const handleSearchResultPress = useCallback((result: SearchResult) => {
    setShowSearchResults(false);
    setSearchQuery("");
    result.action();
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
  }, []);

  return {
    searchQuery,
    searchResults,
    showSearchResults,
    handleSearch,
    handleSearchResultPress,
    clearSearch,
  };
};
