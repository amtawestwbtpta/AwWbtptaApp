import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  BackHandler,
  Alert,
} from 'react-native';

import React, {useState, useEffect} from 'react';
import firestore from '@react-native-firebase/firestore';
import {THEME_COLOR} from '../utils/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import Loader from '../components/Loader';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import {INR, IndianFormat} from '../modules/calculatefunctions';
import Toast from 'react-native-toast-message';

const AdminAccountDashboard = ({exclueOther, total, getAccount}) => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [showLoader, setShowLoader] = useState(false);
  const showConfirmDialog = el => {
    return Alert.alert(
      'Hold On!',
      `Are You Sure To Delete Account ${el.name}?`,
      [
        // The "No" button
        // Does nothing but dismiss the dialog when tapped
        {
          text: 'No',
          onPress: () => showToast('success', 'Account Not Deleted!'),
        },
        // The "Yes" button
        {
          text: 'Yes',
          onPress: () => {
            deleteAccount(el);
          },
        },
      ],
    );
  };
  const deleteAccount = async account => {
    setShowLoader(true);
    await firestore()
      .collection('accounts')
      .doc(account.id)
      .delete()
      .then(async () => {
        setShowLoader(false);
        getAccount();
        showToast('success', 'Account Deleted Successfully!');
      })
      .catch(e => {
        setShowLoader(false);
        showToast('error', 'Account Deletation Failed!');
        console.log(e);
      });
  };
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
  const showToast = (type, text) => {
    Toast.show({
      type: type,
      text1: text,
      visibilityTime: 1500,
      position: 'top',
      topOffset: 500,
    });
  };
  return (
    <View style={{flex: 1}}>
      {exclueOther.map((el, index) => {
        let dateRecent = new Date(el.recentOn);
        return (
          <View style={styles.itemView} key={index}>
            <Text selectable style={styles.label}>
              Name: {el.name}
            </Text>
            <Text selectable style={styles.label}>
              Amount: ₹{el.cash}
            </Text>
            <Text selectable style={styles.label}>
              Recent Transaction Date:{' '}
              {`${dateRecent.getDate()}-${dateRecent.getMonth()}-${dateRecent.getFullYear()}`}
            </Text>
            <Text selectable style={styles.label}>
              Recent Transaction Amount: ₹{el.recentTransactionAmount}
            </Text>
            <TouchableOpacity
              style={{paddingLeft: responsiveWidth(4)}}
              onPress={() => {
                showConfirmDialog(el);
              }}>
              <Text selectable>
                <Ionicons name="trash-bin" size={25} color="red" />
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
      <ScrollView style={{marginBottom: responsiveHeight(2)}}>
        <View style={styles.itemView}>
          <Text selectable style={styles.label}>
            Total: ₹{IndianFormat(total)}
          </Text>
          <Text selectable style={styles.label}>
            In Words: {INR(total)}
          </Text>
        </View>
      </ScrollView>
      <Loader visible={showLoader} />
      <Toast />
    </View>
  );
};

export default AdminAccountDashboard;

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
});
