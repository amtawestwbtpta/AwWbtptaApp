import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ScrollView,
  BackHandler,
  Linking,
  Platform,
  TouchableOpacity,
  Alert,
  Switch,
  DeviceEventEmitter,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {THEME_COLOR} from '../utils/Colors';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import Loader from '../components/Loader';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AntDesign from 'react-native-vector-icons/AntDesign';
import AnimatedSeacrch from '../components/AnimatedSeacrch';
import CustomButton from '../components/CustomButton';
import {useIsFocused} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import CustomTextInput from '../components/CustomTextInput';
import {BONUS, DA, HRA, INCREAMENT} from '../modules/constants';
import {
  findEmptyValues,
  generateID,
  getSubmitDateInput,
} from '../modules/calculatefunctions';
import {notifyAll} from '../modules/notification';
import CircularProgress from 'react-native-circular-progress-indicator';
import bcrypt from 'react-native-bcrypt';
import isaac from 'isaac';
import axios from 'axios';
import ImagePicker from 'react-native-image-crop-picker';
import uuid from 'react-native-uuid';
import {useGlobalContext} from '../context/Store';
import {Image} from 'react-native-svg';
const TeachersDetails = ({refresh, navigation, selectActiveTab, tabValue}) => {
  const {
    state,
    teachersState,
    setTeachersState,
    teacherUpdateTime,
    setTeacherUpdateTime,
    userState,
    setUserState,
    schoolState,
    setSchoolState,
    schoolUpdateTime,
    setSchoolUpdateTime,
    setStateObject,
  } = useGlobalContext();
  const user = state.USER;
  const setActiveTab = () => {
    selectActiveTab(tabValue);
  };
  const scrollRef = useRef();

  const onPressTouch = () => {
    scrollRef.current?.scrollTo({
      y: 0,
      animated: true,
    });
  };

  const isFocused = useIsFocused();
  const [data, setData] = useState(teachersState);
  const [ourPercentage, setOurPercentage] = useState(0);
  const [inputTname, setInputTname] = useState('');
  const [filteredData, setFilteredData] = useState(teachersState);
  const [visible, setVisible] = useState(false);
  const [showOurTeachers, setShowOurTeachers] = useState(false);
  const [showAddView, setShowAddView] = useState(false);
  const [showAddButton, setShowAddButton] = useState(true);
  const [showDeleteBtn, setShowDeleteBtn] = useState(true);
  const [noeditBtn, setNoeditBtn] = useState(true);
  const [teacherId, setTeacherId] = useState('');
  const [teachersData, setTeachersData] = useState([]);
  const [schoolData, setSchoolData] = useState([]);
  const [isClicked, setIsClicked] = useState(false);
  const [selectedText, setSelectedText] = useState('Select School Name');
  const [bankData, setBankData] = useState({});
  const [showBankData, setShowBankData] = useState(false);
  const [firstData, setFirstData] = useState(0);
  const [visibleItems, setVisibleItems] = useState(10);
  const [deletedTeachers, setDeletedTeachers] = useState([]);
  const [showDeletedTeachers, setShowDeletedTeachers] = useState(false);
  const [inputField, setInputField] = useState({
    school: '',
    udise: '',
    tname: '',
    tsname: '',
    gender: 'male',
    ph: 0,
    desig: 'AT',
    fname: '',
    circle: 'taw',
    sis: 'AMTA WEST CIRCLE',
    gp: '',
    association: 'WBTPTA',
    phone: '',
    email: '',
    dob: '01-01-1980',
    doj: '01-01-2010',
    dojnow: getSubmitDateInput(new Date().toLocaleDateString()),
    dor: '01-01-2040',
    bank: '',
    account: '',
    ifsc: '',
    empid: '',
    training: 'TRAINED',
    pan: '',
    address: '',
    basic: 0,
    mbasic: '',
    prevmbasic: '',
    addl: 0,
    da: 0,
    mda: 0,
    hra: 0,
    mhra: 0,
    ma: 500,
    gross: 0,
    mgross: 0,
    gpf: 0,
    gpfprev: 0,
    ptax: 150,
    gsli: 0,
    netpay: 0,
    mnetpay: 0,
    bonus: BONUS,
    arrear: 0,
    question: 'taw',
    hoi: 'no',
    service: 'inservice',
    id: '',
    rank: 3,
    dataYear: new Date().getFullYear(),
  });
  const [isHT, setIsHT] = useState(false);
  let RoundTo = (number, roundto) => roundto * Math.round(number / roundto);

  bcrypt.setRandomFallback(len => {
    const buf = new Uint8Array(len);

    return buf.map(() => Math.floor(isaac.random() * 256));
  });

  const loadPrev = () => {
    setVisibleItems(prevVisibleItems => prevVisibleItems - 10);
    setFirstData(firstData - 10);
    onPressTouch();
  };
  const loadMore = () => {
    setVisibleItems(prevVisibleItems => prevVisibleItems + 10);
    setFirstData(firstData + 10);
    onPressTouch();
  };

  const getDeletedData = async () => {
    setVisible(true);
    await firestore()
      .collection('deletedTeachers')
      .get()
      .then(async snapShot => {
        // let record = JSON.stringify(snapShotTeachers.docs[0]._data);

        const datas = snapShot.docs.map(doc => ({
          // doc.data() is never undefined for query doc snapshots
          ...doc.data(),
          id: doc.id,
        }));
        setVisible(false);
        setDeletedTeachers(datas);
        setFilteredData(datas);
      })
      .catch(e => {
        setVisible(false);
        console.log(e);
      });
  };
  const ifsc_ser = text => {
    if (text.length) {
      fetch(`https://ifsc.razorpay.com/${text}`)
        .then(res => res.json())
        .then(data => {
          setBankData(data);
        });
    } else {
      setBankData({});
    }
  };
  const showMakeAdminConfirmDialog = item => {
    return Alert.alert(
      'Hold On!',
      `Are You Sure To Make ${item.tname} Admin?`,
      [
        // The "No" button
        // Does nothing but dismiss the dialog when tapped
        {
          text: 'No',
          onPress: () => showToast('success', 'Teacher Access Not Updated!'),
        },
        // The "Yes" button
        {
          text: 'Yes',
          onPress: () => {
            makeAdmin(item);
          },
        },
      ],
    );
  };
  const showRegisterTeacherConfirmDialog = item => {
    return Alert.alert(
      'Hold On!',
      `Are You Sure To Register User Account of ${item.tname}?`,
      [
        // The "No" button
        // Does nothing but dismiss the dialog when tapped
        {
          text: 'No',
          onPress: () =>
            showToast('success', 'Teacher User Account Not Created!'),
        },
        // The "Yes" button
        {
          text: 'Yes',
          onPress: () => {
            registerTeacher(item);
          },
        },
      ],
    );
  };

  const registerTeacher = async item => {
    Alert.alert(
      `${item.tname}'s`,
      `Username will be EMPID in Lower Case i.e.\n\n${item.empid.toLowerCase()}\n\nAnd Password will be PAN in Lower Case i.e.\n\n${item.pan.toLowerCase()}\n\nLets Continue to Create Account?`,
      [
        // The "No" button
        // Does nothing but dismiss the dialog when tapped
        {
          text: 'No',
          onPress: () =>
            showToast('success', 'Teacher User Account Not Created!'),
        },
        // The "Yes" button
        {
          text: 'Yes',
          onPress: () => {
            createUser(item);
          },
        },
      ],
    );
  };

  const createUser = async item => {
    await ImagePicker.openPicker({
      width: 400,
      height: 400,
      cropping: true,
      mediaType: 'photo',
    })
      .then(async image => {
        setVisible(true);
        let path = image.path;
        let imageName = image.path.substring(image.path.lastIndexOf('/') + 1);
        const pathToFile = path;
        const reference = storage().ref(
          `/profileImage/${item.id + '-' + imageName}`,
        );
        await reference
          .putFile(pathToFile)
          .then(() => {
            showToast('success', 'Photo Uploaded Successfully');
          })
          .catch(e => {
            showToast('error', 'Photo Upload Failed');
            console.log(e);
          });
        const url = await storage()
          .ref(`/profileImage/${item.id + '-' + imageName}`)
          .getDownloadURL();
        const techerData = {
          teachersID: item.id,
          tname: item.tname,
          tsname: item.tsname,
          school: item.school,
          desig: item.desig,
          pan: item.pan,
          udise: item.udise,
          sis: item.sis,
          circle: item.circle,
          showAccount: item.showAccount,
          empid: item.empid,
          question: item.question,
          email: item.email,
          phone: item.phone,
          id: item.id,
          dpscst: 'District Primary School Council, Howrah',
          dpsc: 'Howrah District Primary School Council',
          dpsc1: '',
          dpsc2: 'CHAIRMAN, DPSC, HOWRAH',
          dpsc3: '18, N.D. MUKHERJEE ROAD',
          dpsc4: 'HOWRAH- 1',
          tan: 'CALD02032C',
          username: item.empid.toLowerCase(),
          password: bcrypt.hashSync(item.pan.toLowerCase(), 10),
          createdAt: Date.now(),
          url: url,
          photoName: item.id + '-' + imageName,
        };
        const backendUrl = `https://awwbtpta.vercel.app/api/signup`;
        try {
          await axios
            .post(backendUrl, techerData)
            .then(async () => {
              await firestore()
                .collection('userteachers')
                .doc(techerData.id)
                .set({
                  teachersID: techerData.teachersID,
                  tname: techerData.tname,
                  tsname: techerData.tsname,
                  school: techerData.school,
                  desig: techerData.desig,
                  pan: techerData.pan,
                  udise: techerData.udise,
                  sis: techerData.sis,
                  circle: techerData.circle,
                  showAccount: techerData.showAccount,
                  empid: techerData.empid,
                  question: techerData.question,
                  email: techerData.email,
                  phone: techerData.phone,
                  id: techerData.id,
                  dpscst: techerData.dpscst,
                  dpsc: techerData.dpsc,
                  dpsc1: techerData.dpsc1,
                  dpsc2: techerData.dpsc2,
                  dpsc3: techerData.dpsc3,
                  dpsc4: techerData.dpsc4,
                  tan: techerData.tan,
                  username: techerData.username,
                  password: techerData.password,
                  createdAt: techerData.createdAt,
                  url: techerData.url,
                  photoName: techerData.photoName,
                });
              if (userState.length !== 0) {
                let x = userState;
                x = [
                  ...x,
                  {
                    teachersID: techerData.teachersID,
                    tname: techerData.tname,
                    tsname: techerData.tsname,
                    school: techerData.school,
                    desig: techerData.desig,
                    pan: techerData.pan,
                    udise: techerData.udise,
                    sis: techerData.sis,
                    circle: techerData.circle,
                    showAccount: techerData.showAccount,
                    empid: techerData.empid,
                    question: techerData.question,
                    email: techerData.email,
                    phone: techerData.phone,
                    id: techerData.id,
                    dpscst: techerData.dpscst,
                    dpsc: techerData.dpsc,
                    dpsc1: techerData.dpsc1,
                    dpsc2: techerData.dpsc2,
                    dpsc3: techerData.dpsc3,
                    dpsc4: techerData.dpsc4,
                    tan: techerData.tan,
                    username: techerData.username,
                    password: techerData.password,
                    createdAt: techerData.createdAt,
                    url: techerData.url,
                    photoName: techerData.photoName,
                  },
                ];
                setUserState(x);
              } else {
                setVisible(true);
                await firestore()
                  .collection('userteachers')
                  .get()
                  .then(snapshot => {
                    const data = snapshot.docs.map(doc => ({
                      ...doc.data(),
                      id: doc.id,
                    }));
                    setUserState(data);
                    setVisible(false);
                  })
                  .catch(e => {
                    console.log('error', e);
                    setVisible(false);
                  });
              }
              await firestore()
                .collection('profileImage')
                .doc(techerData.id)
                .set({
                  title: techerData.tname,
                  description: techerData.school,
                  url: techerData.url,
                  fileName: techerData.photoName,
                  id: techerData.id,
                })
                .then(async () => {
                  await firestore()
                    .collection('teachers')
                    .doc(techerData.id)
                    .update({
                      registered: true,
                    });
                  let title = `${techerData.tname} is Registered To App`;
                  let body = `${
                    techerData.tname
                  } Has Just Registered By Admin ${
                    user.tname
                  }. WBTPTA Amta West Welcome ${
                    techerData.gender === 'male' ? 'Him' : 'Her'
                  }.`;
                  await notifyAll(title, body).then(async () => {
                    setVisible(false);
                    showToast(
                      'success',
                      `Congratulation ${techerData.tname} Is Successfully Registered!`,
                    );
                    getData();
                  });
                })
                .catch(e => {
                  setVisible(false);
                  showToast('error', 'Some Error Happened!');
                  console.log(e);
                });
            })
            .catch(e => {
              setVisible(false);
              showToast('error', 'Some Error Happened!');
              console.log(e);
            });
        } catch (e) {
          setVisible(false);
          showToast('error', 'Some Error Happened!');
          console.log(e.response.data.data);
        }
      })
      .catch(async e => {
        setVisible(false);
        console.log(e);
        showToast('error', 'Teacher User Account Not Created!');
        await ImagePicker.clean()
          .then(() => {
            console.log('removed all tmp images from tmp directory');
          })
          .catch(e => {
            console.log(e);
          });
      });
  };

  const showRestoreTeacherConfirmDialog = item => {
    return Alert.alert(
      'Hold On!',
      `Are You Sure To Restore ${item.tname} to Teacher Database?`,
      [
        // The "No" button
        // Does nothing but dismiss the dialog when tapped
        {
          text: 'No',
          onPress: () => showToast('success', 'Teacher Not Restored!'),
        },
        // The "Yes" button
        {
          text: 'Yes',
          onPress: () => {
            restoreTeacher(item);
          },
        },
      ],
    );
  };

  const restoreTeacher = async item => {
    setVisible(true);
    await firestore()
      .collection('deletedTeachers')
      .doc(item.id)
      .delete()
      .then(async () => {
        await firestore()
          .collection('teachers')
          .doc(item.id)
          .set(item)
          .then(async () => {
            let x = teachersState;
            x = [...x, item];
            const newData = x.sort(function (a, b) {
              let nameA = a.school.toLowerCase(),
                nameB = b.school.toLowerCase();
              if (nameA < nameB)
                //sort string ascending
                return -1;
              if (nameA > nameB) return 1;
              return 0; //default return value (no sorting)
            });
            setTeachersState(newData);
            setTeacherUpdateTime(Date.now());
            refreshData(newData);
            setVisible(false);

            getDeletedData();
            setFilteredData(deletedTeachers);
            setNoeditBtn(true);
            showToast('success', 'Teacher Restored Successfully');
          })
          .catch(e => console.log(e));
      })
      .catch(e => console.log(e));
  };
  const makeAdmin = async item => {
    setVisible(true);
    await firestore()
      .collection('teachers')
      .doc(item.id)
      .update({
        circle: 'admin',
      })
      .then(async () => {
        let x = teachersState.filter(el => el.id === item.id)[0];
        x.circle = 'admin';
        let y = teachersState.filter(el => el.id !== item.id).concat(x);
        const newData = y.sort(
          (a, b) => a.school.localeCompare(b.school) && b.rank > a.rank,
        );
        setTeachersState(newData);
        setTeacherUpdateTime(Date.now());
        refreshData(newData);
        try {
          await firestore()
            .collection('userteachers')
            .doc(item.id)
            .update({
              circle: 'admin',
            })
            .then(() => {
              setVisible(false);
              showToast(
                'success',
                'Teacher Access Changed To Admin Successfully!',
              );

              getData();
            })
            .catch(e => {
              setVisible(false);
              // showToast('error', 'Teacher Access Updation Failed!');
              showToast(
                'success',
                'Teacher Access Changed To Admin Successfully!',
              );
              console.log(e);
              getData();
            });
        } catch (e) {
          console.log(e);
          setVisible(false);
          showToast('success', 'Teacher Access Changed To Admin Successfully!');
          getData();
        }
      })
      .catch(e => {
        setVisible(false);
        showToast('error', 'Teacher Access Updation Failed!');
        console.log(e);
      });
  };
  const showDeleteTeacherConfirmDialog = item => {
    return Alert.alert(
      'Hold On!',
      `Are You Sure Delete ${item.tname} From Teacher Database?`,
      [
        // The "No" button
        // Does nothing but dismiss the dialog when tapped
        {
          text: 'No',
          onPress: () => showToast('success', 'Teacher Not Deleted!'),
        },
        // The "Yes" button
        {
          text: 'Yes',
          onPress: () => {
            deleteTeacher(item);
          },
        },
      ],
    );
  };
  const showRemoveAdminConfirmDialog = item => {
    return Alert.alert(
      'Hold On!',
      `Are You Sure Remove ${item.tname} From Admin?`,
      [
        // The "No" button
        // Does nothing but dismiss the dialog when tapped
        {
          text: 'No',
          onPress: () => showToast('success', 'Teacher Not Deleted!'),
        },
        // The "Yes" button
        {
          text: 'Yes',
          onPress: () => {
            removeAdmin(item);
          },
        },
      ],
    );
  };

  const deleteTeacher = async item => {
    setVisible(true);
    await firestore()
      .collection('teachers')
      .doc(item.id)
      .delete()
      .then(async () => {
        let x = teachersState.filter(el => el.id !== item.id);
        const newData = x.sort(
          (a, b) => a.school.localeCompare(b.school) && b.rank > a.rank,
        );
        setTeachersState(newData);
        setTeacherUpdateTime(Date.now());
        refreshData(newData);

        await firestore()
          .collection('deletedTeachers')
          .doc(item.id)
          .set(item)
          .then(async () => {
            setVisible(false);
            showToast('success', 'Teacher Deleted Successfully');
          })
          .catch(e => console.log(e));
      })
      .catch(e => console.log(e));
  };

  const removeAdmin = async item => {
    setVisible(true);
    await firestore()
      .collection('teachers')
      .doc(item.id)
      .update({
        circle: 'taw',
      })
      .then(async () => {
        let x = teachersState.filter(el => el.id === item.id)[0];
        x.circle = 'taw';
        let y = teachersState.filter(el => el.id !== item.id).concat(x);
        const newData = y.sort(
          (a, b) => a.school.localeCompare(b.school) && b.rank > a.rank,
        );
        setTeachersState(newData);
        setTeacherUpdateTime(Date.now());
        refreshData(newData);
        try {
          await firestore()
            .collection('userteachers')
            .doc(item.id)
            .update({
              circle: 'taw',
            })
            .then(() => {
              setVisible(false);
              showToast(
                'success',
                'Teacher Access Changed To Admin Successfully!',
              );

              getData();
            })
            .catch(e => {
              setVisible(false);
              // showToast('error', 'Teacher Access Updation Failed!');
              showToast(
                'success',
                'Teacher Access Changed To Admin Successfully!',
              );
              console.log(e);
              getData();
            });
        } catch (e) {
          console.log(e);
          setVisible(false);
          showToast('success', 'Teacher Access Changed To Admin Successfully!');
          getData();
        }
      })
      .catch(e => {
        setVisible(false);
        showToast('error', 'Teacher Access Updation Failed!');
        console.log(e);
      });
  };

  const makeCall = phoneNumber => {
    let dial;
    if (Platform.OS === 'android') {
      dial = `tel:${phoneNumber}`;
    } else {
      dial = `telprompt:${phoneNumber}`;
    }
    Linking.openURL(dial);
  };

  const addTeacher = async () => {
    if (!findEmptyValues(inputField)) {
      setVisible(true);
      await firestore()
        .collection('teachers')
        .doc(teacherId)
        .set(inputField)
        .then(async () => {
          let x = teachersState.filter(el => el.id !== teacherId);
          x = [...x, inputField];
          const newData = x.sort(
            (a, b) => a.school.localeCompare(b.school) && b.rank > a.rank,
          );
          setTeachersState(newData);
          setTeacherUpdateTime(Date.now());
          let title = `New Teacher Added`;
          let body = `Our Admin ${user.tname} Has Just Added A New Teacher ${inputField.tname}`;
          await notifyAll(title, body).then(async () => {
            setVisible(false);
            showToast('success', 'New Teacher Added Successfully');
          });
        });
    } else {
      showToast('error', `Some Fields Has Empty Values!!!`);
    }
  };

  const calculateSalary = junebasic => {
    const julyBasic = RoundTo(junebasic + junebasic * INCREAMENT, 100);
    let addl = parseInt(inputField.addl);
    let ph = parseInt(inputField.ph);
    let ma = parseInt(inputField.ma);
    let gpf = parseInt(inputField.gpf);
    let gpfprev = parseInt(inputField.gpfprev);
    let gsli = parseInt(inputField.gsli);
    let jda = Math.round(julyBasic * DA);
    let jhra = Math.round(julyBasic * HRA);
    let jgross = julyBasic + addl + jda + jhra + ma;
    let mda = Math.round(junebasic * DA);
    let mhra = Math.round(junebasic * HRA);
    let mgross = junebasic + addl + mda + mhra + ma;
    let mptax =
      ph === 1
        ? 0
        : mgross > 40000
        ? 200
        : mgross > 25000
        ? 150
        : mgross > 15000
        ? 130
        : mgross > 10000
        ? 110
        : 0;
    let jptax =
      ph === 1
        ? 0
        : jgross > 40000
        ? 200
        : jgross > 25000
        ? 150
        : jgross > 15000
        ? 130
        : jgross > 10000
        ? 110
        : 0;
    setInputField({
      ...inputField,
      mbasic: junebasic,
      prevmbasic: junebasic,
      basic: RoundTo(junebasic + junebasic * INCREAMENT, 100),
      da: Math.round(julyBasic * DA),
      hra: Math.round(julyBasic * HRA),
      gross: jgross,
      ptax:
        ph === 1
          ? 0
          : jgross > 40000
          ? 200
          : jgross > 25000
          ? 150
          : jgross > 15000
          ? 130
          : jgross > 10000
          ? 110
          : 0,
      netpay: jgross - gpf - jptax - gsli,
      mda: mda,
      mhra: mhra,
      mgross: mgross,
      mnetpay: mgross - gpfprev - mptax - gsli,
      id: teacherId,
    });
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

  const getTeacherStateData = async () => {
    setVisible(true);
    await firestore()
      .collection('teachers')
      .get()
      .then(snapshot => {
        const data = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        }));
        const newData = data.sort(
          (a, b) => a.school.localeCompare(b.school) && b.rank > a.rank,
        );
        setTeachersState(newData);
        setTeacherUpdateTime(Date.now());
        setData(newData);
        setFilteredData(newData);
        setTeacherId(
          'teachers' + (newData.length + 101) + '-' + uuid.v4().split('-')[0],
        );
        setTeachersData(newData);
        let ALLTEACHER = newData?.length;
        let WBTPTATEACHERS = newData.filter(
          el => el.association === 'WBTPTA',
        )?.length;

        setOurPercentage(parseInt((WBTPTATEACHERS / ALLTEACHER) * 100));
        setVisible(false);
      })
      .catch(e => {
        console.log('error', e);
        setVisible(false);
      });
  };
  const getSchoolStateData = async () => {
    setVisible(true);
    await firestore()
      .collection('schools')
      .get()
      .then(snapshot => {
        const data = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        }));
        setSchoolState(data);
        setSchoolData(data);
        setVisible(false);
      })
      .catch(e => {
        console.log('error', e);
        setVisible(false);
      });
  };

  const getData = async () => {
    const newData = teachersState.sort(
      (a, b) => a.school.localeCompare(b.school) && b.rank > a.rank,
    );
    setData(newData);
    setFilteredData(newData);
    setTeacherId(
      'teachers' + (teachersState.length + 101) + '-' + uuid.v4().split('-')[0],
    );
    let ALLTEACHER = teachersState?.length;
    let WBTPTATEACHERS = teachersState.filter(
      el => el.association === 'WBTPTA',
    )?.length;

    setOurPercentage(parseInt((WBTPTATEACHERS / ALLTEACHER) * 100));
  };
  const refreshData = async pushedData => {
    const newData = pushedData.sort(
      (a, b) => a.school.localeCompare(b.school) && b.rank > a.rank,
    );
    setData(newData);
    setFilteredData(newData);
    setTeacherId(
      'teachers' + (pushedData.length + 101) + '-' + uuid.v4().split('-')[0],
    );
    let ALLTEACHER = pushedData?.length;
    let WBTPTATEACHERS = pushedData.filter(
      el => el.association === 'WBTPTA',
    )?.length;

    setOurPercentage(parseInt((WBTPTATEACHERS / ALLTEACHER) * 100));
  };
  const getMainData = async () => {
    const teacherDifference = (Date.now() - teacherUpdateTime) / 1000 / 60 / 15;
    if (teacherDifference >= 1 || teachersState.length === 0) {
      setTeacherUpdateTime(Date.now());
      getTeacherStateData();
    } else {
      getData();
    }
    const schDifference = (Date.now() - schoolUpdateTime) / 1000 / 60 / 15;
    if (schDifference >= 1 || schoolState.length === 0) {
      setSchoolUpdateTime(Date.now());
      getSchoolStateData();
    } else {
      getData();
    }
  };
  useEffect(() => {
    getMainData();
    console.log(teacherUpdateTime / Date.now());
  }, [isFocused]);

  useEffect(() => {
    const result = data.filter(el => {
      return el.tname.toLowerCase().match(inputTname.toLowerCase());
    });
    setFilteredData(result);
  }, [inputTname]);
  useEffect(() => {}, [inputField, bankData, teachersState]);
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        refresh();
        return true;
      },
    );
    return () => backHandler.remove();
  }, []);

  useEffect(() => {}, [ourPercentage]);

  return (
    <View style={styles.container}>
      <ScrollView ref={scrollRef} nestedScrollEnabled={true}>
        {showAddButton
          ? user.circle === 'admin' && (
              <TouchableOpacity
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  alignSelf: 'center',
                  justifyContent: 'center',
                  marginBottom: responsiveHeight(1),
                }}
                onPress={() => {
                  setShowAddView(!showAddView);
                  setShowDeleteBtn(!showDeleteBtn);
                  setInputField({
                    school: '',
                    udise: '',
                    tname: '',
                    tsname: '',
                    gender: 'male',
                    ph: 0,
                    desig: 'AT',
                    fname: '',
                    circle: 'taw',
                    sis: 'AMTA WEST CIRCLE',
                    gp: '',
                    association: 'WBTPTA',
                    phone: '',
                    email: '',
                    dob: '01-01-1980',
                    doj: '01-01-2010',
                    dojnow: getSubmitDateInput(new Date().toLocaleDateString()),
                    dor: '01-01-2040',
                    bank: '',
                    account: '',
                    ifsc: '',
                    empid: generateID(),
                    training: 'TRAINED',
                    pan: '',
                    address: '',
                    basic: 0,
                    mbasic: '',
                    prevmbasic: '',
                    addl: 0,
                    da: 0,
                    mda: 0,
                    hra: 0,
                    mhra: 0,
                    ma: 500,
                    gross: 0,
                    mgross: 0,
                    gpf: 0,
                    gpfprev: 0,
                    ptax: 150,
                    gsli: 0,
                    netpay: 0,
                    mnetpay: 0,
                    bonus: BONUS,
                    arrear: 0,
                    question: 'taw',
                    hoi: 'no',
                    service: 'inservice',
                    id: '',
                  });
                  setSelectedText('Select School Name');
                }}>
                <Feather
                  name={showAddView ? 'minus-circle' : 'plus-circle'}
                  size={20}
                  color={THEME_COLOR}
                />
                <Text style={[styles.label, {paddingLeft: responsiveWidth(2)}]}>
                  {showAddView ? 'Hide Add Teacher' : 'Add New Teacher'}
                </Text>
              </TouchableOpacity>
            )
          : null}
        {user.circle === 'admin' && showDeleteBtn && (
          <View>
            {showDeletedTeachers ? (
              <TouchableOpacity
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  alignSelf: 'center',
                  justifyContent: 'center',
                  marginBottom: responsiveHeight(0.5),
                }}
                onPress={() => {
                  setShowDeletedTeachers(false);
                  getData();
                  setFirstData(0);
                  setVisibleItems(10);
                  setShowAddButton(true);
                  setShowAddView(false);
                  setNoeditBtn(true);
                }}>
                <FontAwesome5
                  name={'trash-restore'}
                  size={20}
                  color={'green'}
                />
                <Text
                  style={[
                    styles.label,
                    {
                      paddingLeft: responsiveWidth(2),
                      color: 'green',
                    },
                  ]}>
                  Hide Deleted Teacher
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  alignSelf: 'center',
                  justifyContent: 'center',
                  marginBottom: responsiveHeight(0.5),
                }}
                onPress={() => {
                  setShowDeletedTeachers(true);
                  setShowAddButton(false);
                  getDeletedData();

                  setFirstData(0);
                  setVisibleItems(10);
                  setNoeditBtn(false);
                }}>
                <FontAwesome5 name={'trash'} size={20} color={'red'} />
                <Text
                  style={[
                    styles.label,
                    {
                      paddingLeft: responsiveWidth(2),
                      color: 'red',
                    },
                  ]}>
                  Show Deleted Teacher
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        {showDeletedTeachers ? (
          <View>
            <Text style={styles.title}>Deleted Teachers Details</Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: responsiveHeight(1),
              }}>
              {firstData >= 10 && (
                <View>
                  <CustomButton
                    color={'orange'}
                    title={'Previous'}
                    onClick={loadPrev}
                    size={'small'}
                    fontSize={14}
                  />
                </View>
              )}
              {visibleItems < filteredData.length && (
                <View>
                  <CustomButton
                    title={'Next'}
                    onClick={loadMore}
                    size={'small'}
                    fontSize={14}
                  />
                </View>
              )}
            </View>
            <ScrollView horizontal={true}>
              {filteredData.length ? (
                <FlatList
                  data={filteredData.slice(firstData, visibleItems)}
                  renderItem={({item}) => (
                    <ScrollView
                      style={{
                        marginBottom: responsiveHeight(1),

                        padding: responsiveWidth(5),
                        width: responsiveWidth(95),
                        elevation: 5,
                        backgroundColor: 'white',
                        borderRadius: responsiveWidth(3),
                      }}>
                      <Text style={styles.text}>Name: {item.tname}</Text>
                      <Text style={styles.text}>School: {item.school}</Text>

                      <TouchableOpacity
                        onPress={() => makeCall(parseInt(item.phone))}>
                        <Text style={styles.text}>
                          <Feather
                            name="phone-call"
                            size={18}
                            color={THEME_COLOR}
                          />{' '}
                          Mobile: {item.phone}
                        </Text>
                      </TouchableOpacity>

                      <Text style={styles.text}>GP: {item.gp}</Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'center',
                          alignItems: 'center',
                          alignSelf: 'center',
                        }}>
                        <Text style={styles.text}>Association: </Text>
                        <Text
                          style={[
                            styles.text,
                            {
                              color:
                                item.association === 'WBTPTA'
                                  ? 'darkgreen'
                                  : 'red',
                            },
                          ]}>
                          {item.association}
                        </Text>
                      </View>
                      <Text style={styles.text}>Address: {item.address}</Text>
                      <TouchableOpacity
                        style={{
                          alignItems: 'center',
                          flexDirection: 'row',
                          alignSelf: 'center',
                          justifyContent: 'center',
                          marginBottom: responsiveHeight(0.5),
                        }}
                        onPress={() => {
                          showRestoreTeacherConfirmDialog(item);
                          setNoeditBtn(false);
                        }}>
                        <FontAwesome5
                          name={'trash-restore'}
                          size={40}
                          color={'green'}
                        />
                        <Text
                          style={[
                            styles.label,
                            {
                              paddingLeft: responsiveWidth(2),
                              color: 'green',
                              fontSize: responsiveFontSize(2.5),
                            },
                          ]}>
                          Restore Teacher
                        </Text>
                      </TouchableOpacity>
                    </ScrollView>
                  )}
                />
              ) : (
                <Text style={styles.text}>Teacher Not Found</Text>
              )}
            </ScrollView>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: responsiveHeight(1),
              }}>
              {firstData >= 10 && (
                <View>
                  <CustomButton
                    color={'orange'}
                    title={'Previous'}
                    onClick={loadPrev}
                    size={'small'}
                    fontSize={14}
                  />
                </View>
              )}
              {visibleItems < filteredData.length && (
                <View>
                  <CustomButton
                    title={'Next'}
                    onClick={loadMore}
                    size={'small'}
                    fontSize={14}
                  />
                </View>
              )}
            </View>
          </View>
        ) : showAddView ? (
          <View>
            <Text style={styles.title}>Add New Teacher</Text>
            <ScrollView
              style={{
                marginTop: responsiveHeight(2),
              }}>
              <Text style={styles.dataText}>Select School</Text>
              <View>
                <TouchableOpacity
                  style={[styles.dropDownnSelector, {marginTop: 5}]}
                  onPress={() => {
                    setIsClicked(!isClicked);
                    setSelectedText('Select School Name');
                    setInputField({
                      ...inputField,
                      udise: '',
                      gp: '',
                      school: '',
                    });
                  }}>
                  {isClicked ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text
                        style={[
                          styles.dropDownText,
                          {paddingRight: responsiveWidth(2)},
                        ]}>
                        {selectedText}
                      </Text>

                      <AntDesign name="up" size={30} color={THEME_COLOR} />
                    </View>
                  ) : (
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text
                        style={[
                          styles.dropDownText,
                          {paddingRight: responsiveWidth(2)},
                        ]}>
                        {selectedText}
                      </Text>

                      <AntDesign name="down" size={30} color={THEME_COLOR} />
                    </View>
                  )}
                </TouchableOpacity>

                {isClicked &&
                  schoolData.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.AdminName}
                      onPress={() => {
                        setIsClicked(false);
                        setSelectedText(item.school);
                        setInputField({
                          ...inputField,
                          udise: item.udise,
                          gp: item.gp,
                          school: item.school,
                        });
                      }}>
                      <Text style={styles.dropDownText}>{item.school}</Text>
                    </TouchableOpacity>
                  ))}
              </View>
              <Text style={styles.dataText}>Name</Text>
              <CustomTextInput
                placeholder={'Enter Member Name'}
                value={inputField.tname}
                onChangeText={text => {
                  let foundTeacher = teachersData.filter(
                    el => el.tname.toLowerCase() === text.toLowerCase(),
                  );
                  if (foundTeacher.length) {
                    setInputField({
                      ...inputField,
                      tsname: text + '-' + (teachersData.length + 1),
                      tname: text,
                    });
                  } else {
                    setInputField({
                      ...inputField,
                      tname: text,
                      tsname: text,
                    });
                  }
                }}
              />
              <Text style={styles.dataText}>Father's Name</Text>
              <CustomTextInput
                placeholder={"Enter Father's Name"}
                value={inputField.fname}
                onChangeText={text => {
                  setInputField({...inputField, fname: text});
                }}
              />
              <Text style={styles.dataText}>Gender</Text>
              <CustomTextInput
                placeholder={'Enter Gender'}
                value={inputField.gender}
                onChangeText={text => {
                  setInputField({...inputField, gender: text});
                }}
              />
              <Text style={styles.dataText}>UDISE</Text>
              <CustomTextInput
                placeholder={'Enter UDISE'}
                value={inputField.udise}
                onChangeText={text => {
                  setInputField({...inputField, udise: text});
                }}
              />
              <Text style={styles.dataText}>Designation</Text>

              <View
                style={{
                  flexDirection: 'row',
                  alignSelf: 'center',
                  marginTop: responsiveHeight(0.5),
                  marginBottom: responsiveHeight(0.5),
                }}>
                <Text
                  style={[styles.title, {paddingRight: responsiveWidth(1.5)}]}>
                  AT
                </Text>
                <Switch
                  trackColor={{false: '#767577', true: '#81b0ff'}}
                  thumbColor={isHT ? '#f5dd4b' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={() => {
                    setIsHT(!isHT);

                    if (isHT) {
                      setInputField({...inputField, desig: 'AT'});
                    } else {
                      setInputField({...inputField, desig: 'HT'});
                    }
                  }}
                  value={isHT}
                />

                <Text style={[styles.title, {paddingRight: 5}]}>HT</Text>
              </View>
              {user.circle === 'admin' ? (
                <View>
                  <Text
                    style={[
                      styles.dataText,
                      {paddingRight: responsiveWidth(5)},
                    ]}>
                    Employee ID
                  </Text>

                  <CustomTextInput
                    placeholder={'Enter Employee ID'}
                    value={inputField.empid}
                    onChangeText={text => {
                      setInputField({...inputField, empid: text});
                    }}
                  />
                </View>
              ) : null}
              <Text style={styles.dataText}>Gram Panchayet</Text>
              <CustomTextInput
                placeholder={'Enter Gram Panchayet'}
                value={inputField.gp}
                editable={false}
                onChangeText={text => {
                  setInputField({...inputField, gp: text});
                }}
              />

              <Text style={styles.dataText}>Mobile</Text>
              <CustomTextInput
                placeholder={'Enter Mobile'}
                value={inputField.phone}
                type={'number-pad'}
                onChangeText={text => {
                  setInputField({...inputField, phone: text});
                }}
              />
              <Text style={styles.dataText}>Email</Text>
              <CustomTextInput
                placeholder={'Enter Email'}
                value={inputField.email}
                type={'email-address'}
                onChangeText={text => {
                  setInputField({...inputField, email: text});
                }}
              />
              <Text style={styles.dataText}>Date of Birth</Text>
              <CustomTextInput
                placeholder={'Enter Date of Birth'}
                value={inputField.dob}
                type={'number-pad'}
                onChangeText={text => {
                  setInputField({...inputField, dob: text});
                }}
              />
              <Text style={styles.dataText}>Date of Joining</Text>
              <CustomTextInput
                placeholder={'Enter Date of Joining'}
                value={inputField.doj}
                type={'number-pad'}
                onChangeText={text => {
                  setInputField({...inputField, doj: text});
                }}
              />
              <Text style={styles.dataText}>
                Date of Joining in Current School
              </Text>
              <CustomTextInput
                placeholder={'Enter Date of Joining in Current School'}
                value={inputField.dojnow}
                type={'number-pad'}
                onChangeText={text => {
                  setInputField({...inputField, dojnow: text});
                }}
              />
              <Text style={styles.dataText}>Date of Retirement</Text>
              <CustomTextInput
                placeholder={'Enter Date of Retirement'}
                value={inputField.dor}
                type={'number-pad'}
                onChangeText={text => {
                  setInputField({...inputField, dor: text});
                }}
              />

              <Text style={styles.dataText}>PAN</Text>
              <CustomTextInput
                placeholder={'Enter PAN'}
                value={inputField.pan}
                onChangeText={text => {
                  setInputField({...inputField, pan: text});
                }}
              />
              <Text style={styles.dataText}>Address</Text>
              <CustomTextInput
                placeholder={'Enter Address'}
                value={inputField.address}
                multiline={true}
                size={'medium'}
                onChangeText={text => {
                  setInputField({...inputField, address: text});
                }}
              />

              {user.circle === 'admin' ? (
                <View>
                  <Text style={styles.dataText}>Bank</Text>
                  <CustomTextInput
                    placeholder={'Enter Bank'}
                    value={inputField.bank}
                    multiline={true}
                    onChangeText={text => {
                      setInputField({...inputField, bank: text});
                    }}
                  />
                  <Text style={styles.dataText}>Account No</Text>
                  <CustomTextInput
                    placeholder={'Enter Account No'}
                    value={inputField.account}
                    multiline={true}
                    onChangeText={text => {
                      setInputField({...inputField, account: text});
                    }}
                  />
                  <Text style={styles.dataText}>IFS Code</Text>
                  <CustomTextInput
                    placeholder={'Enter IFS Code'}
                    value={inputField.ifsc}
                    multiline={true}
                    onChangeText={text => {
                      setInputField({...inputField, ifsc: text});
                      if (text.length === 11) {
                        ifsc_ser(text.toUpperCase());
                        setShowBankData(true);
                      } else {
                        setShowBankData(false);
                      }
                    }}
                  />
                  {showBankData && (
                    <View style={styles.dataView}>
                      <Text style={styles.bankDataText}>
                        Bank Name: {bankData.BANK}
                      </Text>
                      <Text style={styles.bankDataText}>
                        Branch: {bankData.BRANCH}
                      </Text>
                      <Text style={styles.bankDataText}>
                        Address: {bankData.ADDRESS}
                      </Text>
                      <Text style={styles.bankDataText}>
                        MICR: {bankData.MICR}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.dataText}>GPF</Text>
                  <CustomTextInput
                    placeholder={'Enter GPF'}
                    value={inputField.gpf.toString()}
                    type={'number-pad'}
                    onChangeText={text => {
                      setInputField({...inputField, gpf: text});
                    }}
                  />
                  <Text style={styles.dataText}>Previous GPF</Text>
                  <CustomTextInput
                    placeholder={'Enter Previous GPF'}
                    value={inputField.gpfprev.toString()}
                    type={'number-pad'}
                    onChangeText={text => {
                      setInputField({...inputField, gpfprev: text});
                    }}
                  />
                  <Text style={styles.dataText}>Additional</Text>
                  <CustomTextInput
                    placeholder={'Enter Additional'}
                    value={inputField.addl.toString()}
                    type={'number-pad'}
                    onChangeText={text => {
                      setInputField({...inputField, addl: text});
                    }}
                  />
                  <Text style={styles.dataText}>Medical Allowance</Text>
                  <CustomTextInput
                    placeholder={'Enter Medical Allowance'}
                    value={inputField.ma.toString()}
                    type={'number-pad'}
                    onChangeText={text => {
                      setInputField({...inputField, ma: text});
                    }}
                  />
                  <Text style={styles.dataText}>GSLI</Text>
                  <CustomTextInput
                    placeholder={'Enter GSLI'}
                    value={inputField.gsli.toString()}
                    type={'number-pad'}
                    onChangeText={text => {
                      setInputField({...inputField, gsli: text});
                    }}
                  />
                  <Text style={styles.dataText}>June BASIC</Text>
                  <CustomTextInput
                    placeholder={'Enter June BASIC'}
                    value={inputField.mbasic.toString()}
                    type={'number-pad'}
                    onChangeText={text => {
                      calculateSalary(parseInt(text));
                    }}
                  />
                  <Text style={styles.dataText}>June DA</Text>
                  <CustomTextInput
                    placeholder={'Enter June DA'}
                    value={inputField.mda.toString()}
                    type={'number-pad'}
                    onChangeText={text => {
                      setInputField({...inputField, mda: text});
                    }}
                  />
                  <Text style={styles.dataText}>June HRA</Text>
                  <CustomTextInput
                    placeholder={'Enter June HRA'}
                    value={inputField.mhra.toString()}
                    type={'number-pad'}
                    onChangeText={text => {
                      setInputField({...inputField, mhra: text});
                    }}
                  />
                  <Text style={styles.dataText}>June Gross</Text>
                  <CustomTextInput
                    placeholder={'Enter June Gross'}
                    value={inputField.mgross.toString()}
                    type={'number-pad'}
                    onChangeText={text => {
                      setInputField({...inputField, mgross: text});
                    }}
                  />
                  <Text style={styles.dataText}>June Net Pay</Text>
                  <CustomTextInput
                    placeholder={'Enter June Net Pay'}
                    value={inputField.mnetpay.toString()}
                    type={'number-pad'}
                    onChangeText={text => {
                      setInputField({...inputField, mnetpay: text});
                    }}
                  />
                  <Text style={styles.dataText}>July BASIC</Text>
                  <CustomTextInput
                    placeholder={'Enter July BASIC'}
                    value={inputField.basic.toString()}
                    type={'number-pad'}
                    onChangeText={text => {
                      setInputField({...inputField, basic: text});
                    }}
                  />
                  <Text style={styles.dataText}>July DA</Text>
                  <CustomTextInput
                    placeholder={'Enter July DA'}
                    value={inputField.da.toString()}
                    type={'number-pad'}
                    onChangeText={text => {
                      setInputField({...inputField, da: text});
                    }}
                  />
                  <Text style={styles.dataText}>July HRA</Text>
                  <CustomTextInput
                    placeholder={'Enter July HRA'}
                    value={inputField.hra.toString()}
                    type={'number-pad'}
                    onChangeText={text => {
                      setInputField({...inputField, hra: text});
                    }}
                  />
                  <Text style={styles.dataText}>July Gross</Text>
                  <CustomTextInput
                    placeholder={'Enter July Gross'}
                    value={inputField.gross.toString()}
                    type={'number-pad'}
                    onChangeText={text => {
                      setInputField({...inputField, gross: text});
                    }}
                  />
                  <Text style={styles.dataText}>July Net Pay</Text>
                  <CustomTextInput
                    placeholder={'Enter July Net Pay'}
                    value={inputField.netpay.toString()}
                    type={'number-pad'}
                    onChangeText={text => {
                      setInputField({...inputField, netpay: text});
                    }}
                  />

                  <Text style={styles.dataText}>Bonus</Text>
                  <CustomTextInput
                    placeholder={'Enter Bonus'}
                    value={inputField.bonus.toString()}
                    type={'number-pad'}
                    onChangeText={text => {
                      setInputField({...inputField, bonus: text});
                    }}
                  />
                  <Text style={styles.dataText}>Training Status</Text>
                  <CustomTextInput
                    placeholder={'Enter Training Status'}
                    value={inputField.training}
                    onChangeText={text => {
                      setInputField({...inputField, training: text});
                    }}
                  />
                  <Text style={styles.dataText}>Association</Text>
                  <CustomTextInput
                    placeholder={'Enter Association'}
                    value={inputField.association}
                    onChangeText={text => {
                      setInputField({...inputField, association: text});
                    }}
                  />
                  <Text style={styles.dataText}>Teacher Search Name</Text>
                  <CustomTextInput
                    placeholder={'Enter Teacher Search Name'}
                    value={inputField.tsname}
                    onChangeText={text => {
                      setInputField({...inputField, tsname: text});
                    }}
                  />
                  <Text style={styles.dataText}>Access</Text>
                  <CustomTextInput
                    placeholder={'Enter Access'}
                    value={inputField.circle}
                    onChangeText={text => {
                      setInputField({...inputField, circle: text});
                    }}
                  />
                  <Text style={styles.dataText}>Question Access</Text>
                  <CustomTextInput
                    placeholder={'Enter Question Access'}
                    value={inputField.question}
                    onChangeText={text => {
                      setInputField({...inputField, question: text});
                    }}
                  />
                  <Text style={styles.dataText}>Disability</Text>
                  <CustomTextInput
                    placeholder={'Enter Disability Write 0 or 1'}
                    value={inputField.ph.toString()}
                    type={'number-pad'}
                    onChangeText={text => {
                      setInputField({...inputField, ph: text});
                    }}
                  />
                  <Text style={styles.dataText}>IS HOI?</Text>
                  <CustomTextInput
                    placeholder={'IS HOI?'}
                    value={inputField.hoi}
                    onChangeText={text => {
                      setInputField({...inputField, hoi: text});
                    }}
                  />
                  <Text style={styles.dataText}>Service Status</Text>
                  <CustomTextInput
                    placeholder={'Service Status?'}
                    value={inputField.service}
                    onChangeText={text => {
                      setInputField({...inputField, service: text});
                    }}
                  />
                </View>
              ) : null}
              <View style={{marginBottom: responsiveHeight(2)}}>
                <CustomButton title={'Add Teacher'} onClick={addTeacher} />
                <CustomButton
                  title={'Cancel'}
                  color={'red'}
                  onClick={() => {
                    setShowAddView(false);
                    setSelectedText('Select School Name');
                    setInputField({
                      school: '',
                      udise: '',
                      tname: '',
                      tsname: '',
                      gender: 'male',
                      ph: 0,
                      desig: 'AT',
                      fname: '',
                      circle: 'taw',
                      sis: 'AMTA WEST CIRCLE',
                      gp: '',
                      association: 'WBTPTA',
                      phone: '',
                      email: '',
                      dob: '01-01-1980',
                      doj: '01-01-2010',
                      dojnow: getSubmitDateInput(
                        new Date().toLocaleDateString(),
                      ),
                      dor: '01-01-2040',
                      bank: '',
                      account: '',
                      ifsc: '',
                      empid: generateID(),
                      training: 'TRAINED',
                      pan: '',
                      address: '',
                      basic: 0,
                      mbasic: '',
                      prevmbasic: '',
                      addl: 0,
                      da: 0,
                      mda: 0,
                      hra: 0,
                      mhra: 0,
                      ma: 500,
                      gross: 0,
                      mgross: 0,
                      gpf: 0,
                      gpfprev: 0,
                      ptax: 150,
                      gsli: 0,
                      netpay: 0,
                      mnetpay: 0,
                      bonus: BONUS,
                      arrear: 0,
                      question: 'taw',
                      hoi: 'no',
                      service: 'inservice',
                      id: '',
                    });
                  }}
                />
              </View>
            </ScrollView>
          </View>
        ) : (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
            }}>
            <Text style={styles.title}>Teachers Details</Text>
            <Text style={styles.text}>Total Teachers: {data.length}</Text>
            <Text style={styles.text}>
              Total WBTPTA Teachers:{' '}
              {data.filter(el => el.association === 'WBTPTA').length}
            </Text>
            <Text style={styles.text}>
              Other Teachers:{' '}
              {data.filter(el => el.association !== 'WBTPTA').length}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
                margin: responsiveWidth(2),
              }}>
              <CircularProgress
                value={ourPercentage}
                radius={40}
                duration={5000}
                progressValueColor={THEME_COLOR}
                title={'WBTPTA'}
                titleColor={THEME_COLOR}
                titleStyle={{fontWeight: 'bold'}}
                dashedStrokeConfig={{
                  count: 50,
                  width: 4,
                }}
              />
              <View style={{paddingLeft: responsiveWidth(5)}}>
                <CircularProgress
                  value={100 - ourPercentage}
                  radius={40}
                  duration={5000}
                  progressValueColor={'red'}
                  activeStrokeColor={'red'}
                  title={'OTHERS'}
                  titleColor={'red'}
                  titleStyle={{fontWeight: 'bold'}}
                  dashedStrokeConfig={{
                    count: 50,
                    width: 4,
                  }}
                />
              </View>
            </View>

            <CustomButton
              title={`Your School's All Teachers Salary Data`}
              fontSize={responsiveFontSize(1.8)}
              color={'blueviolet'}
              onClick={() => {
                navigation.navigate('AllTeachersSalary', {
                  data: data.filter(el => el.udise === user.udise),
                  navigation: navigation,
                });
                DeviceEventEmitter.addListener('goBack', setActiveTab);
              }}
            />
            {showOurTeachers ? (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignSelf: 'center',
                }}>
                <CustomButton
                  title={'All Teachers'}
                  color={'magenta'}
                  onClick={() => {
                    setFilteredData(data);
                    setShowOurTeachers(false);
                    setInputTname('');
                    setFirstData(0);
                    setVisibleItems(10);
                  }}
                  fontSize={responsiveFontSize(1.5)}
                  size={'medium'}
                />
                <View style={{marginLeft: 5}}>
                  <CustomButton
                    title={'Other Teachers'}
                    color={'lightcoral'}
                    onClick={() => {
                      setFilteredData(
                        data.filter(el => el.association !== 'WBTPTA'),
                      );
                      setShowOurTeachers(false);
                      setInputTname('');
                      setFirstData(0);
                      setVisibleItems(10);
                    }}
                    fontSize={responsiveFontSize(1.5)}
                    size={'medium'}
                  />
                </View>
              </View>
            ) : (
              <CustomButton
                title={'WBTPTA Teachers'}
                color={'slateblue'}
                onClick={() => {
                  setFilteredData(
                    data.filter(el => el.association === 'WBTPTA'),
                  );
                  setShowOurTeachers(true);
                  setInputTname('');
                  setFirstData(0);
                  setVisibleItems(10);
                }}
                fontSize={responsiveFontSize(1.5)}
                size={'medium'}
              />
            )}
            <AnimatedSeacrch
              value={inputTname}
              placeholder={'Search Teacher Name'}
              onChangeText={text => setInputTname(text)}
              func={() => {
                setInputTname('');
                setFirstData(0);
                setVisibleItems(10);
              }}
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: responsiveHeight(1),
              }}>
              {firstData >= 10 && (
                <View>
                  <CustomButton
                    color={'orange'}
                    title={'Previous'}
                    onClick={loadPrev}
                    size={'small'}
                    fontSize={14}
                  />
                </View>
              )}
              {visibleItems < filteredData.length && (
                <View>
                  <CustomButton
                    title={'Next'}
                    onClick={loadMore}
                    size={'small'}
                    fontSize={14}
                  />
                </View>
              )}
            </View>
            <ScrollView horizontal={true}>
              {filteredData.length ? (
                <FlatList
                  data={filteredData.slice(firstData, visibleItems)}
                  renderItem={({item}) => (
                    <View
                      style={{
                        marginBottom: responsiveHeight(1),

                        padding: responsiveWidth(5),
                        width: responsiveWidth(92),
                        elevation: 5,
                        backgroundColor: 'white',
                        borderRadius: responsiveWidth(3),
                      }}>
                      <Text style={styles.text}>Name: {item.tname}</Text>
                      <Text style={styles.text}>School: {item.school}</Text>
                      {item.gender === 'male' ? (
                        <TouchableOpacity
                          onPress={() => makeCall(parseInt(item.phone))}>
                          <Text style={styles.text}>
                            <Feather
                              name="phone-call"
                              size={18}
                              color={THEME_COLOR}
                            />{' '}
                            Mobile: {item.phone}
                          </Text>
                        </TouchableOpacity>
                      ) : user.circle === 'admin' ||
                        user.question == 'admin' ? (
                        <TouchableOpacity
                          onPress={() => makeCall(parseInt(item.phone))}>
                          <Text style={styles.text}>
                            <Feather
                              name="phone-call"
                              size={18}
                              color={THEME_COLOR}
                            />{' '}
                            Mobile: {item.phone}
                          </Text>
                        </TouchableOpacity>
                      ) : null}

                      <Text style={styles.text}>GP: {item.gp}</Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'center',
                          alignItems: 'center',
                          alignSelf: 'center',
                        }}>
                        <Text style={styles.text}>Association: </Text>
                        <Text
                          style={[
                            styles.text,
                            {
                              color:
                                item.association === 'WBTPTA'
                                  ? 'darkgreen'
                                  : 'red',
                            },
                          ]}>
                          {item.association}
                        </Text>
                      </View>
                      <Text style={styles.text}>Address: {item.address}</Text>
                      {noeditBtn
                        ? user.circle === 'admin' && (
                            <View
                              style={{
                                flexDirection: 'row',
                                alignSelf: 'center',
                                justifyContent: 'center',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                              }}>
                              <CustomButton
                                title={'View Details'}
                                size={'small'}
                                fontSize={responsiveFontSize(1.5)}
                                color={'darkgreen'}
                                onClick={() => {
                                  navigation.navigate('ViewDetails');
                                  setStateObject({
                                    data: item,
                                    navigation: navigation,
                                  });
                                  DeviceEventEmitter.addListener(
                                    'goBack',
                                    setActiveTab,
                                  );
                                }}
                              />
                              <CustomButton
                                title={'Edit Details'}
                                size={'small'}
                                fontSize={responsiveFontSize(1.5)}
                                color={'chocolate'}
                                onClick={() => {
                                  navigation.navigate('EditDetails');
                                  setStateObject({
                                    data: item,
                                    navigation: navigation,
                                  });
                                  DeviceEventEmitter.addListener(
                                    'goBack',
                                    setActiveTab,
                                  );
                                }}
                              />
                              {user.circle === 'admin' && (
                                <CustomButton
                                  title={'Delete'}
                                  size={'small'}
                                  fontSize={responsiveFontSize(1.5)}
                                  color={'red'}
                                  onClick={() => {
                                    showDeleteTeacherConfirmDialog(item);
                                  }}
                                />
                              )}
                              {user.circle === 'admin' &&
                                item.association === 'WBTPTA' &&
                                !item.registered && (
                                  <CustomButton
                                    title={'Register'}
                                    size={'small'}
                                    fontSize={responsiveFontSize(1.5)}
                                    color={'blueviolet'}
                                    onClick={() => {
                                      showRegisterTeacherConfirmDialog(item);
                                    }}
                                  />
                                )}
                              {item.circle === 'admin' ? (
                                <TouchableOpacity
                                  style={{
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    alignSelf: 'center',
                                    backgroundColor: 'forestgreen',
                                    padding: responsiveWidth(2),
                                    borderRadius: responsiveWidth(2),
                                    marginTop: 10,
                                  }}
                                  onPress={() => {
                                    showRemoveAdminConfirmDialog(item);
                                  }}>
                                  <Image
                                    source={require('../assets/images/user.png')}
                                    style={{
                                      width: responsiveWidth(5),
                                      height: responsiveWidth(5),
                                      tintColor: 'white',
                                    }}
                                  />
                                  <Text
                                    style={[
                                      styles.text,
                                      {
                                        paddingLeft: responsiveWidth(2),
                                        color: 'white',
                                        fontSize: responsiveFontSize(1.5),
                                        fontWeight: '500',
                                      },
                                    ]}>
                                    Remove Admin
                                  </Text>
                                </TouchableOpacity>
                              ) : (
                                <TouchableOpacity
                                  style={{
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    alignSelf: 'center',
                                    backgroundColor: 'forestgreen',
                                    padding: responsiveWidth(2),
                                    borderRadius: responsiveWidth(2),
                                    marginTop: 10,
                                  }}
                                  onPress={() => {
                                    showMakeAdminConfirmDialog(item);
                                  }}>
                                  <Image
                                    source={require('../assets/images/admin.png')}
                                    style={{
                                      width: responsiveWidth(5),
                                      height: responsiveWidth(5),
                                      tintColor: 'white',
                                    }}
                                  />
                                  <Text
                                    style={[
                                      styles.text,
                                      {
                                        paddingLeft: responsiveWidth(2),
                                        color: 'white',
                                        fontSize: responsiveFontSize(1.5),
                                        fontWeight: '500',
                                      },
                                    ]}>
                                    Make Admin
                                  </Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          )
                        : null}
                    </View>
                  )}
                />
              ) : (
                <Text style={styles.text}>Teacher Not Found</Text>
              )}
            </ScrollView>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: responsiveHeight(8),
              }}>
              {firstData >= 10 && (
                <View>
                  <CustomButton
                    color={'orange'}
                    title={'Previous'}
                    onClick={loadPrev}
                    size={'small'}
                    fontSize={14}
                  />
                </View>
              )}
              {visibleItems < filteredData.length && (
                <View>
                  <CustomButton
                    title={'Next'}
                    onClick={loadMore}
                    size={'small'}
                    fontSize={14}
                  />
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
      <Toast />
      <Loader visible={visible} />
    </View>
  );
};

