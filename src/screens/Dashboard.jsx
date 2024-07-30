import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  Modal,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {THEME_COLOR} from '../utils/Colors';
import EncryptedStorage from 'react-native-encrypted-storage';
import CustomButton from '../components/CustomButton';
import {INR, IndianFormat} from '../modules/calculatefunctions';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import RNExitApp from 'react-native-exit-app';
import Carousel from 'react-native-reanimated-carousel';
import ImageView from 'react-native-image-viewing';
import {downloadFile} from '../modules/downloadFile';
import {
  AppURL,
  DA,
  GithubWebsite,
  HRA,
  TelegramURL,
  VercelWeb,
} from '../modules/constants';
import {useGlobalContext} from '../context/Store';
const Dashboard = () => {
  const {state, slideState, setStateObject, questionRateState} =
    useGlobalContext();
  const user = state.USER;
  const navigation = useNavigation();
  const teacher = state.TEACHER;
  const isFocused = useIsFocused();
  const [showData, setShowData] = useState(false);
  const [btnText, setBtnText] = useState('Show Your Data');
  const [bankData, setBankData] = useState({});
  const [slides, setSlides] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [showProfilePhoto, setShowProfilePhoto] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [titles, setTitles] = useState([]);
  const [photoNames, setPhotoNames] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const ifsc_ser = () => {
    fetch(`https://ifsc.razorpay.com/${teacher.ifsc}`)
      .then(res => res.json())
      .then(data => setBankData(data));
  };
  const [images, setImages] = useState([]);
  let date = new Date();

  let da, hra, gross, basicpay, netpay, ptax, pfund;
  let junelast = new Date(`${date.getFullYear()}-07-1`);
  const month = date.getMonth();
  let addl = teacher.addl;
  let ma = teacher.ma;
  let gpf = teacher.gpf;
  let gpfprev = teacher.gpfprev;
  let julyGpf = teacher.julyGpf;
  let gsli = teacher.gsli;
  let disability = teacher.disability;

  if (date >= junelast) {
    basicpay = teacher.basic;
    pfund = julyGpf;
  } else if (month <= 3) {
    basicpay = teacher.basic;
    pfund = gpf;
  } else if (month < 6 && month >= 2) {
    basicpay = teacher.mbasic;
    pfund = gpf;
  } else {
    basicpay = teacher.mbasic;
    pfund = gpfprev;
  }

  da = Math.round(basicpay * DA);
  hra = Math.round(basicpay * HRA);
  gross = basicpay + da + hra + addl + ma;

  if (gross > 40000) {
    ptax = 200;
  } else if (gross > 25000) {
    ptax = 150;
  } else if (gross > 15000) {
    ptax = 130;
  } else if (gross > 10000) {
    ptax = 110;
  } else {
    ptax = 0;
  }

  if (disability === 'YES') {
    ptax = 0;
  }

  let deduction = gsli + pfund + ptax;

  netpay = gross - deduction;
  const getphotos = async () => {
    setSlides(slideState);
    let i = [];

    slideState.map(el => {
      return i.push({uri: el.url});
    });
    setImages(i);
    let p = [];

    slideState.map(el => {
      return p.push({fileName: el.fileName, url: el.url});
    });
    setPhotoNames(p);
    let t = [];
    slideState.map(el => {
      return t.push({titles: el.title, descriptions: el.description});
    });
    setTitles(t);
  };

  useEffect(() => {
    ifsc_ser();

    getphotos();
    if (teacher === '') {
      EncryptedStorage.clear();
      navigation.navigate('Login');
    }
  }, [isFocused, slideState]);

  return (
    <View style={styles.container}>
      <ScrollView>
        <View
          style={[
            styles.bottom,
            {flex: 1, shadowColor: 'black', elevation: 5},
          ]}>
          <Carousel
            loop
            mode="parallax"
            modeConfig={{
              parallaxScrollingScale: 0.9,
              parallaxScrollingOffset: 50,
            }}
            width={responsiveWidth(100)}
            height={responsiveHeight(35)}
            autoPlay={true}
            autoPlayInterval={1000}
            pagingEnabled={true}
            snapEnabled={true}
            data={slides}
            scrollAnimationDuration={1000}
            renderItem={({item, index}) => (
              <TouchableOpacity
                style={{
                  flex: 1,
                  // borderWidth: 1,
                  justifyContent: 'center',
                }}
                onPress={() => {
                  setCurrentIndex(index);
                  setIsVisible(true);
                }}>
                <View
                  style={{
                    width: responsiveWidth(100),
                    height: responsiveHeight(8),
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'center',
                    backgroundColor: 'darkorange',
                    borderTopLeftRadius: responsiveHeight(2),
                    borderTopRightRadius: responsiveHeight(2),
                  }}>
                  <Text
                    selectable
                    style={[
                      styles.dataText,
                      {
                        fontSize: responsiveFontSize(2.5),
                        color: 'white',
                        fontWeight: '700',
                        fontFamily: 'Roboto',
                      },
                    ]}>
                    {item.title}
                  </Text>
                </View>
                <Image
                  source={{uri: item.url}}
                  style={{
                    width: responsiveWidth(100),
                    height: responsiveHeight(20),
                    alignSelf: 'center',
                  }}
                />
                <View
                  style={{
                    width: responsiveWidth(100),
                    height: responsiveHeight(8),
                    borderBottomLeftRadius: responsiveWidth(4),
                    borderBottomRightRadius: responsiveWidth(4),
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'center',
                    backgroundColor: 'green',
                  }}>
                  <Text
                    selectable
                    style={[
                      styles.dataText,
                      {
                        fontSize: responsiveFontSize(1.8),
                        color: 'white',
                        fontWeight: '700',
                      },
                    ]}>
                    {item.description}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
          <ImageView
            images={images}
            imageIndex={currentIndex}
            visible={isVisible}
            presentationStyle={'overFullScreen'}
            onRequestClose={() => setIsVisible(false)}
            animationType="slide"
            onImageIndexChange={index => setCurrentIndex(index)}
            FooterComponent={() => {
              return (
                <View>
                  <Text
                    selectable
                    style={[
                      styles.dataText,
                      {fontSize: responsiveFontSize(1.8), color: 'white'},
                    ]}>
                    {titles[currentIndex].titles}
                  </Text>

                  <Text
                    selectable
                    style={[
                      styles.dataText,
                      {fontSize: responsiveFontSize(1.5), color: 'white'},
                    ]}>
                    {titles[currentIndex].descriptions}
                  </Text>
                  <TouchableOpacity
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      position: 'absolute',
                      top: -responsiveHeight(85),
                      left: responsiveWidth(65),
                    }}
                    onPress={async () => {
                      await downloadFile(
                        photoNames[currentIndex].url,
                        photoNames[currentIndex].fileName,
                      );

                      setIsVisible(false);
                    }}>
                    <MaterialIcons
                      name="download-for-offline"
                      color={'white'}
                      size={30}
                    />
                    <Text
                      selectable
                      style={[
                        styles.dataText,
                        {fontSize: responsiveFontSize(1.5), color: 'white'},
                      ]}>
                      Download
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
          <ImageView
            images={[{uri: user.url}]}
            imageIndex={0}
            visible={showProfilePhoto}
            doubleTapToZoomEnabled={true}
            presentationStyle="overFullScreen"
            animationType="slide"
            onRequestClose={() => setShowProfilePhoto(false)}
            FooterComponent={() => {
              return (
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'center',
                    flexDirection: 'row',
                    marginTop: -responsiveHeight(94),
                    marginLeft: responsiveWidth(60),
                  }}>
                  <TouchableOpacity
                    style={{
                      marginRight: responsiveWidth(5),
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    onPress={async () => {
                      await downloadFile(
                        user.url,
                        user.photoName.split(`${user.id}-`)[1],
                      );

                      setShowProfilePhoto(false);
                    }}>
                    <MaterialIcons
                      name="download-for-offline"
                      color={'white'}
                      size={40}
                    />
                    <Text
                      selectable
                      style={[
                        styles.dataText,
                        {fontSize: responsiveFontSize(1.5), color: 'white'},
                      ]}>
                      Download
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      marginRight: responsiveWidth(15),
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    onPress={() => {
                      setShowProfilePhoto(false);
                      navigation.navigate('ChangePhoto');
                    }}>
                    <MaterialCommunityIcons
                      name="camera-flip-outline"
                      size={40}
                      color={'white'}
                    />
                    <Text
                      selectable
                      style={[
                        styles.dataText,
                        {fontSize: responsiveFontSize(1.5), color: 'white'},
                      ]}>
                      Change Photo
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
          {user.url ? (
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignSelf: 'center',
              }}
              onPress={() => setShowProfilePhoto(true)}>
              <Image
                source={{
                  uri: user.url,
                }}
                style={{
                  width: responsiveWidth(20),
                  height: responsiveWidth(20),
                  borderRadius: responsiveWidth(10),
                  alignSelf: 'center',
                }}
              />

              {/* <TouchableOpacity
                style={{
                  marginLeft: responsiveWidth(-6),
                  marginTop: responsiveHeight(5),
                }}
                onPress={() => {
                  navigation.navigate('ChangePhoto');
                  
                }}>
                <MaterialCommunityIcons
                  name="camera-flip-outline"
                  size={20}
                  color={'white'}
                />
              </TouchableOpacity> */}
            </TouchableOpacity>
          ) : null}

          <Text selectable style={styles.title}>
            {`Welcome ${teacher.tname}, ${teacher.desig} of \n ${teacher.school}!`}
          </Text>

          <CustomButton
            title={btnText}
            color={btnText === 'Show Your Data' ? 'darkgreen' : 'chocolate'}
            onClick={() => {
              setShowData(!showData);

              btnText === 'Show Your Data'
                ? setBtnText('Hide Your Data')
                : setBtnText('Show Your Data');
            }}
          />

          {showData ? (
            <ScrollView style={{marginBottom: 20, marginTop: 10}}>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  Name: {teacher.tname}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  Father's Name: {teacher.fname}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  School: {teacher.school}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  UDISE: {teacher.udise}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  Designation: {teacher.desig}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  Gram Panchayet: {teacher.gp}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  Mobile: {teacher.phone}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  Email: {teacher.email}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  Date of Birth: {teacher.dob}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  Date of Joining: {teacher.doj}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  DOJ in Present School: {teacher.dojnow}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  Date of Retirement: {teacher.dor}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  Employee ID: {teacher.empid}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  Training: {teacher.training}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  PAN: {teacher.pan}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  Address: {teacher.address}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  BANK: {teacher.bank}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  Account No: {teacher.account}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  IFS Code: {teacher.ifsc}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.bankDataText}>
                  Bank Name: {bankData.BANK}
                </Text>
                <Text selectable style={styles.bankDataText}>
                  Branch: {bankData.BRANCH}
                </Text>
                <Text selectable style={styles.bankDataText}>
                  Address: {bankData.ADDRESS}
                </Text>
                <Text selectable style={styles.bankDataText}>
                  MICR: {bankData.MICR}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  BASIC: ₹ {IndianFormat(basicpay)}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  DA: ₹ {IndianFormat(da)}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  HRA: ₹ {IndianFormat(hra)}
                </Text>
              </View>
              {addl ? (
                <View style={styles.dataView}>
                  <Text selectable style={styles.dataText}>
                    Additional Pay: ₹ {IndianFormat(addl)}
                  </Text>
                </View>
              ) : null}
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  Gross Pay: ₹ {IndianFormat(gross)}
                </Text>
              </View>
              {pfund > 0 ? (
                gpf === gpfprev ? (
                  <View style={styles.dataView}>
                    <Text selectable style={styles.dataText}>
                      GPF: ₹ {IndianFormat(pfund)}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.dataView}>
                    <Text selectable style={styles.dataText}>
                      March GPF: ₹ {IndianFormat(gpfprev)}
                    </Text>
                    <Text selectable style={styles.dataText}>
                      April GPF: ₹ {IndianFormat(gpf)}
                    </Text>
                  </View>
                )
              ) : null}
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  PTAX: ₹ {IndianFormat(ptax)}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  Net Pay: ₹ {IndianFormat(netpay)}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  Net Pay in Words: {INR(netpay)}
                </Text>
              </View>
              <CustomButton
                title={btnText}
                color={btnText === 'Show Your Data' ? 'darkgreen' : 'chocolate'}
                onClick={() => {
                  setShowData(!showData);

                  btnText === 'Show Your Data'
                    ? setBtnText('Hide Data')
                    : setBtnText('Show Your Data');
                }}
              />
              <CustomButton
                title={'Edit Details'}
                size={'small'}
                fontSize={responsiveFontSize(1.5)}
                color={'blueviolet'}
                onClick={() => {
                  navigation.navigate('EditDetails');
                  setStateObject(teacher);
                }}
              />
            </ScrollView>
          ) : (
            <View>
              {user.circle === 'admin' ? (
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'center',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                  }}>
                  <CustomButton
                    size={'small'}
                    fontSize={responsiveFontSize(1.3)}
                    title={'View Registered Users'}
                    color={'crimson'}
                    onClick={() => {
                      navigation.navigate('RegUsers');
                    }}
                  />

                  {user.showAccount && (
                    <CustomButton
                      size={'small'}
                      fontSize={responsiveFontSize(1.5)}
                      title={'Accounts'}
                      color={'orangered'}
                      onClick={() => {
                        navigation.navigate('Accounts');
                      }}
                    />
                  )}

                  <CustomButton
                    size={'small'}
                    fontSize={responsiveFontSize(1.5)}
                    title={'Update Slide Photos'}
                    color={'darkolivegreen'}
                    onClick={() => {
                      navigation.navigate('UpdateSlides');
                    }}
                  />
                  <CustomButton
                    size={'small'}
                    fontSize={responsiveFontSize(1.5)}
                    title={'Tokens Section'}
                    color={'brown'}
                    onClick={() => {
                      navigation.navigate('TokensView');
                    }}
                  />
                  <CustomButton
                    size={'small'}
                    fontSize={responsiveFontSize(1.5)}
                    title={'Locations'}
                    color={'deepskyblue'}
                    onClick={() => {
                      navigation.navigate('UserLoacation');
                    }}
                  />

                  <CustomButton
                    size={'small'}
                    fontSize={responsiveFontSize(1.5)}
                    title={"Teacher's Service Life"}
                    color={'darkgreen'}
                    onClick={() => {
                      navigation.navigate('TeacherServiceLife');
                    }}
                  />

                  {user.question === 'admin' && (
                    <CustomButton
                      size={'small'}
                      fontSize={responsiveFontSize(1.5)}
                      title={'Question Section'}
                      color={'blueviolet'}
                      onClick={() => {
                        navigation.navigate('QuestionSection');
                      }}
                    />
                  )}
                </View>
              ) : null}

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignSelf: 'center',
                }}>
                <CustomButton
                  size={'small'}
                  fontSize={responsiveFontSize(1.5)}
                  title={'Yearwise Teachers'}
                  color={'deeppink'}
                  onClick={() => {
                    navigation.navigate('YearwiseTeachers');
                  }}
                />
                {questionRateState?.isAccepting && (
                  <CustomButton
                    size={'small'}
                    fontSize={responsiveFontSize(1.5)}
                    title={'Question Requisition'}
                    color={'fuchsia'}
                    onClick={() => {
                      navigation.navigate('QuestionRequisition');
                    }}
                  />
                )}
                <CustomButton
                  size={'small'}
                  fontSize={responsiveFontSize(1.5)}
                  title={'Update App'}
                  color={'rebeccapurple'}
                  onClick={async () => {
                    const supported = await Linking.canOpenURL(AppURL); //To check if URL is supported or not.
                    if (supported) {
                      await Linking.openURL(AppURL); // It will open the URL on browser.
                    } else {
                      Alert.alert(`Can't open this URL: ${AppURL}`);
                    }
                  }}
                />
                <CustomButton
                  size={'small'}
                  fontSize={responsiveFontSize(1.5)}
                  title={'Telegram'}
                  color={'dodgerblue'}
                  onClick={async () => {
                    const supported = await Linking.canOpenURL(TelegramURL); //To check if URL is supported or not.
                    if (supported) {
                      await Linking.openURL(TelegramURL); // It will open the URL on browser.
                    } else {
                      Alert.alert(`Can't open this URL: ${TelegramURL}`);
                    }
                  }}
                />
              </View>
              <CustomButton
                size={'small'}
                fontSize={responsiveFontSize(1.5)}
                title={'Website'}
                color={'navy'}
                onClick={async () => {
                  setShowModal(true);
                }}
              />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignSelf: 'center',
                }}>
                <TouchableOpacity
                  style={{
                    paddingLeft: responsiveWidth(5),
                    marginTop: responsiveHeight(2),
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    Alert.alert('Hold On!', 'Are You Sure To Exit App?', [
                      {
                        text: 'Cancel',
                        onPress: () => null,
                        style: 'cancel',
                      },
                      {
                        text: 'Exit',
                        onPress: () => RNExitApp.exitApp(),
                      },
                    ]);
                    return true;
                  }}>
                  <MaterialCommunityIcons
                    name="power"
                    size={responsiveFontSize(4)}
                    color={'red'}
                  />
                  <Text selectable style={{color: 'red', fontWeight: 'bold'}}>
                    Exit App
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    paddingLeft: responsiveWidth(5),
                    marginTop: responsiveHeight(2),
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    Alert.alert('Hold On!', 'Are You Sure To Sign Out?', [
                      {
                        text: 'Cancel',
                        onPress: () => null,
                        style: 'cancel',
                      },
                      {
                        text: 'Sign Out',
                        onPress: () => navigation.navigate('SignOut'),
                      },
                    ]);
                    return true;
                  }}>
                  <AntDesign
                    name="logout"
                    size={responsiveFontSize(4)}
                    color={'red'}
                  />
                  <Text selectable style={{color: 'red', fontWeight: 'bold'}}>
                    Sign Out
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
        <Modal
          animationType="slide"
          visible={showModal}
          transparent
          closeOnClick={true}
          onRequestClose={() => {
            setShowModal(false);
          }}>
          <TouchableOpacity
            style={styles.modalView}
            onPress={() => {
              setShowModal(false);
            }}>
            <View style={styles.mainView}>
              <Text
                selectable
                style={{
                  fontSize: responsiveFontSize(3),
                  fontWeight: '500',
                  textAlign: 'center',
                  color: THEME_COLOR,
                }}>
                Choose Website
              </Text>
              <Text selectable style={styles.label}>
                We have two identical website. You can chose anyone of them.
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignSelf: 'center',
                }}>
                <CustomButton
                  title={'GitHub'}
                  color={'chocolate'}
                  size="small"
                  onClick={async () => {
                    setShowModal(false);
                    const supported = await Linking.canOpenURL(GithubWebsite); //To check if URL is supported or not.
                    if (supported) {
                      await Linking.openURL(GithubWebsite); // It will open the URL on browser.
                    } else {
                      Alert.alert(`Can't open this URL: ${GithubWebsite}`);
                    }
                  }}
                />
                <CustomButton
                  title={'Vercel'}
                  color={'darkgreen'}
                  size="small"
                  onClick={async () => {
                    setShowModal(false);
                    const supported = await Linking.canOpenURL(VercelWeb); //To check if URL is supported or not.
                    if (supported) {
                      await Linking.openURL(VercelWeb); // It will open the URL on browser.
                    } else {
                      Alert.alert(`Can't open this URL: ${VercelWeb}`);
                    }
                  }}
                />
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </ScrollView>
    </View>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(2),
    fontWeight: '500',
    marginTop: responsiveHeight(3),
    color: THEME_COLOR,
    textAlign: 'center',
    padding: 5,
  },
  bottom: {
    marginBottom: responsiveHeight(8),
  },
  dataView: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: '#ddd',
    marginTop: responsiveHeight(1),
    borderRadius: 10,
    padding: 10,
    width: responsiveWidth(90),
  },
  dataText: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(2),
    color: THEME_COLOR,
    textAlign: 'center',
    padding: 5,
  },
  bankDataText: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(1.5),
    color: THEME_COLOR,
    textAlign: 'center',
    padding: 1,
  },
  modalView: {
    flex: 1,

    width: responsiveWidth(90),
    height: responsiveWidth(30),
    padding: responsiveHeight(2),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  mainView: {
    width: responsiveWidth(90),
    height: responsiveHeight(30),
    padding: responsiveHeight(2),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: 'white',
    borderRadius: 10,

    backgroundColor: 'white',
    alignSelf: 'center',
  },
  label: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(2),
    fontWeight: '500',
    margin: responsiveHeight(1),
    color: THEME_COLOR,
    textAlign: 'center',
  },
});
