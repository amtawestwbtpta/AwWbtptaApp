import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  BackHandler,
  Alert,
  Platform,
  Linking,
  DeviceEventEmitter,
} from 'react-native';
import axios from 'axios';
import React, {useState, useEffect} from 'react';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {THEME_COLOR} from '../utils/Colors';
import CustomButton from '../components/CustomButton';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import Loader from '../components/Loader';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import bcrypt from 'react-native-bcrypt';
import isaac from 'isaac';
import {getSubmitDateInput} from '../modules/calculatefunctions';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Toast from 'react-native-toast-message';
import AnimatedSeacrch from '../components/AnimatedSeacrch';
import {useGlobalContext} from '../context/Store';
const RegUsers = () => {
  const isFocused = useIsFocused();

  const navigation = useNavigation();
  const [members, setMembers] = useState([]);
  const [name, setName] = useState('');
  const [filteredName, setFilteredName] = useState([]);
  const [showLoader, setShowLoader] = useState(false);
  const {
    state,
    userState,
    setUserState,
    teachersState,
    setTeachersState,
    setTeacherUpdateTime,
  } = useGlobalContext();
  const user = state.USER;
  bcrypt.setRandomFallback(len => {
    const buf = new Uint8Array(len);

    return buf.map(() => Math.floor(isaac.random() * 256));
  });
  const [firstData, setFirstData] = useState(0);
  const [visibleItems, setShowLoaderItems] = useState(10);
  const loadPrev = () => {
    setShowLoaderItems(prevVisibleItems => prevVisibleItems - 10);
    setFirstData(firstData - 10);
  };
  const loadMore = () => {
    setShowLoaderItems(prevVisibleItems => prevVisibleItems + 10);
    setFirstData(firstData + 10);
  };

  const getMembers = async () => {
    setShowLoader(true);
    await firestore()
      .collection('userteachers')
      .get()
      .then(snapshot => {
        const datas = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        }));
        let newData = datas.sort((a, b) => a.createdAt - b.createdAt);
        setShowLoader(false);
        setMembers(newData);
        setFilteredName(newData);
        setUserState(newData);
      })
      .catch(e => {
        setShowLoader(false);
        showToast('error', e);
      });
  };

  const showConfirmDialog = el => {
    return Alert.alert('Hold On!', `Are You Sure To Delete User ${el.tname}?`, [
      // The "No" button
      // Does nothing but dismiss the dialog when tapped
      {
        text: 'No',
        onPress: () => showToast('success', 'User Not Deleted!'),
      },
      // The "Yes" button
      {
        text: 'Yes',
        onPress: () => {
          deleteUser(el);
        },
      },
    ]);
  };

  const deleteUser = async user => {
    const url = `https://awwbtpta.vercel.app/api/delteacher`;
    try {
      setShowLoader(true);
      let response = await axios.post(url, {
        id: user.id,
      });
      let record = response.data;
      if (record.success) {
        await firestore().collection('userteachers').doc(user.id).delete();
        await delTokens(user);
        await firestore().collection('profileImage').doc(user.id).delete();
        await firestore().collection('teachers').doc(user.id).update({
          registered: false,
        });
        setUserState(userState.filter(el => el.id !== user.id));
        let x = teachersState.filter(el => el.id === user.id)[0];
        let y = teachersState.filter(el => el.id !== user.id);
        x.registered = false;
        y = [...y, x];
        let c = y.sort(
          (a, b) => a.school.localeCompare(b.school) && b.rank > a.rank,
        );
        setTeachersState(c);
        setTeacherUpdateTime(Date.now());

        await storage()
          .ref('/profileImage/' + user.photoName)
          .delete()
          .then(async () => {
            await delChats(user).then(() => {
              setShowLoader(false);
              showToast('success', 'User Deleted Successfully!');
            });
          })
          .catch(e => {
            setShowLoader(false);
            showToast('error', 'Member Deletation Failed!');
            console.log(e);
          });
      } else {
        setShowLoader(false);
        showToast('error', 'Member Deletation Failed!');
      }
    } catch (e) {
      setShowLoader(false);
      showToast('error', 'Something Went Wrong!');
      console.log(e);
    }
  };

  const delChats = async user => {
    let all1stUserChatCollection = [];
    let all2ndUserChatCollection = [];

    members
      .filter(el => el.empid !== user.empid)
      .map(el => all1stUserChatCollection.push(user.empid + '-' + el.empid));
    members
      .filter(el => el.empid !== user.empid)
      .map(el => all2ndUserChatCollection.push(el.empid + '-' + user.empid));

    all1stUserChatCollection.map(collection => {
      return firestore()
        .collection('chats')
        .doc(collection)
        .collection('messages')
        .orderBy('createdAt', 'desc')
        .onSnapshot(querySnapShot => {
          const allMessages = querySnapShot.docs.map(item => {
            return {...item._data, createdAt: item._data.createdAt};
          });
          allMessages.map(
            async el => await deleteMessage(el.user.uid, collection),
          );
        });
    });
    all2ndUserChatCollection.map(collection => {
      return firestore()
        .collection('chats')
        .doc(collection)
        .collection('messages')
        .orderBy('createdAt', 'desc')
        .onSnapshot(querySnapShot => {
          const allMessages = querySnapShot.docs.map(item => {
            return {...item._data, createdAt: item._data.createdAt};
          });
          allMessages.map(
            async el => await deleteMessage(el.user.uid, collection),
          );
        });
    });
  };

  const deleteMessage = async (id, collection) => {
    await firestore()
      .collection('chats')
      .doc(collection)
      .collection('messages')
      .where('user.uid', '==', id)
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(async documentSnapshot => {
          await firestore()
            .collection('chats')
            .doc(collection)
            .collection('messages')
            .doc(documentSnapshot.id)
            .delete()
            .then(() => console.log('Message Deleted'))
            .catch(e => console.log(e));
        });
      })
      .catch(e => console.log(e));
  };
  const delTokens = async user => {
    await firestore()
      .collection('tokens')
      .where('username', '==', user.username)
      .get()
      .then(snapshot => {
        const datas = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        }));
        datas.map(
          async el =>
            await firestore().collection('tokens').doc(el.id).delete(),
        );
      })
      .catch(e => {
        console.log('error', e);
      });
  };
  const showDisableConfirmDialog = id => {
    return Alert.alert('Hold On!', `Are You Sure To Disable User Login?`, [
      // The "No" button
      // Does nothing but dismiss the dialog when tapped
      {
        text: 'No',
        onPress: () => showToast('success', 'User Login Not Disabled!'),
      },
      // The "Yes" button
      {
        text: 'Yes',
        onPress: () => {
          disableUser(id);
        },
      },
    ]);
  };
  const showRestoreConfirmDialog = id => {
    return Alert.alert('Hold On!', `Are You Sure To Restore User Login?`, [
      // The "No" button
      // Does nothing but dismiss the dialog when tapped
      {
        text: 'No',
        onPress: () => showToast('success', 'User Login Not Restored!'),
      },
      // The "Yes" button
      {
        text: 'Yes',
        onPress: () => {
          activeUser(id);
        },
      },
    ]);
  };

  const disableUser = async id => {
    setShowLoader(true);
    await firestore()
      .collection('userteachers')
      .doc(id)
      .update({
        disabled: true,
      })
      .then(() => {
        setShowLoader(false);
        let x = userState.filter(el => el.id === id)[0];
        let y = userState.filter(el => el.id !== id);
        x.disabled = true;
        y = [...y, x];
        let newData = y.sort((a, b) => a.createdAt - b.createdAt);
        setUserState(newData);
        showToast('success', 'User Login is Disabled Successfully!');
      })
      .catch(e => {
        setShowLoader(false);
        showToast('error', 'User Login Disable Updation Failed!');
        console.log(e);
      });
  };

  const activeUser = async id => {
    setShowLoader(true);
    await firestore()
      .collection('userteachers')
      .doc(id)
      .update({
        disabled: false,
      })
      .then(() => {
        setShowLoader(false);
        showToast('success', 'User Login is Restored Successfully!');
        let x = userState.filter(el => el.id === id)[0];
        let y = userState.filter(el => el.id !== id);
        x.disabled = false;
        y = [...y, x];
        let newData = y.sort((a, b) => a.createdAt - b.createdAt);
        setUserState(newData);
      })
      .catch(e => {
        setShowLoader(false);
        showToast('error', 'User Login Restoration Failed!');
        console.log(e);
      });
  };

  const toggleAccount = async elem => {
    setShowLoader(true);
    await firestore()
      .collection('userteachers')
      .doc(elem.id)
      .update({
        showAccount: !elem.showAccount,
      })
      .then(() => {
        setShowLoader(false);
        showToast(
          'success',
          `Account ${
            elem.showAccount ? 'Hidden From' : 'Shown To'
          } User Successfully!`,
        );
        let x = userState.filter(el => el.id === elem.id)[0];
        let y = userState.filter(el => el.id !== elem.id);
        x.showAccount = !x.showAccount;
        y = [...y, x];
        let newData = y.sort((a, b) => a.createdAt - b.createdAt);
        setUserState(newData);
        getUserData();
      })
      .catch(e => {
        setShowLoader(false);
        showToast('error', 'User Login Disable Updation Failed!');
        console.log(e);
      });
  };
  const showConfirmDialog2 = el => {
    return Alert.alert(
      'Hold On!',
      `Are You Sure To Reset Password of User ${
        el.tname
      } to PAN in LowerCase i.e. ${el.pan.toLowerCase()}?`,
      [
        // The "No" button
        // Does nothing but dismiss the dialog when tapped
        {
          text: 'No',
          onPress: () => showToast('success', 'Password Not Reseted!'),
        },
        // The "Yes" button
        {
          text: 'Yes',
          onPress: () => {
            resetPassword(el);
          },
        },
      ],
    );
  };
  const resetPassword = async user => {
    setShowLoader(true);
    await firestore()
      .collection('userteachers')
      .doc(user.id)
      .update({
        password: bcrypt.hashSync(`${user.pan.toLowerCase()}`, 10),
      })
      .then(() => {
        setShowLoader(false);
        showToast('success', 'User Password Reset is Successfull!');
        let x = userState.filter(el => el.id === user.id)[0];
        let y = userState.filter(el => el.id !== user.id);
        x.password = bcrypt.hashSync(`${user.pan.toLowerCase()}`, 10);
        y = [...y, x];
        let newData = y.sort((a, b) => a.createdAt - b.createdAt);
        setUserState(newData);
        getUserData();
      })
      .catch(e => {
        setShowLoader(false);
        showToast('error', 'User Password Reset Failed!');
        console.log(e);
      });
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

  const makeAdmin = async item => {
    setShowLoader(true);
    await firestore()
      .collection('teachers')
      .doc(item.id)
      .update({
        circle: 'admin',
      })
      .then(async () => {
        try {
          await firestore()
            .collection('userteachers')
            .doc(item.id)
            .update({
              circle: 'admin',
            })
            .then(() => {
              setShowLoader(false);
              showToast(
                'success',
                'Teacher Access Changed To Admin Successfully!',
              );

              let x = userState.filter(el => el.id === item.id)[0];
              let y = userState.filter(el => el.id !== item.id);
              x.circle = 'admin';
              y = [...y, x];
              let newData = y.sort((a, b) => a.createdAt - b.createdAt);
              setUserState(newData);
              let m = teachersState.filter(el => el.id === item.id)[0];
              let n = teachersState.filter(el => el.id !== item.id);
              m.circle = 'admin';
              n = [...n, m];
              let c = n.sort(
                (a, b) => a.school.localeCompare(b.school) && b.rank > a.rank,
              );
              setTeachersState(c);
              setTeacherUpdateTime(Date.now());
            })
            .catch(e => {
              setShowLoader(false);
              // showToast('error', 'Teacher Access Updation Failed!');
              showToast(
                'success',
                'Teacher Access Changed To Admin Successfully!',
              );
              console.log(e);
              getUserData();
            });
        } catch (e) {
          console.log(e);
          setShowLoader(false);
          showToast('success', 'Teacher Access Changed To Admin Successfully!');
          getUserData();
        }
      })
      .catch(e => {
        setShowLoader(false);
        showToast('error', 'Teacher Access Updation Failed!');
        console.log(e);
      });
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
          onPress: () => showToast('success', 'Teacher Access Not Updated!'),
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

  const removeAdmin = async item => {
    setShowLoader(true);
    await firestore()
      .collection('teachers')
      .doc(item.id)
      .update({
        circle: 'taw',
      })
      .then(async () => {
        try {
          await firestore()
            .collection('userteachers')
            .doc(item.id)
            .update({
              circle: 'taw',
            })
            .then(() => {
              setShowLoader(false);
              showToast(
                'success',
                'Teacher Access Changed To Admin Successfully!',
              );

              let x = userState.filter(el => el.id === item.id)[0];
              let y = userState.filter(el => el.id !== item.id);
              x.circle = 'taw';
              y = [...y, x];
              let newData = y.sort((a, b) => a.createdAt - b.createdAt);
              setUserState(newData);
              let m = teachersState.filter(el => el.id === item.id)[0];
              let n = teachersState.filter(el => el.id !== item.id);
              m.circle = 'taw';
              n = [...n, m];
              let c = n.sort(
                (a, b) => a.school.localeCompare(b.school) && b.rank > a.rank,
              );
              setTeachersState(c);
              getUserData();
            })
            .catch(e => {
              setShowLoader(false);
              // showToast('error', 'Teacher Access Updation Failed!');
              showToast(
                'success',
                'Teacher Access Changed To Admin Successfully!',
              );
              console.log(e);
              getUserData();
            });
        } catch (e) {
          console.log(e);
          setShowLoader(false);
          showToast('success', 'Teacher Access Changed To Admin Successfully!');
          getUserData();
        }
      })
      .catch(e => {
        setShowLoader(false);
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
  const showToast = (type, text) => {
    Toast.show({
      type: type,
      text1: text,
      visibilityTime: 1500,
      position: 'top',
      topOffset: 500,
    });
  };

  const getUserData = () => {
    if (userState.length === 0) {
      getMembers();
    } else {
      setShowLoader(false);
      let newData = userState.sort((a, b) => a.createdAt - b.createdAt);
      setMembers(newData);
      setFilteredName(userState);
    }
  };

  useEffect(() => {
    getUserData();
  }, [isFocused]);
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.navigate('Home');
        DeviceEventEmitter.emit('goBack');
        return true;
      },
    );
    return () => backHandler.remove();
  }, [isFocused]);
  useEffect(() => {}, [name, filteredName]);

  return (
    <View style={{flex: 1}}>
      <View style={styles.header}>
        <View
          style={{
            justifyContent: 'space-between',
            alignItems: 'center',
            alignSelf: 'center',
            flexDirection: 'row',
          }}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Image
              source={require('../assets/images/logosq.png')}
              style={{
                width: responsiveWidth(30),
                height: responsiveWidth(30),
                paddingRight: responsiveWidth(20),
                transform: [
                  {scale: 0.4},
                  {translateY: -responsiveHeight(8)},
                  {translateX: -responsiveHeight(8)},
                ],
              }}
            />
          </TouchableOpacity>
          <Text
            selectable
            style={{
              fontSize: responsiveFontSize(3),
              fontFamily: 'kalpurush',
              fontWeight: '500',
              transform: [
                {scale: 1.4},
                {scaleY: 1.5},
                {translateY: -responsiveHeight(1.2)},
                {translateX: -responsiveHeight(1.5)},
              ],
              color: 'white',
            }}>
            আমতা পশ্চিম চক্র
          </Text>
          <TouchableOpacity
            style={{
              paddingLeft: responsiveWidth(5),
              transform: [{translateY: -responsiveHeight(3)}],
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => {
              navigation.navigate('Home');
            }}>
            <MaterialCommunityIcons
              name="home"
              size={responsiveFontSize(5)}
              color={'white'}
            />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        style={{
          marginTop: responsiveHeight(9),
        }}>
        <Text
          selectable
          style={[styles.title, {marginBottom: responsiveHeight(2)}]}>
          Our Registered Users
        </Text>
        <View style={{marginBottom: responsiveHeight(6)}}>
          <AnimatedSeacrch
            value={name}
            placeholder={'Serch Teacher Name'}
            onChangeText={text => {
              setName(text);
              let newData = members.filter(el => {
                return el.tname.toLowerCase().match(text.toLowerCase());
              });

              setFilteredName(newData);
            }}
            func={() => {
              setFilteredName(members);
              setName('');
              setFirstData(0);
            }}
          />
        </View>

        <ScrollView style={{marginBottom: responsiveHeight(6)}}>
          <View
            style={{
              flexDirection: 'row',
              marginBottom: 5,
              alignSelf: 'center',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            {firstData >= 10 && (
              <View style={{marginBottom: 10}}>
                <CustomButton
                  color={'orange'}
                  title={'Previous'}
                  onClick={loadPrev}
                  size={'small'}
                  fontSize={14}
                />
              </View>
            )}
            {visibleItems < filteredName.length && (
              <View style={{marginBottom: 10}}>
                <CustomButton
                  title={'Next'}
                  onClick={loadMore}
                  size={'small'}
                  fontSize={14}
                />
              </View>
            )}
          </View>
          {filteredName.length > 0 ? (
            filteredName.slice(firstData, visibleItems).map((el, ind) => {
              return (
                <ScrollView key={ind}>
                  <View
                    style={[
                      styles.itemView,
                      {
                        backgroundColor: !el.disabled
                          ? 'white'
                          : 'rgba(255, 0, 0,.4)',
                      },
                    ]}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                      <View
                        style={{
                          paddingRight: responsiveWidth(2),

                          justifyContent: 'center',
                          alignItems: 'center',
                          alignSelf: 'center',
                        }}>
                        <Image
                          source={{uri: el.url}}
                          style={{
                            width: responsiveWidth(20),
                            height: responsiveWidth(20),
                            borderRadius: responsiveWidth(10),
                            alignSelf: 'center',
                            marginBottom: responsiveHeight(1),
                          }}
                        />
                        {user.circle === 'admin' ? (
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              alignSelf: 'center',
                            }}>
                            {el.circle === 'admin' ? (
                              user.circle === 'admin' &&
                              user.showAccount &&
                              el.showAccount ? (
                                <TouchableOpacity
                                  style={{
                                    paddingRight: responsiveWidth(1),
                                    paddingLeft: responsiveWidth(1),
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                  }}
                                  onPress={() => {
                                    return Alert.alert(
                                      'Hold On!',
                                      `Are You Sure To Hide Account From ${el.tname}?`,
                                      [
                                        // The "No" button
                                        // Does nothing but dismiss the dialog when tapped
                                        {
                                          text: 'No',
                                          onPress: () =>
                                            showToast(
                                              'success',
                                              'Account Not Hidden',
                                            ),
                                        },
                                        // The "Yes" button
                                        {
                                          text: 'Yes',
                                          onPress: () => {
                                            toggleAccount(el);
                                          },
                                        },
                                      ],
                                    );
                                  }}>
                                  <Fontisto
                                    name="locked"
                                    size={18}
                                    color="red"
                                  />
                                  <Text
                                    selectable
                                    style={[
                                      styles.btnText,
                                      {color: 'red'},
                                    ]}>{`Hide\nA/C`}</Text>
                                </TouchableOpacity>
                              ) : (
                                <TouchableOpacity
                                  style={{
                                    paddingRight: responsiveWidth(1),
                                    paddingLeft: responsiveWidth(1),
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                  }}
                                  onPress={() => {
                                    return Alert.alert(
                                      'Hold On!',
                                      `Are You Sure To Show Account To ${el.tname}?`,
                                      [
                                        // The "No" button
                                        // Does nothing but dismiss the dialog when tapped
                                        {
                                          text: 'No',
                                          onPress: () =>
                                            showToast(
                                              'success',
                                              'Account Not Shown',
                                            ),
                                        },
                                        // The "Yes" button
                                        {
                                          text: 'Yes',
                                          onPress: () => {
                                            toggleAccount(el);
                                          },
                                        },
                                      ],
                                    );
                                  }}>
                                  <Fontisto
                                    name="unlocked"
                                    size={18}
                                    color="green"
                                  />
                                  <Text
                                    selectable
                                    style={[
                                      styles.btnText,
                                      {color: 'green'},
                                    ]}>{`Show\nA/C`}</Text>
                                </TouchableOpacity>
                              )
                            ) : null}
                            {el.disabled ? (
                              <TouchableOpacity
                                style={{
                                  paddingRight: responsiveWidth(1),
                                  paddingLeft: responsiveWidth(1),
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                }}
                                onPress={() => {
                                  showRestoreConfirmDialog(el.id);
                                }}>
                                <FontAwesome5
                                  name="user-check"
                                  size={18}
                                  color="green"
                                />
                                <Text
                                  selectable
                                  style={[
                                    styles.btnText,
                                    {color: 'green'},
                                  ]}>{`Unlock\nUser`}</Text>
                              </TouchableOpacity>
                            ) : (
                              <TouchableOpacity
                                style={{
                                  paddingRight: responsiveWidth(1),
                                  paddingLeft: responsiveWidth(1),
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                }}
                                onPress={() => {
                                  showDisableConfirmDialog(el.id);
                                }}>
                                <FontAwesome5
                                  name="user-lock"
                                  size={18}
                                  color="red"
                                />
                                <Text
                                  selectable
                                  style={[
                                    styles.btnText,
                                    {color: 'red'},
                                  ]}>{`Lock\nUser`}</Text>
                              </TouchableOpacity>
                            )}

                            <TouchableOpacity
                              style={{
                                paddingLeft: responsiveWidth(1),
                                paddingRight: responsiveWidth(1),
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}
                              onPress={() => {
                                showConfirmDialog(el);
                              }}>
                              <Ionicons
                                name="trash-bin"
                                size={18}
                                color="red"
                              />
                              <Text
                                selectable
                                style={[
                                  styles.btnText,
                                  {color: 'red'},
                                ]}>{`Delete\nUser`}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={{
                                paddingLeft: responsiveWidth(1),
                                paddingRight: responsiveWidth(1),
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}
                              onPress={() => {
                                showConfirmDialog2(el);
                              }}>
                              <MaterialCommunityIcons
                                name="lock-reset"
                                size={18}
                                color="red"
                              />
                              <Text
                                selectable
                                style={[
                                  styles.btnText,
                                  {color: 'red'},
                                ]}>{`Reset\nPassword`}</Text>
                            </TouchableOpacity>
                          </View>
                        ) : null}
                      </View>
                      <View>
                        <Text selectable style={styles.label}>
                          Sl No.: {ind + 1}
                        </Text>
                        <Text selectable style={styles.label}>
                          Name: {el.tname}
                        </Text>
                        <Text selectable style={styles.label}>
                          Access: {el.circle}
                        </Text>
                        {el.circle === 'admin' ? (
                          <TouchableOpacity
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'center',
                              alignItems: 'center',
                              alignSelf: 'center',

                              borderRadius: responsiveWidth(2),
                            }}
                            onPress={() => {
                              showRemoveAdminConfirmDialog(el);
                            }}>
                            <Image
                              source={require('../assets/images/user.png')}
                              style={{
                                width: responsiveWidth(4),
                                height: responsiveWidth(4),
                                tintColor: 'red',
                              }}
                            />
                            <Text
                              selectable
                              style={[
                                styles.text,
                                {
                                  paddingLeft: responsiveWidth(2),
                                  color: 'red',
                                  fontSize: responsiveFontSize(1.5),
                                  fontWeight: '500',
                                },
                              ]}>
                              Remove From Admin
                            </Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'center',
                              alignItems: 'center',
                              alignSelf: 'center',

                              borderRadius: responsiveWidth(2),
                            }}
                            onPress={() => {
                              showMakeAdminConfirmDialog(el);
                            }}>
                            <Image
                              source={require('../assets/images/admin.png')}
                              style={{
                                width: responsiveWidth(4),
                                height: responsiveWidth(4),
                                tintColor: 'green',
                              }}
                            />
                            <Text
                              selectable
                              style={[
                                styles.text,
                                {
                                  paddingLeft: responsiveWidth(2),
                                  color: 'green',
                                  fontSize: responsiveFontSize(1.5),
                                  fontWeight: '500',
                                },
                              ]}>
                              Make Admin
                            </Text>
                          </TouchableOpacity>
                        )}
                        <Text selectable style={styles.label}>
                          Username: {el.username}
                        </Text>
                        <Text selectable style={styles.label}>
                          Email: {el.email}
                        </Text>
                        <Text
                          selectable
                          style={styles.label}
                          onPress={() => makeCall(parseInt(el.phone))}>
                          <Feather
                            name="phone-call"
                            size={18}
                            color={THEME_COLOR}
                          />{' '}
                          Mobile: {el.phone}
                        </Text>
                        <Text selectable style={styles.label}>
                          Teacher ID: {el.teachersID}
                        </Text>
                        <Text selectable style={styles.label}>
                          EMPID: {el.empid}
                        </Text>
                        <Text selectable style={styles.label}>
                          PAN: {el.pan}
                        </Text>
                        <Text selectable style={styles.label}>
                          Registered On:{' '}
                          {getSubmitDateInput(
                            new Date(el.createdAt).toLocaleDateString(),
                          )}
                        </Text>
                      </View>
                    </View>
                  </View>
                </ScrollView>
              );
            })
          ) : (
            <Text selectable style={styles.label}>
              Teacher Not Found
            </Text>
          )}
          <View
            style={{
              flexDirection: 'row',
              marginBottom: 5,
              alignSelf: 'center',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            {firstData >= 10 && visibleItems < filteredName.length && (
              <View style={{marginBottom: 10}}>
                <CustomButton
                  color={'orange'}
                  title={'Previous'}
                  onClick={loadPrev}
                  size={'small'}
                  fontSize={14}
                />
              </View>
            )}
            {visibleItems < filteredName.length && (
              <View style={{marginBottom: 10}}>
                <CustomButton
                  title={'Next'}
                  onClick={loadMore}
                  size={'small'}
                  fontSize={14}
                />
              </View>
            )}
          </View>
        </ScrollView>
      </ScrollView>
      <Loader visible={showLoader} />
      <Toast />
    </View>
  );
};

export default RegUsers;

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    width: responsiveWidth(100),
    height: responsiveHeight(8.5),
    backgroundColor: THEME_COLOR,
    elevation: 5,
    shadowColor: 'black',
    borderBottomLeftRadius: responsiveWidth(3),
    borderBottomRightRadius: responsiveWidth(3),
    padding: 3,
    marginBottom: responsiveHeight(2),
  },
  title: {
    textAlign: 'center',
    fontSize: responsiveFontSize(3),
    fontWeight: '700',
    color: THEME_COLOR,
  },
  itemView: {
    width: responsiveWidth(95),

    alignSelf: 'center',
    borderRadius: responsiveWidth(2),
    marginTop: responsiveHeight(0.5),
    marginBottom: responsiveHeight(0.5),
    padding: responsiveWidth(4),
    shadowColor: 'black',
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(1.2),
    fontWeight: '500',
    marginTop: responsiveHeight(0.2),
    color: THEME_COLOR,
    textAlign: 'center',
  },
  btnText: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(1),
    fontWeight: '500',
    marginTop: responsiveHeight(0.2),
    color: THEME_COLOR,
    textAlign: 'center',
  },
  text: {
    fontSize: responsiveFontSize(2),
    textAlign: 'center',
    color: THEME_COLOR,
  },
});
