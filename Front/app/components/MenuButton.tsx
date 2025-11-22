import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface MenuButtonProps {
  onPress: () => void;
  style?: any;
}

const MenuButton: React.FC<MenuButtonProps> = ({ onPress, style }) => {
  return (
    <TouchableOpacity style={[styles.menuButton, style]} onPress={onPress}>
      <Text style={styles.menuIcon}>☰</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  menuButton: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 44,
    minHeight: 44,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  menuIcon: {
    fontSize: 20,
    color: '#333',
    fontWeight: 'bold',
    lineHeight: 20,
  },
});

export default MenuButton;
