import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  BackHandler,
  TouchableOpacity,
  DeviceEventEmitter,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useIsFocused} from '@react-navigation/native';
import {THEME_COLOR} from '../utils/Colors';
import {INR} from '../modules/calculatefunctions';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import Clipboard from '@react-native-clipboard/clipboard';
import CustomButton from '../components/CustomButton';
import {useGlobalContext} from '../context/Store';
import {DA, HRA} from '../modules/constants';
const ViewDetails = () => {
  const {state, stateObject, setStateObject} = useGlobalContext();
  const isFocused = useIsFocused();
  const navigation = stateObject.navigation;
  const user = state.USER;
  let {
    udise,
    tname,
    desig,
    school,
    disability,
    circle,
    gp,
    phone,
    email,
    dob,
    doj,
    dojnow,
    dor,
    bank,
    account,
    ifsc,
    empid,
    training,
    pan,
    address,
    basic,
    mbasic,
    addl,
    ma,
    gpf,
    gsli,
    fname,
    dataYear,
  } = stateObject.data;
  const [bankData, setBankData] = useState({});
  const ifsc_ser = () => {
    fetch(`https://ifsc.razorpay.com/${ifsc}`)
      .then(res => res.json())
      .then(data => setBankData(data));
  };
  let date = new Date();

  let basicpay;
  let ptax;
  let junelast = new Date(`${date.getFullYear()}-07-31`);
  if (dataYear === new Date().getFullYear()) {
    if (date >= junelast) {
      basicpay = basic;
    } else {
      basicpay = mbasic;
    }
  } else {
    basicpay = basic;
  }
  let da = Math.round(basicpay * DA);
  let hra = Math.round(basicpay * HRA);

  let gross = basicpay + da + hra + addl + ma;

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

  useEffect(() => {
    ifsc_ser();
  }, [isFocused]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.navigate('Home');
        DeviceEventEmitter.emit('goBack');
        return true;
      },
    );
    return () => backHandler.remove();
  }, [isFocused]);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>DETAILS OF {tname}</Text>
      <ScrollView
        style={{
          marginTop: responsiveHeight(2),
        }}>
        {user.circle == 'admin' && (
          <CustomButton
            title={'Edit Details'}
            marginBottom={responsiveHeight(1)}
            onClick={() =>
              navigation.navigate('EditDetails', {
                data: stateObject.data,
                navigation: navigation,
              })
            }
          />
        )}
        <TouchableOpacity
          style={styles.dataView}
          onPress={() => Clipboard.setString(tname)}>
          <Text style={styles.dataText}>Name: {tname}</Text>
        </TouchableOpacity>
        {user.circle === 'admin' && (
          <TouchableOpacity
            style={styles.dataView}
            onPress={() => Clipboard.setString(tname)}>
            <Text style={styles.dataText}>Access: {circle}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.dataView}
          onPress={() => Clipboard.setString(fname)}>
          <Text style={styles.dataText}>Father's Name: {fname}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dataView}
          onPress={() => Clipboard.setString(school)}>
          <Text style={styles.dataText}>School: {school}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dataView}
          onPress={() => Clipboard.setString(udise)}>
          <Text style={styles.dataText}>UDISE: {udise}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dataView}
          onPress={() => Clipboard.setString(desig)}>
          <Text style={styles.dataText}>Designation: {desig}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dataView}
          onPress={() => Clipboard.setString(gp)}>
          <Text style={styles.dataText}>Gram Panchayet: {gp}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dataView}
          onPress={() => Clipboard.setString(phone)}>
          <Text style={styles.dataText}>Mobile: {phone}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dataView}
          onPress={() => Clipboard.setString(email)}>
          <Text style={styles.dataText}>Email: {email}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dataView}
          onPress={() => Clipboard.setString(dob)}>
          <Text style={styles.dataText}>Date of Birth: {dob}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dataView}
          onPress={() => Clipboard.setString(doj)}>
          <Text style={styles.dataText}>Date of Joining: {doj}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dataView}
          onPress={() => Clipboard.setString(dojnow)}>
          <Text style={styles.dataText}>DOJ in Present School: {dojnow}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dataView}
          onPress={() => Clipboard.setString(dor)}>
          <Text style={styles.dataText}>Date of Retirement: {dor}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dataView}
          onPress={() => Clipboard.setString(empid)}>
          <Text style={styles.dataText}>Employee ID: {empid}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dataView}>
          <Text style={styles.dataText}>Training: {training}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dataView}
          onPress={() => Clipboard.setString(pan)}>
          <Text style={styles.dataText}>PAN: {pan}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dataView}
          onPress={() => Clipboard.setString(address)}>
          <Text style={styles.dataText}>Address: {address}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dataView}>
          <Text style={styles.dataText}>BANK: {bank}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dataView}
          onPress={() => Clipboard.setString(account)}>
          <Text style={styles.dataText}>Account No: {account}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dataView}
          onPress={() => Clipboard.setString(ifsc)}>
          <Text style={styles.dataText}>IFS Code: {ifsc}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dataView}>
          <Text style={styles.bankDataText}>Bank Name: {bankData.BANK}</Text>
          <Text style={styles.bankDataText}>Branch: {bankData.BRANCH}</Text>
          <Text style={styles.bankDataText}>Address: {bankData.ADDRESS}</Text>
          <Text style={styles.bankDataText}>MICR: {bankData.MICR}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dataView}>
          <Text style={styles.dataText}>BASIC: {basicpay}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dataView}>
          <Text style={styles.dataText}>DA: {da}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dataView}>
          <Text style={styles.dataText}>HRA: {hra}</Text>
        </TouchableOpacity>
        {addl ? (
          <TouchableOpacity style={styles.dataView}>
            <Text style={styles.dataText}>Additional Pay: {addl}</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity style={styles.dataView}>
          <Text style={styles.dataText}>Gross Pay: {gross}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dataView}>
          <Text style={styles.dataText}>GPF: {gpf}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dataView}>
          <Text style={styles.dataText}>PTAX: {ptax}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dataView}>
          <Text style={styles.dataText}>Net Pay: {netpay}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.dataView, {marginBottom: responsiveHeight(2)}]}
          onPress={() => Clipboard.setString(INR(netpay))}>
          <Text style={styles.dataText}>Net Pay in Words: {INR(netpay)}</Text>
        </TouchableOpacity>
        {user.circle == 'admin' && (
          <CustomButton
            title={'Edit Details'}
            marginBottom={responsiveHeight(1)}
            onClick={() => {
              navigation.navigate('EditDetails');
              setStateObject({
                data: data,
                navigation: navigation,
              });
            }}
          />
        )}
      </ScrollView>
    </View>
  );
};

export default ViewDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(3),
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
    backgroundColor: '#ddd',
    marginTop: responsiveHeight(1),
    borderRadius: responsiveWidth(3),
    padding: responsiveWidth(5),
    width: responsiveWidth(94),
    elevation: 5,
  },
  dataText: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(2.5),
    color: THEME_COLOR,
    textAlign: 'center',
    padding: 5,
  },
  bankDataText: {
    alignSelf: 'center',
    fontSize: 15,
    color: THEME_COLOR,
    textAlign: 'center',
    padding: 1,
  },
});
