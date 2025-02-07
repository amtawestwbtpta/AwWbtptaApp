import {
  StyleSheet,
  Text,
  View,
  Image,
  BackHandler,
  Alert,
  StatusBar,
  TouchableOpacity,
  Linking,
  ScrollView,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {THEME_COLOR} from '../utils/Colors';
import CustomTextInput from '../components/CustomTextInput';
import CustomButton from '../components/CustomButton';
import {useNavigation} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import EncryptedStorage from 'react-native-encrypted-storage';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import Loader from '../components/Loader';
import {useIsFocused} from '@react-navigation/native';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import {useGlobalContext} from '../context/Store';
import bcrypt from 'react-native-bcrypt';
import isaac from 'isaac';
import uuid from 'react-native-uuid';
import DeviceInfo from 'react-native-device-info';
import {TelegramURL} from '../modules/constants';
const Login = () => {
  const docId = uuid.v4();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const {state, setState} = useGlobalContext();
  const [visible, setVisible] = useState(false);
  const [token, setToken] = useState('');
  const [titleColor, setTitleColor] = useState('skyblue');
  const [inputField, setInputField] = useState({
    username: '',
    password: '',
  });
  const [errField, setErrField] = useState({
    usernameErr: '',
    passwordErr: '',
  });
  bcrypt.setRandomFallback(len => {
    const buf = new Uint8Array(len);

    return buf.map(() => Math.floor(isaac.random() * 256));
  });
  const compare = (userPassword, serverPassword) => {
    let match = bcrypt.compareSync(userPassword, serverPassword);

    return match;
  };

  const validForm = () => {
    let formIsValid = true;
    setErrField({
      usernameErr: '',
      passwordErr: '',
      cpasswordErr: '',
    });
    if (inputField.username === '') {
      formIsValid = false;
      setErrField(prevState => ({
        ...prevState,
        usernameErr: 'Please Enter Username',
      }));
    }

    if (inputField.password === '') {
      formIsValid = false;
      setErrField(prevState => ({
        ...prevState,
        passwordErr: 'Please Enter Password',
      }));
    }

    return formIsValid;
  };

  const getFcmToken = async () => {
    let deviceToken = await messaging().getToken();
    setToken(deviceToken);
  };

  const signIn = async (email, password) => {
    await auth()
      .createUserWithEmailAndPassword(email, password)
      .then(() => {
        console.log('User account created & signed in!');
      })
      .catch(error => {
        if (error.code === 'auth/email-already-in-use') {
          console.log('That email address is already in use!');
        }

        if (error.code === 'auth/invalid-email') {
          console.log('That email address is invalid!');
        }

        console.log(error);
      });
  };

  const submitForm = async () => {
    if (validForm()) {
      setVisible(true);
      try {
        const username = inputField.username.replace(/\s/g, '').toLowerCase();
        await firestore()
          .collection('userteachers')
          .where('username', '==', username)
          .get()
          .then(async snapShot => {
            let record = snapShot.docs[0]._data;
            let userRecord = JSON.stringify(snapShot.docs[0]._data);
            if (compare(inputField.password, record.password)) {
              if (!record.disabled) {
                if (!__DEV__) {
                  await firestore()
                    .collection('tokens')
                    .where('token', '==', token)
                    .get()
                    .then(async snapShot => {
                      const tokendatas = snapShot.docs.map(doc => ({
                        ...doc.data(),
                        id: doc.id,
                      }));
                      if (tokendatas.length === 0) {
                        await firestore()
                          .collection('tokens')
                          .doc(docId)
                          .set({
                            id: docId,
                            token: token,
                            date: Date.now(),
                            username: inputField.username.replace(/\s/g, '').toLowerCase(),
                            name: record.tname,
                            circle: record.circle,
                            question: record.question,
                            model: DeviceInfo.getModel(),
                            brand: DeviceInfo.getBrand(),
                            os: DeviceInfo.getSystemName(),
                            osVersion: DeviceInfo.getSystemVersion(),
                          });
                      }
                    })
                    .catch(e => {
                      showToast('success', `This is A new Device`);
                      console.log(e);
                    });
                }

                await firestore()
                  .collection('teachers')
                  .where('pan', '==', record.pan)
                  .get()
                  .then(async snapShot => {
                    let trecord = snapShot.docs[0]._data;
                    let teacherRecord = JSON.stringify(snapShot.docs[0]._data);
                    let loggedAt = Date.now().toString();
                    signIn(record.email, inputField.password);

                    setState({
                      USER: record,
                      TEACHER: trecord,
                      TOKEN: token,
                      LOGGEDAT: loggedAt,
                    });

                    await EncryptedStorage.setItem('teacher', teacherRecord);
                    await EncryptedStorage.setItem('user', userRecord);
                    await EncryptedStorage.setItem('loggedAt', loggedAt);
                    await EncryptedStorage.setItem('token', token);
                    setVisible(false);
                    showToast(
                      'success',
                      `Congrats ${record.tname}!`,
                      'You are Logined Successfully!',
                    );
                    setInputField({
                      username: '',
                      password: '',
                    });
                    setTimeout(() => navigation.navigate('Home'), 600);
                  })
                  .catch(e => {
                    showToast('error', 'Your Account Not Found');
                    console.log(e);
                  });
              } else {
                setVisible(false);
                showToast('error', 'Your Account is Disabled');
              }
            } else {
              setVisible(false);
              showToast('error', 'Invalid Password');
            }
          })
          .catch(e => {
            setVisible(false);
            console.log(e);
            showToast('error', 'Invalid Username');
          });
      } catch (e) {
        setVisible(false);
        console.log(e);
        showToast('error', 'Connection Error');
      }
    } else {
      showToast('error', 'Form Is Invalid');
      setTitleColor('red');
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

  const openURI = async () => {
    const url = TelegramURL;
    const supported = await Linking.canOpenURL(url); //To check if URL is supported or not.
    if (supported) {
      await Linking.openURL(url); // It will open the URL on browser.
    } else {
      Alert.alert(`Don't know how to open this URL: ${url}`);
    }
  };
  const checkLogin = async () => {
    const user = await EncryptedStorage.getItem('user');
    if (user) {
      navigation.navigate('Home');
    }
  };
  useEffect(() => {}, [inputField]);
  useEffect(() => {
    checkLogin();
    getFcmToken();
  }, [isFocused]);

  useEffect(() => {
    const backAction = () => {
      Alert.alert('Hold On!', 'Are You Sure To Exit App?', [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        {
          text: 'Exit',
          onPress: () => BackHandler.exitApp(),
        },
      ]);
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, [isFocused]);
  return (
    <ScrollView>
      <StatusBar backgroundColor={THEME_COLOR} barStyle={'light-content'} />
      <Image
        source={require('../assets/images/bg.jpg')}
        style={styles.banner}
      />

      <View style={styles.card}>
        <Toast />
        <Text selectable style={styles.title}>
          Login
        </Text>
        <CustomTextInput
          value={inputField.username}
          title={'Username'}
          color={titleColor}
          placeholder={'Enter Username'}
          onChangeText={text => setInputField({...inputField, username: text})}
        />
        {errField.usernameErr.length > 0 && (
          <Text selectable style={styles.textErr}>
            {errField.usernameErr}
          </Text>
        )}
        <CustomTextInput
          secure={true}
          value={inputField.password}
          title={'Password'}
          color={titleColor}
          placeholder={'Enter Password'}
          onChangeText={text => {
            setInputField({...inputField, password: text});
          }}
        />
        {errField.passwordErr.length > 0 && (
          <Text selectable style={styles.textErr}>
            {errField.passwordErr}
          </Text>
        )}

        <CustomButton title="Login" onClick={submitForm} />
        <View style={styles.row}>
          <Text selectable style={{color: 'black', fontSize: 18}}>
            Don't Have an Account?
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: 'green',
              padding: responsiveWidth(2),
              borderRadius: 5,
              marginLeft: 5,
            }}
            onPress={() => navigation.navigate('Signup')}>
            <Text
              selectable
              style={styles.account}
              // onPress={() => navigation.navigate('Signup')}
            >
              Create New
            </Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.row, {marginTop: 20}]}>
          <Text selectable style={{color: 'black', fontSize: 18}}>
            Forgot Password?
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('OTPForm')}
            style={{
              backgroundColor: 'chocolate',
              padding: responsiveWidth(2),
              borderRadius: 5,
              marginLeft: 5,
            }}>
            <Text selectable style={styles.account}>
              Press Here
            </Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.row, {marginTop: 20}]}>
          <Text selectable style={{color: 'black', fontSize: 18}}>
            Feeling Trouble?
          </Text>
          <TouchableOpacity
            onPress={openURI}
            style={{
              backgroundColor: 'blueviolet',
              padding: responsiveWidth(2),
              borderRadius: 5,
              marginLeft: 5,
            }}>
            <Text selectable style={styles.account}>
              Press Here
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <Loader visible={visible} />
      <Toast />
    </ScrollView>
  );
};

export default Login;

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

    backgroundColor: 'white',

    elevation: 5,
    borderRadius: responsiveWidth(5),
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.7,
    marginTop: -responsiveHeight(3),
    marginBottom: responsiveHeight(3),
    paddingBottom: responsiveHeight(2),
  },
  title: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(3),
    fontWeight: '500',
    marginTop: responsiveHeight(1),
    color: THEME_COLOR,
  },
  label: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(1.5),
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
  },
});
