import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CATEGORY_DATA } from "../constants/ServiceModes";

interface CategoryListProps {
  onCategoryPress?: (category: string) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  onCategoryPress,
}) => {
  return (
    <View style={styles.categoryList}>
      {CATEGORY_DATA.map((category, index) => (
        <TouchableOpacity
          key={index}
          style={styles.categoryItem}
          onPress={() => onCategoryPress?.(category.name)}
          activeOpacity={0.7}>
          <View style={styles.categoryContent}>
            <View style={styles.iconContainer}>
              <Text style={styles.categoryIcon}>{category.icon}</Text>
            </View>
            <Text style={styles.categoryText}>{category.name}</Text>
            <View style={styles.arrowContainer}>
              <Text style={styles.arrow}>›</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  categoryList: {
    gap: 7,
  },
  categoryItem: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F0F8FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  categoryIcon: {
    fontSize: 22,
  },
  categoryText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  arrowContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  arrow: {
    fontSize: 20,
    color: "#C59172",
    fontWeight: "600",
  },
});

export default CategoryList;
