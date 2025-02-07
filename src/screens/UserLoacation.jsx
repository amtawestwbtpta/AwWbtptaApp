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
  Modal,
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

import {getSubmitDateInput, titleCase} from '../modules/calculatefunctions';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Toast from 'react-native-toast-message';
import AnimatedSeacrch from '../components/AnimatedSeacrch';
import {useGlobalContext} from '../context/Store';

const UserLoacation = () => {
  const {
    state,
    userState,
    setUserState,
    teachersState,
    setTeachersState,
    setTeacherUpdateTime,
  } = useGlobalContext();
  const user = state.USER;
  const isFocused = useIsFocused();

  const navigation = useNavigation();
  const [members, setMembers] = useState([]);
  const [name, setName] = useState('');
  const [filteredName, setFilteredName] = useState([]);
  const [showLoader, setShowLoader] = useState(false);
  const [firstData, setFirstData] = useState(0);
  const [visibleItems, setShowLoaderItems] = useState(10);
  const [showResult, setShowResult] = useState(false);
  const [address, setAddress] = useState({
    city: 'San Jose',
    continent: 'North America',
    continentCode: 'NA',
    countryCode: 'US',
    countryName: 'United States of America (the)',
    fips: {
      county: '085',
      countySubdivision: '92830',
      place: '49670',
      state: '06',
    },
    latitude: 37.4220936,
    locality: 'Mountain View',
    localityLanguageRequested: 'en',
    longitude: -122.083922,
    plusCode: '849VCWC8+RC',
    postcode: '94043',
    principalSubdivision: 'California',
    principalSubdivisionCode: 'US-CA',
  });
  const loadPrev = () => {
    setShowLoaderItems(prevVisibleItems => prevVisibleItems - 10);
    setFirstData(firstData - 10);
  };
  const loadMore = () => {
    setShowLoaderItems(prevVisibleItems => prevVisibleItems + 10);
    setFirstData(firstData + 10);
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
  const getUsersLocation = async () => {
    setShowLoader(true);
    await firestore()
      .collection('userLocations')
      .get()
      .then(snapshot => {
        const datas = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        }));
        let newData = datas.sort((a, b) => a.date - b.date);
        setShowLoader(false);
        setMembers(newData);
        setFilteredName(newData);
      })
      .catch(e => {
        setShowLoader(false);
        showToast('error', e);
      });
  };

  const openMap = (lat, lng) => {
    const scheme = Platform.select({
      ios: 'maps://0,0?q=',
      android: 'geo:0,0?q=',
    });
    const latLng = `${lat},${lng}`;
    const label = 'Custom Label';
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    Linking.openURL(url);
  };

  const showConfirmDialog = el => {
    return Alert.alert(
      'Hold On!',
      `Are You Sure To Delete Location of User ${el.tname}?`,
      [
        // The "No" button
        // Does nothing but dismiss the dialog when tapped
        {
          text: 'No',
          onPress: () => showToast('success', 'Location Not Deleted!'),
        },
        // The "Yes" button
        {
          text: 'Yes',
          onPress: () => {
            delLocation(el);
          },
        },
      ],
    );
  };

  const delLocation = async loc => {
    await firestore()
      .collection('userLocations')
      .doc(loc.id)
      .delete()
      .then(() => {
        showToast('success', 'Location deleted successfully');
        getUsersLocation();
      })
      .catch(err => {
        showToast('error', 'Failed to delete location');
        console.log(err);
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
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.navigate('Home');
        return true;
      },
    );
    return () => backHandler.remove();
  }, [isFocused]);

  useEffect(() => {
    getUsersLocation();
  }, []);
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
          User's Loacation
        </Text>

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
                  <View style={styles.itemView}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                      }}>
                      <View
                        style={{
                          paddingRight: responsiveWidth(2),

                          justifyContent: 'center',
                          alignItems: 'center',
                          alignSelf: 'center',
                        }}>
                        <Image
                          source={{uri: el.photo}}
                          style={{
                            width: responsiveWidth(20),
                            height: responsiveWidth(20),
                            borderRadius: responsiveWidth(10),
                            alignSelf: 'center',
                            marginBottom: responsiveHeight(1),
                          }}
                        />
                      </View>
                      <View>
                        <Text selectable style={styles.label}>
                          Sl No.: {ind + 1}
                        </Text>
                        <Text selectable style={styles.label}>
                          Name: {el.tname}
                        </Text>
                        <Text selectable style={styles.label}>
                          Username: {el.username}
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
                          Brand: {el.brand}
                        </Text>
                        <Text selectable style={styles.label}>
                          Model: {el.model}
                        </Text>
                        <Text selectable style={styles.label}>
                          Latitude: {el.latitude}
                        </Text>
                        <Text selectable style={styles.label}>
                          Longitude: {el.longitude}
                        </Text>

                        <Text selectable style={styles.label}>
                          Located On:{' '}
                          {getSubmitDateInput(
                            new Date(el.date).toLocaleDateString(),
                          )}{' '}
                          at {new Date(el.date).toLocaleString().split(',')[1]}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        alignSelf: 'center',
                      }}>
                      <TouchableOpacity
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                          alignSelf: 'center',
                          marginHorizontal: responsiveWidth(5),
                        }}
                        onPress={async () => {
                          const data = await axios.get(
                            `https://api-bdc.net/data/reverse-geocode?latitude=${el.latitude}&longitude=${el.longitude}&localityLanguage=en&key=bdc_9c58c8a33fd24d60bf83214d4fc4dadc`,
                          );
                          const result = data.data;
                          setAddress(result);
                          setName(el.tname);
                          setShowResult(true);
                        }}>
                        <Text selectable style={styles.label}>
                          Show Location
                        </Text>
                        <Ionicons name="location" size={30} color="darkgreen" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                          alignSelf: 'center',
                          marginHorizontal: responsiveWidth(5),
                        }}
                        onPress={() => openMap(el.latitude, el.longitude)}>
                        <Text selectable style={styles.label}>
                          Open Map
                        </Text>
                        <MaterialCommunityIcons
                          name="home-map-marker"
                          size={30}
                          color="darkgreen"
                        />
                      </TouchableOpacity>
                      <CustomButton
                        title={'Delete'}
                        size={'xsmall'}
                        color={'red'}
                        onClick={() => showConfirmDialog(el)}
                      />
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
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          alignSelf: 'center',
        }}>
        <Modal
          transparent
          closeOnClick={true}
          visible={showResult}
          onRequestClose={() => setShowResult(false)}>
          <View style={styles.modalView}>
            <View style={styles.mainView}>
              <Text style={styles.label}>
                {titleCase(name)}'s Current Location
              </Text>
              <Text style={styles.label}>
                <MaterialCommunityIcons
                  name="arrow-down-bold"
                  size={30}
                  color="darkgreen"
                />
              </Text>
              <Text style={styles.label}>Locality: {address.locality}</Text>
              <Text style={styles.label}>City: {address.city}</Text>
              <Text style={styles.label}>
                State: {address.principalSubdivision}
              </Text>
              <Text style={styles.label}>Country: {address.countryName}</Text>

              <CustomButton
                size={'xsmall'}
                title={'Close'}
                color={'red'}
                onClick={() => setShowResult(false)}
              />
            </View>
          </View>
        </Modal>
      </View>
      <Loader visible={showLoader} />
      <Toast />
    </View>
  );
};

export default UserLoacation;

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
    borderRadius: responsiveWidth(4),
    marginTop: responsiveHeight(0.5),
    marginBottom: responsiveHeight(0.5),
    padding: responsiveWidth(4),
    shadowColor: 'black',
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'honeydew',
  },
  label: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(1.5),
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
  mainView: {
    marginTop: responsiveHeight(2),
    marginBottom: responsiveHeight(2),
    width: responsiveWidth(90),
    // height: responsiveHeight(100),
    borderRadius: responsiveWidth(5),
    padding: responsiveWidth(5),

    backgroundColor: 'white',
    alignSelf: 'center',
  },
});
