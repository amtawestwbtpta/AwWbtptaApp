import {PermissionsAndroid, StyleSheet, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import Main from './Main';
import {useIsFocused} from '@react-navigation/native';
import {useGlobalContext} from '../context/Store';
import firestore from '@react-native-firebase/firestore';
import Loader from '../components/Loader';
import Toast from 'react-native-toast-message';
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
  } = useGlobalContext();

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
