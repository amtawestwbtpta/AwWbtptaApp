import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  BackHandler,
  DeviceEventEmitter,
} from 'react-native';
import React, {useState, useEffect, useContext} from 'react';
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
import {useGlobalContext} from '../context/Store';
import Toast from 'react-native-toast-message';
import AnimatedSeacrch from '../components/AnimatedSeacrch';
const ChatList = ({refresh, navigation, selectActiveTab, tabValue}) => {
  const isFocused = useIsFocused();
  const setActiveTab = () => {
    selectActiveTab(tabValue);
  };
  const [members, setMembers] = useState([]);
  const [name, setName] = useState('');
  const [filteredName, setFilteredName] = useState([]);
  const [showLoader, setShowLoader] = useState(false);
  const [value, setValue] = useState(0);
  const {state} = useGlobalContext();
  const user = state.USER;

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

  const getMembers = async () => {
    setShowLoader(true);
    await firestore()
      .collection('userteachers')
      .get()
      .then(snapshot => {
        const datas = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        }));
        let newData = datas
          .sort((a, b) => b.date - a.date)
          .filter(el => el.tname !== user.tname);
        setShowLoader(false);
        setMembers(newData);
        setFilteredName(newData);
      })
      .catch(e => {
        setShowLoader(false);
        showToast('error', e);
      });
  };

  useEffect(() => {
    getMembers();
  }, [isFocused]);
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
  useEffect(() => {}, [name, filteredName]);
  return (
    <View style={{flex: 1}}>
      <ScrollView>
        <Text style={[styles.title, {marginBottom: responsiveHeight(1)}]}>
          GROUP CHAT
        </Text>
        <TouchableOpacity
          style={[
            styles.itemView,
            {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}
          onPress={() => {
            navigation.navigate('WbtptaChatRoom', {
              navigation: navigation,
            });
            DeviceEventEmitter.addListener('goBack', setActiveTab);
          }}>
          <Image
            source={require('../assets/images/maingrp.jpg')}
            style={{
              width: responsiveWidth(10),
              height: responsiveWidth(10),
              borderRadius: responsiveWidth(10),
            }}
          />
          <Text style={styles.titleName}>WBTPTA AMTA WEST</Text>
        </TouchableOpacity>
        {user.question === 'admin' ? (
          <TouchableOpacity
            style={[
              styles.itemView,
              {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              },
            ]}
            onPress={() => {
              navigation.navigate('WbtptaWorkingChatRoom', {
                navigation: navigation,
              });
              DeviceEventEmitter.addListener('goBack', setActiveTab);
            }}>
            <Image
              source={require('../assets/images/workinggrp.jpg')}
              style={{
                width: responsiveWidth(10),
                height: responsiveWidth(10),
                borderRadius: responsiveWidth(10),
              }}
            />
            <Text style={styles.titleName}>WBTPTA WORKING GROUP</Text>
          </TouchableOpacity>
        ) : null}
        {user.circle === 'admin' ? (
          <TouchableOpacity
            style={[
              styles.itemView,
              {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              },
            ]}
            onPress={() => {
              navigation.navigate('WeFourGroup', {
                navigation: navigation,
              });
              DeviceEventEmitter.addListener('goBack', setActiveTab);
            }}>
            <Image
              source={require('../assets/images/we4grp.jpg')}
              style={{
                width: responsiveWidth(10),
                height: responsiveWidth(10),
                borderRadius: responsiveWidth(10),
              }}
            />
            <Text style={styles.titleName}>𝖂𝖊 կ𝖔𝖚𝖗</Text>
          </TouchableOpacity>
        ) : null}
        <Text style={[styles.title, {marginBottom: responsiveHeight(1)}]}>
          Chat With Users
        </Text>
        <View style={{marginBottom: responsiveHeight(6)}}>
          <AnimatedSeacrch
            value={name}
            placeholder={'Serch Teacher Name'}
            onChangeText={text => {
              setName(text);
              let newData = members.filter(el => {
                return el.tname.toLowerCase().match(text.toLowerCase());
              });

              setFilteredName(newData);
            }}
            func={() => {
              setFilteredName(members);
              setName('');
              setFirstData(0);
            }}
          />
        </View>

        <ScrollView style={{marginBottom: responsiveHeight(11)}}>
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
            {visibleItems < filteredName.length && (
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
          {filteredName.length > 0 ? (
            filteredName.slice(firstData, visibleItems).map((el, ind) => {
              return (
                <ScrollView key={ind}>
                  <TouchableOpacity
                    style={[
                      styles.itemView,
                      {
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                      },
                    ]}
                    onPress={() => {
                      navigation.navigate('ChatRoom', {
                        data: el,
                        navigation: navigation,
                      });
                      DeviceEventEmitter.addListener('goBack', setActiveTab);
                    }}>
                    <Image
                      source={{uri: el.url}}
                      style={{
                        width: responsiveWidth(10),
                        height: responsiveWidth(10),
                        borderRadius: responsiveWidth(10),
                      }}
                    />

                    <Text style={styles.titleName}> {el.tname}</Text>
                  </TouchableOpacity>
                </ScrollView>
              );
            })
          ) : (
            <Text style={styles.label}>Teacher Not Found</Text>
          )}
          <View
            style={{
              flexDirection: 'row',
              marginBottom: 5,
              alignSelf: 'center',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            {firstData >= 10 && visibleItems < filteredName.length && (
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
            {visibleItems < filteredName.length && (
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
      </ScrollView>
      <Loader visible={showLoader} />
      <Toast />
    </View>
  );
};

export default ChatList;

const styles = StyleSheet.create({
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
    textAlign: 'center',
    fontSize: responsiveFontSize(3),
    fontWeight: '700',
    color: THEME_COLOR,
  },
  titleName: {
    textAlign: 'center',
    fontSize: responsiveFontSize(2.6),
    fontWeight: '700',
    color: THEME_COLOR,
    paddingLeft: responsiveWidth(2),
  },
  itemView: {
    width: responsiveWidth(92),

    alignSelf: 'center',
    borderRadius: responsiveWidth(2),
    marginTop: responsiveHeight(0.5),
    marginBottom: responsiveHeight(0.5),
    padding: responsiveWidth(2),
    shadowColor: 'black',
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  label: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(1.5),
    fontWeight: '500',
    marginTop: responsiveHeight(0.2),
    color: THEME_COLOR,
    textAlign: 'center',
  },
});
