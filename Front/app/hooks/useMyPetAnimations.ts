import { useState, useRef } from "react";
import { Animated } from "react-native";

export const useMyPetAnimations = () => {
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showDeleteMessage, setShowDeleteMessage] = useState(false);
  const [hasSuccessfullyAddedPhoto, setHasSuccessfullyAddedPhoto] = useState(false);
  
  const borderAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const confettiAnimation = useRef(new Animated.Value(0)).current;
  const deleteMessageOpacity = useRef(new Animated.Value(0)).current;
  const temperamentAnimations = useRef<{[key: string]: Animated.Value}>({}).current;

  const triggerSuccessAnimation = () => {
    setShowSuccessAnimation(true);
    setHasSuccessfullyAddedPhoto(true);
    
    borderAnimation.setValue(0);
    scaleAnimation.setValue(1);
    confettiAnimation.setValue(0);
    
    Animated.sequence([
      Animated.timing(scaleAnimation, {
        toValue: 1.1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(borderAnimation, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setTimeout(() => {
        setShowSuccessAnimation(false);
        borderAnimation.setValue(0);
      }, 1000);
    });
  };

  const triggerDeleteAnimation = () => {
    setShowSuccessAnimation(false);
    setHasSuccessfullyAddedPhoto(false);
    borderAnimation.setValue(0);
    confettiAnimation.setValue(0);
    
    setShowDeleteMessage(true);
    deleteMessageOpacity.setValue(0);
    
    Animated.timing(deleteMessageOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(deleteMessageOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          setShowDeleteMessage(false);
        });
      }, 3000);
    });
  };

  const toggleTemperament = (
    temperament: string,
    selectedTemperaments: string[],
    setSelectedTemperaments: (updater: (prev: string[]) => string[]) => void
  ) => {
    if (!temperamentAnimations[temperament]) {
      temperamentAnimations[temperament] = new Animated.Value(0);
    }
    
    const isCurrentlySelected = selectedTemperaments.includes(temperament);
    
    setSelectedTemperaments(prev => {
      if (prev.includes(temperament)) {
        return prev.filter(t => t !== temperament);
      } else {
        return [...prev, temperament];
      }
    });
    
    Animated.sequence([
      Animated.timing(temperamentAnimations[temperament], {
        toValue: isCurrentlySelected ? 0 : 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return {
    showSuccessAnimation,
    showDeleteMessage,
    hasSuccessfullyAddedPhoto,
    borderAnimation,
    scaleAnimation,
    confettiAnimation,
    deleteMessageOpacity,
    temperamentAnimations,
    triggerSuccessAnimation,
    triggerDeleteAnimation,
    toggleTemperament,
  };
};

