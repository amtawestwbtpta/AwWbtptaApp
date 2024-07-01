import {StyleSheet, Text, View, ScrollView, BackHandler} from 'react-native';
import React, {useState, useEffect} from 'react';
import firestore from '@react-native-firebase/firestore';
import {THEME_COLOR} from '../utils/Colors';
import CustomButton from '../components/CustomButton';
import {useIsFocused} from '@react-navigation/native';
import Loader from '../components/Loader';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';

import {IndianFormat, titleCase} from '../modules/calculatefunctions';
import Toast from 'react-native-toast-message';
import AnimatedSeacrch from '../components/AnimatedSeacrch';

const AccountLedger = ({refresh}) => {
  const isFocused = useIsFocused();

  const [showLoader, setShowLoader] = useState(false);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [purpose, setPurpose] = useState('');

  const [firstData, setFirstData] = useState(0);
  const [visibleItems, setVisibleItems] = useState(10);
  const loadPrev = () => {
    setVisibleItems(prevVisibleItems => prevVisibleItems - 10);
    setFirstData(firstData - 10);
  };
  const loadMore = () => {
    setVisibleItems(prevVisibleItems => prevVisibleItems + 10);
    setFirstData(firstData + 10);
  };

  const getLedgers = async () => {
    setShowLoader(true);
    await firestore()
      .collection('ledgers')
      .get()
      .then(snapshot => {
        const datas = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        }));
        let newData = datas.sort((a, b) => b.transactOn - a.transactOn);
        setData(newData);
        setFilteredData(newData);
        setShowLoader(false);
      })
      .catch(e => {
        setShowLoader(false);
        showToast('error', e);
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

  useEffect(() => {
    getLedgers();
  }, [isFocused]);
  return (
    <View style={{flex: 1}}>
      <ScrollView
        nestedScrollEnabled={true}
        contentContainerStyle={{
          justifyContent: 'center',
          alignItems: 'center',
          alignSelf: 'center',
        }}>
        <AnimatedSeacrch
          placeholder={'Search Purpose'}
          value={purpose}
          onChangeText={text => {
            setPurpose(text);
            let newData = data.filter(el => {
              return el.purpose.toLowerCase().match(text.toLowerCase());
            });

            setFilteredData(newData);
          }}
          func={() => {
            setFilteredData(data);
            setPurpose('');
            setFirstData(0);
          }}
        />
        <View
          style={{
            flexDirection: 'row',
            marginBottom: 5,
            alignSelf: 'center',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {firstData >= 10 && (
            <View style={{marginBottom: 10}}>
              <CustomButton
                color={'orange'}
                title={'Previous'}
                onClick={loadPrev}
                size={'small'}
                fontSize={14}
              />
            </View>
          )}
          {visibleItems < filteredData.length && (
            <View style={{marginBottom: 10}}>
              <CustomButton
                title={'Next'}
                onClick={loadMore}
                size={'small'}
                fontSize={14}
              />
            </View>
          )}
        </View>
        {filteredData.length > 0 ? (
          filteredData.slice(firstData, visibleItems).map((el, index) => {
            let date = new Date(el.transactOn);
            return (
              <View style={styles.itemView} key={index}>
                <Text selectable style={styles.label}>
                  From: {el.transferFrom}
                </Text>
                <Text selectable style={styles.label}>
                  To: {el.receiveTo}
                </Text>
                <View style={{flexDirection: 'row', alignSelf: 'center'}}>
                  <Text selectable style={styles.label}>
                    Amount:{' '}
                  </Text>
                  <Text
                    selectable
                    style={[
                      styles.label,
                      {
                        color: 'green',
                      },
                    ]}>
                    ₹{IndianFormat(el.cashTransfered)}
                  </Text>
                </View>
                <Text selectable style={styles.label}>
                  Purpose: {el.purpose ? titleCase(el.purpose) : 'Transfer'}
                </Text>
                <View style={{flexDirection: 'row', alignSelf: 'center'}}>
                  <Text selectable style={styles.label}>
                    Tansferer's Cash:{' '}
                  </Text>
                  <Text
                    selectable
                    style={[
                      styles.label,
                      {
                        color: el.trnsferersCash < 0 ? 'red' : 'green',
                      },
                    ]}>
                    {el.trnsferersCash < 0
                      ? `-₹${IndianFormat(el.trnsferersCash * -1)}`
                      : `₹${IndianFormat(el.trnsferersCash)}`}
                  </Text>
                </View>
                <View style={{flexDirection: 'row', alignSelf: 'center'}}>
                  <Text selectable style={styles.label}>
                    Receiver's Cash:{' '}
                  </Text>
                  <Text
                    selectable
                    style={[
                      styles.label,
                      {
                        color: el.receiversCash < 0 ? 'red' : 'green',
                      },
                    ]}>
                    {el.receiversCash < 0
                      ? `-₹${IndianFormat(el.receiversCash * -1)}`
                      : `₹${IndianFormat(el.receiversCash)}`}
                  </Text>
                </View>

                <Text selectable style={styles.label}>
                  Date:-{' '}
                  {`${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`}
                </Text>
                <Text selectable style={styles.label}>
                  Done By:- {el.transactBy}
                </Text>
                <View style={{flexDirection: 'row', alignSelf: 'center'}}>
                  <Text selectable style={styles.label}>
                    Total Cash:{' '}
                  </Text>
                  <Text
                    selectable
                    style={[
                      styles.label,
                      {
                        color: 'green',
                      },
                    ]}>
                    ₹{el.totalCash}
                  </Text>
                </View>
              </View>
            );
          })
        ) : (
          <Text selectable style={styles.label}>
            Data Not Found
          </Text>
        )}
        <View
          style={{
            flexDirection: 'row',
            marginBottom: 5,
            alignSelf: 'center',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {firstData >= 10 && (
            <View style={{marginBottom: 10}}>
              <CustomButton
                color={'orange'}
                title={'Previous'}
                onClick={loadPrev}
                size={'small'}
                fontSize={14}
              />
            </View>
          )}
          {visibleItems < filteredData.length && (
            <View style={{marginBottom: 10}}>
              <CustomButton
                title={'Next'}
                onClick={loadMore}
                size={'small'}
                fontSize={14}
              />
            </View>
          )}
        </View>
      </ScrollView>
      <Loader visible={showLoader} />
      <Toast />
    </View>
  );
};

export default AccountLedger;

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    fontSize: responsiveFontSize(3),
    fontWeight: '700',
    color: THEME_COLOR,
  },
  itemView: {
    width: responsiveWidth(92),
    backgroundColor: 'white',
    alignSelf: 'center',
    borderRadius: responsiveWidth(2),
    marginTop: responsiveHeight(1),
    marginBottom: responsiveHeight(1),
    padding: responsiveWidth(2),

    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(1.5),
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
