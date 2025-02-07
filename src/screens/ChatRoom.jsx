import {
  StyleSheet,
  Text,
  View,
  Image,
  BackHandler,
  TouchableOpacity,
  ImageBackground,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import React, {useState, useEffect, useCallback} from 'react';
import {THEME_COLOR} from '../utils/Colors';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {Bubble, GiftedChat, InputToolbar, Send} from 'react-native-gifted-chat';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import uuid from 'react-native-uuid';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Image as Img} from 'react-native-compressor';
import {Video as Vid} from 'react-native-compressor';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import {useGlobalContext} from '../context/Store';
import {sendNotifications} from '../modules/notification';
import Toast from 'react-native-toast-message';
import Loader from '../components/Loader';
import Modal from 'react-native-modal';
import ImagePicker from 'react-native-image-crop-picker';
import DocumentPicker from 'react-native-document-picker';
import Video from 'react-native-video';
import VideoPlayer from '../components/VideoPlayer';
import {downloadFile} from '../modules/downloadFile';
const ChatRoom = () => {
  const docId = uuid.v4().split('-')[0];

  const {state, stateObject} = useGlobalContext();
  const user = state.USER;
  let data = stateObject;
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [showModal, setShowModal] = useState(false);
  const [messageList, setMessageList] = useState([]);
  const [targetMessage, setTargetMessage] = useState('');
  const [msgUsername, setMsgUsername] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [photoName, setPhotoName] = useState('');
  const [uri, setUri] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [documentUri, setDocumentUri] = useState('');
  const [fileType, setFileType] = useState('');
  const [videoUri, setVideoUri] = useState('');
  const [videoName, setVideoName] = useState('');
  const [showVideo, setShowVideo] = useState(false);
  const [chatVideoUri, setChatVideoUri] = useState('');
  const [paused, setPaused] = useState(true);
  const [clicked, setClicked] = useState(false);
  const [chatVideoName, setChatVideoName] = useState('');
  useEffect(() => {}, [photoName, uri, documentName, documentUri, fileType]);

  const getMessage = async () => {
    const subscriber = firestore()
      .collection('chats')
      .doc(user.empid + '-' + data.empid)
      .collection('messages')
      .orderBy('createdAt', 'desc');
    subscriber.onSnapshot(querySnapShot => {
      const allMessages = querySnapShot.docs.map(item => {
        return {...item._data, createdAt: item._data.createdAt};
      });
      setMessageList(allMessages);
    });
    return () => subscriber;
  };

  const onSend = useCallback(
    async (messages = []) => {
      const msg = messages[0];
      let myMsg = null;
      let url = '';

      if (uri !== '') {
        const reference = storage().ref(`/chatImages/${photoName}`);
        const result = await Img.compress(uri, {
          progressDivider: 10,
          downloadProgress: progress => {
            console.log('downloadProgress: ', progress);
          },
        });

        const pathToFile = result;

        // uploads file
        await reference.putFile(pathToFile);
        url = await storage().ref(`/chatImages/${photoName}`).getDownloadURL();

        myMsg = {
          ...msg,
          sentBy: user.empid,
          sentTo: data.empid,
          createdAt: Date.parse(msg.createdAt),
          image: url,
          photoName: photoName,
          fileType: fileType,
          documentName: '',
          documentUri: '',
          video: '',
          videoName: '',
        };
      } else if (documentUri !== '') {
        const reference = storage().ref(`/chatDocuments/${documentName}`);
        const pathToFile = documentUri;

        // uploads file
        await reference
          .putFile(pathToFile)
          .then(task => console.log(task))
          .catch(e => console.log(e));
        url = await storage()
          .ref(`/chatDocuments/${documentName}`)
          .getDownloadURL();

        myMsg = {
          ...msg,
          sentBy: user.empid,
          sentTo: data.empid,
          createdAt: Date.parse(msg.createdAt),
          image:
            fileType === 'image/jpeg' || fileType === 'image/png' ? url : '',
          photoName: '',
          fileType: fileType,
          documentName: documentName,
          documentUri: url,
          video: fileType === 'video/mp4' ? url : '',
          videoName: fileType === 'video/mp4' ? videoName : '',
        };
      } else if (videoUri !== '') {
        const reference = storage().ref(`/chatVideos/${videoName}`);

        const result = await Vid.compress(
          videoUri,
          {
            progressDivider: 10,
            downloadProgress: progress => {
              console.log('downloadProgress: ', progress);
            },
          },
          progress => {
            console.log('Compression Progress: ', progress);
          },
        );
        const pathToFile = result;
        // uploads file
        await reference
          .putFile(pathToFile)
          .then(task => console.log(task))
          .catch(e => console.log(e));
        url = await storage().ref(`/chatVideos/${videoName}`).getDownloadURL();

        myMsg = {
          ...msg,
          sentBy: user.empid,
          sentTo: data.empid,
          createdAt: Date.parse(msg.createdAt),
          image: '',
          photoName: '',
          fileType: fileType,
          documentName: '',
          videoName: videoName,
          documentUri: '',
          video: url,
        };
      } else {
        myMsg = {
          ...msg,
          sentBy: user.empid,
          sentTo: data.empid,
          createdAt: Date.parse(msg.createdAt),
          image: '',
          photoName: '',
          fileType: '',
          documentName: '',
          documentUri: '',
          video: '',
        };
      }
      setMessageList(previousMessages =>
        GiftedChat.append(previousMessages, myMsg),
      );

      await firestore()
        .collection('chats')
        .doc(data.empid + '-' + user.empid)
        .collection('messages')
        .add(myMsg);
      await firestore()
        .collection('chats')
        .doc(user.empid + '-' + data.empid)
        .collection('messages')
        .add(myMsg)
        .then(async () => {
          await firestore()
            .collection('tokens')
            .where('username', '==', data.username)
            .get()
            .then(snapshot => {
              const datas = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
              }));
              datas.map(
                async el =>
                  await sendNotifications(
                    el.token,
                    `New Message From ${user.tname}`,
                    msg.text,
                  ),
              );
              setDocumentName('');
              setDocumentUri('');
              setPhotoName('');
              setUri('');
              setFileType('');
              setVideoName('');
              setVideoUri('');
            })
            .catch(e => {
              console.log(e);
            });
        });
    },
    [photoName, uri, documentName, documentUri, fileType],
  );

  const deleteMessageEveryOne = async id => {
    await firestore()
      .collection('chats')
      .doc(user.empid + '-' + data.empid)
      .collection('messages')
      .where('user.uid', '==', id)
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(async documentSnapshot => {
          await firestore()
            .collection('chats')
            .doc(user.empid + '-' + data.empid)
            .collection('messages')
            .doc(documentSnapshot.id)
            .delete()
            .then(async () => {
              if (documentSnapshot._data.photoName !== '') {
                try {
                  await storage()
                    .ref('/chatImages/' + documentSnapshot._data.photoName)
                    .delete()
                    .then(() => console.log('Photo Deleted'));
                } catch (e) {
                  console.log(e);
                }
              } else if (documentSnapshot._data.documentName !== '') {
                try {
                  await storage()
                    .ref(
                      '/chatDocuments/' + documentSnapshot._data.documentName,
                    )
                    .delete()
                    .then(() => console.log('Document Deleted'));
                } catch (e) {
                  console.log(e);
                }
              } else if (documentSnapshot._data.videoName !== '') {
                try {
                  await storage()
                    .ref('/chatVideos/' + documentSnapshot._data.videoName)
                    .delete()
                    .then(() => console.log('Video Deleted'));
                } catch (e) {
                  console.log(e);
                }
              } else {
                console.log('It was a Text Message');
              }

              await firestore()
                .collection('chats')
                .doc(data.empid + '-' + user.empid)
                .collection('messages')
                .where('user.uid', '==', id)
                .get()
                .then(querySnapshot => {
                  querySnapshot.forEach(async documentSnapshot => {
                    await firestore()
                      .collection('chats')
                      .doc(data.empid + '-' + user.empid)
                      .collection('messages')
                      .doc(documentSnapshot.id)
                      .delete()
                      .then(async () => {
                        await firestore()
                          .collection('tokens')
                          .where('username', '==', data.username)
                          .get()
                          .then(snapshot => {
                            const datas = snapshot.docs.map(doc => ({
                              ...doc.data(),
                              id: doc.id,
                            }));
                            datas.map(
                              async el =>
                                await sendNotifications(
                                  el.token,
                                  `${user.tname} Deleted A Message`,
                                  msg.text,
                                ),
                            );
                          })
                          .catch(e => {
                            console.log(e);
                          });
                        showToast('success', 'Message Deleted');
                        getMessage();
                      })
                      .catch(e => {
                        console.log(e);
                      });
                  });
                })
                .catch(e => {
                  console.log(e);
                });
            })
            .catch(e => {
              console.log(e);
            });
        });
      })
      .catch(e => {
        console.log(e);
      });
  };

  const deleteMessageOnlyMe = async id => {
    await firestore()
      .collection('chats')
      .doc(user.empid + '-' + data.empid)
      .collection('messages')
      .where('user.uid', '==', id)
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(async documentSnapshot => {
          await firestore()
            .collection('chats')
            .doc(user.empid + '-' + data.empid)
            .collection('messages')
            .doc(documentSnapshot.id)
            .delete()
            .then(async () => {
              showToast('success', 'Message Deleted');
            })
            .catch(e => {
              console.log(e);
            });
        });
      })
      .catch(e => {
        console.log(e);
      });
  };

  function renderLoading() {
    return <Loader />;
  }

  useEffect(() => {
    getMessage();
  }, [isFocused]);
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.navigate('Home');
        return true;
      },
    );
    return () => backHandler.remove();
  }, [isFocused]);
  useEffect(() => {}, [targetMessage, msgUsername]);
  const showToast = (type, text) => {
    Toast.show({
      type: type,
      text1: text,
      visibilityTime: 1500,
      position: 'top',
      topOffset: 500,
    });
  };
  return (
    <ImageBackground
      source={require('../assets/images/wpchat.jpeg')}
      style={{
        backgroundColor: 'rgb(39,52,67)',
        flex: 1,
        flexDirection: 'column',
        width: responsiveWidth(100),
        height: responsiveHeight(100),
      }}>
      <View
        style={{
          width: responsiveWidth(100),
          height: responsiveHeight(6),
          backgroundColor: 'navy',
          padding: 5,
          marginBottom: responsiveHeight(0.5),
          // marginTop: responsiveHeight(0.5),
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
          paddingLeft: responsiveWidth(5),
        }}>
        <TouchableOpacity
          style={{paddingRight: responsiveWidth(1)}}
          onPress={() => navigation.navigate('Home')}>
          <AntDesign
            name="arrowleft"
            size={responsiveWidth(5)}
            color={'white'}
          />
        </TouchableOpacity>
        <Image
          source={{uri: data.url}}
          style={{
            width: responsiveWidth(10),
            height: responsiveWidth(10),
            borderRadius: responsiveWidth(5),
            alignSelf: 'center',
            paddingRight: responsiveWidth(1),
          }}
        />
        <Text selectable style={styles.title}>
          {data.tname}
        </Text>
      </View>

      <GiftedChat
        messages={messageList}
        onSend={messages => onSend(messages)}
        user={{
          _id: user.empid,
          avatar: user.url,
          uid: docId,
        }}
        renderMessageVideo={props => {
          const {currentMessage} = props;
          return (
            <View
              style={{
                padding: 10,
                width: responsiveWidth(50),
                height: responsiveHeight(10),
                borderRadius: responsiveWidth(2),
              }}>
              {/* <ChatVideoPlayer
                videoUri={currentMessage.video}
                paused={paused}
              /> */}
              <TouchableOpacity
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignSelf: 'center',
                }}
                onPress={() => {
                  setShowVideo(true);
                  setChatVideoUri(currentMessage.video);
                  setPaused(false);
                  setChatVideoName(currentMessage.videoName);
                  console.log(currentMessage);
                }}>
                <Image
                  source={require('../assets/images/play-button.png')}
                  style={{
                    width: responsiveWidth(15),
                    height: responsiveWidth(15),
                  }}
                />
              </TouchableOpacity>
            </View>
          );
        }}
        renderCustomView={props => {
          const {currentMessage} = props;

          return (
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                padding: 5,
              }}>
              {currentMessage.fileType === 'application/pdf' ||
              currentMessage.fileType === 'application/msword' ||
              currentMessage.fileType ===
                'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
              currentMessage.fileType === 'application/vnd.ms-excel' ||
              currentMessage.fileType ===
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
              currentMessage.fileType ===
                'application/vnd.ms-excel.sheet.macroEnabled.12' ||
              currentMessage.fileType === 'application/vnd.ms-powerpoint' ||
              currentMessage.fileType === 'application/zip' ||
              currentMessage.fileType === 'application/vnd.rar' ||
              currentMessage.fileType ===
                'application/vnd.openxmlformats-officedocument.presentationml.presentation' ? (
                <TouchableOpacity
                  style={{
                    width: responsiveWidth(50),
                    backgroundColor: 'teal',
                    borderRadius: responsiveWidth(2),
                  }}
                  onPress={() => {
                    downloadFile(
                      currentMessage.documentUri,
                      currentMessage.documentName,
                    );
                  }}>
                  <View style={{flexDirection: 'row'}}>
                    <View
                      style={{
                        width: responsiveWidth(2),
                        height: '100%',
                        backgroundColor: 'pink',
                        borderTopLeftRadius: responsiveWidth(2),
                        borderBottomLeftRadius: responsiveWidth(2),
                      }}></View>
                    <View style={{flexDirection: 'row'}}>
                      <Text
                        selectable
                        style={[
                          styles.label,
                          {
                            color: 'white',
                            fontSize: responsiveFontSize(2),
                            marginLeft: responsiveWidth(2),
                            padding: 2,
                          },
                        ]}>
                        {currentMessage.documentName}
                      </Text>
                      <TouchableOpacity
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                          alignSelf: 'flex-end',
                          paddingLeft: responsiveWidth(2),
                        }}
                        onPress={() => {
                          downloadFile(
                            currentMessage.documentUri,
                            currentMessage.documentName,
                          );
                        }}>
                        <MaterialCommunityIcons
                          name="download"
                          color={'white'}
                          size={25}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ) : currentMessage.fileType === '' ? null : (
                <TouchableOpacity
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'flex-end',
                  }}
                  onPress={() => {
                    downloadFile(
                      currentMessage.fileType === 'video/mp4'
                        ? currentMessage.video
                        : currentMessage.image,
                      currentMessage.fileType === 'video/mp4'
                        ? currentMessage.videoName
                        : currentMessage.photoName,
                    );
                  }}>
                  <MaterialCommunityIcons
                    name="download"
                    color={'white'}
                    size={25}
                  />
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        renderBubble={props => {
          return (
            <Bubble
              {...props}
              timeTextStyle={{
                left: {color: 'white'},
              }}
              textStyle={{
                right: {
                  color: 'white',
                },
                left: {
                  color: 'white',
                },
              }}
              wrapperStyle={{
                left: {
                  backgroundColor: '#273443',
                },
                right: {
                  backgroundColor: '#075E54',
                },
              }}
              onLongPress={(context, message) => {
                setTargetMessage(message.user.uid);
                setMsgUsername(message.user._id);
                setShowModal(true);
              }}
            />
          );
        }}
        renderInputToolbar={props => {
          return (
            <InputToolbar
              {...props}
              containerStyle={{
                placeholderTextColor: THEME_COLOR,
              }}
              textInputStyle={{
                color: THEME_COLOR,
              }}
              placeholder="Enter message ..."
              height={responsiveHeight(5)}
            />
          );
        }}
        renderLoading={renderLoading}
        showUserAvatar={true}
        alwaysShowSend
        renderChatFooter={() => <View style={{height: responsiveHeight(5)}} />}
        renderSend={props => {
          return (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                height: responsiveHeight(5),
              }}>
              {uri ? (
                <View
                  style={{
                    width: responsiveWidth(7),
                    height: responsiveWidth(7),
                    borderRadius: responsiveWidth(2),
                    marginRight: responsiveWidth(2),
                    position: 'absolute',
                    bottom: responsiveHeight(20),
                    right: responsiveWidth(50),
                  }}>
                  <Image
                    source={{uri: uri}}
                    style={{
                      width: responsiveWidth(30),
                      height: responsiveWidth(30),
                      borderRadius: responsiveWidth(2),
                    }}
                  />
                  <TouchableOpacity
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: -responsiveWidth(23),
                    }}
                    onPress={() => {
                      setPhotoName('');
                      setUri('');
                      setFileType('');
                    }}>
                    <MaterialIcons name="cancel" color={'red'} size={25} />
                  </TouchableOpacity>
                </View>
              ) : null}
              {documentUri ? (
                <View
                  style={{
                    width: responsiveWidth(7),
                    height: responsiveWidth(7),
                    borderRadius: responsiveWidth(2),
                    marginRight: responsiveWidth(2),
                    position: 'absolute',
                    bottom: responsiveHeight(18),
                    right: responsiveWidth(70),
                  }}>
                  {/* <Image
                      source={{uri: documentUri}}
                      style={{
                        width: responsiveWidth(30),
                        height: responsiveWidth(30),
                        borderRadius: responsiveWidth(2),
                      }}
                    /> */}
                  <View
                    style={{
                      width: responsiveWidth(60),
                      height: responsiveWidth(30),
                      borderRadius: responsiveWidth(2),
                      backgroundColor: 'rgb(39,52,67)',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: 3,
                    }}>
                    <Text selectable style={[styles.label, {color: 'white'}]}>
                      {`Document Name: ${documentName} Attached`}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: -responsiveWidth(52),
                    }}
                    onPress={() => {
                      setDocumentName('');
                      setDocumentUri('');
                      setFileType('');
                    }}>
                    <MaterialIcons name="cancel" color={'red'} size={25} />
                  </TouchableOpacity>
                </View>
              ) : null}

              {videoUri ? (
                <View
                  style={{
                    width: responsiveWidth(100),
                    height: responsiveWidth(50),
                    borderRadius: responsiveWidth(2),
                    marginRight: responsiveWidth(2),
                    position: 'absolute',
                    bottom: responsiveHeight(10),
                    right: responsiveWidth(0),
                  }}>
                  <TouchableOpacity>
                    <VideoPlayer videoUri={videoUri} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: -responsiveWidth(0),
                    }}
                    onPress={() => {
                      setVideoName('');
                      setVideoUri('');
                      setFileType('');
                    }}>
                    <MaterialIcons name="cancel" color={'red'} size={25} />
                  </TouchableOpacity>
                </View>
              ) : null}

              <TouchableOpacity
                onPress={() => {
                  // requestCameraPermission();
                  setShowUpload(!showUpload);
                }}>
                <Image
                  source={require('../assets/images/attachment.png')}
                  style={{
                    width: responsiveWidth(7),
                    height: responsiveWidth(7),
                    tintColor: THEME_COLOR,
                    marginRight: responsiveWidth(1),
                  }}
                />
              </TouchableOpacity>

              <Send {...props} containerStyle={{justifyContent: 'center'}}>
                <MaterialIcons
                  name={'send'}
                  marginRight={responsiveWidth(1)}
                  size={30}
                  color={THEME_COLOR}
                />
              </Send>
            </View>
          );
        }}
      />

      {Platform.OS === 'android' ? (
        <KeyboardAvoidingView behavior="height" />
      ) : null}

      <Modal visible={showModal} transparent>
        <View style={styles.modalView}>
          {msgUsername === user.empid ? (
            <View style={styles.mainView}>
              <Text selectable style={{color: 'lightsteelblue'}}>
                Delete Message?
              </Text>

              <View
                style={{
                  paddingLeft: responsiveWidth(40),
                }}>
                <TouchableOpacity
                  onPress={() => {
                    setShowModal(false);
                    deleteMessageEveryOne(targetMessage);
                  }}>
                  <Text selectable style={styles.modalText}>
                    Delete For everyone
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{paddingLeft: responsiveWidth(6)}}
                  onPress={() => {
                    setShowModal(false);
                    deleteMessageOnlyMe(targetMessage);
                  }}>
                  <Text selectable style={styles.modalText}>
                    Delete For me
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{paddingLeft: responsiveWidth(14)}}
                  onPress={() => {
                    setShowModal(false);
                  }}>
                  <Text selectable style={styles.modalText}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.mainView}>
              <Text
                selectable
                style={{
                  color: 'lightsteelblue',
                  textAlign: 'center',
                }}>{`Delete message from ${data.tname}?`}</Text>

              <View
                style={{
                  paddingLeft: responsiveWidth(20),
                  flexDirection: 'row',
                }}>
                <TouchableOpacity
                  style={{paddingLeft: responsiveWidth(6)}}
                  onPress={() => {
                    setShowModal(false);
                  }}>
                  <Text selectable style={styles.modalText}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{paddingLeft: responsiveWidth(6)}}
                  onPress={() => {
                    setShowModal(false);
                    deleteMessageOnlyMe(targetMessage);
                  }}>
                  <Text selectable style={styles.modalText}>
                    Delete For me
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>
      <Modal
        onRequestClose={() => {
          setShowUpload(false);
          setDocumentName('');
          setDocumentUri('');
          setPhotoName('');
          setUri('');
          setFileType('');
        }}
        animationIn={'fadeInUpBig'}
        animationOut={'fadeOutLeftBig'}
        animationInTiming={500}
        animationOutTiming={500}
        statusBarTranslucent={true}
        visible={showUpload}
        onBackdropPress={() => {
          setShowUpload(false);
          setDocumentName('');
          setDocumentUri('');
          setPhotoName('');
          setUri('');
          setFileType('');
        }}
        transparent>
        <View style={styles.modalDocView}>
          <View style={styles.docView}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
                marginBottom: responsiveHeight(2),
                flexWrap: 'wrap',
              }}>
              <TouchableOpacity
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: responsiveWidth(4),
                }}
                onPress={async () => {
                  try {
                    const res = await DocumentPicker.pickSingle({
                      presentationStyle: 'fullScreen',
                      type: [DocumentPicker.types.allFiles],
                      copyTo: 'cachesDirectory',
                    });
                    let fileCopyUri = res.fileCopyUri;
                    const filename = fileCopyUri.substring(
                      fileCopyUri.lastIndexOf('/') + 1,
                    );
                    setFileType(res.type);
                    setDocumentName(filename);
                    setDocumentUri(fileCopyUri);
                    setShowUpload(false);
                  } catch (e) {
                    if (DocumentPicker.isCancel(e)) {
                      console.log('User Cancelled The Upload', e);
                    } else {
                      console.log(e);
                    }
                  }
                  // .then(async document => {
                  //   setDocumentName(document.name);
                  //   setDocumentUri(document.uri);
                  //   setShowUpload(false);
                  // })
                  // .catch(e => console.log(e));
                }}>
                <View
                  style={{
                    width: responsiveWidth(12),
                    height: responsiveWidth(12),
                    borderRadius: responsiveWidth(6),
                    backgroundColor: 'royalblue',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Ionicons name="document" color={'white'} size={20} />
                </View>
                <Text selectable style={styles.docText}>
                  Document
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: responsiveWidth(4),
                }}
                onPress={async () => {
                  await ImagePicker.openCamera({
                    // width: responsiveWidth(80),
                    // height: responsiveHeight(80),
                    cropping: true,
                    mediaType: 'photo',
                  })
                    .then(image => {
                      setUri(image.path);
                      setPhotoName(
                        image.path.substring(image.path.lastIndexOf('/') + 1),
                      );
                      setShowUpload(false);
                      setFileType(image.mime);
                      console.log(image);
                    })
                    .catch(async e => {
                      console.log(e);

                      await ImagePicker.clean()
                        .then(() => {
                          console.log(
                            'removed all tmp images from tmp directory',
                          );
                          setUri('');
                          setPhotoName('');
                          setFileType('');
                          setShowUpload(false);
                        })
                        .catch(e => {
                          console.log(e);
                        });
                    });
                }}>
                <View
                  style={{
                    width: responsiveWidth(12),
                    height: responsiveWidth(12),
                    borderRadius: responsiveWidth(6),
                    backgroundColor: 'deeppink',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Fontisto name="camera" color={'white'} size={20} />
                </View>
                <Text selectable style={styles.docText}>
                  Camera
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: responsiveWidth(4),
                }}
                onPress={async () => {
                  await ImagePicker.openPicker({
                    // width: responsiveWidth(80),
                    // height: responsiveHeight(80),
                    cropping: true,
                    mediaType: 'photo',
                  })
                    .then(image => {
                      setUri(image.path);
                      setPhotoName(
                        image.path.substring(image.path.lastIndexOf('/') + 1),
                      );
                      setFileType(image.mime);
                      setShowUpload(false);
                    })
                    .catch(async e => {
                      console.log(e);

                      await ImagePicker.clean()
                        .then(() => {
                          console.log(
                            'removed all tmp images from tmp directory',
                          );
                          setUri('');
                          setPhotoName('');
                          setFileType('');
                          setShowUpload(false);
                        })
                        .catch(e => {
                          console.log(e);
                        });
                    });
                }}>
                <View
                  style={{
                    width: responsiveWidth(12),
                    height: responsiveWidth(12),
                    borderRadius: responsiveWidth(6),
                    backgroundColor: 'deeppink',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Image
                    source={require('../assets/images/gallery.png')}
                    style={{
                      width: responsiveWidth(8),
                      height: responsiveWidth(8),
                      borderRadius: responsiveWidth(4),
                      tintColor: 'white',
                    }}
                  />
                </View>
                <Text selectable style={styles.docText}>
                  Gallery
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: responsiveWidth(4),
                }}
                onPress={async () => {
                  await ImagePicker.openPicker({
                    mediaType: 'video',
                  })
                    .then(image => {
                      console.log(image);
                      setVideoUri(image.path);
                      setVideoName(
                        image.path.substring(image.path.lastIndexOf('/') + 1),
                      );
                      setFileType(image.mime);
                      setShowUpload(false);
                    })
                    .catch(async e => {
                      console.log(e);

                      await ImagePicker.clean()
                        .then(() => {
                          console.log(
                            'removed all tmp images from tmp directory',
                          );
                          setVideoUri('');
                          setVideoName('');
                          setFileType('');
                          setShowUpload(false);
                        })
                        .catch(e => {
                          console.log(e);
                        });
                    });
                }}>
                <View
                  style={{
                    width: responsiveWidth(12),
                    height: responsiveWidth(12),
                    borderRadius: responsiveWidth(6),
                    backgroundColor: 'red',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <MaterialIcons
                    name="video-library"
                    color={'white'}
                    size={20}
                  />
                </View>
                <Text selectable style={styles.docText}>
                  Video
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={showVideo}
        transparent
        onRequestClose={() => {
          setShowVideo(false);
          setChatVideoUri('');
          setPaused(true);
          setChatVideoName('');
        }}
        animationIn={'fadeInUpBig'}
        animationOut={'fadeOutLeftBig'}
        animationInTiming={500}
        animationOutTiming={500}
        statusBarTranslucent={true}>
        <View style={styles.videoModalView}>
          <View style={styles.videoMainView}>
            <TouchableOpacity
              style={{
                width: responsiveWidth(100),
                height: responsiveHeight(100),
                alignSelf: 'center',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => {
                setClicked(true);
                setTimeout(() => {
                  setClicked(false);
                }, 2000);
              }}>
              <Video
                resizeMode="contain"
                useNativeControls
                paused={paused}
                source={{uri: chatVideoUri}}
                style={{
                  width: responsiveWidth(80),
                  height: responsiveHeight(80),
                  alignSelf: 'center',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: responsiveHeight(12),
                right: responsiveWidth(8),
              }}
              onPress={() => {
                setShowVideo(false);
                setChatVideoUri('');
                setPaused(true);
                setChatVideoName('');
              }}>
              <MaterialIcons name="cancel" color={'red'} size={40} />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: responsiveHeight(12),
                right: responsiveWidth(20),
              }}
              onPress={() => {
                downloadFile(chatVideoUri, chatVideoName);
              }}>
              <MaterialCommunityIcons
                name="download"
                color={'lime'}
                size={40}
              />
            </TouchableOpacity>
            {clicked && (
              <TouchableOpacity
                style={{
                  width: responsiveWidth(100),
                  height: responsiveHeight(100),
                  position: 'absolute',
                  backgroundColor: 'rgba(0,0,0,.3)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <TouchableOpacity
                  onPress={() => {
                    setPaused(!paused);
                  }}>
                  <Image
                    source={
                      paused
                        ? require('../assets/images/play-button.png')
                        : require('../assets/images/pause.png')
                    }
                    style={{
                      width: responsiveWidth(15),
                      height: responsiveWidth(15),
                      tintColor: 'white',
                    }}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
      <Toast />
    </ImageBackground>
  );
};

export default ChatRoom;

const styles = StyleSheet.create({
  header: {
    width: responsiveWidth(100),
    height: responsiveHeight(6),
    backgroundColor: THEME_COLOR,
    elevation: 5,
    shadowColor: 'black',
    borderBottomLeftRadius: responsiveWidth(3),
    borderBottomRightRadius: responsiveWidth(3),
    padding: 5,
    marginBottom: responsiveHeight(0.5),
    // marginTop: responsiveHeight(0.5),
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingLeft: responsiveWidth(5),
  },
  title: {
    textAlign: 'center',
    fontSize: responsiveFontSize(2),
    fontWeight: '500',
    color: 'white',
    paddingLeft: responsiveWidth(1),
  },
  itemView: {
    width: responsiveWidth(92),

    alignSelf: 'center',
    borderRadius: responsiveWidth(2),
    marginTop: responsiveHeight(0.5),
    marginBottom: responsiveHeight(0.5),
    padding: responsiveWidth(2),
    shadowColor: 'black',
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(1.5),
    fontWeight: '500',
    marginTop: responsiveHeight(0.2),
    color: THEME_COLOR,
    textAlign: 'center',
  },
  modalView: {
    width: responsiveWidth(100),
    height: responsiveHeight(100),
    position: 'absolute',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainView: {
    width: responsiveWidth(80),

    borderRadius: 10,

    backgroundColor: 'steelblue',
    padding: responsiveWidth(5),
  },
  modalText: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(1.5),
    fontWeight: '500',
    marginTop: responsiveHeight(2),
    color: 'lime',
    textAlign: 'center',
  },
  modalDocView: {
    width: responsiveWidth(80),
    height: responsiveHeight(20),
    bottom: responsiveHeight(1),
    position: 'absolute',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  docView: {
    width: responsiveWidth(80),

    borderRadius: 10,

    backgroundColor: 'rgb(39,52,67)',
    padding: responsiveWidth(5),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  docText: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(1.5),
    fontWeight: '500',
    marginTop: responsiveHeight(0.2),
    color: 'slategray',
    textAlign: 'center',
  },
  video: {
    width: responsiveWidth(50),
    height: responsiveHeight(15),
    borderRadius: responsiveWidth(2),
  },
  videoModalView: {
    width: responsiveWidth(100),
    height: responsiveHeight(100),
    position: 'absolute',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoMainView: {
    width: responsiveWidth(100),
    height: responsiveHeight(100),
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
});
