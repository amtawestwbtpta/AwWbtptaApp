import {PermissionsAndroid, StyleSheet, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import Main from './Main';
import {useIsFocused} from '@react-navigation/native';
import {useGlobalContext} from '../context/Store';
import firestore from '@react-native-firebase/firestore';
import Loader from '../components/Loader';
import Geolocation from '@react-native-community/geolocation';
import Toast from 'react-native-toast-message';
import DeviceInfo from 'react-native-device-info';
import EncryptedStorage from 'react-native-encrypted-storage';
import RNExitApp from 'react-native-exit-app';
const Home = () => {
  const {
    state,
    slideState,
    setSlideState,
    slideUpdateTime,
    setSlideUpdateTime,
    questionRateState,
    setQuestionRateState,
    questionRateUpdateTime,
    setQuestionRateUpdateTime,
    locationTime,
    location,
    setLocation,
    setLocationTime,
  } = useGlobalContext();

  const user = state.USER;
  const token = state.TOKEN;

  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [visible, setVisible] = useState(false);
  const [showMain, setShowMain] = useState(false);

  const getSlides = async () => {
    setVisible(true);
    await firestore()
      .collection('slides')
      .get()
      .then(snapshot => {
        const data = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        }));
        setSlideState(data);
        setVisible(false);
        setShowMain(true);
      })
      .catch(e => {
        setVisible(false);
        setShowMain(true);
        showToast('error', e);
      });
  };

  const getData = async () => {
    const difference = (slideUpdateTime - Date.now()) / 1000 / 60 / 15;
    if (difference >= 1 || slideState.length === 0) {
      setSlideUpdateTime(Date.now());
      getSlides();
    } else {
      setVisible(false);
      setShowMain(true);
    }
    const questionRateDifference =
      (Date.now() - questionRateUpdateTime) / 1000 / 60 / 15;
    if (questionRateDifference >= 1 || questionRateState.length === 0) {
      setQuestionRateUpdateTime(Date.now());
      getQuestionRate();
    }
    const locationTimeDifference = (Date.now() - locationTime) / 1000 / 60 / 5;
    if (locationTimeDifference >= 1 || !location) {
      grantLocationAccess();
      setLocationTime(Date.now());
      setLocation(true);
    }
  };

  const getQuestionRate = async () => {
    setVisible(true);
    await firestore()
      .collection('question_rate')
      .get()
      .then(snapshot => {
        const data = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        }))[0];
        setQuestionRateState(data);
        setVisible(false);
      })
      .catch(e => {
        setVisible(false);
        showToast('error', e);
      });
  };

  const grantLocationAccess = async () => {
    setVisible(false);
    setShowMain(true);
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'WBTPTA App Location Permission',
        message: 'WBTPTA App needs Mandatory access to your location!',
      },
    );
    if (granted) {
      Geolocation.getCurrentPosition(
        async position => {
          const date = Date.now();
          const deviceToken = token;
          const docId = __DEV__
            ? deviceToken.split(':')[0]
            : deviceToken.split('-')[0];
          !__DEV__ &&
            (await firestore()
              .collection('userLocations')
              .doc(docId)
              .set({
                id: docId,
                userId: user.id,
                username: user.username,
                phone: user.phone,
                tname: user.tname,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                date: date,
                token: deviceToken,
                photo: user.url,
                brand: DeviceInfo.getBrand(),
                model: DeviceInfo.getModel(),
              })
              .then(() => {
                setVisible(false);
                setShowMain(true);
                console.log('Location data sent successfully');
              })
              .catch(err => console.log(err)));
        },
        error => {
          // See error code charts below.

          console.log(error.code, error.message);
          // setTimeout(async () => {
          //   await EncryptedStorage.clear();
          //   navigation.navigate('SignOut');
          // }, 2000);
        },

        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
    } else {
      showToast('error', 'Location Permission Denied, Hence Exiting');
      setTimeout(async () => {
        await EncryptedStorage.clear();
        navigation.navigate('SignOut');
      }, 2000);
    }
  };

  const showToast = (type, text, text2) => {
    Toast.show({
      type: type,
      text1: text,
      text2: text2,
      visibilityTime: 1500,
      position: 'top',
      topOffset: 500,
    });
  };
  useEffect(() => {
    if (!state) {
      navigation.navigate('Login');
    }
    getData();
  }, [isFocused]);

  return (
    <View style={{flex: 1}}>
      {showMain && <Main navigation={navigation} />}
      <Loader visible={visible} />
      <Toast />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({});
