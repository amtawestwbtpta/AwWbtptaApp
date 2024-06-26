import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
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
import {AppURL, DA, HRA, TelegramURL} from '../modules/constants';
import {useGlobalContext} from '../context/Store';
const Dashboard = () => {
  const {state, slideState, setStateObject, teachersState} = useGlobalContext();
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
  const ifsc_ser = () => {
    fetch(`https://ifsc.razorpay.com/${teacher.ifsc}`)
      .then(res => res.json())
      .then(data => setBankData(data));
  };
  const [images, setImages] = useState([]);
  let date = new Date();

  let da, hra, gross, basicpay, netpay, ptax;
  let junelast = new Date(`${date.getFullYear()}-07-1`);
  let addl = teacher.addl;
  let ma = teacher.ma;
  let gpf = teacher.gpf;
  let gsli = teacher.gsli;
  let disability = teacher.disability;

  if (date >= junelast) {
    basicpay = teacher.basic;
  } else if (
    date.getMonth() == 0 ||
    date.getMonth() == 1 ||
    date.getMonth() == 3
  ) {
    basicpay = teacher.basic;
  } else {
    basicpay = teacher.mbasic;
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

  let deduction = gsli + gpf + ptax;

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
  }, [isFocused]);

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={[styles.container, styles.bottom]}>
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
            pagingEnabled={true}
            snapEnabled={true}
            data={slides}
            scrollAnimationDuration={1000}
            renderItem={({item, index}) => (
              <TouchableOpacity
                style={{
                  flex: 1,
                  borderWidth: 1,
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
                    backgroundColor: THEME_COLOR,
                  }}>
                  <Text
                    selectable
                    style={[
                      styles.dataText,
                      {fontSize: responsiveFontSize(1.8), color: 'white'},
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
                    borderRadius: responsiveWidth(1),
                  }}
                />
                <View
                  style={{
                    width: responsiveWidth(100),
                    height: responsiveHeight(8),

                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'center',
                    backgroundColor: THEME_COLOR,
                  }}>
                  <Text
                    selectable
                    style={[
                      styles.dataText,
                      {fontSize: responsiveFontSize(1.5), color: 'white'},
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
                      top: -responsiveHeight(88),
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
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  GPF: ₹ {IndianFormat(gpf)}
                </Text>
              </View>
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
                    title={"Teacher's Service Life"}
                    color={'darkgreen'}
                    onClick={() => {
                      navigation.navigate('TeacherServiceLife');
                    }}
                  />
                  <CustomButton
                    size={'small'}
                    fontSize={responsiveFontSize(1.5)}
                    title={'Yearwise Teachers'}
                    color={'deeppink'}
                    onClick={() => {
                      navigation.navigate('YearwiseTeachers');
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
});
