import {KeyboardAvoidingView, StyleSheet, View} from 'react-native';
import React, {useEffect, useContext, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import Main from './Main';
import {useIsFocused} from '@react-navigation/native';
import {useGlobalContext} from '../context/Store';
import firestore from '@react-native-firebase/firestore';
import Loader from '../components/Loader';
const Home = () => {
  const {
    state,
    slideState,
    setSlideState,
    slideUpdateTime,
    setSlideUpdateTime,
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
    if (difference >= 1 || slideState.length == 0) {
      setSlideUpdateTime(Date.now());
      getSlides();
    } else {
      setVisible(false);
      setShowMain(true);
    }
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
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({});
