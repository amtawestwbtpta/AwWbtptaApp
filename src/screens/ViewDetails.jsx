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
import {useIsFocused, useNavigation} from '@react-navigation/native';
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
  const {state, stateObject} = useGlobalContext();
  const isFocused = useIsFocused();
  const navigation = useNavigation();
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
    gpfprev,
    julyGpf,
    gsli,
    fname,
    dataYear,
  } = stateObject;
  const [bankData, setBankData] = useState({});
  const ifsc_ser = () => {
    fetch(`https://ifsc.razorpay.com/${ifsc}`)
      .then(res => res.json())
      .then(data => setBankData(data));
  };
  let date = new Date();

  let da, hra, gross, basicpay, netpay, ptax, pfund;
  let junelast = new Date(`${date.getFullYear()}-07-1`);
  const month = date.getMonth();

  if (dataYear === new Date().getFullYear()) {
    if (date >= junelast) {
      basicpay = basic;
      pfund = julyGpf;
    } else if (month <= 3) {
      basicpay = basic;
      pfund = gpf;
    } else if (month < 6 && month >= 2) {
      basicpay = mbasic;
      pfund = gpf;
    } else {
      basicpay = mbasic;
      pfund = gpfprev;
    }
  } else {
    basicpay = basic;
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

  useEffect(() => {
    ifsc_ser();
  }, [isFocused]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.goBack();
        DeviceEventEmitter.emit('goBack');
        return true;
      },
    );
    return () => backHandler.remove();
  }, [isFocused]);
  return (
    <View style={styles.container}>
      <Text selectable style={styles.title}>
        DETAILS OF {tname}
      </Text>
      <ScrollView
        style={{
          marginTop: responsiveHeight(2),
        }}>
        {user.circle == 'admin' && (
          <CustomButton
            title={'Edit Details'}
            fontSize={responsiveFontSize(1.5)}
            size={'small'}
            marginBottom={responsiveHeight(1)}
            onClick={() => navigation.navigate('EditDetails')}
          />
        )}
        <CustomButton
          title={'Go Back'}
          color={'purple'}
          size={'small'}
          onClick={() => {
            navigation.goBack();
            DeviceEventEmitter.emit('goBack');
          }}
        />
        <TouchableOpacity
          style={styles.dataView}
          onPress={() => Clipboard.setString(tname)}>
          <Text selectable style={styles.dataText}>
            Name: {tname}
          </Text>
        </TouchableOpacity>
        {user.circle === 'admin' && (
          <TouchableOpacity
            style={styles.dataView}
            onPress={() => Clipboard.setString(tname)}>
            <Text selectable style={styles.dataText}>
              Access: {circle}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.dataView}
          onPress={() => Clipboard.setString(fname)}>
          <Text selectable style={styles.dataText}>
            Father's Name: {fname}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dataView}
          onPress={() => Clipboard.setString(school)}>
          <Text selectable style={styles.dataText}>
            School: {school}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dataView}
          onPress={() => Clipboard.setString(udise)}>
          <Text selectable style={styles.dataText}>
            UDISE: {udise}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dataView}
          onPress={() => Clipboard.setString(desig)}>
          <Text selectable style={styles.dataText}>
            Designation: {desig}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dataView}
          onPress={() => Clipboard.setString(gp)}>
          <Text selectable style={styles.dataText}>
            Gram Panchayet: {gp}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dataView}
          onPress={() => Clipboard.setString(phone)}>
          <Text selectable style={styles.dataText}>
            Mobile: {phone}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dataView}
          onPress={() => Clipboard.setString(email)}>
          <Text selectable style={styles.dataText}>
            Email: {email}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dataView}
          onPress={() => Clipboard.setString(dob)}>
          <Text selectable style={styles.dataText}>
            Date of Birth: {dob}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dataView}
          onPress={() => Clipboard.setString(doj)}>
          <Text selectable style={styles.dataText}>
            Date of Joining: {doj}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dataView}
          onPress={() => Clipboard.setString(dojnow)}>
          <Text selectable style={styles.dataText}>
            DOJ in Present School: {dojnow}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dataView}
          onPress={() => Clipboard.setString(dor)}>
          <Text selectable style={styles.dataText}>
            Date of Retirement: {dor}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dataView}
          onPress={() => Clipboard.setString(empid)}>
          <Text selectable style={styles.dataText}>
            Employee ID: {empid}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dataView}>
          <Text selectable style={styles.dataText}>
            Training: {training}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dataView}
          onPress={() => Clipboard.setString(pan)}>
          <Text selectable style={styles.dataText}>
            PAN: {pan}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dataView}
          onPress={() => Clipboard.setString(address)}>
          <Text selectable style={styles.dataText}>
            Address: {address}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dataView}>
          <Text selectable style={styles.dataText}>
            BANK: {bank}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dataView}
          onPress={() => Clipboard.setString(account)}>
          <Text selectable style={styles.dataText}>
            Account No: {account}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dataView}
          onPress={() => Clipboard.setString(ifsc)}>
          <Text selectable style={styles.dataText}>
            IFS Code: {ifsc}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dataView}>
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
        </TouchableOpacity>
        <TouchableOpacity style={styles.dataView}>
          <Text selectable style={styles.dataText}>
            BASIC: {basicpay}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dataView}>
          <Text selectable style={styles.dataText}>
            DA: {da}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dataView}>
          <Text selectable style={styles.dataText}>
            HRA: {hra}
          </Text>
        </TouchableOpacity>
        {addl ? (
          <TouchableOpacity style={styles.dataView}>
            <Text selectable style={styles.dataText}>
              Additional Pay: {addl}
            </Text>
          </TouchableOpacity>
        ) : null}
        {ma ? (
          <TouchableOpacity style={styles.dataView}>
            <Text selectable style={styles.dataText}>
              Medical Allowance: {ma}
            </Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity style={styles.dataView}>
          <Text selectable style={styles.dataText}>
            Gross Pay: {gross}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dataView}>
          <Text selectable style={styles.dataText}>
            March GPF: {gpfprev}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dataView}>
          <Text selectable style={styles.dataText}>
            April GPF: {gpf}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dataView}>
          <Text selectable style={styles.dataText}>
            July GPF: {julyGpf}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dataView}>
          <Text selectable style={styles.dataText}>
            PTAX: {ptax}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dataView}>
          <Text selectable style={styles.dataText}>
            Net Pay: {netpay}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.dataView, {marginBottom: responsiveHeight(2)}]}
          onPress={() => Clipboard.setString(INR(netpay))}>
          <Text selectable style={styles.dataText}>
            Net Pay in Words: {INR(netpay)}
          </Text>
        </TouchableOpacity>
        {user.circle == 'admin' && (
          <CustomButton
            title={'Edit Details'}
            fontSize={responsiveFontSize(1.5)}
            size={'small'}
            marginBottom={responsiveHeight(1)}
            onClick={() => navigation.navigate('EditDetails')}
          />
        )}
        <CustomButton
          title={'Go Back'}
          size={'small'}
          color={'purple'}
          onClick={() => {
            navigation.goBack();
            DeviceEventEmitter.emit('goBack');
          }}
        />
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
