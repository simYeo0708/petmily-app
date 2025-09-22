import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CATEGORY_DATA } from "../constants/ServiceModes";

interface CategoryGridProps {
  lightColor: string;
  onCategoryPress?: (category: string) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  lightColor,
  onCategoryPress,
}) => {
  return (
    <View style={styles.categoryGrid}>
      {CATEGORY_DATA.map((category, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.categoryItem, { backgroundColor: lightColor }]}
          onPress={() => onCategoryPress?.(category.name)}>
          <Text style={styles.categoryIcon}>{category.icon}</Text>
          <Text style={styles.categoryText}>{category.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  categoryItem: {
    flex: 1,
    minWidth: "45%",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A4A4A",
  },
});

export default CategoryGrid;
