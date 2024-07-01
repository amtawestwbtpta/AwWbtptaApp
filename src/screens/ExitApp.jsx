import {
  StyleSheet,
  ActivityIndicator,
  Text,
  View,
  StatusBar,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {THEME_COLOR} from '../utils/Colors';
import {useNavigation, useIsFocused} from '@react-navigation/native';
import {
  responsiveHeight,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import EncryptedStorage from 'react-native-encrypted-storage';
import RNExitApp from 'react-native-exit-app';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
const ExitApp = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const h = useSharedValue(0);
  const w = useSharedValue(0);
  const r = useSharedValue('0deg');

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: w.value,
      height: h.value,
      opacity: w.value === 0 ? 0.3 : 1,
      transform: [{rotate: r.value}],
    };
  });
  const scaleImage = () => {
    if (w.value === 0) {
      h.value = withSpring(250);
      w.value = withSpring(250);
      r.value = withDelay(500, withSpring('360deg'));
    }
  };
  const exitApp = async () => {
    let exitState = await EncryptedStorage.getItem('exitApp');
    console.log(exitState);

    setTimeout(async () => {
      if (exitState === 'true') {
        await EncryptedStorage.removeItem('exitApp');
        RNExitApp.exitApp();
      } else {
        await EncryptedStorage.removeItem('exitApp');
        navigation.navigate('Home');
      }
    }, 2000);
  };

  useEffect(() => {
    scaleImage();
    exitApp();
  }, [isFocused]);
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={THEME_COLOR} barStyle={'light-content'} />

      <Animated.Image
        source={require('../assets/images/logo.png')}
        style={[{width: 0, height: 0}, animatedStyle]}
      />

      <View
        style={{
          margin: responsiveHeight(2),
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text selectable style={styles.logoText}>
          See
        </Text>
        <Text selectable style={styles.logoText}>
          You
        </Text>
        <Text selectable style={styles.logoText}>
          Again
        </Text>
      </View>
      <View style={{margin: responsiveHeight(2)}}>
        <ActivityIndicator size={50} color={'white'} />
      </View>
    </View>
  );
};

export default ExitApp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME_COLOR,
  },
  logoText: {
    fontSize: responsiveFontSize(5),
    fontWeight: '500',
    color: 'white',
  },
});
