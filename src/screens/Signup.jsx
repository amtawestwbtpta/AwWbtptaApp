import {StyleSheet, Text, View, Image, BackHandler} from 'react-native';
import React, {useState, useEffect} from 'react';
import {THEME_COLOR} from '../utils/Colors';
import CustomTextInput from '../components/CustomTextInput';
import CustomButton from '../components/CustomButton';
import {useNavigation} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import Registration from './Registration';
import firestore from '@react-native-firebase/firestore';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import {useIsFocused} from '@react-navigation/native';
const Signup = () => {
  const [showSignUpForm, setShowSignUpForm] = useState(true);
  const [allData, setAllData] = useState({});
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const [empid, setEmpid] = useState('');
  const [titleColor, setTitleColor] = useState('skyblue');
  const findEmpid = async () => {
    if (empid !== '') {
      await firestore()
        .collection('userteachers')
        .where('empid', '==', empid.toUpperCase())
        .get()
        .then(async snapShot => {
          if (snapShot.docs.length > 0) {
            showToast(
              'error',
              `Hello ${snapShot.docs[0]._data.tname}`,
              'You Are Already Registered, Please Login with your username and password',
            );
            setTimeout(() => {
              setEmpid('');
              navigation.navigate('Login');
            }, 1600);
          } else {
            await firestore()
              .collection('teachers')
              .where('empid', '==', empid.toUpperCase())
              .get()
              .then(snapshot => {
                if (snapShot) {
                  setAllData(snapshot.docs[0].data());
                  if (snapshot.docs[0].data().association === 'WBTPTA') {
                    let tname = snapshot.docs[0].data().tname;
                    Toast.show({
                      type: 'success',
                      text1: `Congrats! ${tname}`,
                      text2: `Please Review And Register Yourself On Next Page.`,
                      visibilityTime: 1500,
                      position: 'top',
                      topOffset: 500,
                    });
                    setTimeout(() => {
                      setShowSignUpForm(false);
                    }, 1500);
                  } else {
                    showToast(
                      'error',
                      'Only WBTPTA Members Are Allowed',
                      'Join Us Today To get All Advatage.',
                    );
                  }
                }
              })
              .catch(e => {
                showToast(
                  'error',
                  'Employee ID Is Invalid',
                  'Please Enter Correct Employee ID',
                );
                console.log(e);
              });
          }
        });
    } else {
      showToast('error', 'Form Is Invalid', 'Employee ID Field is Necessary');
      setTitleColor('red');
    }
  };

  const showToast = (type, text, text2) => {
    Toast.show({
      type: type,
      text1: text,
      text2: text2,
      visibilityTime: 2500,
      position: 'top',
      topOffset: 500,
    });
  };
  const setSignUpFalse = () => {
    setEmpid('');
    setShowSignUpForm(true);
  };
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.navigate('Login');
        return true;
      },
    );
    return () => backHandler.remove();
  }, [isFocused]);
  return (
    <View style={styles.container}>
      {showSignUpForm ? (
        <View style={styles.container}>
          <Image
            source={require('../assets/images/bg.jpg')}
            style={styles.banner}
          />

          <View style={styles.card}>
            <Text selectable style={styles.title}>
              Sign Up
            </Text>
            <Text selectable style={styles.label}>
              Enter Your Employee ID
            </Text>
            <CustomTextInput
              placeholder={'Enter Employee ID'}
              title={'Employee ID'}
              color={titleColor}
              maxLength={10}
              value={empid}
              onChangeText={text => setEmpid(text)}
            />

            <CustomButton title="Sign Up" onClick={findEmpid} />
            <CustomButton
              title="Cancel"
              color={'red'}
              onClick={() => {
                navigation.navigate('Login');
              }}
            />
          </View>
          <Toast />
        </View>
      ) : (
        <Registration data={allData} setSignUp={setSignUpFalse} />
      )}
    </View>
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  banner: {
    width: responsiveWidth(100),
    height: responsiveHeight(30),
  },
  card: {
    width: responsiveWidth(90),
    height: responsiveHeight(100),
    backgroundColor: 'white',
    position: 'absolute',
    top: responsiveHeight(28),
    elevation: 5,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.7,
  },
  title: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(3),
    fontWeight: '500',
    marginTop: responsiveHeight(3),
    color: THEME_COLOR,
  },
  label: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(2),
    fontWeight: '400',
    marginTop: 5,
    color: THEME_COLOR,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: responsiveHeight(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  textErr: {
    fontSize: responsiveFontSize(2),
    color: 'red',
    alignSelf: 'center',
    marginTop: responsiveHeight(4),
  },
  account: {
    color: 'white',
    fontWeight: '500',
    fontSize: responsiveFontSize(2),
    fontFamily: 'kalpurush',
  },
});
