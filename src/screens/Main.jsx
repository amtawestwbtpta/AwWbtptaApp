import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  BackHandler,
  ScrollView,
} from 'react-native';
import React, {useState, useEffect, useCallback} from 'react';
import {useGlobalContext} from '../context/Store';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {THEME_COLOR} from '../utils/Colors';
import Dashboard from './Dashboard';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import TeachersDetails from './TeachersDetails';
import StudentTeacherData from './StudentTeacherData';
import ChangeUP from './ChangeUP';
import GPWiseSchoolData from './GPWiseSchoolData';
import RetirementDateCalculator from './RetirementDateCalculator';
import AgeCalculator from './AgeCalculator';
import RegComplain from './RegComplain';
import TaxCalculator from './TaxCalculator';
import ChatList from './ChatList';
import Notice from './Notice';
import Memo from './Memo';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import RNExitApp from 'react-native-exit-app';
import Modal from 'react-native-modal';
import Downloads from './Downloads';

const Main = () => {
  const {state, activeTab, setActiveTab} = useGlobalContext();

  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [isClicked, setIsClicked] = useState(false);
  const [textColor, setTextColor] = useState(THEME_COLOR);

  const AnimatedBtn = Animated.createAnimatedComponent(TouchableOpacity);

  const animatedBtn0X = useSharedValue(0);
  const animatedBtn05X = useSharedValue(0);
  const animatedBtn1X = useSharedValue(0);
  const animatedBtn2X = useSharedValue(0);
  const animatedBtn3X = useSharedValue(0);
  const animatedBtn4X = useSharedValue(0);
  const animatedBtn5X = useSharedValue(0);
  const animatedBtn6X = useSharedValue(0);
  const animatedBtn7X = useSharedValue(0);
  const animatedBtn8X = useSharedValue(0);
  const animatedBtn9X = useSharedValue(0);
  const animatedBtn10X = useSharedValue(0);
  const animatedBtn11X = useSharedValue(0);

  const animatedBtnStyle0 = useAnimatedStyle(() => {
    return {
      transform: [{translateX: animatedBtn0X.value}],
    };
  });
  const animatedBtnStyle05 = useAnimatedStyle(() => {
    return {
      transform: [{translateX: animatedBtn05X.value}],
    };
  });

  const animatedBtnStyle1 = useAnimatedStyle(() => {
    return {
      transform: [{translateX: animatedBtn1X.value}],
    };
  });

  const animatedBtnStyle2 = useAnimatedStyle(() => {
    return {
      transform: [{translateX: animatedBtn2X.value}],
    };
  });

  const animatedBtnStyle3 = useAnimatedStyle(() => {
    return {
      transform: [{translateX: animatedBtn3X.value}],
    };
  });

  const animatedBtnStyle4 = useAnimatedStyle(() => {
    return {
      transform: [{translateX: animatedBtn4X.value}],
    };
  });

  const animatedBtnStyle5 = useAnimatedStyle(() => {
    return {
      transform: [{translateX: animatedBtn5X.value}],
    };
  });

  const animatedBtnStyle6 = useAnimatedStyle(() => {
    return {
      transform: [{translateX: animatedBtn6X.value}],
    };
  });

  const animatedBtnStyle7 = useAnimatedStyle(() => {
    return {
      transform: [{translateX: animatedBtn7X.value}],
    };
  });

  const animatedBtnStyle8 = useAnimatedStyle(() => {
    return {
      transform: [{translateX: animatedBtn8X.value}],
    };
  });

  const animatedBtnStyle9 = useAnimatedStyle(() => {
    return {
      transform: [{translateX: animatedBtn9X.value}],
    };
  });
  const animatedBtnStyle10 = useAnimatedStyle(() => {
    return {
      transform: [{translateX: animatedBtn10X.value}],
    };
  });
  const animatedBtnStyle11 = useAnimatedStyle(() => {
    return {
      transform: [{translateX: animatedBtn11X.value}],
    };
  });

  useEffect(() => {
    if (activeTab === 0) {
      animatedBtn0X.value = withTiming(-responsiveWidth(50), {duration: 200});
      setTimeout(() => {
        animatedBtn0X.value = withTiming(0, {
          duration: 200,
        });
      }, 1000);
    } else if (activeTab === 0.5) {
      animatedBtn05X.value = withTiming(-responsiveWidth(50), {
        duration: 200,
      });
      setTimeout(() => {
        animatedBtn05X.value = withTiming(0, {
          duration: 200,
        });
      }, 1000);
    } else if (activeTab === 1) {
      animatedBtn1X.value = withTiming(-responsiveWidth(50), {duration: 200});
      setTimeout(() => {
        animatedBtn1X.value = withTiming(0, {
          duration: 200,
        });
      }, 1000);
    } else if (activeTab === 2) {
      animatedBtn2X.value = withTiming(-responsiveWidth(50), {duration: 200});
      setTimeout(() => {
        animatedBtn2X.value = withTiming(0, {
          duration: 200,
        });
      }, 1000);
    } else if (activeTab === 3) {
      animatedBtn3X.value = withTiming(-responsiveWidth(50), {duration: 200});
      setTimeout(() => {
        animatedBtn3X.value = withTiming(0, {
          duration: 200,
        });
      }, 1000);
    } else if (activeTab === 4) {
      animatedBtn4X.value = withTiming(-responsiveWidth(50), {duration: 200});
      setTimeout(() => {
        animatedBtn4X.value = withTiming(0, {
          duration: 200,
        });
      }, 1000);
    } else if (activeTab === 5) {
      animatedBtn5X.value = withTiming(-responsiveWidth(50), {duration: 200});
      setTimeout(() => {
        animatedBtn5X.value = withTiming(0, {
          duration: 200,
        });
      }, 1000);
    } else if (activeTab === 6) {
      animatedBtn6X.value = withTiming(-responsiveWidth(50), {duration: 200});
      setTimeout(() => {
        animatedBtn6X.value = withTiming(0, {
          duration: 200,
        });
      }, 1000);
    } else if (activeTab === 7) {
      animatedBtn7X.value = withTiming(-responsiveWidth(50), {duration: 200});
      setTimeout(() => {
        animatedBtn7X.value = withTiming(0, {
          duration: 200,
        });
      }, 1000);
    } else if (activeTab === 8) {
      animatedBtn8X.value = withTiming(-responsiveWidth(50), {duration: 200});
      setTimeout(() => {
        animatedBtn8X.value = withTiming(0, {
          duration: 200,
        });
      }, 1000);
    } else if (activeTab === 9) {
      animatedBtn9X.value = withTiming(-responsiveWidth(50), {duration: 200});
      setTimeout(() => {
        animatedBtn9X.value = withTiming(0, {
          duration: 200,
        });
      }, 1000);
    } else if (activeTab === 10) {
      animatedBtn10X.value = withTiming(-responsiveWidth(50), {duration: 200});
      setTimeout(() => {
        animatedBtn10X.value = withTiming(0, {
          duration: 200,
        });
      }, 1000);
    } else if (activeTab === 11) {
      animatedBtn11X.value = withTiming(-responsiveWidth(50), {duration: 200});
      setTimeout(() => {
        animatedBtn11X.value = withTiming(0, {
          duration: 200,
        });
      }, 1000);
    } else {
    }
  }, [activeTab]);

  const refresh = async () => {
    setActiveTab(0);
  };

  useEffect(() => {
    if (!state) {
      navigation.navigate('Login');
    }
    // refresh();
  }, [isFocused]);
  // const backAction = () => {
  //   Alert.alert('Hold On!', 'Are You Sure To Exit App?', [
  //     {
  //       text: 'Cancel',
  //       onPress: () => null,
  //       style: 'cancel',
  //     },
  //     {
  //       text: 'Exit',
  //       onPress: () => RNExitApp.exitApp(),
  //     },
  //   ]);
  //   return true;
  // };

  const [backPressCount, setBackPressCount] = useState(0);

  const handleBackPress = useCallback(() => {
    if (backPressCount === 0) {
      setBackPressCount(prevCount => prevCount + 1);
      setTimeout(() => setBackPressCount(0), 2000);
    } else if (backPressCount === 1) {
      RNExitApp.exitApp();
    }
    return true;
  }, [backPressCount]);

  useEffect(() => {
    const backListener = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );
    return backListener.remove;
  }, [handleBackPress]);
  // useEffect(() => {
  //   const backHandler = BackHandler.addEventListener(
  //     'hardwareBackPress',
  //     backAction,
  //   );
  //   return () => backHandler.remove();
  // }, []);
  useEffect(() => {}, [isClicked, textColor]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View
          style={{
            justifyContent: 'space-between',
            alignItems: 'center',
            alignSelf: 'center',
            flexDirection: 'row',
            marginLeft: -responsiveWidth(12),
          }}>
          <TouchableOpacity onPress={() => refresh()}>
            <Image
              source={require('../assets/images/logosq.png')}
              style={{
                width: responsiveWidth(30),
                height: responsiveWidth(30),
                transform: [
                  {scale: 0.3},
                  {translateY: -responsiveHeight(7)},
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
                {scale: 1.5},
                {scaleY: 1.3},
                {translateY: -responsiveHeight(0.8)},
                {translateX: -responsiveHeight(2.5)},
              ],
              color: 'white',
              paddingLeft: responsiveWidth(5),
            }}>
            আমতা পশ্চিম চক্র
          </Text>
          <TouchableOpacity
            style={{
              transform: [
                {scale: 1.5},
                // {scaleY: 1.5},
                {translateY: -responsiveHeight(1.2)},
                {translateX: responsiveHeight(2.5)},
              ],
            }}
            onPress={() => setIsClicked(!isClicked)}>
            <AntDesign
              name={!isClicked ? 'menu-unfold' : 'menu-fold'}
              size={15}
              color={'white'}
            />
            <Text
              style={[
                styles.bottomText,
                {color: 'white', fontSize: responsiveFontSize(0.7)},
              ]}>
              Menu
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View
        style={{
          flex: 1,
          marginTop: responsiveHeight(10),

          alignSelf: 'center',
        }}>
        {activeTab === 0 ? (
          <Dashboard />
        ) : activeTab === 0.5 ? (
          <Notice />
        ) : activeTab === 11 ? (
          <Memo />
        ) : activeTab === 1 ? (
          <TeachersDetails />
        ) : activeTab === 2 ? (
          <StudentTeacherData />
        ) : activeTab === 3 ? (
          <GPWiseSchoolData />
        ) : activeTab === 4 ? (
          <RetirementDateCalculator />
        ) : activeTab === 5 ? (
          <AgeCalculator />
        ) : activeTab === 6 ? (
          <TaxCalculator />
        ) : activeTab === 7 ? (
          <RegComplain />
        ) : activeTab === 8 ? (
          <ChangeUP />
        ) : activeTab === 9 ? (
          <ChatList />
        ) : activeTab === 10 ? (
          <Downloads />
        ) : null}
      </View>
      <Modal
        visible={isClicked}
        transparent
        onBackdropPress={() => {
          setIsClicked(false);
        }}
        onRequestClose={() => {
          setIsClicked(false);
        }}
        animationIn={'slideLeft'}
        animationOut={'slideRight'}
        animationInTiming={500}
        animationOutTiming={500}
        onSwipeComplete={() => setIsClicked(!isClicked)}
        swipeDirection="right">
        <View
          style={[
            styles.modalView,
            {width: !isClicked ? responsiveWidth(10) : responsiveWidth(20)},
          ]}>
          <View
            style={{
              position: 'absolute',
              top: responsiveHeight(3),
              right: responsiveWidth(0),
              elevation: !isClicked ? 0 : 5,
              backgroundColor: !isClicked ? 'transparent' : 'white',
              borderRadius: responsiveWidth(2),
              height: responsiveHeight(86),
              width: !isClicked ? responsiveWidth(10) : responsiveWidth(20),
              justifyContent: 'center',
              alignItems: 'center',
              opacity: isClicked ? 1 : 0.2,
            }}>
            {isClicked ? (
              <View
                style={{
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                  padding: responsiveWidth(2),

                  padding: responsiveWidth(2),
                }}>
                <ScrollView>
                  <View>
                    <AnimatedBtn
                      style={[styles.bottomBtn, animatedBtnStyle0]}
                      onPress={() => {
                        setActiveTab(0);

                        setTimeout(() => {
                          setIsClicked(false);
                        }, 1000);
                      }}>
                      <MaterialCommunityIcons
                        name="view-dashboard"
                        size={15}
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
                    </AnimatedBtn>
                    <AnimatedBtn
                      style={[styles.bottomBtn, animatedBtnStyle05]}
                      onPress={() => {
                        setActiveTab(0.5);

                        setTimeout(() => {
                          setIsClicked(false);
                        }, 1000);
                      }}>
                      <AntDesign
                        name="notification"
                        size={15}
                        color={activeTab == 0.5 ? 'purple' : THEME_COLOR}
                      />
                      <Text
                        selectable
                        style={[
                          styles.bottomText,
                          {color: activeTab == 0.5 ? 'purple' : THEME_COLOR},
                        ]}>
                        Notices
                      </Text>
                    </AnimatedBtn>
                    <AnimatedBtn
                      onPress={() => {
                        setActiveTab(11);

                        setTimeout(() => {
                          setIsClicked(false);
                        }, 1000);
                      }}
                      style={[styles.bottomBtn, animatedBtnStyle11]}>
                      <Entypo
                        name="newsletter"
                        size={15}
                        color={activeTab == 11 ? 'purple' : THEME_COLOR}
                      />
                      <Text
                        selectable
                        style={[
                          styles.bottomText,
                          {
                            color: activeTab == 11 ? 'purple' : THEME_COLOR,
                            textAlign: 'center',
                          },
                        ]}>
                        Memos
                      </Text>
                    </AnimatedBtn>
                    <AnimatedBtn
                      style={[styles.bottomBtn, animatedBtnStyle1]}
                      onPress={() => {
                        setActiveTab(1);

                        setTimeout(() => {
                          setIsClicked(false);
                        }, 1000);
                      }}>
                      <MaterialCommunityIcons
                        name="account-search"
                        size={15}
                        color={activeTab == 1 ? 'purple' : THEME_COLOR}
                      />
                      <Text
                        selectable
                        style={[
                          styles.bottomText,
                          {color: activeTab == 1 ? 'purple' : THEME_COLOR},
                        ]}>
                        Teachers
                      </Text>
                    </AnimatedBtn>
                    <AnimatedBtn
                      style={[styles.bottomBtn, animatedBtnStyle2]}
                      onPress={() => {
                        setActiveTab(2);

                        setTimeout(() => {
                          setIsClicked(false);
                        }, 1000);
                      }}>
                      <Image
                        source={require('../assets/images/ratio.png')}
                        style={{
                          width: !isClicked ? 0 : responsiveWidth(5),
                          height: !isClicked ? 0 : responsiveWidth(5),
                          tintColor: activeTab == 2 ? 'purple' : THEME_COLOR,
                        }}
                      />
                      <Text
                        selectable
                        style={[
                          styles.bottomText,
                          {color: activeTab == 2 ? 'purple' : THEME_COLOR},
                        ]}>
                        S/T Ratio
                      </Text>
                    </AnimatedBtn>
                    <AnimatedBtn
                      onPress={() => {
                        setActiveTab(3);

                        setTimeout(() => {
                          setIsClicked(false);
                        }, 1000);
                      }}
                      style={[styles.bottomBtn, animatedBtnStyle3]}>
                      <MaterialCommunityIcons
                        name="map-marker-distance"
                        size={15}
                        color={activeTab == 3 ? 'purple' : THEME_COLOR}
                      />
                      <Text
                        selectable
                        style={[
                          styles.bottomText,
                          {
                            color: activeTab == 3 ? 'purple' : THEME_COLOR,
                            textAlign: 'center',
                          },
                        ]}>
                        GP Data
                      </Text>
                    </AnimatedBtn>
                    <AnimatedBtn
                      onPress={() => {
                        setActiveTab(4);

                        setTimeout(() => {
                          setIsClicked(false);
                        }, 1000);
                      }}
                      style={[styles.bottomBtn, animatedBtnStyle4]}>
                      <MaterialCommunityIcons
                        name="calendar-account"
                        size={15}
                        color={activeTab == 4 ? 'purple' : THEME_COLOR}
                      />
                      <Text
                        selectable
                        style={[
                          styles.bottomText,
                          {
                            color: activeTab == 4 ? 'purple' : THEME_COLOR,
                            textAlign: 'center',
                          },
                        ]}>
                        {`Retirement\nCalculator`}
                      </Text>
                    </AnimatedBtn>
                    <AnimatedBtn
                      onPress={() => {
                        setActiveTab(5);

                        setTimeout(() => {
                          setIsClicked(false);
                        }, 1000);
                      }}
                      style={[styles.bottomBtn, animatedBtnStyle5]}>
                      <MaterialCommunityIcons
                        name="face-agent"
                        size={15}
                        color={activeTab == 5 ? 'purple' : THEME_COLOR}
                      />
                      <Text
                        selectable
                        style={[
                          styles.bottomText,
                          {
                            color: activeTab == 5 ? 'purple' : THEME_COLOR,
                            textAlign: 'center',
                          },
                        ]}>
                        {`Age\nCalculator`}
                      </Text>
                    </AnimatedBtn>
                    <AnimatedBtn
                      onPress={() => {
                        setActiveTab(6);

                        setTimeout(() => {
                          setIsClicked(false);
                        }, 1000);
                      }}
                      style={[styles.bottomBtn, animatedBtnStyle6]}>
                      <Image
                        source={require('../assets/images/tax.png')}
                        style={{
                          width: !isClicked ? 0 : responsiveWidth(5),
                          height: !isClicked ? 0 : responsiveWidth(5),
                          tintColor: activeTab == 6 ? 'purple' : THEME_COLOR,
                        }}
                      />
                      <Text
                        selectable
                        style={[
                          styles.bottomText,
                          {
                            color: activeTab == 6 ? 'purple' : THEME_COLOR,
                            textAlign: 'center',
                          },
                        ]}>
                        {`Tax\nCalculator`}
                      </Text>
                    </AnimatedBtn>
                    <AnimatedBtn
                      onPress={() => {
                        setActiveTab(7);

                        setTimeout(() => {
                          setIsClicked(false);
                        }, 1000);
                      }}
                      style={[styles.bottomBtn, animatedBtnStyle7]}>
                      <MaterialIcons
                        name="report-problem"
                        size={15}
                        color={activeTab == 7 ? 'purple' : THEME_COLOR}
                      />
                      <Text
                        selectable
                        style={[
                          styles.bottomText,
                          {
                            color: activeTab == 7 ? 'purple' : THEME_COLOR,
                            textAlign: 'center',
                          },
                        ]}>
                        Complain
                      </Text>
                    </AnimatedBtn>
                    <AnimatedBtn
                      onPress={() => {
                        setActiveTab(8);

                        setTimeout(() => {
                          setIsClicked(false);
                        }, 1000);
                      }}
                      style={[styles.bottomBtn, animatedBtnStyle8]}>
                      <FontAwesome6
                        name="user-gear"
                        size={15}
                        color={activeTab == 8 ? 'purple' : THEME_COLOR}
                      />
                      <Text
                        selectable
                        style={[
                          styles.bottomText,
                          {
                            color: activeTab == 8 ? 'purple' : THEME_COLOR,
                            textAlign: 'center',
                          },
                        ]}>
                        User U & P
                      </Text>
                    </AnimatedBtn>

                    <AnimatedBtn
                      onPress={() => {
                        setActiveTab(9);

                        setTimeout(() => {
                          setIsClicked(false);
                        }, 1000);
                      }}
                      style={[styles.bottomBtn, animatedBtnStyle9]}>
                      <Ionicons
                        name="chatbubble-ellipses-sharp"
                        size={15}
                        color={activeTab == 9 ? 'purple' : THEME_COLOR}
                      />
                      <Text
                        selectable
                        style={[
                          styles.bottomText,
                          {
                            color: activeTab == 9 ? 'purple' : THEME_COLOR,
                            textAlign: 'center',
                          },
                        ]}>
                        Chat
                      </Text>
                    </AnimatedBtn>
                    <AnimatedBtn
                      onPress={() => {
                        setActiveTab(10);

                        setTimeout(() => {
                          setIsClicked(false);
                        }, 1000);
                      }}
                      style={[styles.bottomBtn, animatedBtnStyle10]}>
                      <Entypo
                        name="download"
                        size={15}
                        color={activeTab == 10 ? 'purple' : THEME_COLOR}
                      />
                      <Text
                        selectable
                        style={[
                          styles.bottomText,
                          {
                            color: activeTab == 10 ? 'purple' : THEME_COLOR,
                            textAlign: 'center',
                          },
                        ]}>
                        Downloads
                      </Text>
                    </AnimatedBtn>

                    <TouchableOpacity
                      style={styles.bottomBtn}
                      onPress={() => setIsClicked(false)}>
                      <Ionicons
                        name="chevron-forward-sharp"
                        size={responsiveFontSize(4)}
                        color={'green'}
                      />
                      <Text
                        selectable
                        style={[
                          styles.bottomText,
                          {
                            color: 'darkgreen',
                            textAlign: 'center',
                          },
                        ]}>
                        Close Bar
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.bottomBtn}
                      onPress={() => {

                        setTimeout(() => {
                          setIsClicked(false);
                        }, 1000);
                      }}>
                      <MaterialCommunityIcons
                        name="power"
                        size={responsiveFontSize(3)}
                        color={'red'}
                      />
                      <Text
                        selectable
                        style={{color: 'red', fontWeight: 'bold'}}>
                        Exit App
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            ) : (
              <TouchableOpacity
                style={{
                  marginTop: responsiveHeight(63),
                }}
                onPress={() => {
                  setIsClicked(true);
                }}>
                <Ionicons
                  name="chevron-back-sharp"
                  size={60}
                  color={'darkgreen'}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
      {!isClicked && (
        <TouchableOpacity
          style={{
            width: responsiveWidth(20),
            height: responsiveWidth(20),
            position: 'absolute',
            right: -responsiveWidth(10),
            top: responsiveHeight(79),
            opacity: 0.5,
          }}
          onPress={() => {
            setIsClicked(true);
          }}>
          <AntDesign name={'menu-unfold'} size={20} color={THEME_COLOR} />
          <Text
            style={[
              styles.bottomText,
              {color: THEME_COLOR, fontSize: responsiveFontSize(1.5),marginLeft:-responsiveWidth(15)},
            ]}>
            Menu
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Main;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
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
  header: {
    position: 'absolute',
    width: responsiveWidth(100),
    height: responsiveHeight(8.5),
    backgroundColor: THEME_COLOR,
    elevation: 5,
    shadowColor: 'black',
    borderBottomLeftRadius: responsiveWidth(3),
    borderBottomRightRadius: responsiveWidth(3),
    padding: responsiveHeight(0.5),
    marginBottom: responsiveHeight(2),
  },
  title: {
    textAlign: 'center',
    fontSize: responsiveFontSize(3),
    fontWeight: '200',
    paddingLeft: responsiveWidth(5),
    paddingRight: responsiveWidth(5),
    color: 'white',
    fontFamily: 'Times New Roman',
  },
  bottomBtn: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: responsiveHeight(1),
  },
  modalView: {
    height: responsiveHeight(82),
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    right: -responsiveWidth(5),
    top: responsiveHeight(5),
  },
  mainView: {
    width: responsiveWidth(100),
    borderRadius: 10,
    padding: responsiveWidth(5),
  },
});
