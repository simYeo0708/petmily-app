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
    gap: 6,
    justifyContent: "space-between",
  },
  categoryItem: {
    width: "18.5%",
    aspectRatio: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  categoryIcon: {
    fontSize: 18,
    marginBottom: 3,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: "600",
    color: "#4A4A4A",
    textAlign: "center",
    lineHeight: 11,
  },
});

export default CategoryGrid;
