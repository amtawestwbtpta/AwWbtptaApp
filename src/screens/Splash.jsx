import {
  StyleSheet,
  ActivityIndicator,
  Text,
  View,
  StatusBar,
  Linking,
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {THEME_COLOR} from '../utils/Colors';
import {useNavigation, useIsFocused} from '@react-navigation/native';
import {
  responsiveHeight,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import EncryptedStorage from 'react-native-encrypted-storage';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import {useGlobalContext} from '../context/Store';
import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';
import Toast from 'react-native-toast-message';
import {AppURL, appVersion} from '../modules/constants';
const Splash = () => {
  const {state, setState} = useGlobalContext();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const h = useSharedValue(0);
  const w = useSharedValue(0);
  const r = useSharedValue('0deg');
  const [token, setToken] = useState('');

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
  const getDetails = async () => {
    const userID = JSON.parse(await EncryptedStorage.getItem('user'));
    const teacherID = JSON.parse(await EncryptedStorage.getItem('teacher'));
    const loggedAt = parseInt(
      JSON.parse(await EncryptedStorage.getItem('loggedAt')),
    );

    if (userID != null) {
      if ((Date.now() - loggedAt) / 1000 / 60 / 15 < 1) {
        setState({
          USER: userID,
          TEACHER: teacherID,
          TOKEN: token,
          LOGGEDAT: loggedAt,
        });
        setTimeout(() => {
          navigation.navigate('Home');
        }, 500);
      } else {
        await firestore()
          .collection('userteachers')
          .where('empid', '==', userID.empid)
          .get()
          .then(snapshot => {
            let userData = snapshot.docs[0]._data;

            if (userData.disabled) {
              showToast(
                'error',
                'Your Account Has Been Disabled.',
                'Contact WBTPTA Admin',
              );
              setTimeout(() => {
                navigation.navigate('SignOut');
              }, 500);
            } else {
              setState({
                USER: userID,
                TEACHER: teacherID,
                TOKEN: token,
                LOGGEDAT: loggedAt,
              });
              setTimeout(() => {
                navigation.navigate('Home');
              }, 500);
            }
          })
          .catch(async e => {
            console.log(e);
            await EncryptedStorage.clear();
            navigation.navigate('Login');
          });
      }
    } else {
      setTimeout(async () => {
        navigation.navigate('Login');
      }, 500);
    }
  };
  const getFcmToken = async () => {
    let deviceToken = await messaging().getToken();
    setToken(deviceToken);
  };

  const appUpdate = async () => {
    await firestore()
      .collection('appUpdate')
      .get()
      .then(snapshot => {
        const data = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        }))[0];

        if (data.update) {
          if (data.appVersion > appVersion) {
            Alert.alert(
              'Hold On!',
              `This app Has A New Update, Please Download and Install it.`,
              [
                // The "No" button
                // Does nothing but dismiss the dialog when tapped
                // {
                //   text: 'No',
                //   onPress: () => showToast('error', 'You Must Download it.'),
                // },
                // The "Yes" button
                {
                  text: 'Download Now?',
                  onPress: async () => {
                    const supported = await Linking.canOpenURL(AppURL); //To check if URL is supported or not.
                    if (supported) {
                      await Linking.openURL(AppURL); // It will open the URL on browser.
                      await EncryptedStorage.clear();
                    } else {
                      Alert.alert(`Can't open this URL: ${AppURL}`);
                    }
                  },
                },
              ],
            );
          }
        }
      })
      .catch(e => {
        console.log(e);
      });
  };
  const showToast = (type, text1, text2) => {
    Toast.show({
      type: type,
      text1: text1,
      text2: text2,
      visibilityTime: 1500,
      position: 'top',
      topOffset: 500,
    });
  };

  useEffect(() => {
    getDetails();
    scaleImage();
    getFcmToken();
    setTimeout(() => {
      appUpdate();
    }, 500);
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
        <Text style={styles.logoText}>Amta</Text>
        <Text style={styles.logoText}>West</Text>
        <Text style={styles.logoText}>WBTPTA</Text>
      </View>
      <View style={{margin: responsiveHeight(2)}}>
        <ActivityIndicator size={50} color={'white'} />
      </View>
      <Toast />
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME_COLOR,
  },
  logoText: {
    fontSize: responsiveFontSize(5),
    fontWeight: '700',
    color: 'white',
  },
});
