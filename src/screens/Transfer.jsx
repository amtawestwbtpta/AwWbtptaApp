import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  BackHandler,
  TouchableOpacity,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {THEME_COLOR} from '../utils/Colors';
import CustomButton from '../components/CustomButton';
import CustomTextInput from '../components/CustomTextInput';
import firestore from '@react-native-firebase/firestore';
import Toast from 'react-native-toast-message';

import {useIsFocused} from '@react-navigation/native';
import Loader from '../components/Loader';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {titleCase} from '../modules/calculatefunctions';
import uuid from 'react-native-uuid';
const Transfer = ({refresh, excludeMyData, myData, total}) => {
  const isFocused = useIsFocused();
  const docId = uuid.v4();
  const [showLoader, setShowLoader] = useState(false);
  const [selectedText, setSelectedText] = useState('Select Admin Name');
  const [isClicked, setIsClicked] = useState(false);
  const [filteredData, setFilteredData] = useState(excludeMyData);
  const [showData, setShowData] = useState(false);

  const [receivingAdmin, setReceivingAdmin] = useState({});
  const [transferingAmount, setTransferingAmount] = useState('');
  const [purpose, setPurpose] = useState('');

  const transferAmount = async () => {
    setShowLoader(true);
    await firestore()
      .collection('accounts')
      .doc(receivingAdmin.id)
      .update({
        cash: receivingAdmin.cash + parseFloat(transferingAmount),
        transactBy: myData.name,
        recentOn: Date.now(),
        recentTransactionAmount: parseInt(transferingAmount),
      })
      .then(async () => {
        await firestore()
          .collection('accounts')
          .doc(myData.id)
          .update({
            cash: myData.cash - parseFloat(transferingAmount),
            transactBy: myData.name,
            recentOn: Date.now(),
            recentTransactionAmount: parseInt(transferingAmount),
          })
          .then(async () => {
            await firestore()
              .collection('ledgers')
              .doc(docId)
              .set({
                id: docId,
                cashTransfered: parseInt(transferingAmount),
                trnsferersCash: myData.cash - parseFloat(transferingAmount),
                transferFrom: myData.name,
                receiveTo: receivingAdmin.name,
                transactBy: myData.name,
                receiversCash:
                  receivingAdmin.cash + parseFloat(transferingAmount),
                totalCash:
                  receivingAdmin.name === 'OTHERS'
                    ? total - parseFloat(transferingAmount)
                    : total,
                purpose: purpose,
                transactOn: Date.now(),
              })
              .then(() => {
                setShowLoader(false);
                showToast('success', 'Amount Transfered Successfully!');
                refresh();
              })
              .catch(e => {
                setShowLoader(false);
                showToast('error', 'Amount Transfer Failed!');
                console.log(e);
              });
          })
          .catch(e => {
            setShowLoader(false);
            showToast('error', 'Amount Transfer Failed!');
            console.log(e);
          });
      })
      .catch(e => {
        setShowLoader(false);
        showToast('error', 'Amount Transfer Failed!');
        console.log(e);
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
        refresh();
        return true;
      },
    );
    return () => backHandler.remove();
  }, [isFocused]);
  useEffect(() => {}, [isFocused]);
  useEffect(() => {}, [receivingAdmin]);
  return (
    <View style={{flex: 1}}>
      <Text selectable style={styles.title}>
        Transfer To Which Admin?
      </Text>

      <TouchableOpacity
        style={[styles.dropDownnSelector, {marginTop: 5}]}
        onPress={() => {
          setIsClicked(!isClicked);
          setShowData(false);
          setSelectedText('Select Admin Name');
          setTransferingAmount('');
          setPurpose('');
        }}>
        {isClicked ? (
          <View style={{flexDirection: 'row'}}>
            <Text
              selectable
              style={[styles.dropDownText, {paddingRight: responsiveWidth(2)}]}>
              {selectedText}
            </Text>

            <AntDesign name="up" size={30} color={THEME_COLOR} />
          </View>
        ) : (
          <View style={{flexDirection: 'row'}}>
            <Text
              selectable
              style={[styles.dropDownText, {paddingRight: responsiveWidth(2)}]}>
              {selectedText}
            </Text>

            <AntDesign name="down" size={30} color={THEME_COLOR} />
          </View>
        )}
      </TouchableOpacity>

      {isClicked ? (
        <View style={styles.dropDowArea}>
          {filteredData.map((item, index) => {
            return (
              <TouchableOpacity
                key={index}
                style={styles.AdminName}
                onPress={() => {
                  setIsClicked(false);
                  setShowData(true);
                  setSelectedText(item.name);
                  setReceivingAdmin(
                    excludeMyData.filter(el => el.name.match(item.name))[0],
                  );
                }}>
                <Text selectable style={styles.dropDownText}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}

      <ScrollView>
        {showData && (
          <View style={{marginTop: responsiveHeight(1)}}>
            <Text selectable style={styles.title}>
              {titleCase(
                `${receivingAdmin.name}'s Total Amount: ₹${receivingAdmin.cash}`,
              )}
            </Text>
            <CustomTextInput
              placeholder={'Enter Amount To Transfer'}
              value={transferingAmount}
              onChangeText={text => {
                setTransferingAmount(text);
              }}
            />
            <CustomTextInput
              placeholder={'Enter Purpose of Transaction'}
              value={purpose}
              onChangeText={text => {
                setPurpose(text);
              }}
            />
            {parseFloat(transferingAmount) > 0 &&
              myData.cash >= parseFloat(transferingAmount) &&
              purpose !== '' && (
                <View style={styles.itemView}>
                  <Text selectable style={styles.title}>
                    {titleCase(
                      `${receivingAdmin.name}'s Total Amount After Transfer: ₹${
                        receivingAdmin.cash + parseFloat(transferingAmount)
                      }`,
                    )}
                  </Text>
                  <CustomButton title={'Transfer'} onClick={transferAmount} />
                </View>
              )}
            <CustomButton
              title={'Cancel'}
              color={'darkred'}
              onClick={() => {
                setIsClicked(false);
                setShowData(false);
                setSelectedText('Select Admin Name');
                setTransferingAmount('');
                setPurpose('');
              }}
            />
          </View>
        )}
      </ScrollView>

      <Loader visible={showLoader} />
      <Toast />
    </View>
  );
};

export default Transfer;

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    fontSize: responsiveFontSize(3),
    fontWeight: '700',
    color: THEME_COLOR,
  },
  itemView: {
    width: responsiveWidth(92),

    alignSelf: 'center',
    borderRadius: responsiveWidth(2),
    marginTop: responsiveHeight(1),
    marginBottom: responsiveHeight(1),
    padding: responsiveWidth(4),
    shadowColor: 'transparent',
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  label: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(2),
    fontWeight: '500',
    marginTop: responsiveHeight(0.2),
    color: THEME_COLOR,
    textAlign: 'center',
  },
  dropDownnSelector: {
    width: responsiveWidth(90),
    height: responsiveHeight(6),
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
    width: responsiveWidth(90),

    borderRadius: responsiveWidth(2),
    marginTop: responsiveHeight(1),
    backgroundColor: '#fff',
    elevation: 5,
    alignSelf: 'center',
    marginBottom: responsiveHeight(20),
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
});
