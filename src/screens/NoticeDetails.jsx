import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  BackHandler,
  FlatList,
  Linking,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import uuid from 'react-native-uuid';
import {THEME_COLOR} from '../utils/Colors';
import CustomTextInput from '../components/CustomTextInput';
import CustomButton from '../components/CustomButton';
import Toast from 'react-native-toast-message';
import Loader from '../components/Loader';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  getDay,
  getFullYear,
  getMonthName,
  titleCase,
} from '../modules/calculatefunctions';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import {notifyAll} from '../modules/notification';
import AnimatedSeacrch from '../components/AnimatedSeacrch';
import Pdf from 'react-native-pdf';
import {downloadFile} from '../modules/downloadFile';
import ImageView from 'react-native-image-viewing';
import AutoHeightImage from 'react-native-auto-height-image';
import {useGlobalContext} from '../context/Store';
const NoticeDetails = () => {
  const isFocused = useIsFocused();
  const {state, stateObject} = useGlobalContext();
  const user = state.USER;
  const teacher = state.TEACHER;
  const pdfRef = useRef();
  let data = stateObject;
  const navigation = useNavigation();
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [editReply, setEditReply] = useState('');
  const [reply, setReply] = useState('');
  const [showEditReply, setShowEditReply] = useState(false);
  const [editReplyObj, setEditReplyObj] = useState({});
  const [NoticeReplies, setNoticeReplies] = useState([]);
  const [showLoader, setShowLoader] = useState(false);
  const [showPageNo, setShowPageNo] = useState(false);
  const [search, setSearch] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const noticeId = user.id + '-' + uuid.v4().split('-')[0];
  const [showReplies, setShowReplies] = useState(false);
  const [firstData, setFirstData] = useState(0);
  const [visibleItems, setVisibleItems] = useState(10);
  const [visible, setIsVisible] = useState(false);
  const [width, setWidth] = useState(1);
  const [height, setHeight] = useState(1);
  const [pageNo, setPageNo] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [isLink, setIsLink] = useState(false);
  const [textArr, setTextArr] = useState([]);
  const loadPrev = () => {
    setVisibleItems(prevVisibleItems => prevVisibleItems - 10);
    setFirstData(firstData - 10);
  };
  const loadMore = () => {
    setVisibleItems(prevVisibleItems => prevVisibleItems + 10);
    setFirstData(firstData + 10);
  };

  const submitReply = async () => {
    setShowReplyBox(false);
    if (reply !== '') {
      await firestore()
        .collection('noticeReply')
        .doc(noticeId)
        .set({
          id: noticeId,
          token: state.TOKEN,
          username: user.username,
          tname: user.tname,
          school: user.school,
          gp: teacher.gp,
          association: teacher.association,
          email: user.email,
          phone: user.phone,
          reply: reply,
          date: Date.now(),
          noticeId: data.id,
        })
        .then(async () => {
          let title = `${user.tname} Has Replied To a Notice`;
          let body = `His / Her Reply is=> ${reply}`;
          await notifyAll(title, body).then(async () => {
            setShowLoader(false);
            showToast('success', 'Reply Added Successfully');
            getNoticeReplies();
            setReply('');
            setShowReplies(true);
          });
        })
        .catch(e => {
          setShowLoader(false);
          showToast('error', 'Reply Addition Failed');
          console.log(e);
        });
    } else {
      setShowLoader(false);
      showToast('error', 'Form Is Invalid');
    }
  };
  const getNoticeReplies = async () => {
    setShowLoader(true);
    const subscriber = firestore().collection('noticeReply');
    subscriber.onSnapshot(querySnapShot => {
      const allMessages = querySnapShot.docs.map(item => {
        return {...item._data};
      });
      let newData = allMessages.sort((a, b) => b.date - a.date);
      setNoticeReplies(newData);
      setFilteredData(newData);
      setShowLoader(false);
      setShowReplies(true);
    });
    return () => subscriber;
  };

  const showConfirmDialog = id => {
    return Alert.alert('Hold On!', `Are You Sure To Delete This Reply?`, [
      // The "No" button
      // Does nothing but dismiss the dialog when tapped
      {
        text: 'No',
        onPress: () => showToast('success', 'Reply Not Deleted!'),
      },
      // The "Yes" button
      {
        text: 'Yes',
        onPress: () => {
          delReply(id);
        },
      },
    ]);
  };
  const submitEditReply = async () => {
    setShowLoader(true);
    setShowEditReply(false);
    if (editReply !== '') {
      await firestore()
        .collection('noticeReply')
        .doc(editReplyObj.id)
        .update({
          reply: editReply,
          updatedAt: Date.now(),
        })
        .then(async () => {
          let title = `${user.tname} Has Updated His Reply`;
          let body = `His / Her Reply is=> ${editReply}`;
          await notifyAll(title, body).then(async () => {
            setShowLoader(false);
            showToast('success', 'Reply Added Successfully');

            setEditReply('');
            setShowReplies(true);
          });
        })
        .catch(e => {
          setShowLoader(false);
          showToast('error', 'Reply Addition Failed');
          console.log(e);
        });
    } else {
      setShowLoader(false);
      showToast('error', 'Form Is Invalid');
    }
  };
  const delReply = async id => {
    setShowLoader(true);
    await firestore()
      .collection('noticeReply')
      .doc(id)
      .delete()
      .then(() => {
        setShowLoader(false);
        showToast('success', 'Reply Deleted Successfully');

        setReply('');
        setShowReplies(true);
      })
      .catch(e => {
        setShowLoader(false);
        showToast('error', 'Reply Deltation Failed');
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
  useEffect(() => {
    getNoticeReplies();
  }, []);
  useEffect(() => {}, [editReplyObj, editReply, width, height]);
  useEffect(() => {
    const result = NoticeReplies.filter(el => {
      return el.reply.toLowerCase().match(search.toLowerCase());
    });
    setFilteredData(result);
  }, [search]);
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.navigate('Home');
        return true;
      },
    );
    return () => backHandler.remove();
  }, []);
  useEffect(() => {}, [isFocused]);
  useEffect(() => {
    const txt = data.noticeText;
    if (txt?.includes('https')) {
      setIsLink(true);
      const firstIndex = txt?.indexOf('https'); //find link start
      const linkEnd = txt?.indexOf(' ', firstIndex); //find the end of link
      const firstTextSection = txt?.slice(0, firstIndex);
      const linkSection = txt?.slice(firstIndex, linkEnd);
      const secondSection = txt?.slice(linkEnd);
      setTextArr([firstTextSection, linkSection, secondSection]);
    } else {
      setIsLink(false);
    }
  }, []);
  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
      <ScrollView nestedScrollEnabled={true}>
        <TouchableOpacity
          style={{alignSelf: 'center'}}
          onPress={() => navigation.navigate('Home')}>
          <MaterialCommunityIcons
            name="home-circle"
            color={THEME_COLOR}
            size={30}
          />
        </TouchableOpacity>
        <View style={styles.itemView}>
          <Text selectable style={styles.title}>
            {data.title}
          </Text>
        </View>
        <View
          style={[
            styles.dateView,
            {
              flexDirection: 'row',
              marginTop: responsiveHeight(1),
            },
          ]}>
          <Text selectable style={styles.dropDownText}>
            Posted On: {getDay(data.date)}
          </Text>
          <Text selectable style={styles.dropDownText}>
            {' '}
            {getMonthName(data.date)}
          </Text>
          <Text selectable style={styles.dropDownText}>
            {' '}
            {getFullYear(data.date)}
          </Text>
        </View>

        <View style={styles.itemImageView}>
          {data.url ? (
            <ScrollView
              style={{marginTop: responsiveHeight(2)}}
              contentContainerStyle={{
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
              }}>
              {(data.type === 'image/jpeg' || data.type === 'image/png') && (
                <TouchableOpacity onPress={() => setIsVisible(true)}>
                  <AutoHeightImage
                    width={responsiveWidth(90)}
                    source={{uri: data.url}}
                    style={{
                      borderRadius: responsiveWidth(2),
                    }}
                  />
                </TouchableOpacity>
              )}
              {data.type === 'application/pdf' && (
                <View>
                  <Pdf
                    ref={pdfRef}
                    trustAllCerts={false}
                    source={{
                      uri: data.url,
                      cache: false,
                    }}
                    showsHorizontalScrollIndicator={true}
                    showsVerticalScrollIndicator={true}
                    enablePaging={true}
                    onLoadProgress={percent => {
                      console.log(percent);
                      setShowLoader(true);
                    }}
                    onLoadComplete={(numberOfPages, filePath) => {
                      console.log(`Number of pages: ${numberOfPages}`);
                      setShowLoader(false);

                      setShowPageNo(false);
                    }}
                    onPageChanged={(page, numberOfPages) => {
                      console.log(`Current page: ${page}`);
                      setPageNo(page);
                      setTotalPage(numberOfPages);
                    }}
                    onError={error => {
                      console.log(error);
                    }}
                    onPressLink={async uri => {
                      console.log(`Link pressed: ${uri}`);

                      const supported = await Linking.canOpenURL(uri); //To check if URL is supported or not.
                      if (supported) {
                        await Linking.openURL(uri); // It will open the URL on browser.
                        console.log(uri);
                      } else {
                        Alert.alert(`Don't know how to open this URL: ${uri}`);
                      }
                    }}
                    style={{
                      flex: 1,
                      width: responsiveWidth(80),
                      height: responsiveHeight(60),
                      alignSelf: 'center',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  />
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      margin: responsiveHeight(1),
                    }}>
                    <View>
                      {pageNo > 1 && (
                        <CustomButton
                          color={'orange'}
                          title={'Previous'}
                          onClick={() => {
                            pdfRef.current.setPage(pageNo - 1);
                          }}
                          size={'small'}
                          fontSize={14}
                        />
                      )}
                    </View>
                    {pageNo < totalPage && (
                      <View>
                        <CustomButton
                          title={'Next'}
                          onClick={() => {
                            pdfRef.current.setPage(pageNo + 1);
                          }}
                          size={'small'}
                          fontSize={14}
                        />
                      </View>
                    )}
                  </View>
                  {showPageNo && (
                    <Text style={styles.text}>
                      Page {pageNo} of {totalPage}
                    </Text>
                  )}
                </View>
              )}

              {data.url !== '' && (
                <TouchableOpacity
                  style={{
                    margin: responsiveHeight(2),
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'center',
                  }}
                  onPress={async () =>
                    await downloadFile(data.url, data.photoName)
                  }>
                  <MaterialIcons
                    name="download-for-offline"
                    color={'green'}
                    size={30}
                  />
                  <Text selectable style={styles.text}>
                    Download
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          ) : (
            <Image
              source={require('../assets/images/notice.png')}
              style={{
                width: responsiveWidth(30),
                height: responsiveWidth(30),
                borderRadius: responsiveWidth(2),
              }}
            />
          )}
        </View>

        {!isLink ? (
          <View style={styles.itemView}>
            <Text selectable style={styles.label}>
              {data.noticeText}
            </Text>
          </View>
        ) : (
          <View style={styles.itemView}>
            <View>
              <Text selectable style={styles.label}>
                {textArr[0]}
              </Text>
            </View>
            <TouchableOpacity
              onPress={async () => {
                const supported = await Linking.canOpenURL(textArr[1]); //To check if URL is supported or not.
                if (supported) {
                  await Linking.openURL(textArr[1]); // It will open the URL on browser.
                } else {
                  showToast('error', 'Failed to open link');
                }
              }}>
              <Text selectable style={styles.label}>
                Click Here: {textArr[1]}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView>
          {showReplyBox ? (
            <View>
              <CustomTextInput
                placeholder={'Write a Reply'}
                value={reply}
                size={'large'}
                onChangeText={text => setReply(text)}
              />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                  alignSelf: 'center',
                }}>
                <CustomButton
                  title={'Submit Reply'}
                  fontSize={13}
                  size={'small'}
                  onClick={submitReply}
                />
                <CustomButton
                  title={'Cancel'}
                  size={'small'}
                  color={'darkred'}
                  onClick={() => {
                    setShowReplyBox(false);
                    setReply('');
                    setShowReplies(true);
                  }}
                />
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                alignSelf: 'center',
                justifyContent: 'center',
                marginBottom: responsiveHeight(1),
                marginTop: responsiveHeight(1),
              }}
              onPress={() => {
                setShowReplyBox(true);
                setReply('');
                setShowReplies(false);
              }}>
              <Feather name={'plus-circle'} size={20} color={'darkgreen'} />
              <Text selectable style={[styles.text, {color: 'darkgreen'}]}>
                {'Add New Reply'}
              </Text>
            </TouchableOpacity>
          )}
          {showEditReply ? (
            <View>
              <CustomTextInput
                placeholder={'Write a Reply'}
                value={editReply}
                size={'large'}
                onChangeText={text => setEditReply(text)}
              />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                  alignSelf: 'center',
                }}>
                <CustomButton
                  title={'Submit Reply'}
                  fontSize={13}
                  size={'small'}
                  onClick={submitEditReply}
                />
                <CustomButton
                  title={'Cancel'}
                  size={'small'}
                  color={'darkred'}
                  onClick={() => {
                    setShowEditReply(false);
                    setEditReply('');
                    setShowReplies(true);
                  }}
                />
              </View>
            </View>
          ) : null}
          <View>
            {showReplies ? (
              <View>
                <Text selectable style={styles.title}>
                  Notice Replies
                </Text>
                <AnimatedSeacrch
                  value={search}
                  placeholder={'Search Reply Content'}
                  onChangeText={text => setSearch(text)}
                  func={() => {
                    setSearch('');
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
                <ScrollView
                  style={{alignSelf: 'center'}}
                  contentContainerStyle={{
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
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
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}>
                            <Text
                              selectable
                              style={styles.text}
                              onPress={() => console.log(item)}>
                              Reply: {titleCase(item.reply)}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.dateView2,
                              {
                                flexDirection: 'row',
                              },
                            ]}>
                            <Text selectable style={styles.dropDownText}>
                              Date: {getDay(item.date)}
                            </Text>
                            <Text selectable style={styles.dropDownText}>
                              {' '}
                              {getMonthName(item.date)}
                            </Text>
                            <Text selectable style={styles.dropDownText}>
                              {' '}
                              {getFullYear(item.date)}
                            </Text>
                            <Text selectable style={styles.dropDownText}>
                              {' , By: '}
                              {item.tname}
                            </Text>
                          </View>
                          {item.updatedAt ? (
                            <View
                              style={[
                                styles.dateView2,
                                {
                                  flexDirection: 'row',
                                },
                              ]}>
                              <Text selectable style={styles.dropDownText}>
                                Updated At: {getDay(item.updatedAt)}
                              </Text>
                              <Text selectable style={styles.dropDownText}>
                                {' '}
                                {getMonthName(item.updatedAt)}
                              </Text>
                              <Text selectable style={styles.dropDownText}>
                                {' '}
                                {getFullYear(item.updatedAt)}
                              </Text>
                            </View>
                          ) : null}
                          {item.username === user.username ||
                          user.circle === 'admin' ? (
                            <View
                              style={{
                                paddingLeft: responsiveWidth(4),
                                justifyContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                                flexDirection: 'row',
                              }}>
                              <TouchableOpacity
                                onPress={() => {
                                  showConfirmDialog(item.id);
                                }}>
                                <Ionicons
                                  name="trash-bin"
                                  size={25}
                                  color="red"
                                />
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={{paddingLeft: responsiveWidth(10)}}
                                onPress={() => {
                                  setEditReply(item.reply);
                                  setEditReplyObj(item);
                                  setShowEditReply(true);
                                  setShowReplies(false);
                                }}>
                                <Feather
                                  name="edit"
                                  size={25}
                                  color="darkblue"
                                />
                              </TouchableOpacity>
                            </View>
                          ) : null}
                        </ScrollView>
                      )}
                    />
                  ) : (
                    <Text selectable style={styles.text}>
                      No Replies
                    </Text>
                  )}
                </ScrollView>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: responsiveHeight(0.5),
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
            ) : null}
          </View>
        </ScrollView>
      </ScrollView>
      {data.url !== '' && data.type.split('/')[0] === 'image' && (
        <ImageView
          images={[{uri: data.url}]}
          imageIndex={0}
          visible={visible}
          // presentationStyle={'overFullScreen'}
          onRequestClose={() => setIsVisible(false)}
          FooterComponent={() => {
            return (
              <TouchableOpacity
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignSelf: 'center',
                  marginTop: -responsiveHeight(95.5),
                  marginLeft: responsiveWidth(60),
                }}
                onPress={async () =>
                  await downloadFile(data.url, data.photoName)
                }>
                <MaterialIcons
                  name="download-for-offline"
                  color={'green'}
                  size={40}
                />
                <Text selectable style={[styles.text, {color: 'white'}]}>
                  Download
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      )}

      <Loader visible={showLoader} />
      <Toast />
    </View>
  );
};

