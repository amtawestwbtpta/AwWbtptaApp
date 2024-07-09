import {ScrollView, StyleSheet, Text, View, BackHandler} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {THEME_COLOR} from '../utils/Colors';
import CustomButton from '../components/CustomButton';
import {
  GetMonthName,
  IndianFormat,
  months,
} from '../modules/calculatefunctions';
import {DA, HRA, NEXTDA, PREV6DA, PREVDA} from '../modules/constants';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import {useGlobalContext} from '../context/Store';
const AllTeachersSalary = () => {
  const {stateArray} = useGlobalContext();
  const isFocused = useIsFocused();
  const data = stateArray;
  const navigation = useNavigation();
  const [school, setSchool] = useState('');
  const today = new Date();
  const date = new Date();
  const [index, setIndex] = useState(today.getMonth() + 1);
  const [month, setMonth] = useState(GetMonthName(today.getMonth()));
  const thisMonth = GetMonthName(today.getMonth());

  useEffect(() => {
    setSchool(stateArray[0]?.school);
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
  return (
    <View style={styles.container}>
      <ScrollView
        style={{
          marginTop: responsiveHeight(1),
        }}
        contentContainerStyle={{
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <View style={styles.dataView}>
          <Text selectable style={styles.bankDataText}>
            Select Month
          </Text>
        </View>
        <View
          style={{
            justifyContent: 'space-evenly',
            alignItems: 'center',
            alignSelf: 'center',
            flexDirection: 'row',
            margin: responsiveWidth(1),
            flexWrap: 'wrap',
            width: responsiveWidth(95),
          }}>
          {months.slice(0, months.indexOf(thisMonth) + 1).map((el, ind) => {
            return (
              <CustomButton
                key={ind}
                title={el}
                color={month === el ? 'green' : null}
                fontColor={month === el ? 'seashell' : null}
                size={'small'}
                onClick={() => {
                  setMonth(el);
                  setIndex(ind + 1);
                }}
              />
            );
          })}
        </View>
        <Text selectable style={styles.title}>
          {' '}
          All Teacher's Salary Data for The Month of {month.toUpperCase()} of{' '}
          {school}
        </Text>
        {data.map((el, ind) => {
          let basic = el.basic;
          let mbasic = el.mbasic;
          let addl = el.addl;
          let ma = el.ma;
          let gpf = el.gpf;
          let gpfprev = el.gpfprev;
          let gsli = el.gsli;
          let disability = el.disability;
          let prevmbasic = el.prevmbasic;
          let dataYear = el.dataYear;
          let da;

          // console.log(junelast)
          let basicpay;
          let ptax;
          let pfund;
          if (dataYear === date.getFullYear()) {
            if (index > 6) {
              basicpay = basic;
              da = Math.round(basicpay * DA);
              pfund = gpf;
            } else {
              pfund = gpfprev;
              basicpay = mbasic;
              if (index < 4) {
                da = Math.round(basicpay * PREVDA);
              } else {
                da = Math.round(basicpay * DA);
              }
            }
          } else if (dataYear === date.getFullYear() - 1) {
            basicpay = prevmbasic;
            da = Math.round(basicpay * PREV6DA);
            pfund = gpfprev;
          } else {
            if (index > 6) {
              basicpay = RoundTo(basic + basic * 0.03, 100);
              da = Math.round(basicpay * NEXTDA);
            } else {
              basicpay = basic;
              da = Math.round(basicpay * DA);
            }
            pfund = gpfprev;
          }

          // let da = Math.round(basicpay * DA);
          let hra = Math.round(basicpay * HRA);

          let gross = basicpay + da + hra + addl + ma;
          // console.log(gross)

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

          let netpay = gross - deduction;

          return (
            <View style={styles.dataView} key={ind}>
              <Text selectable style={styles.dataText}>
                ({ind + 1})
              </Text>
              <View
                style={{
                  flexDirection: data.length > 3 ? 'row' : 'column',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  alignSelf: 'center',
                  flexWrap: 'wrap',
                }}>
                <Text selectable style={styles.dataText}>
                  Teacher Name: {el.tname},
                </Text>
                <Text selectable style={styles.dataText}>
                  Designation: {el.desig},
                </Text>
                <Text selectable style={styles.dataText}>
                  Basicpay: ₹{IndianFormat(basicpay)},
                </Text>
                {addl > 0 ? (
                  <Text selectable style={styles.dataText}>
                    Additional Allowance: ₹{IndianFormat(addl)},
                  </Text>
                ) : null}
                <Text selectable style={styles.dataText}>
                  DA: ₹{IndianFormat(da)},
                </Text>
                <Text selectable style={styles.dataText}>
                  HRA: ₹{IndianFormat(hra)},
                </Text>
                {ma > 0 ? (
                  <Text selectable style={styles.dataText}>
                    Medical Allowance: ₹{IndianFormat(ma)},
                  </Text>
                ) : null}
                <Text selectable style={styles.dataText}>
                  Gross: ₹{IndianFormat(gross)},
                </Text>
                <Text selectable style={styles.dataText}>
                  GPF: ₹{IndianFormat(pfund)},
                </Text>
                <Text selectable style={styles.dataText}>
                  PTax: ₹{IndianFormat(ptax)},
                </Text>
                <Text selectable style={styles.dataText}>
                  Net Pay: ₹{IndianFormat(netpay)}
                </Text>
              </View>
            </View>
          );
        })}

        <CustomButton
          title={'Go Back'}
          color={'orange'}
          size={'small'}
          onClick={() => navigation.navigate('Home')}
        />
      </ScrollView>
    </View>
  );
};

export default AllTeachersSalary;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'center',
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

    margin: responsiveHeight(1),
    borderRadius: responsiveWidth(3),
    padding: responsiveWidth(1),
    width: responsiveWidth(94),
    elevation: 5,
  },
  dataText: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(1.6),
    color: THEME_COLOR,
    textAlign: 'center',
    marginTop: responsiveHeight(0.2),
  },
  bankDataText: {
    alignSelf: 'center',
    fontSize: 15,
    color: THEME_COLOR,
    textAlign: 'center',
    padding: 1,
  },
});
