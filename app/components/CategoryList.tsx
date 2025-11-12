import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
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
              {category.icon.startsWith('@') ? (
                <Image
                  source={
                    category.icon === '@dog_food.png' ? require('../../assets/images/dog_food.png') :
                    category.icon === '@dog_snack.png' ? require('../../assets/images/dog_snack.png') :
                    category.icon === '@cat_food.png' ? require('../../assets/images/cat_food.png') :
                    category.icon === '@cat_snack.png' ? require('../../assets/images/cat_snack.png') :
                    category.icon === '@toy.png' ? require('../../assets/images/toy.png') :
                    category.icon === '@toilet.png' ? require('../../assets/images/toilet.png') :
                    category.icon === '@grooming.png' ? require('../../assets/images/grooming.png') :
                    category.icon === '@clothing.png' ? require('../../assets/images/clothing.png') :
                    category.icon === '@outdoor.png' ? require('../../assets/images/outdoor.png') :
                    category.icon === '@house.png' ? require('../../assets/images/house.png') :
                    category.icon === '@shop.png' ? require('../../assets/images/shop.png') :
                    category.icon === '@walker.png' ? require('../../assets/images/walker.png') :
                    require('../../assets/images/dog_food.png')
                  }
                  style={{ width: 22, height: 22 }}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.categoryIcon}>{category.icon}</Text>
              )}
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
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "space-between",
  },
  categoryItem: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    width: "18.5%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryContent: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F0F8FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 3,
  },
  categoryIcon: {
    fontSize: 18,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    lineHeight: 11,
  },
  arrowContainer: {
    display: "none",
  },
  arrow: {
    display: "none",
  },
});

export default CategoryList;
