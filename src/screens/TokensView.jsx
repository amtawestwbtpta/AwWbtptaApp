import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  BackHandler,
  Alert,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
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
import {getSubmitDateInput} from '../modules/calculatefunctions';
import Toast from 'react-native-toast-message';
import AnimatedSeacrch from '../components/AnimatedSeacrch';
const TokensView = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [showLoader, setShowLoader] = useState(false);
  const [allTokens, setAllTokens] = useState([]);
  const [filteredTokens, setFilteredTokens] = useState([]);
  const [name, setName] = useState('');
  const [firstData, setFirstData] = useState(0);
  const [visibleItems, setVisibleItems] = useState(10);
  const scrollRef = useRef();

  const onPressTouch = () => {
    scrollRef.current?.scrollTo({
      y: 0,
      animated: true,
    });
  };
  const loadPrev = () => {
    setVisibleItems(prevVisibleItems => prevVisibleItems - 10);
    setFirstData(firstData - 10);
    onPressTouch();
  };
  const loadMore = () => {
    setVisibleItems(prevVisibleItems => prevVisibleItems + 10);
    setFirstData(firstData + 10);
    onPressTouch();
  };
  const getTokens = async () => {
    setShowLoader(true);
    await firestore()
      .collection('tokens')
      .get()
      .then(snapshot => {
        const data = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        }));
        let newData = data.sort((a, b) => {
          // First, compare the "school" keys
          if (a.username < b.username) {
            return -1;
          }
          if (a.username > b.username) {
            return 1;
          }
          // If "school" keys are equal, compare the "rank" keys
          return b.date - a.date;
        });
        setAllTokens(newData);
        setFilteredTokens(newData);
        setShowLoader(false);
      })
      .catch(e => {
        console.log('error', e);
        setShowLoader(false);
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

  const showDelTokenConfirmDialog = item => {
    return Alert.alert(
      'Hold On!',
      `Are You Sure Remove Token of ${item.name}?`,
      [
        // The "No" button
        // Does nothing but dismiss the dialog when tapped
        {
          text: 'No',
          onPress: () => showToast('success', 'Token Not Deleted!'),
        },
        // The "Yes" button
        {
          text: 'Yes',
          onPress: () => {
            delToken(item.id);
          },
        },
      ],
    );
  };
  const delToken = async id => {
    setShowLoader(true);
    await firestore()
      .collection('tokens')
      .doc(id)
      .delete()
      .then(() => {
        showToast('success', 'Token deleted successfully');
        setShowLoader(false);
        getTokens();
      })
      .catch(e => {
        showToast('error', 'Failed to delete token');
        setShowLoader(false);
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
    getTokens();
  }, []);
  useEffect(() => {}, [filteredTokens]);
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View
          style={{
            justifyContent: 'space-between',
            alignItems: 'center',
            alignSelf: 'center',
            flexDirection: 'row',
          }}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Image
              source={require('../assets/images/logosq.png')}
              style={{
                width: responsiveWidth(30),
                height: responsiveWidth(30),
                paddingRight: responsiveWidth(20),
                transform: [
                  {scale: 0.4},
                  {translateY: -responsiveHeight(8)},
                  {translateX: -responsiveHeight(8)},
                ],
              }}
            />
          </TouchableOpacity>
          <Text
            selectable
            style={{
              fontSize: responsiveFontSize(3),
              fontFamily: 'kalpurush',
              fontWeight: '500',
              transform: [
                {scale: 1.4},
                {scaleY: 1.5},
                {translateY: -responsiveHeight(1.2)},
                {translateX: -responsiveHeight(1.5)},
              ],
              color: 'white',
            }}>
            আমতা পশ্চিম চক্র
          </Text>
          <TouchableOpacity
            style={{
              paddingLeft: responsiveWidth(5),
              transform: [{translateY: -responsiveHeight(3)}],
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => {
              navigation.navigate('Home');
            }}>
            <MaterialCommunityIcons
              name="home"
              size={responsiveFontSize(5)}
              color={'white'}
            />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        ref={scrollRef}
        nestedScrollEnabled={true}
        style={{marginTop: responsiveHeight(7)}}>
        <Text selectable style={styles.title}>
          All Device Tokens
        </Text>
        <View style={{margin: responsiveHeight(1)}}>
          <AnimatedSeacrch
            value={name}
            placeholder={'Serch Teacher Name'}
            onChangeText={text => {
              setName(text);
              let newData = allTokens.filter(el => {
                return el.name.toLowerCase().match(text.toLowerCase());
              });

              setFilteredTokens(newData);
            }}
            func={() => {
              setFilteredTokens(allTokens);
              setName('');
            }}
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: responsiveHeight(1),
          }}>
          {firstData >= 10 && (
            <View>
              <CustomButton
                color={'orange'}
                title={'Previous'}
                onClick={loadPrev}
                size={'small'}
                fontSize={14}
              />
            </View>
          )}
          {visibleItems < filteredTokens.length && (
            <View>
              <CustomButton
                title={'Next'}
                onClick={loadMore}
                size={'small'}
                fontSize={14}
              />
            </View>
          )}
        </View>
        {filteredTokens.length > 0 ? (
          filteredTokens.map((el, index) => (
            <View style={styles.dataView} key={index}>
              <Text selectable style={styles.label}>
                Teacher's Name: {el.name}
              </Text>
              <Text selectable style={styles.label}>
                Username: {el.username}
              </Text>
              <Text selectable style={styles.label}>
                Registered On:{' '}
                {getSubmitDateInput(new Date(el.date).toLocaleDateString())}
              </Text>
              <Text selectable style={styles.label}>
                Device Brand: {el.brand}
              </Text>
              <Text selectable style={styles.label}>
                Device Model: {el.model}
              </Text>
              <Text selectable style={styles.label}>
                Android Version: {el.osVersion}
              </Text>
              <CustomButton
                title={'Delete Token'}
                color={'red'}
                size={'small'}
                fontSize={responsiveFontSize(1.5)}
                onClick={() => showDelTokenConfirmDialog(el)}
              />
            </View>
          ))
        ) : (
          <Text selectable style={styles.label}>
            No Token Found
          </Text>
        )}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: responsiveHeight(8),
          }}>
          {firstData >= 10 && (
            <View>
              <CustomButton
                color={'orange'}
                title={'Previous'}
                onClick={loadPrev}
                size={'small'}
                fontSize={14}
              />
            </View>
          )}
          {visibleItems < filteredTokens.length && (
            <View>
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

export default TokensView;

const styles = StyleSheet.create({
  // Your styles here
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    width: responsiveWidth(100),
    height: responsiveHeight(8.5),
    backgroundColor: THEME_COLOR,
    elevation: 5,
    shadowColor: 'black',
    borderBottomLeftRadius: responsiveWidth(3),
    borderBottomRightRadius: responsiveWidth(3),
    padding: 3,
    marginBottom: responsiveHeight(2),
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

    margin: responsiveHeight(0.5),
    borderRadius: responsiveWidth(3),
    padding: responsiveWidth(1),
    width: responsiveWidth(94),
    elevation: 5,
  },
  label: {
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