export default NoticeDetails;

const styles = StyleSheet.create({
  title: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(3),
    fontWeight: '500',
    fontFamily: 'kalpurush',
    color: THEME_COLOR,
    textAlign: 'center',
  },
  label: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(3),
    fontWeight: '400',
    marginTop: responsiveHeight(0.3),
    color: THEME_COLOR,
    textAlign: 'center',
    fontFamily: 'kalpurush',
  },
  itemView: {
    width: responsiveWidth(92),
    backgroundColor: 'white',

    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: responsiveWidth(2),
    marginTop: responsiveHeight(1),
    marginBottom: responsiveHeight(1),
    padding: 5,
    shadowColor: 'black',
    elevation: 5,
  },
  itemImageView: {
    width: responsiveWidth(95),

    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: responsiveWidth(2),
    marginTop: responsiveHeight(1),
    marginBottom: responsiveHeight(1),
    padding: 5,
    shadowColor: 'black',
  },
  dateView: {
    width: responsiveWidth(92),
    backgroundColor: 'white',

    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: responsiveWidth(2),
    marginTop: responsiveHeight(0.3),
    marginBottom: responsiveHeight(0.3),
    paddingTop: responsiveHeight(1),
    paddingBottom: responsiveHeight(1),
    shadowColor: 'black',
    elevation: 5,
  },
  dateView2: {
    width: responsiveWidth(92),
    backgroundColor: 'white',

    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: responsiveWidth(2),
    marginTop: responsiveHeight(0.3),
    marginBottom: responsiveHeight(0.3),

    shadowColor: 'black',
  },
  dropDownText: {
    fontSize: responsiveFontSize(1.5),
    color: THEME_COLOR,
    alignSelf: 'center',
    textAlign: 'center',
  },
  text: {
    textAlign: 'center',
    fontSize: responsiveFontSize(1.5),
    fontWeight: '500',
    paddingLeft: responsiveWidth(5),
    paddingRight: responsiveWidth(5),
    color: THEME_COLOR,
    alignSelf: 'center',
  },
  modalView: {
    width: responsiveWidth(100),
    height: responsiveHeight(100),
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255,.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainView: {
    width: responsiveWidth(80),
    height: responsiveWidth(80),
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});
