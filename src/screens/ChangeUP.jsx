import {StyleSheet, Text, View, ScrollView, BackHandler} from 'react-native';
import React, {useState, useEffect} from 'react';
import {THEME_COLOR} from '../utils/Colors';
import EncryptedStorage from 'react-native-encrypted-storage';
import CustomButton from '../components/CustomButton';
import CustomTextInput from '../components/CustomTextInput';
import firestore from '@react-native-firebase/firestore';
import Toast from 'react-native-toast-message';
import {useGlobalContext} from '../context/Store';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import Loader from '../components/Loader';
import {
  responsiveHeight,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import bcrypt from 'react-native-bcrypt';
import isaac from 'isaac';
const ChangeUP = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const {state, setActiveTab} = useGlobalContext();
  const user = state.USER;
  const [showLoder, setShowLoder] = useState(false);
  const [showUsername, setShowUsername] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showUPBtn, setShowUPBtn] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confPassword, setConfPassword] = useState('');
  bcrypt.setRandomFallback(len => {
    const buf = new Uint8Array(len);

    return buf.map(() => Math.floor(isaac.random() * 256));
  });

  const usernameChange = async () => {
    if (username !== '' && username !== user.username) {
      setShowLoder(true);
      await firestore()
        .collection('userteachers')
        .where('username', '==', username)
        .get()
        .then(async snapshot => {
          const datas = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
          }));
          if (datas.length === 0) {
            await firestore()
              .collection('userteachers')
              .doc(user.id)
              .update({
                username: username,
              })
              .then(async () => {
                setShowLoder(false);
                navigation.navigate('SignOut');
              })
              .catch(e => {
                setShowLoder(false);
                showToast('error', 'Username Change Failed!');
              });
          } else {
            setShowLoder(false);
            showToast('error', 'Username Already Taken!');
          }
        })
        .catch(e => {
          setShowLoder(false);
          showToast('error', 'Failed To Change Username');
          console.log(e);
        });
    } else {
      setShowLoder(false);
      showToast('error', 'Please Enter Valid Username');
    }
  };

  const passwordChange = async () => {
    if (
      password !== '' &&
      password.length >= 6 &&
      confPassword !== '' &&
      password === confPassword
    ) {
      setShowLoder(true);

      await firestore()
        .collection('userteachers')
        .doc(user.id)
        .update({
          password: bcrypt.hashSync(password, 10),
        })
        .then(async () => {
          await EncryptedStorage.clear();
          navigation.navigate('SignOut');
        })
        .catch(e => {
          showToast('error', 'Failed To Change Password');
          console.log(e);
        });
    } else {
      setShowLoder(false);
      showToast('error', 'Please Enter Valid Password');
    }
  };
  const showToast = (type, text) => {
    Toast.show({
      type: type,
      text1: text,
      visibilityTime: 1500,
      position: 'top',
      topOffset: 500,
    });
  };
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        setActiveTab(0);
        return true;
      },
    );
    return () => backHandler.remove();
  }, []);
  useEffect(() => {}, [isFocused]);
  useEffect(() => {}, [username, password, confPassword]);
  return (
    <View
      style={{
        flex: 1,
      }}>
      <Text selectable style={styles.heading}>
        Change Username & Password
      </Text>
      {showUPBtn ? (
        <View>
          <CustomButton
            title={'Change Username'}
            onClick={() => {
              setShowUsername(true);
              setShowPassword(false);
              setShowUPBtn(false);
            }}
          />
          <CustomButton
            title={'Change Password'}
            color={'darkgreen'}
            onClick={() => {
              setShowUsername(false);
              setShowPassword(true);
              setShowUPBtn(false);
            }}
          />
          <CustomButton
            title={'Change Photo'}
            color={'blueviolet'}
            onClick={() => {
              navigation.navigate('ChangePhoto');
            }}
          />
        </View>
      ) : null}
      {showUsername ? (
        <View>
          <Text selectable style={styles.heading}>
            Change Username
          </Text>
          <Text selectable style={styles.dropDownText}>
            Current Username: {user.username}
          </Text>
          <CustomTextInput
            value={username}
            onChangeText={text => setUsername(text.replace(/\s/g, ''))}
            placeholder={'Enter Username'}
          />
          <CustomButton
            title={'Update Username'}
            color={'blue'}
            onClick={usernameChange}
          />
          <CustomButton
            title={'Cancel'}
            color={'purple'}
            onClick={() => {
              setShowUPBtn(true);
              setShowUsername(false);
            }}
          />
        </View>
      ) : null}
      {showPassword ? (
        <View>
          <Text selectable style={styles.heading}>
            Change Password
          </Text>
          <CustomTextInput
            value={password}
            onChangeText={text => setPassword(text)}
            placeholder={'Enter Password'}
            secure={true}
            bgcolor={password === confPassword && password !== ''}
          />
          <CustomTextInput
            value={confPassword}
            onChangeText={text => setConfPassword(text)}
            placeholder={'Confirm Password'}
            bgcolor={
              password === confPassword && password !== ''
                ? 'rgba(135, 255, 167,.3)'
                : 'transparent'
            }
          />
          <CustomButton
            title={'Update Password'}
            color={'blue'}
            onClick={passwordChange}
          />
          <CustomButton
            title={'Cancel'}
            color={'purple'}
            onClick={() => {
              setShowUPBtn(true);
              setShowPassword(false);
            }}
          />
        </View>
      ) : null}

      <Toast />
      <Loader visible={showLoder} />
    </View>
  );
};

export default ChangeUP;

const styles = StyleSheet.create({
  heading: {
    fontSize: responsiveFontSize(3),
    fontWeight: '800',
    marginTop: responsiveHeight(3),
    marginBottom: responsiveHeight(3),
    alignSelf: 'center',
    color: THEME_COLOR,
    textAlign: 'center',
  },

  dropDownText: {
    fontSize: responsiveFontSize(2),
    color: THEME_COLOR,
    alignSelf: 'center',
    textAlign: 'center',
  },
});
