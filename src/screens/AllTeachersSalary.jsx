import {ScrollView, StyleSheet, Text, View, BackHandler} from 'react-native';
import React, {useEffect} from 'react';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {THEME_COLOR} from '../utils/Colors';
import CustomButton from '../components/CustomButton';
import {IndianFormat} from '../modules/calculatefunctions';
import {DA, HRA} from '../modules/constants';
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

  useEffect(() => {}, [isFocused]);
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
        <Text
          selectable
          style={
            styles.title
          }>{`ALL TEACHERS SALARY DATA OF\n ${data[0].school}`}</Text>
        {data.map((el, index) => {
          let basic = el.basic;
          let mbasic = el.mbasic;
          let addl = el.addl;
          let ma = el.ma;
          let gpf = el.gpf;
          let gsli = el.gsli;
          let disability = el.disability;
          let date = new Date();

          // console.log(junelast)
          let basicpay;
          let ptax;
          if (date.getMonth() > 5) {
            basicpay = basic;
          } else {
            basicpay = mbasic;
          }

          let da = Math.round(basicpay * DA);
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

          let deduction = gsli + gpf + ptax;

          let netpay = gross - deduction;

          return (
            <View style={styles.dataView} key={index}>
              <Text selectable style={styles.dataText}>
                ({index + 1})
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
                  GPF: ₹{IndianFormat(gpf)},
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
