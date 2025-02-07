import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  BackHandler,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {THEME_COLOR} from '../utils/Colors';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import {getSubmitYearInput, getMonthDays} from '../modules/calculatefunctions';
import DateTimePickerAndroid from '@react-native-community/datetimepicker';
import {useGlobalContext} from '../context/Store';

const RetirementDateCalculator = () => {
  const {setActiveTab} = useGlobalContext();
  const [retirementDate, setRetirementDate] = useState('');
  const [fontColor, setFontColor] = useState(THEME_COLOR);
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [showData, setShowData] = useState(false);
  const calculateAgeOnSameDay = (event, selectedDate) => {
    const currentSelectedDate = selectedDate || date;
    setOpen('');
    setDate(currentSelectedDate);
    setShowData(true);
    setFontColor('black');
    calculateRetirementDate(new Date(currentSelectedDate).toLocaleDateString());
  };
  const calculateRetirementDate = input => {
    const jdate = getSubmitYearInput(input);
    const joinedYear = parseInt(jdate.substring(0, 4), 10);
    const joinedMonth = parseInt(jdate.substring(5, 7), 10);
    const currentYear = new Date().getFullYear();
    const retirementYear = joinedYear + 60;

    let retirementMonth = joinedMonth;
    let retirementDay = new Date(retirementYear, retirementMonth, 0).getDate();

    if (currentYear >= retirementYear) {
      retirementMonth = 12;
      retirementDay = new Date(retirementYear, retirementMonth, 0).getDate();
    }
    if (new Date(jdate).getDate() === 1 && retirementMonth == 1) {
      setRetirementDate(
        `${retirementDay.toString().padStart(2, '0')}-12-${retirementYear - 1}`,
      );
    } else if (new Date(jdate).getDate() === 1 && retirementMonth == 2) {
      setRetirementDate(`31-01-${retirementYear}`);
    } else if (
      new Date(jdate).getDate() === 1 &&
      retirementMonth == 3 &&
      (retirementYear / 4) % 1 === 0
    ) {
      setRetirementDate(`29-02-${retirementYear}`);
    } else if (new Date(jdate).getDate() === 1 && retirementMonth == 3) {
      setRetirementDate(`28-02-${retirementYear}`);
    } else if (new Date(jdate).getDate() === 1 && retirementMonth == 12) {
      setRetirementDate(`30-11-${retirementYear}`);
    } else if (new Date(jdate).getDate() === 1) {
      setRetirementDate(
        `${getMonthDays[retirementMonth]}-${(retirementMonth - 1)
          .toString()
          .padStart(2, '0')}-${retirementYear}`,
      );
    } else {
      setRetirementDate(
        `${retirementDay.toString().padStart(2, '0')}-${retirementMonth
          .toString()
          .padStart(2, '0')}-${retirementYear}`,
      );
    }
  };
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        setActiveTab(0);
        return true;
      },
    );
    return () => backHandler.remove();
  }, []);
  useEffect(() => {}, [retirementDate]);
  return (
    <View style={styles.container}>
      <Text selectable style={styles.title}>
        Retirement Date Calculator
      </Text>
      <Text selectable style={styles.desc}>
        Select Date of Birth
      </Text>
      <View>
        <TouchableOpacity
          style={{
            marginTop: 10,
            borderColor: 'skyblue',
            borderWidth: 1,
            width: responsiveWidth(76),
            height: 50,
            alignSelf: 'center',
            borderRadius: responsiveWidth(3),
            justifyContent: 'center',
          }}
          onPress={() => setOpen(true)}>
          <Text
            selectable
            style={{
              fontSize: responsiveFontSize(1.6),
              color: fontColor,
              paddingLeft: 14,
            }}>
            {date.getDate() < 10 ? '0' + date.getDate() : date.getDate()}-
            {date.getMonth() + 1 < 10
              ? `0${date.getMonth() + 1}`
              : date.getMonth() + 1}
            -{date.getFullYear()}
          </Text>
        </TouchableOpacity>

        {open && (
          <DateTimePickerAndroid
            testID="dateTimePicker"
            value={date}
            mode="date"
            display="spinner"
            maximumDate={Date.parse(new Date())}
            minimumDate={new Date('01-01-2023')}
            onChange={calculateAgeOnSameDay}
          />
        )}
      </View>
      {showData ? (
        <View style={[styles.itemView, {marginTop: responsiveHeight(8)}]}>
          <Text selectable style={styles.title}>
            Retirement Date is {retirementDate}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

export default RetirementDateCalculator;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    textAlign: 'center',
    fontSize: responsiveFontSize(3),
    fontWeight: '700',
    paddingLeft: responsiveWidth(5),
    paddingRight: responsiveWidth(5),
    color: THEME_COLOR,
  },
  desc: {
    textAlign: 'center',
    fontSize: responsiveFontSize(2.5),
    fontWeight: '500',
    paddingLeft: responsiveWidth(5),
    paddingRight: responsiveWidth(5),
    color: THEME_COLOR,
  },
  text: {
    textAlign: 'center',
    fontSize: responsiveFontSize(2),
    fontWeight: '500',
    paddingLeft: responsiveWidth(5),
    paddingRight: responsiveWidth(5),
    color: THEME_COLOR,
  },
  dropDownnSelector: {
    width: responsiveWidth(90),
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
    width: responsiveWidth(80),

    borderRadius: responsiveWidth(2),
    marginTop: responsiveHeight(1),
    backgroundColor: '#fff',
    elevation: 5,
    alignSelf: 'center',
    marginBottom: responsiveHeight(10),
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
  membership: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(3),
    fontWeight: '500',
    padding: responsiveWidth(2),
    color: 'darkgreen',
    marginTop: responsiveHeight(1),
    textAlign: 'center',
    fontFamily: 'kalpurush',
  },

  itemView: {
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'white',
    width: responsiveWidth(90),
    borderRadius: responsiveWidth(2),
    padding: responsiveWidth(2),
    elevation: 5,
    margin: responsiveWidth(1),
  },
  label: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(1.5),
    fontWeight: '500',
    marginTop: responsiveHeight(0.2),
    color: THEME_COLOR,
    textAlign: 'center',
  },
});
