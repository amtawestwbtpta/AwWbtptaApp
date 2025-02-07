import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  BackHandler,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {THEME_COLOR} from '../utils/Colors';
import CustomTextInput from '../components/CustomTextInput';
import CustomButton from '../components/CustomButton';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import EncryptedStorage from 'react-native-encrypted-storage';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import ImagePicker from 'react-native-image-crop-picker';
import {Image as Img} from 'react-native-compressor';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Loader from '../components/Loader';
import bcrypt from 'react-native-bcrypt';
import isaac from 'isaac';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import {notifyAll} from '../modules/notification';
const Registration = props => {
  let data = props.data;
  let setSignUpFalse = props.setSignUp;

  // console.log(data);
  bcrypt.setRandomFallback(len => {
    const buf = new Uint8Array(len);

    return buf.map(() => Math.floor(isaac.random() * 256));
  });
  const navigation = useNavigation();
  const userId = data.id;
  const [visible, setVisible] = useState(false);
  const [path, setPath] = useState('');
  const [imageName, setImageName] = useState('');
  const [titleColor, setTitleColor] = useState('skyblue');
  const [inputField, setInputField] = useState({
    teachersID: data.id,
    tname: data.tname,
    tsname: data.tsname,
    school: data.school,
    desig: data.desig,
    pan: data.pan,
    udise: data.udise,
    sis: data.sis,
    circle: data.circle,
    showAccount: data.showAccount,
    empid: data.empid,
    question: data.question,
    email: data.email,
    phone: data.phone,
    id: userId,
    dpscst: 'District Primary School Council, Howrah',
    dpsc: 'Howrah District Primary School Council',
    dpsc1: '',
    dpsc2: 'CHAIRMAN, DPSC, HOWRAH',
    dpsc3: '18, N.D. MUKHERJEE ROAD',
    dpsc4: 'HOWRAH- 1',
    tan: 'CALD02032C',
    username: '',
    password: '',
    cpassword: '',
    createdAt: Date.now(),
  });
  useEffect(() => {}, [inputField]);

  function ValidateEmail(mail) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/.test(mail)) {
      return true;
    }
    // alert("You have entered an invalid email address!");
    return false;
  }
  const reference = storage().ref(`/profileImage/${userId}-${imageName}`);

  const registerUser = async () => {
    // e.preventDefault();
    // console.log(inputField);
    if (validForm()) {
      setVisible(true);
      const result = await Img.compress(path, {
        progressDivider: 10,
        downloadProgress: progress => {
          console.log('downloadProgress: ', progress);
        },
      });
      const pathToFile = result;
      // uploads file
      await reference.putFile(pathToFile);
      const url = await storage()
        .ref(`/profileImage/${userId}-${imageName}`)
        .getDownloadURL();
        const username = inputField.username.replace(/\s/g, '').toLowerCase();
      await firestore()
        .collection('userteachers')
        .doc(userId)
        .set({
          teachersID: inputField.teachersID,
          tname: inputField.tname,
          tsname: inputField.tsname,
          school: inputField.school,
          desig: inputField.desig,
          pan: inputField.pan,
          udise: inputField.udise,
          sis: inputField.sis,
          circle: inputField.circle,
          showAccount: inputField.showAccount,
          empid: inputField.empid,
          question: inputField.question,
          email: inputField.email,
          phone: inputField.phone,
          id: userId,
          dpscst: inputField.dpscst,
          dpsc: inputField.dpsc,
          dpsc1: inputField.dpsc1,
          dpsc2: inputField.dpsc2,
          dpsc3: inputField.dpsc3,
          dpsc4: inputField.dpsc4,
          tan: inputField.tan,
          username: username,
          password: bcrypt.hashSync(inputField.password, 10),
          createdAt: inputField.createdAt,
          url: url,
          photoName: `${userId}-${imageName}`,
        })
        .then(async () => {
          const backendUrl = `https://awwbtpta.vercel.app/api/signup`;
          inputField.username = username
          try {
            let response = await axios.post(backendUrl, inputField);
            let record = response.data;
            if (record.success) {
              await firestore()
                .collection('profileImage')
                .doc(userId)
                .set({
                  title: inputField.tname,
                  description: inputField.school,
                  url: url,
                  fileName: `${userId}-${imageName}`,
                  id: userId,
                })
                .then(async () => {
                  await firestore().collection('teachers').doc(userId).update({
                    registered: true,
                  });
                  let title = `${inputField.tname} is Registered To App`;
                  let body = `${
                    inputField.tname
                  } Has Just Registered To Our App. WBTPTA Amta West Welcome ${
                    data.gender === 'male' ? 'Him' : 'Her'
                  }.`;
                  await notifyAll(title, body).then(async () => {
                    await ImagePicker.clean()
                      .then(() => {
                        console.log(
                          'removed all tmp images from tmp directory',
                        );
                      })
                      .catch(e => {
                        console.log(e);
                      });
                    EncryptedStorage.clear();
                    setVisible(false);
                    showToast(
                      'success',
                      `Congratulation ${inputField.tname} You are Successfully Registered!`,
                    );
                    setInputField({
                      teachersID: '',
                      tname: '',
                      tsname: '',
                      school: '',
                      desig: '',
                      pan: '',
                      udise: '',
                      sis: '',
                      circle: '',
                      showAccount: '',
                      empid: '',
                      question: '',
                      email: '',
                      phone: '',
                      id: '',
                      dpscst: 'District Primary School Council, Howrah',
                      dpsc: 'Howrah District Primary School Council',
                      dpsc1: '',
                      dpsc2: 'CHAIRMAN, DPSC, HOWRAH',
                      dpsc3: '18, N.D. MUKHERJEE ROAD',
                      dpsc4: 'HOWRAH- 1',
                      tan: 'CALD02032C',
                      username: '',
                      password: '',
                      cpassword: '',
                      createdAt: Date.now(),
                    });
                    setImageName('');
                    setPath('');
                    setSignUpFalse();
                    setTimeout(() => navigation.navigate('Login'), 1500);
                  });
                })
                .catch(e => {
                  setVisible(false);
                  showToast('error', 'Some Error Happened!');
                  console.log(e);
                  EncryptedStorage.clear();
                  setTimeout(() => {
                    navigation.navigate('Login');
                  }, 1500);
                });
            } else {
              setVisible(false);
              showToast('error', 'Some Error Happened!');
              EncryptedStorage.clear();
              setTimeout(() => {
                navigation.navigate('Login');
              }, 1500);
            }
          } catch (e) {
            setVisible(false);
            showToast('error', 'Some Error Happened!');
            console.log(e.response.data.data);
            EncryptedStorage.clear();
            setTimeout(() => {
              navigation.navigate('Login');
            }, 1500);
          }
        })
        .catch(e => {
          setVisible(false);
          showToast('error', e);
          console.log(e);
        });
    } else {
      setVisible(false);
      showToast('error', 'Form Is Invalid');
      setTitleColor('red');
    }
  };
  const validForm = () => {
    let formIsValid = true;

    if (inputField.username === '') {
      formIsValid = false;
    }
    if (inputField.email === '' || !ValidateEmail(inputField.email)) {
      formIsValid = false;
    }
    if (inputField.phone === '') {
      formIsValid = false;
    }
    if (inputField.password === '') {
      formIsValid = false;
    }
    if (inputField.password.length <= 5) {
      formIsValid = false;
      setErrField(prevState => ({
        ...prevState,
        passwordErr: 'Password length must be minimum 6',
      }));
    }

    if (
      inputField.cpassword === '' ||
      inputField.password !== inputField.cpassword
    ) {
      formIsValid = false;
    }
    return formIsValid;
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
        setSignUpFalse();
        return true;
      },
    );
    return () => backHandler.remove();
  }, []);
  return (
    <ScrollView>
      <Image
        source={require('../assets/images/bg.jpg')}
        style={styles.banner}
      />

      <View style={styles.card}>
        <Text selectable style={styles.title}>
          Sign Up
        </Text>
        <CustomTextInput
          placeholder={'Enter Email'}
          title={'Email'}
          color={titleColor}
          value={inputField.email}
          onChangeText={text => setInputField({...inputField, email: text})}
        />

        <CustomTextInput
          placeholder={'Enter Mobile Number'}
          title={'Mobile'}
          color={titleColor}
          value={inputField.phone}
          onChangeText={text => setInputField({...inputField, phone: text})}
        />

        <CustomTextInput
          placeholder={'Enter Username'}
          title={'Username'}
          color={titleColor}
          value={inputField.username}
          onChangeText={text => setInputField({...inputField, username: text})}
        />

        <CustomTextInput
          placeholder={'Enter Password'}
          title={'Password'}
          color={titleColor}
          secure={true}
          value={inputField.password}
          onChangeText={text => setInputField({...inputField, password: text})}
          bgcolor={
            inputField.password === inputField.cpassword &&
            inputField.password !== ''
              ? 'rgba(135, 255, 167,.3)'
              : 'transparent'
          }
        />

        <CustomTextInput
          placeholder={'Enter Confirm Password'}
          title={'Confirm Password'}
          color={titleColor}
          secure={false}
          value={inputField.cpassword}
          onChangeText={text => setInputField({...inputField, cpassword: text})}
          bgcolor={
            inputField.password === inputField.cpassword &&
            inputField.cpassword !== ''
              ? 'rgba(135, 255, 167,.3)'
              : 'transparent'
          }
        />

        <Text selectable style={[styles.label, {marginBottom: 5}]}>
          Upload Profile Picture
        </Text>

        {path == '' ? (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
            }}>
            <TouchableOpacity
              onPress={async () => {
                await ImagePicker.openCamera({
                  width: 400,
                  height: 400,
                  cropping: true,
                  mediaType: 'photo',
                })
                  .then(image => {
                    setPath(image.path);
                    setImageName(
                      image.path.split('/react-native-image-crop-picker/')[1],
                    );
                  })
                  .catch(async e => {
                    console.log(e);
                    await ImagePicker.clean()
                      .then(() => {
                        console.log(
                          'removed all tmp images from tmp directory',
                        );
                      })
                      .catch(e => {
                        console.log(e);
                      });
                  });
              }}>
              <Image
                source={require('../assets/images/camera.png')}
                style={{
                  width: responsiveWidth(10),
                  height: responsiveWidth(10),
                  alignSelf: 'center',
                  tintColor: THEME_COLOR,
                }}
              />
              <Text selectable style={styles.label}>
                Open Camera
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                await ImagePicker.openPicker({
                  width: 400,
                  height: 400,
                  cropping: true,
                  mediaType: 'photo',
                })
                  .then(image => {
                    setPath(image.path);
                    setImageName(
                      image.path.substring(image.path.lastIndexOf('/') + 1),
                    );
                  })
                  .catch(async e => {
                    console.log(e);
                    await ImagePicker.clean()
                      .then(() => {
                        console.log(
                          'removed all tmp images from tmp directory',
                        );
                      })
                      .catch(e => {
                        console.log(e);
                      });
                  });
              }}
              style={{paddingLeft: responsiveWidth(10)}}>
              <Image
                source={require('../assets/images/file.png')}
                style={{
                  width: responsiveWidth(10),
                  height: responsiveWidth(10),
                  alignSelf: 'center',
                  tintColor: THEME_COLOR,
                }}
              />
              <Text selectable style={styles.label}>
                Open Gallery
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={{
              width: responsiveWidth(20),
              height: responsiveHeight(3),

              alignSelf: 'center',
            }}
            onPress={() => {
              setPath('');
            }}>
            <View style={{flexDirection: 'row'}}>
              <View>
                <Image
                  source={{uri: path}}
                  style={{
                    width: 50,
                    height: 50,
                    alignSelf: 'center',
                    borderRadius: 5,
                  }}
                />
              </View>
              <View>
                <TouchableOpacity onPress={() => setPath('')}>
                  <Text selectable style={{color: 'red'}}>
                    <MaterialIcons name="cancel" size={20} />
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
        <View style={{marginTop: responsiveHeight(4)}}>
          <CustomButton title="Sign Up" onClick={registerUser} />
          <CustomButton title="Cancel" color={'red'} onClick={setSignUpFalse} />
        </View>
      </View>
      <Loader visible={visible} />
      <Toast />
    </ScrollView>
  );
};

export default Registration;

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
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
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
    marginLeft: responsiveWidth(2),
    color: THEME_COLOR,
    fontWeight: '600',
    fontSize: responsiveFontSize(2),
  },
});
