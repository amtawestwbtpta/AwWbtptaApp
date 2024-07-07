import {
  StyleSheet,
  ActivityIndicator,
  Text,
  View,
  StatusBar,
  Linking,
  Alert,
  Modal,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {THEME_COLOR} from '../utils/Colors';
import {useNavigation, useIsFocused} from '@react-navigation/native';
import {
  responsiveHeight,
  responsiveFontSize,
  responsiveWidth,
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
import CustomButton from '../components/CustomButton';
import RNExitApp from 'react-native-exit-app';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
const Splash = () => {
  const {state, setState} = useGlobalContext();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const h = useSharedValue(0);
  const w = useSharedValue(0);
  const r = useSharedValue('0deg');
  const [token, setToken] = useState('');
  const [showModal, setShowModal] = useState(false);
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
    const loggedAt = parseInt(await EncryptedStorage.getItem('loggedAt'));
    await firestore()
      .collection('appUpdate')
      .get()
      .then(async snapshot => {
        const data = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        }))[0];

        if (data.update) {
          if (data.appVersion > appVersion) {
            setShowModal(true);
          } else {
            setShowModal(false);
            if (userID != null) {
              if ((Date.now() - loggedAt) / 1000 / 60 / 15 < 1) {
                setState({
                  USER: userID,
                  TEACHER: teacherID,
                  TOKEN: token,
                  LOGGEDAT: loggedAt,
                });
                console.log('User Not Logged');

                setTimeout(() => {
                  navigation.navigate('Home');
                }, 500);
              } else {
                console.log('User Logged');
                await firestore()
                  .collection('userteachers')
                  .where('empid', '==', userID.empid)
                  .get()
                  .then(snapshot => {
                    let userData = snapshot.docs[0]._data;

                    if (userData.disabled) {
                      console.log('User Disabled');
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
                      console.log('User Settled going to Home Page');
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
          }
        }
      })
      .catch(e => {
        console.log(e);
      });
  };
  const getFcmToken = async () => {
    let deviceToken = await messaging().getToken();
    setToken(deviceToken);
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
  }, [isFocused, showModal]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={THEME_COLOR} barStyle={'light-content'} />
      {!showModal ? (
        <View>
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
          </View>
          <View style={{margin: responsiveHeight(2)}}>
            <ActivityIndicator size={50} color={'white'} />
          </View>
        </View>
      ) : (
        <Modal animationType="slide" visible={showModal} transparent>
          <View style={styles.modalView}>
            <View style={styles.mainView}>
              <Text
                selectable
                style={{
                  fontSize: responsiveFontSize(3),
                  fontWeight: '500',
                  textAlign: 'center',
                  color: THEME_COLOR,
                }}>
                Your App Has a New Update
              </Text>
              <Text selectable style={styles.label}>
                Please Download and Install the latest version of the app to
                enjoy all the features.
              </Text>
              <CustomButton
                title={'Download Now'}
                color={'darkgreen'}
                onClick={async () => {
                  const supported = await Linking.canOpenURL(AppURL); //To check if URL is supported or not.
                  if (supported) {
                    await EncryptedStorage.clear();
                    await Linking.openURL(AppURL); // It will open the URL on browser.
                  } else {
                    Alert.alert(`Can't open this URL: ${AppURL}`);
                  }
                }}
              />
              <TouchableOpacity
                style={{
                  marginTop: responsiveHeight(2),
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() => {
                  Alert.alert('Hold On!', 'Are You Sure To Exit App?', [
                    {
                      text: 'Cancel',
                      onPress: () => null,
                      style: 'cancel',
                    },
                    {
                      text: 'Exit',
                      onPress: () => RNExitApp.exitApp(),
                    },
                  ]);
                  return true;
                }}>
                <MaterialCommunityIcons
                  name="power"
                  size={responsiveFontSize(4)}
                  color={'red'}
                />
                <Text selectable style={{color: 'red', fontWeight: 'bold'}}>
                  Exit App
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

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
  modalView: {
    flex: 1,

    width: responsiveWidth(90),
    height: responsiveWidth(30),
    padding: responsiveHeight(2),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  mainView: {
    width: responsiveWidth(90),
    height: responsiveHeight(30),
    padding: responsiveHeight(2),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: 'white',
    borderRadius: 10,

    backgroundColor: 'white',
    alignSelf: 'center',
  },
  label: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(2),
    fontWeight: '500',
    margin: responsiveHeight(1),
    color: THEME_COLOR,
    textAlign: 'center',
  },
});
