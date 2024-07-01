import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  BackHandler,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import firestore from '@react-native-firebase/firestore';
import {THEME_COLOR} from '../utils/Colors';
import CustomButton from '../components/CustomButton';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import Loader from '../components/Loader';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import {isEmpty} from '../modules/calculatefunctions';
import {useGlobalContext} from '../context/Store';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Toast from 'react-native-toast-message';
import Transfer from './Transfer';
import AdminAccountDashboard from './AdminAccountDashboard';
import UpdateAccounts from './UpdateAccounts';
import AccountLedger from './AccountLedger';
import uuid from 'react-native-uuid';
import CustomTextInput from '../components/CustomTextInput';
const Accounts = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const accountId = uuid.v4();
  const [showLoader, setShowLoader] = useState(false);
  const [data, setData] = useState([]);
  const [myData, setMyData] = useState({});
  const [excludeMyData, setExcludeMyData] = useState({});
  const [showdata, setShowdata] = useState(false);
  const [total, setTotal] = useState('');
  const [exclueOther, setExclueOther] = useState([]);
  const {state} = useGlobalContext();
  const user = state.USER;
  const adminName = user.tname;
  const showToast = (type, text) => {
    Toast.show({
      type: type,
      text1: text,
      visibilityTime: 1500,
      position: 'top',
      topOffset: 500,
    });
  };
  const getAccount = async () => {
    setShowLoader(true);
    await firestore()
      .collection('accounts')
      .get()
      .then(snapshot => {
        const datas = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        }));
        setExclueOther(datas.filter(el => el.name !== 'OTHERS'));
        setExcludeMyData(datas.filter(el => el.name !== adminName));

        setData(datas);
        let cash = 0;
        datas
          .filter(el => el.name !== 'OTHERS')
          .map(el => {
            cash = cash + el.cash;
            return cash;
          });
        setTotal(cash);
        setMyData(datas.filter(el => el.name.match(adminName))[0]);
        setShowLoader(false);
        setShowdata(true);
      })
      .catch(e => {
        setShowLoader(false);
        showToast('error', e);
      });
  };
  const [activeTab, setActiveTab] = useState(0);

  const [showAddAccount, setShowAddAccount] = useState(false);
  const [inputField, setInputField] = useState({
    id: accountId,
    cash: '',
    name: '',
    recentOn: Date.now(),
    recentTransactionAmount: '',
    transactBy: adminName,
    transactOn: Date.now(),
  });
  const [showTab, setShowTab] = useState(true);
  const addAccount = async () => {
    if (!isEmpty(inputField)) {
      await firestore()
        .collection('accounts')
        .doc(accountId)
        .set(inputField)
        .then(async () => {
          await firestore()
            .collection('ledgers')
            .doc(accountId)
            .set({
              id: accountId,
              cashTransfered: inputField.cash,
              trnsferersCash: inputField.cash,
              transferFrom: 'New Account',
              receiveTo: inputField.name,
              transactBy: myData.name,
              receiversCash: inputField.cash,
              totalCash: total + inputField.cash,
              purpose: 'New Account',
              transactOn: Date.now(),
            })
            .then(() => {
              setShowLoader(false);
              showToast('success', 'Account Added Successfully');
              getAccount();
              setShowTab(true);
              setShowAddAccount(false);
            })
            .catch(e => {
              setShowLoader(false);
              showToast('error', 'Account Addition Failed');
              console.log(e);
            });
        })
        .catch(e => {
          setShowLoader(false);
          showToast('error', 'Account Addition Failed');
          console.log(e);
        });
    } else {
      setShowLoader(false);
      showToast('error', 'Form Is Invalid');
    }
  };

  const refresh = () => {
    setActiveTab(0);
    getAccount();
  };

  useEffect(() => {
    getAccount();
  }, [isFocused]);
  useEffect(() => {}, [myData, inputField]);
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
    <View style={{flex: 1}}>
      {showdata && (
        <View
          style={{
            marginTop: responsiveHeight(1),
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
          }}>
          {activeTab == 0 ? (
            <Text selectable style={styles.title}>
              Admin Accounts Dashboard
            </Text>
          ) : activeTab == 1 ? (
            <Text selectable style={styles.title}>
              Admin Accounts Transfer Cash
            </Text>
          ) : activeTab == 2 ? (
            <Text selectable style={styles.title}>
              Admin Accounts Update Cash
            </Text>
          ) : activeTab == 3 ? (
            <Text selectable style={styles.title}>
              Admin Accounts Ledger
            </Text>
          ) : null}
          <Text selectable style={styles.label}>
            Welcome {adminName}!
          </Text>
          <Text selectable style={styles.label}>
            You Have ₹{myData.cash}
          </Text>
          <TouchableOpacity
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              alignSelf: 'center',
              justifyContent: 'center',
              marginBottom: responsiveHeight(1),
              marginTop: responsiveHeight(1),
            }}
            onPress={() => {
              setShowAddAccount(!showAddAccount);
              setShowTab(!showTab);
            }}>
            <Feather
              name={showAddAccount ? 'minus-circle' : 'plus-circle'}
              size={20}
              color={THEME_COLOR}
            />
            <Text
              selectable
              style={[styles.label, {paddingLeft: responsiveWidth(2)}]}>
              {showAddAccount ? 'Hide Add Account' : 'Add New Account'}
            </Text>
          </TouchableOpacity>
          <View>
            {showAddAccount ? (
              <View>
                <CustomTextInput
                  placeholder={'Enter Name'}
                  value={inputField.name}
                  onChangeText={text =>
                    setInputField({...inputField, name: text})
                  }
                />
                <CustomTextInput
                  placeholder={'Enter Amount'}
                  type={'number-pad'}
                  value={inputField.cash.toString()}
                  onChangeText={text =>
                    setInputField({
                      ...inputField,
                      cash: parseFloat(text),
                      recentTransactionAmount: parseFloat(text),
                    })
                  }
                />

                <CustomButton title={'Add Account'} onClick={addAccount} />

                <CustomButton
                  title={'Cancel'}
                  color={'darkred'}
                  onClick={() => {
                    setShowAddAccount(false);
                    setInputField({
                      id: accountId,
                      cash: '',
                      name: '',
                      recentOn: Date.now(),
                      recentTransactionAmount: '',
                      transactBy: adminName,
                      transactOn: Date.now(),
                    });
                    setShowTab(true);
                  }}
                />
              </View>
            ) : null}
          </View>
        </View>
      )}

      {showTab && (
        <View style={{flex: 1}}>
          <ScrollView
            style={{
              marginTop: responsiveHeight(1),
              marginBottom: responsiveHeight(7),
            }}
            contentContainerStyle={{
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            {activeTab === 0 ? (
              <AdminAccountDashboard
                data={data}
                exclueOther={exclueOther}
                excludeMyData={excludeMyData}
                total={total}
                myData={myData}
                getAccount={getAccount}
                refresh={refresh}
                navigation={navigation}
              />
            ) : activeTab === 1 ? (
              <Transfer
                data={data}
                exclueOther={exclueOther}
                excludeMyData={excludeMyData}
                total={total}
                myData={myData}
                getAccount={getAccount}
                refresh={refresh}
                navigation={navigation}
              />
            ) : activeTab === 2 ? (
              <UpdateAccounts
                data={data}
                exclueOther={exclueOther}
                excludeMyData={excludeMyData}
                total={total}
                myData={myData}
                getAccount={getAccount}
                refresh={refresh}
                navigation={navigation}
              />
            ) : activeTab === 3 ? (
              <AccountLedger
                data={data}
                exclueOther={exclueOther}
                excludeMyData={excludeMyData}
                total={total}
                myData={myData}
                getAccount={getAccount}
                refresh={refresh}
                navigation={navigation}
              />
            ) : null}
          </ScrollView>
          <ScrollView
            style={{
              backgroundColor: 'white',
              position: 'absolute',
              bottom: 0,
              height: 60,
              alignSelf: 'center',
              width: '100%',
              flexDirection: 'row',
              elevation: 5,
              shadowColor: '#000',
              shadowOpacity: 0.5,
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
            }}
            contentContainerStyle={{
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
            horizontal={true}>
            <TouchableOpacity
              style={[styles.bottomBtn, {paddingLeft: 5}]}
              onPress={() => navigation.navigate('Home')}>
              <Entypo name="back" size={30} color={THEME_COLOR} />
              <Text
                selectable
                style={[styles.bottomText, {color: THEME_COLOR}]}>
                Go Back
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bottomBtn, {paddingLeft: 5}]}
              onPress={() => setActiveTab(0)}>
              <MaterialCommunityIcons
                name="view-dashboard"
                size={20}
                color={activeTab == 0 ? 'purple' : THEME_COLOR}
              />
              <Text
                selectable
                style={[
                  styles.bottomText,
                  {color: activeTab == 0 ? 'purple' : THEME_COLOR},
                ]}>
                Dashboard
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bottomBtn, {paddingLeft: 5}]}
              onPress={() => setActiveTab(1)}>
              <FontAwesome6
                name="money-bill-transfer"
                size={20}
                color={activeTab == 1 ? 'purple' : THEME_COLOR}
              />
              <Text
                selectable
                style={[
                  styles.bottomText,
                  {color: activeTab == 1 ? 'purple' : THEME_COLOR},
                ]}>
                Transfer
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bottomBtn, {paddingLeft: 5}]}
              onPress={() => setActiveTab(2)}>
              <MaterialCommunityIcons
                name="cash-check"
                size={30}
                color={activeTab == 2 ? 'purple' : THEME_COLOR}
              />
              <Text
                selectable
                style={[
                  styles.bottomText,
                  {color: activeTab == 2 ? 'purple' : THEME_COLOR},
                ]}>
                Update
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bottomBtn, {paddingLeft: 5}]}
              onPress={() => setActiveTab(3)}>
              <FontAwesome6
                name="piggy-bank"
                size={30}
                color={activeTab == 3 ? 'purple' : THEME_COLOR}
              />
              <Text
                selectable
                style={[
                  styles.bottomText,
                  {color: activeTab == 3 ? 'purple' : THEME_COLOR},
                ]}>
                Ledger
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}
      <Loader visible={showLoader} />
      <Toast />
    </View>
  );
};

export default Accounts;

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
    borderRadius: responsiveWidth(3),
    marginTop: responsiveHeight(0.2),
    marginBottom: responsiveHeight(0.2),
    padding: responsiveWidth(4),

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
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    height: responsiveHeight(8.5),
    width: responsiveWidth(100),
    backgroundColor: '#ddd',

    shadowColor: '#000',
    shadowOpacity: 0.5,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: 'row',
    paddingLeft: responsiveWidth(2),
    paddingRight: responsiveWidth(2),
  },
  bottomText: {
    fontSize: responsiveFontSize(1.5),
    color: THEME_COLOR,
    textAlign: 'center',
    // fontWeight: '600',
  },
  bottomTextDbl: {
    fontSize: responsiveFontSize(1),
    color: THEME_COLOR,
    textAlign: 'center',
    fontWeight: '600',
  },
  bottomBtn: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 10,
  },
});
