import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
const AnimatedView = () => {
  const transtateX = useSharedValue(0);
  const transtateY = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {transtateX: transtateX.value},
        {translateY: transtateY.value},
      ],
    };
  });

  return (
    <Animated.View>
      <Text>AnimatedView</Text>
    </Animated.View>
  );
};

export default AnimatedView;

const styles = StyleSheet.create({});
