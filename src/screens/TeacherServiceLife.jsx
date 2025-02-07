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
import {getServiceAge, getServiceLife} from '../modules/calculatefunctions';

const TeacherServiceLife = () => {
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
  const [visible, setVisible] = useState(false);
  const [serviceLife, setServiceLife] = useState('');
  const [target, setTarget] = useState('');
  const [addValue, setAddValue] = useState(0);
  const serviceLifeRange = [
    {
      id: 1,
      serviceLife: '0 - 1 Years',
      value: [0],
      target: '1 Year',
      addValue: 1,
    },
    {
      id: 2,
      serviceLife: '1 - 2 Years',
      value: [1, 2],
      target: '2 Years',
      addValue: 2,
    },
    {
      id: 3,
      serviceLife: '9 - 10 Years',
      value: [9, 10],
      target: '10 Years',
      addValue: 10,
    },
    {
      id: 4,
      serviceLife: '17 - 18 Years',
      value: [17, 18],
      target: '18 Years',
      addValue: 18,
    },
    {
      id: 5,
      serviceLife: '19 - 20 Years',
      value: [19, 20],
      target: '20 Years',
      addValue: 20,
    },
    {
      id: 6,
      serviceLife: '58 - 60 Years',
      value: [58, 59, 60],
      target: '60 Years',
      addValue: 60,
    },
  ];

  const handleChange = el => {
    const selectedValue = el.value;
    let x = [];
    data.map(teacher => {
      return selectedValue.map(range => {
        if (getServiceAge(teacher.doj) === range) {
          return x.push(teacher);
        } else if (el.id === 6) {
          if (getServiceAge(teacher.dob) === range) {
            return x.push(teacher);
          }
        }
      });
    });
    setFilteredData(x);
    setServiceLife(el.serviceLife);
    setTarget(el.target);
    setAddValue(el.addValue);
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
  useEffect(() => {}, [filteredData, data]);

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
        setData(newData.filter(el => el.association === 'WBTPTA'));
        setFilteredData(newData.filter(el => el.association === 'WBTPTA'));
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
    const newData = teachersState
      .filter(el => el.association === 'WBTPTA')
      .sort((a, b) => {
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
    setData(newData);
    setFilteredData(newData);
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
        style={{marginTop: responsiveHeight(8.6)}}>
        <Text selectable style={styles.title}>
          Teacher's Service Life
        </Text>

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
          {serviceLifeRange.map((el, index) => (
            <CustomButton
              key={index}
              title={el.serviceLife}
              size={'small'}
              fontSize={responsiveFontSize(1.5)}
              color={THEME_COLOR}
              onClick={() => {
                handleChange(el);
              }}
            />
          ))}
        </View>

        {serviceLife && filteredData.length > 0 && (
          <View>
            <View style={styles.dataView}>
              <Text selectable style={styles.bankDataText}>
                Service Life {serviceLife}
              </Text>
            </View>
            <View style={styles.dataView}>
              <Text selectable style={styles.bankDataText}>
                Total {filteredData.length} Teachers
              </Text>
            </View>
          </View>
        )}
        {serviceLife ? (
          filteredData.length > 0 ? (
            filteredData.map((el, index) => {
              const date = parseInt(el.doj?.split('-')[0]);
              const month = el.doj?.split('-')[1];
              const year = parseInt(el.doj?.split('-')[2]);
              return (
                <View style={styles.dataView} key={index}>
                  <View
                    style={{
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <Text selectable style={styles.bankDataText}>
                      Teacher's Name: {el.tname} ({`${el.desig}`})
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
                    {serviceLife !== '58 - 60 Years' ? (
                      <Text selectable style={styles.bankDataText}>
                        Date of Completion of {target}:
                        {date - 1 > 9 ? date - 1 : `0${date - 1}`}-{month}-
                        {year + addValue}
                      </Text>
                    ) : (
                      <View>
                        <Text selectable style={styles.bankDataText}>
                          Date of Birth: {el.dob}
                        </Text>
                        <Text selectable style={styles.bankDataText}>
                          Date of Retirement: {el.dor}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          ) : (
            <Text selectable style={styles.bankDataText}>
              No Teachers found for the selected service life.
            </Text>
          )
        ) : (
          <Text selectable style={styles.bankDataText}>
            Please Select Any Year Range From Above Choice
          </Text>
        )}
      </ScrollView>
      <Loader visible={visible} />
    </View>
  );
};

export default TeacherServiceLife;

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
