import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  Image,
  Platform,
  Linking,
} from 'react-native';
import React, {useEffect, useState, useRef} from 'react';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {THEME_COLOR} from '../utils/Colors';
import CustomButton from '../components/CustomButton';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import firestore from '@react-native-firebase/firestore';
import Loader from '../components/Loader';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {useGlobalContext} from '../context/Store';
import {
  getServiceAge,
  getServiceLife,
  monthNamesWithIndex,
  uniqArray,
} from '../modules/calculatefunctions';
import Toast from 'react-native-toast-message';
const YearwiseTeachers = () => {
  const {
    teachersState,
    setTeachersState,
    teacherUpdateTime,
    setTeacherUpdateTime,
    schoolState,
    setSchoolState,
    schoolUpdateTime,
    setSchoolUpdateTime,
  } = useGlobalContext();
  const ref = useRef();
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [moreFilteredData, setMoreFilteredData] = useState([]);
  const [visible, setVisible] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');
  const [joiningMonths, setJoiningMonths] = useState([]);
  const [serviceArray, setServiceArray] = useState([]);

  const handleChange = el => {
    setSelectedYear(el);
    let x = [];
    let y = [];
    data.map(teacher => {
      const joiningYear = teacher.doj.split('-')[2];
      const joiningMonth = teacher.doj.split('-')[1];
      if (joiningYear === el) {
        x.push(teacher);
      }
      if (joiningYear === el) {
        monthNamesWithIndex.map(month => {
          if (joiningMonth === month.index) {
            y.push(month);
          }
        });
      }
    });
    setSelectedYear(el);
    setFilteredData(x);
    setMoreFilteredData(x);
    setJoiningMonths(uniqArray(y).sort((a, b) => a.rank - b.rank));
  };
  const handleMonthChange = month => {
    let x = [];
    data.map(teacher => {
      const joiningYear = teacher.doj.split('-')[2];
      const joiningMonth = teacher.doj.split('-')[1];
      if (joiningYear === selectedYear && joiningMonth === month.index) {
        return x.push(teacher);
      }
    });
    setFilteredData(x);
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
  useEffect(() => {}, [filteredData, data, serviceArray, moreFilteredData]);
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
        const newData = data.sort((a, b) => {
          // First, compare the "school" keys
          if (a.school < b.school) {
            return -1;
          }
          if (a.school > b.school) {
            return 1;
          }
          // If "school" keys are equal, compare the "rank" keys
          return a.rank - b.rank;
        });
        setTeachersState(newData);
        setTeacherUpdateTime(Date.now());
        const wbtptaTeachers = newData.filter(
          el => el.association === 'WBTPTA',
        );
        setData(wbtptaTeachers);

        let x = [];
        wbtptaTeachers.map(teacher => {
          const joiningYear = teacher.doj.split('-')[2];
          x.push(joiningYear);
          x = uniqArray(x);
          x = x.sort((a, b) => a - b);
        });

        setServiceArray(x);
        setVisible(false);
      })
      .catch(e => {
        console.log('error', e);
        setVisible(false);
      });
  };
  const getSchoolStateData = async () => {
    await firestore()
      .collection('schools')
      .get()
      .then(snapshot => {
        const data = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        }));
        setSchoolState(data);
      })
      .catch(e => {
        console.log('error', e);
        setVisible(false);
      });
  };

  const getData = async () => {
    setVisible(true);
    const newData = teachersState;
    const wbtptaTeachers = newData.filter(el => el.association === 'WBTPTA');
    setData(wbtptaTeachers);

    let x = [];
    wbtptaTeachers.map(teacher => {
      const joiningYear = teacher.doj.split('-')[2];
      x.push(joiningYear);
      x = uniqArray(x);
      x = x.sort((a, b) => a - b);
    });
    setServiceArray(x);
    setVisible(false);
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
  }, [isFocused]);

  return (
    <View style={styles.container}>
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
      {filteredData.length > 5 && (
        <View>
          <TouchableOpacity
            style={{
              borderWidth: 1,
              borderColor: 'rgba(0,0,0,0.2)',
              alignItems: 'center',
              justifyContent: 'center',
              width: 50,
              position: 'absolute',
              top: responsiveHeight(76),
              right: 10,
              height: 50,
              backgroundColor: '#fff',
              opacity: 0.3,
              borderRadius: 100,
              zIndex: 1000,
            }}
            onPress={() =>
              ref.current?.scrollTo({
                y: 0,
                animated: true,
              })
            }>
            <AntDesign name="up" size={30} color={THEME_COLOR} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              borderWidth: 1,
              borderColor: 'rgba(0,0,0,0.2)',
              alignItems: 'center',
              justifyContent: 'center',
              width: 50,
              position: 'absolute',
              top: responsiveHeight(83),
              right: 10,
              height: 50,
              backgroundColor: '#fff',
              opacity: 0.3,
              borderRadius: 100,
              zIndex: 1000,
            }}
            onPress={() => ref.current?.scrollToEnd({animated: true})}>
            <AntDesign name="down" size={30} color={THEME_COLOR} />
          </TouchableOpacity>
        </View>
      )}
      <ScrollView
        nestedScrollEnabled={true}
        ref={ref}
        style={{marginTop: responsiveHeight(8.6), backgroundColor: 'white'}}>
        <Text selectable style={styles.title}>
          Year Wise Teachers
        </Text>
        {serviceArray.length > 0 && (
          <View style={styles.dataView}>
            <Text selectable style={styles.bankDataText}>
              Please Select Any Year
            </Text>
          </View>
        )}
        <View
          style={{
            justifyContent: 'space-evenly',
            alignItems: 'center',
            alignSelf: 'center',
            flexDirection: 'row',
            margin: responsiveHeight(1),
            flexWrap: 'wrap',
            width: responsiveWidth(90),
          }}>
          {serviceArray.length > 0 &&
            serviceArray.map((year, index) => (
              <View>
                <CustomButton
                  title={year}
                  size={'xsmall'}
                  key={index}
                  onClick={() => handleChange(year)}
                />
                <Text
                  style={{
                    color: 'chocolate',
                    fontSize: responsiveFontSize(1.3),
                    alignSelf: 'center',
                    textAlign: 'center',
                  }}>
                  {new Date().getFullYear() - parseInt(year)} Year
                </Text>
              </View>
            ))}
        </View>

        {selectedYear ? (
          <View>
            {joiningMonths.length > 1 && (
              <View style={styles.dataView}>
                <Text selectable style={styles.bankDataText}>
                  Filter By Joining Month
                </Text>
              </View>
            )}
            <View
              style={{
                justifyContent: 'space-evenly',
                alignItems: 'center',
                alignSelf: 'center',
                flexDirection: 'row',
                margin: responsiveHeight(1),
                flexWrap: 'wrap',
                width: responsiveWidth(90),
              }}>
              {joiningMonths.length > 1 &&
                joiningMonths.map((month, index) => (
                  <View>
                    <CustomButton
                      title={month.monthName}
                      size={'small'}
                      fontSize={responsiveFontSize(1.5)}
                      key={index}
                      onClick={() => handleMonthChange(month)}
                    />
                    <Text
                      style={{
                        color: 'chocolate',
                        fontSize: responsiveFontSize(1.3),
                        alignSelf: 'center',
                        textAlign: 'center',
                        marginTop: responsiveHeight(0.1),
                      }}>
                      {
                        moreFilteredData.filter(
                          m => m.doj.split('-')[1] === month.index,
                        ).length
                      }{' '}
                      Teacher
                    </Text>
                  </View>
                ))}
            </View>
            <View style={styles.dataView}>
              <Text selectable style={styles.bankDataText}>
                {moreFilteredData.length > 1 ? 'Teachers' : 'Teacher'} Joined on
                Year {selectedYear}
              </Text>
              <Text selectable style={styles.bankDataText}>
                Total {moreFilteredData.length} Teachers
              </Text>
            </View>

            {filteredData.length > 0 ? (
              filteredData.map((el, index) => {
                return (
                  <View style={styles.dataView} key={index}>
                    <View
                      style={{
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                      <Text selectable style={styles.bankDataText}>
                        {index + 1}) Teacher's Name: {el.tname} ({`${el.desig}`}
                        )
                      </Text>
                      <Text selectable style={styles.bankDataText}>
                        School: {el.school}
                      </Text>
                      <TouchableOpacity
                        onPress={() => makeCall(parseInt(el.phone))}>
                        <Text selectable style={styles.bankDataText}>
                          Mobile: {el.phone}
                        </Text>
                      </TouchableOpacity>
                      <Text selectable style={styles.bankDataText}>
                        Service Life: {getServiceLife(el.doj)}
                      </Text>
                      <Text selectable style={styles.bankDataText}>
                        Date of Joining: {el.doj}
                      </Text>
                      <Text selectable style={styles.bankDataText}>
                        DOJ at This Post in This School: {el.dojnow}
                      </Text>
                      <Text selectable style={styles.bankDataText}>
                        Date of Birth: {el.dob}
                      </Text>
                      <Text selectable style={styles.bankDataText}>
                        Date of Retirement: {el.dor}
                      </Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <Text selectable style={styles.bankDataText}>
                No Teachers found for the selected Year.
              </Text>
            )}
          </View>
        ) : null}
      </ScrollView>
      <Loader visible={visible} />
      <Toast />
    </View>
  );
};

export default YearwiseTeachers;

const styles = StyleSheet.create({
  // Your styles here
  container: {
    flex: 1,
  },
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
    alignSelf: 'center',
    fontSize: responsiveFontSize(2),
    fontWeight: '500',
    marginTop: 10,
    color: THEME_COLOR,
    textAlign: 'center',
    padding: 5,
  },
  bottom: {
    marginBottom: 60,
  },
  dataView: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',

    margin: responsiveHeight(0.5),
    borderRadius: responsiveWidth(3),
    padding: responsiveWidth(1),
    width: responsiveWidth(94),
    elevation: 5,
  },
  label: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(1.6),
    color: THEME_COLOR,
    textAlign: 'center',
    marginTop: responsiveHeight(0.2),
  },
  bankDataText: {
    alignSelf: 'center',
    color: THEME_COLOR,
    textAlign: 'center',
    padding: 1,
    fontSize: responsiveFontSize(2),
    marginLeft: 5,
  },
});
