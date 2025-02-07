import {
  StyleSheet,
  Text,
  View,
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
const UpdateAccounts = ({refresh, myData, data, total}) => {
  const isFocused = useIsFocused();
  const docId = uuid.v4();
  const [showLoader, setShowLoader] = useState(false);
  const [selectedText, setSelectedText] = useState(
    'Select Transfering Admin Name',
  );
  const [isClicked, setIsClicked] = useState(false);
  const [transferingAccount, setTransferingAccount] = useState({});
  const [excludeReceivingAccount, setExcludeReceivingAccount] = useState([]);
  const [showData, setShowData] = useState(false);
  const [showTrData, setShowTrData] = useState(false);
  const [showRcData, setShowRcData] = useState(false);
  const [isTrnsSelected, setIsTrnsSelected] = useState(false);
  const [transferingAmount, setTransferingAmount] = useState('');
  const [receivingAccount, setReceivingAccount] = useState({});
  const [purpose, setPurpose] = useState('');
  const [isReceivingClicked, setIsReceivingClicked] = useState(false);
  const [rcSelectedText, setRcSelectedText] = useState(
    'Select Receiving Admin Name',
  );
  const transferAmount = async () => {
    setShowLoader(true);
    await firestore()
      .collection('accounts')
      .doc(transferingAccount.id)
      .update({
        cash: transferingAccount.cash - parseFloat(transferingAmount),
        transactBy: myData.name,
        recentOn: Date.now(),
        recentTransactionAmount: parseInt(transferingAmount),
      })
      .then(async () => {
        await firestore()
          .collection('accounts')
          .doc(receivingAccount.id)
          .update({
            cash: receivingAccount.cash + parseFloat(transferingAmount),
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
                trnsferersCash:
                  transferingAccount.cash - parseFloat(transferingAmount),
                transferFrom: transferingAccount.name,
                receiveTo: receivingAccount.name,
                transactBy: myData.name,
                receiversCash:
                  receivingAccount.cash + parseFloat(transferingAmount),
                totalCash:
                  transferingAccount.name === 'OTHERS'
                    ? total + parseFloat(transferingAmount)
                    : receivingAccount.name === 'OTHERS'
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
  useEffect(() => {}, [
    transferingAmount,
    purpose,
    transferingAccount,
    excludeReceivingAccount,
  ]);
  return (
    <View style={{flex: 1}}>
      <Text selectable style={styles.label}>
        Select Transfering Admin's Name
      </Text>

      <TouchableOpacity
        style={[styles.dropDownnSelector, {marginTop: 5}]}
        onPress={() => {
          setIsClicked(!isClicked);
          setShowData(false);
          setSelectedText('Select Transfering Admin Name');
          setRcSelectedText('Select Receiving Admin Name');
          setIsTrnsSelected(false);
          setIsReceivingClicked(false);
          setTransferingAmount('');
          setPurpose('');
          setTransferingAccount({});
          setExcludeReceivingAccount([]);
          setReceivingAccount({});
          setShowTrData(false);
          setShowRcData(false);
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
          {data.map((item, index) => {
            return (
              <TouchableOpacity
                key={index}
                style={styles.AdminName}
                onPress={() => {
                  setIsClicked(false);
                  setIsTrnsSelected(true);
                  setSelectedText(item.name);
                  setShowTrData(true);
                  setTransferingAccount(
                    data.filter(el => el.name.match(item.name))[0],
                  );
                  setExcludeReceivingAccount(
                    data.filter(el => el.name !== item.name),
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
      {showTrData && (
        <Text selectable style={styles.label}>
          {titleCase(
            `${transferingAccount.name}'s Total Amount: ₹${transferingAccount.cash}`,
          )}
        </Text>
      )}
      {isTrnsSelected && (
        <View style={{marginTop: responsiveHeight(2)}}>
          <TouchableOpacity
            style={[styles.dropDownnSelector, {marginTop: 5}]}
            onPress={() => {
              setIsReceivingClicked(!isReceivingClicked);
              setShowData(false);
              setRcSelectedText('Select Receiving Admin Name');
              setShowRcData(false);
              setTransferingAmount('');
              setPurpose('');

              setReceivingAccount({});
            }}>
            {isReceivingClicked ? (
              <View style={{flexDirection: 'row'}}>
                <Text
                  selectable
                  style={[
                    styles.dropDownText,
                    {paddingRight: responsiveWidth(2)},
                  ]}>
                  {rcSelectedText}
                </Text>

                <AntDesign name="up" size={30} color={THEME_COLOR} />
              </View>
            ) : (
              <View style={{flexDirection: 'row'}}>
                <Text
                  selectable
                  style={[
                    styles.dropDownText,
                    {paddingRight: responsiveWidth(2)},
                  ]}>
                  {rcSelectedText}
                </Text>

                <AntDesign name="down" size={30} color={THEME_COLOR} />
              </View>
            )}
          </TouchableOpacity>

          {isReceivingClicked ? (
            <View style={styles.dropDowArea}>
              {excludeReceivingAccount.map((item, index) => {
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.AdminName}
                    onPress={() => {
                      setIsReceivingClicked(false);
                      setShowData(true);
                      setRcSelectedText(item.name);
                      setReceivingAccount(
                        excludeReceivingAccount.filter(el =>
                          el.name.match(item.name),
                        )[0],
                      );
                      setShowRcData(true);
                    }}>
                    <Text selectable style={styles.dropDownText}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}
          {showRcData && (
            <Text selectable style={styles.label}>
              {titleCase(
                `${receivingAccount.name}'s Total Amount: ₹${receivingAccount.cash}`,
              )}
            </Text>
          )}
        </View>
      )}
      <View>
        {showData && (
          <View
            style={{
              marginTop: responsiveHeight(1),
              marginBottom: responsiveHeight(1),
            }}>
            <CustomTextInput
              placeholder={'Enter Amount To Transact'}
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

            {parseFloat(transferingAmount) > 0 && (
              <View style={styles.itemView}>
                <Text selectable style={styles.label}>
                  {titleCase(
                    `${
                      transferingAccount.name
                    }'s Total Amount After Transfer: ₹${
                      transferingAccount.cash - parseFloat(transferingAmount)
                    }`,
                  )}
                </Text>
                <Text selectable style={styles.label}>
                  {titleCase(
                    `${receivingAccount.name}'s Total Amount After Transfer: ₹${
                      receivingAccount.cash + parseFloat(transferingAmount)
                    }`,
                  )}
                </Text>
              </View>
            )}
            {parseFloat(transferingAmount) > 0 && purpose !== '' && (
              <CustomButton
                title={'Transfer'}
                onClick={() => {
                  if (transferingAccount.name === 'OTHERS') {
                    transferAmount();
                  }
                  if (parseFloat(transferingAmount) < transferingAccount.cash) {
                    transferAmount();
                  } else {
                    showToast('error', 'Invalid Amount!');
                  }
                }}
              />
            )}
          </View>
        )}
        {showTrData && (
          <CustomButton
            title={'Cancel'}
            color={'darkred'}
            onClick={() => {
              setIsClicked(false);
              setShowData(false);
              setSelectedText('Select Transfering Admin Name');
              setRcSelectedText('Select Receiving Admin Name');
              setIsTrnsSelected(false);
              setIsReceivingClicked(false);
              setTransferingAmount('');
              setPurpose('');
              setTransferingAccount({});
              setExcludeReceivingAccount([]);
              setReceivingAccount({});
              setShowTrData(false);
              setShowRcData(false);
            }}
          />
        )}
      </View>

      <Loader visible={showLoader} />
      <Toast />
    </View>
  );
};

export default UpdateAccounts;

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
