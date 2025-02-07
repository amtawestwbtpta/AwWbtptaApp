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
  Image,
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
  withTiming,
} from 'react-native-reanimated';
import {useGlobalContext} from '../context/Store';
import firestore from '@react-native-firebase/firestore';
import Toast from 'react-native-toast-message';
import {AppURL, appVersion} from '../modules/constants';
import CustomButton from '../components/CustomButton';
import RNExitApp from 'react-native-exit-app';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Indicator from '../components/Indicator';

const Splash = () => {
  const {setState} = useGlobalContext();
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const mamata_y = useSharedValue(0);
  const logoImg_y = useSharedValue(0);
  const amta_x = useSharedValue(0);
  const west_x = useSharedValue(0);
  const circle_y = useSharedValue(0);

  const [showMamata, setShowMamata] = useState(true);
  const [showAvishek, setShowAvishek] = useState(false);
  const [showSukanta, setShowSukanta] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const mamataImageAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateY: -mamata_y.value}],
    };
  });
  const logoImageAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateY: -logoImg_y.value}],
    };
  });
  const amtaAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateX: amta_x.value}],
    };
  });
  const westAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateX: west_x.value}],
    };
  });
  const circleAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateY: circle_y.value}],
    };
  });
  const swipeAmtaWestCircle = () => {
    mamata_y.value = responsiveHeight(100);
    logoImg_y.value = responsiveHeight(100);
    amta_x.value = -responsiveWidth(100);
    west_x.value = responsiveWidth(100);
    circle_y.value = responsiveHeight(100);

    mamata_y.value = withTiming(0, {
      duration: 500,
    });
    setTimeout(() => {
      changePhoto();
      logoImg_y.value = withTiming(0, {
        duration: 500,
      });
      amta_x.value = withTiming(0, {
        duration: 600,
      });
      west_x.value = withTiming(0, {
        duration: 700,
      });
      circle_y.value = withTiming(0, {
        duration: 800,
      });
    }, 500);
  };

  const getDetails = async () => {
    const userID = JSON.parse(await EncryptedStorage.getItem('user'));
    const teacherID = JSON.parse(await EncryptedStorage.getItem('teacher'));
    const loggedAt = parseInt(await EncryptedStorage.getItem('loggedAt'));
    const token = await EncryptedStorage.getItem('token');
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
                  setShowLoader(false);
                  navigation.navigate('Home');
                }, 1000);
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
                        setShowLoader(false);
                        navigation.navigate('SignOut');
                      }, 1000);
                    } else {
                      setState({
                        USER: userID,
                        TEACHER: teacherID,
                        TOKEN: token,
                        LOGGEDAT: loggedAt,
                      });

                      console.log('User Settled going to Home Page');
                      setTimeout(() => {
                        setShowLoader(false);
                        navigation.navigate('Home');
                      }, 1000);
                    }
                  })
                  .catch(async e => {
                    setShowLoader(false);
                    console.log(e);
                    await EncryptedStorage.clear();
                    navigation.navigate('Login');
                  });
              }
            } else {
              setTimeout(async () => {
                setShowLoader(false);
                navigation.navigate('Login');
              }, 1000);
            }
          }
        }
      })
      .catch(e => {
        setShowLoader(false);
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

  const changePhoto = () => {
    setInterval(() => {
      setShowMamata(false);
      setShowAvishek(true);
      setTimeout(() => {
        setShowAvishek(false);
        setShowSukanta(true);
        setTimeout(() => {
          setShowSukanta(false);
          setShowMamata(true);
        }, 2000);
      }, 2000);
    }, 2000);
  };

  useEffect(() => {
    setTimeout(() => {
      getDetails();

      setShowLoader(true);
    }, 5000);
    swipeAmtaWestCircle();
  }, [isFocused, showModal]);
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={THEME_COLOR} barStyle={'light-content'} />
      {!showModal ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Image
            style={{
              width: 200,
              height: 200,
              position: 'absolute',
              tintColor: 'white',
              top: responsiveHeight(10),
            }}
            source={require('../assets/images/tmc.png')}
          />
          {showMamata && (
            <Animated.Image
              source={require('../assets/images/mb2.png')}
              style={[
                {
                  width: 240,
                  height: 240,
                  marginVertical: responsiveHeight(1),
                  borderRadius: 200,
                },
                mamataImageAnimatedStyle,
              ]}
            />
          )}
          {showAvishek && (
            <Animated.Image
              source={require('../assets/images/ab2.png')}
              style={[
                {
                  width: 240,
                  height: 240,
                  marginVertical: responsiveHeight(1),
                  borderRadius: 200,
                },
              ]}
            />
          )}
          {showSukanta && (
            <Animated.Image
              source={require('../assets/images/sp2.png')}
              style={[
                {
                  width: 240,
                  height: 240,
                  marginVertical: responsiveHeight(1),
                  borderRadius: 200,
                },
              ]}
            />
          )}
          <Animated.Image
            source={require('../assets/images/logo.png')}
            style={[
              {
                width: 150,
                height: 150,
                marginVertical: responsiveHeight(1),
              },
            ]}
          />

          <View
            style={{
              marginVertical: responsiveHeight(1),
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Animated.Text
              selectable
              style={[styles.logoText, amtaAnimatedStyle]}>
              Amta
            </Animated.Text>
            <Animated.Text
              selectable
              style={[styles.logoText, westAnimatedStyle]}>
              West
            </Animated.Text>
            <Animated.Text
              selectable
              style={[styles.logoText, circleAnimatedStyle]}>
              WBTPTA
            </Animated.Text>
          </View>
          <View
            style={{
              marginVertical: responsiveHeight(1),
              width: responsiveFontSize(40),
              height: responsiveWidth(40),
            }}>
            {showLoader && (
              <Indicator pattern={'UIActivity'} color={'white'} size={40} />
            )}
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
                onPress={() => RNExitApp.exitApp()}>
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
    fontSize: responsiveFontSize(4),
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
