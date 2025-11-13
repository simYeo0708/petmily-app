import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { IconImage, IconName } from "./IconImage";
import { Ionicons } from "@expo/vector-icons";

interface CardBoxProps {
  iconName?: IconName;
  ionIconName?: keyof typeof Ionicons.glyphMap;
  description: string;
  actionText: string;
  borderColor: string;
  backgroundColor: string;
  onPress?: () => void;
}

export const CardBox: React.FC<CardBoxProps> = ({
  iconName,
  ionIconName,
  description,
  actionText,
  borderColor,
  backgroundColor,
  onPress,
}) => {
  return (
    <View style={[styles.cardBox, { borderColor }]}>
      <View style={styles.iconWrapper}>
        {iconName ? (
          <IconImage name={iconName} size={32} />
        ) : ionIconName ? (
          <Ionicons name={ionIconName} size={28} color={borderColor} />
        ) : null}
      </View>
      <Text style={styles.infoText}>{description}</Text>
      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor }]}
        onPress={onPress}
      >
        <Text style={styles.actionBtnText}>{actionText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardBox: {
    minHeight: 120,
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 15,
    backgroundColor: "rgba(245, 245, 245, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  iconWrapper: {
    marginBottom: 8,
  },
  infoText: {
    color: "#6B6B6B",
    textAlign: "center",
    paddingHorizontal: 12,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  actionBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  actionBtnText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default CardBox;
