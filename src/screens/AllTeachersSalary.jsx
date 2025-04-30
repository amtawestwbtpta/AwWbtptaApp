import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  BackHandler,
  Linking,
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {THEME_COLOR} from '../utils/Colors';
import CustomButton from '../components/CustomButton';
import {
  GetMonthName,
  IndianFormat,
  months,
} from '../modules/calculatefunctions';
import {
  ANYKEY,
  DA,
  HRA,
  NEXTDA,
  PREV6DA,
  PREVDA,
  VercelWeb,
} from '../modules/constants';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import {useGlobalContext} from '../context/Store';
import axios from 'axios';
import Loader from '../components/Loader';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
const AllTeachersSalary = () => {
  const {stateArray, state, setStateObject} = useGlobalContext();
  const user = state.USER;
  const isFocused = useIsFocused();
  const data = stateArray;
  const navigation = useNavigation();
  const [school, setSchool] = useState('');
  const thisYear = new Date().getFullYear();
  const preYear = thisYear - 1;
  const pre2ndYear = thisYear - 2;
  const thisYearMonths = [
    `January-${thisYear}`,
    `February-${thisYear}`,
    `March-${thisYear}`,
    `April-${thisYear}`,
    `May-${thisYear}`,
    `June-${thisYear}`,
    `July-${thisYear}`,
    `August-${thisYear}`,
    `September-${thisYear}`,
    `October-${thisYear}`,
    `November-${thisYear}`,
    `December-${thisYear}`,
  ];
  const preYearMonths = [
    `January-${preYear}`,
    `February-${preYear}`,
    `March-${preYear}`,
    `April-${preYear}`,
    `May-${preYear}`,
    `June-${preYear}`,
    `July-${preYear}`,
    `August-${preYear}`,
    `September-${preYear}`,
    `October-${preYear}`,
    `November-${preYear}`,
    `December-${preYear}`,
  ];
  const pre2ndYearMonths = [
    `January-${pre2ndYear}`,
    `February-${pre2ndYear}`,
    `March-${pre2ndYear}`,
    `April-${pre2ndYear}`,
    `May-${pre2ndYear}`,
    `June-${pre2ndYear}`,
    `July-${pre2ndYear}`,
    `August-${pre2ndYear}`,
    `September-${pre2ndYear}`,
    `October-${pre2ndYear}`,
    `November-${pre2ndYear}`,
    `December-${pre2ndYear}`,
  ];

  const today = new Date();
  const [loader, setLoader] = useState(true);
  const [month, setMonth] = useState(GetMonthName(today.getMonth()));
  const [year, setYear] = useState(today.getFullYear());

  const lastMonthIndex = today.getMonth() === 11 ? 11 : today.getMonth() + 1;
  // const paySlipArray = thisYearMonths
  //   .slice(0, lastMonthIndex)
  //   .reverse()
  //   .concat(preYearMonths.reverse())
  //   .concat(pre2ndYearMonths.reverse());

  const [monthSalary, setMonthSalary] = useState([]);
  const [aprilSalary, setAprilSalary] = useState([]);
  const handleChange = async el => {
    const month = el.split('-')[0];
    const year = parseInt(el.split('-')[1]);
    setMonth(month);
    setYear(year);

    await getSalary(month, year);
  };
  const getSalary = async (month, year) => {
    setLoader(true);
    const q1 = await axios.get(
      `https://raw.githubusercontent.com/amtawestwbtpta/salaryRemodified/main/${month.toLowerCase()}-${year}.json`,
    );
    const q2 = await axios.get(
      `https://raw.githubusercontent.com/amtawestwbtpta/salaryRemodified/main/april-2024.json`,
    );
    setLoader(false);
    setMonthSalary(q1.data);
    setAprilSalary(q2.data);
  };
  useEffect(() => {
    setSchool(stateArray[0]?.school);
    getSalary(month, year);
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
      {loader ? (
        <Loader visible={loader} />
      ) : (
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
          <Text selectable style={styles.dataText}>
            Year {thisYear}
          </Text>
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
            {thisYearMonths
              .slice(0, lastMonthIndex)
              .reverse()
              .map((el, ind) => {
                return (
                  <CustomButton
                    key={ind}
                    title={el}
                    color={
                      month === el?.split('-')[0] &&
                      year === parseInt(el?.split('-')[1])
                        ? 'green'
                        : null
                    }
                    fontColor={
                      month === el?.split('-')[0] &&
                      year === parseInt(el?.split('-')[1])
                        ? 'seashell'
                        : null
                    }
                    size={'small'}
                    fontSize={responsiveFontSize(1.2)}
                    onClick={() => {
                      handleChange(el);
                      console.log(el);
                    }}
                  />
                );
              })}
          </View>
          <Text selectable style={styles.dataText}>
            Year {preYear}
          </Text>
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
            {preYearMonths
              .reverse()
              .map((el, ind) => {
                return (
                  <CustomButton
                    key={ind}
                    title={el}
                    color={
                      month === el?.split('-')[0] &&
                      year === parseInt(el?.split('-')[1])
                        ? 'green'
                        : null
                    }
                    fontColor={
                      month === el?.split('-')[0] &&
                      year === parseInt(el?.split('-')[1])
                        ? 'seashell'
                        : null
                    }
                    size={'small'}
                    fontSize={responsiveFontSize(1.2)}
                    onClick={() => {
                      handleChange(el);
                      console.log(el);
                    }}
                  />
                );
              })}
          </View>
          <Text selectable style={styles.dataText}>
            Year {pre2ndYear}
          </Text>
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
            {pre2ndYearMonths
              .reverse()
              .map((el, ind) => {
                return (
                  <CustomButton
                    key={ind}
                    title={el}
                    color={
                      month === el?.split('-')[0] &&
                      year === parseInt(el?.split('-')[1])
                        ? 'green'
                        : null
                    }
                    fontColor={
                      month === el?.split('-')[0] &&
                      year === parseInt(el?.split('-')[1])
                        ? 'seashell'
                        : null
                    }
                    size={'small'}
                    fontSize={responsiveFontSize(1.2)}
                    onClick={() => {
                      handleChange(el);
                      console.log(el);
                    }}
                  />
                );
              })}
          </View>
          <Text selectable style={styles.title}>
            All Teacher's Salary Data for The Month of {month.toUpperCase()}'{' '}
            {year} of {school}
          </Text>
          {data.map((el, ind) => {
            let tname,
              id,
              desig,
              disability,
              addl,
              da,
              hra,
              ma,
              gross,
              pfund,
              ptax,
              gsli,
              ir,
              netpay,
              basicpay;

            tname = el.tname;
            id = el.id;
            desig = el.desig;
            disability = el.disability;

            const techersSalary = monthSalary?.filter(el => el.id === id)[0];
            const teachersAprilSalary = aprilSalary?.filter(
              el => el.id === id,
            )[0];
            if (
              month === 'July' &&
              year === 2024 &&
              teachersAprilSalary?.basic > 0
            ) {
              ir = Math.round(teachersAprilSalary?.basic * 0.04);
            } else {
              ir = 0;
            }
            basicpay = techersSalary?.basic;
            da = Math.round(basicpay * techersSalary?.daPercent);
            hra =
              techersSalary?.hraPercent > 10
                ? techersSalary?.hraPercent
                : Math.round(basicpay * techersSalary?.hraPercent);
            addl = techersSalary?.addl;
            ma = techersSalary?.ma;
            pfund = techersSalary?.gpf;
            gsli = techersSalary?.gsli;
            gross = basicpay + da + ir + hra + addl + ma;
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

            return (
              basicpay !== 0 &&
              basicpay !== undefined && (
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
                      Teacher Name: {tname},
                    </Text>
                    <Text selectable style={styles.dataText}>
                      Designation: {desig},
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
                    {hra > 0 && (
                      <Text selectable style={styles.dataText}>
                        HRA: ₹{IndianFormat(hra)},
                      </Text>
                    )}

                    {ma > 0 ? (
                      <Text selectable style={styles.dataText}>
                        Medical Allowance: ₹{IndianFormat(ma)},
                      </Text>
                    ) : null}
                    {ir > 0 ? (
                      <Text selectable style={styles.dataText}>
                        IR: ₹{IndianFormat(ir)},
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
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent:
                        user?.circle === 'admin' ? 'space-between' : 'center',
                      alignItems: 'center',
                      alignSelf: 'center',
                      flexWrap: 'wrap',
                      width: responsiveWidth(60),
                    }}>
                    <CustomButton
                      title={`Download\nWBTPTA\nPayslip`}
                      size={'medium'}
                      fontSize={responsiveFontSize(1.1)}
                      color={'darkgreen'}
                      onClick={async () => {
                        const url = `${VercelWeb}/downloadWBTPTAPayslip?data=${JSON.stringify(
                          el,
                        )}`;
                        await Linking.openURL(url);
                      }}>
                      <MaterialIcons
                        name="download-for-offline"
                        color={'white'}
                        size={30}
                      />
                    </CustomButton>
                    {user?.circle === 'admin' && (
                      <CustomButton
                        title={`Download\nOSMS\nPayslip`}
                        size={'medium'}
                        fontSize={responsiveFontSize(1.1)}
                        color={'blueviolet'}
                        onClick={async () => {
                          const url = `${VercelWeb}/downloadOsmsPayslip?data=${JSON.stringify(
                            el,
                          )}&key=${ANYKEY}`;
                          await Linking.openURL(url);
                        }}>
                        <MaterialIcons
                          name="download-for-offline"
                          color={'white'}
                          size={30}
                        />
                      </CustomButton>
                    )}
                  </View>
                </View>
              )
            );
          })}

          <CustomButton
            title={'Go Back'}
            color={'orange'}
            size={'small'}
            onClick={() => navigation.navigate('Home')}
          />
        </ScrollView>
      )}
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