export default TeachersDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(3),
    fontWeight: '500',
    marginTop: responsiveHeight(0.5),
    color: THEME_COLOR,
    textAlign: 'center',
    padding: responsiveWidth(1),
  },
  text: {
    fontSize: responsiveFontSize(2),
    textAlign: 'center',
    color: THEME_COLOR,
  },
  label: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(2),
    fontWeight: '500',
    marginTop: responsiveHeight(0.2),
    color: THEME_COLOR,
    textAlign: 'center',
  },
  dataView: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginTop: responsiveHeight(1),
    borderRadius: responsiveWidth(3),
    padding: responsiveWidth(5),
    width: responsiveWidth(76),
    elevation: 5,
  },
  dataText: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(2),
    color: THEME_COLOR,
    textAlign: 'center',
    marginTop: responsiveHeight(0.5),
  },
  bankDataText: {
    alignSelf: 'center',
    fontSize: 15,
    color: THEME_COLOR,
    textAlign: 'center',
    padding: 1,
  },
  dropDownnSelector: {
    width: responsiveWidth(76),
    height: responsiveHeight(7),
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: THEME_COLOR,
    alignSelf: 'center',
    marginTop: responsiveHeight(15),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: responsiveWidth(5),
    paddingRight: responsiveWidth(5),
  },
  dropDowArea: {
    width: responsiveWidth(76),

    borderRadius: responsiveWidth(2),
    marginTop: responsiveHeight(1),
    backgroundColor: '#fff',
    elevation: 5,
    alignSelf: 'center',
    marginBottom: responsiveHeight(20),
  },
  AdminName: {
    width: responsiveWidth(80),
    height: responsiveHeight(7),
    borderBottomWidth: 0.2,
    borderBottomColor: THEME_COLOR,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  dropDownText: {
    fontSize: responsiveFontSize(2),
    color: THEME_COLOR,
    alignSelf: 'center',
    textAlign: 'center',
    fontFamily: 'kalpurush',
  },
});
