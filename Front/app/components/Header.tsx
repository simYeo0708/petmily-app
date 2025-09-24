import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import type { RootStackParamList } from '../index';
import { headerStyles } from '../styles/HomeScreenStyles';
import MenuButton from './MenuButton';
import SideMenuDrawer from './SideMenuDrawer';

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  backgroundColor?: string;
  showBackButton?: boolean;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Header: React.FC<HeaderProps> = ({
  title = "🐾 Petmily",
  showSearch = false,
  searchPlaceholder = "검색",
  searchQuery = "",
  onSearchChange,
  backgroundColor = "rgba(255, 255, 255, 0.95)",
  showBackButton = false,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const openMenu = () => setIsMenuOpen(true);
  const closeMenu = () => setIsMenuOpen(false);

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <>
      <View style={[headerStyles.header, { backgroundColor }]}>
        <View style={headerStyles.headerLeft}>
          <MenuButton onPress={openMenu} style={{ marginRight: 12 }} />
          {showBackButton && (
            <Pressable onPress={handleBackPress} style={{ marginRight: 10 }}>
              <Text style={{ fontSize: 18, color: "#C59172", fontWeight: "600" }}>←</Text>
            </Pressable>
          )}
          <Text style={headerStyles.logo}>{title}</Text>
        </View>
        
        {showSearch && (
          <View style={headerStyles.headerRight}>
            <View style={headerStyles.searchBar}>
              <Text style={headerStyles.searchIcon}>🔍</Text>
              <TextInput
                style={headerStyles.searchInput}
                placeholder={searchPlaceholder}
                placeholderTextColor="#888"
                value={searchQuery}
                onChangeText={onSearchChange}
                returnKeyType="search"
              />
            </View>
          </View>
        )}
      </View>
      
      <SideMenuDrawer isVisible={isMenuOpen} onClose={closeMenu} />
    </>
  );
};

export default Header;
