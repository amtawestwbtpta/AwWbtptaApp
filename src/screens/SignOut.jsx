import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect} from 'react';
import EncryptedStorage from 'react-native-encrypted-storage';
import {useNavigation, useIsFocused} from '@react-navigation/native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import {THEME_COLOR} from '../utils/Colors';
import {
  responsiveHeight,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import auth from '@react-native-firebase/auth';
import {useGlobalContext} from '../context/Store';
const SignOut = () => {
  const {setState} = useGlobalContext();
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
  const signOut = async () => {
    await EncryptedStorage.clear();

    await auth()
      .signOut()
      .then(() => {
        console.log('User signed out!');
        navigation.navigate('Login');
        setState({
          USER: {},
          TEACHER: {},
          TOKEN: '',
          LOGGEDAT: '',
        });
      })
      .catch(e => {
        console.log(e);
        navigation.navigate('Login');
      });
  };

  useEffect(() => {
    signOut();
    scaleImage();
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
          Amta
        </Text>
        <Text selectable style={styles.logoText}>
          West
        </Text>
        <Text selectable style={styles.logoText}>
          WBTPTA
        </Text>
        <Text selectable style={styles.dataText}>
          See You Again
        </Text>
      </View>
      <View style={{margin: responsiveHeight(2)}}>
        <ActivityIndicator size={50} color={'white'} />
      </View>
    </View>
  );
};

export default SignOut;

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
  dataText: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(2),
    color: THEME_COLOR,
    textAlign: 'center',
    padding: 5,
  },
});
