import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  DeviceEventEmitter,
  Linking,
  Alert,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {useIsFocused} from '@react-navigation/native';
import {THEME_COLOR} from '../utils/Colors';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {getDay, getFullYear, getMonthName} from '../modules/calculatefunctions';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import Loader from '../components/Loader';
import {downloadFile} from '../modules/downloadFile';
import ImageView from 'react-native-image-viewing';
import Pdf from 'react-native-pdf';
import CustomButton from '../components/CustomButton';
import AutoHeightImage from 'react-native-auto-height-image';
import {useGlobalContext} from '../context/Store';
const MemoDetails = () => {
  const isFocused = useIsFocused();
  const {stateObject} = useGlobalContext();
  let data = stateObject.data;
  const navigation = stateObject.navigation;
  const pdfRef = useRef();
  const [visible, setIsVisible] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [totalPage, setTotalPage] = useState(1);

  useEffect(() => {}, [isFocused, data]);

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
  }, []);

  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
      <ScrollView nestedScrollEnabled={true}>
        <TouchableOpacity
          style={{alignSelf: 'center'}}
          onPress={() => navigation.navigate('Home')}>
          <MaterialCommunityIcons
            name="home-circle"
            color={THEME_COLOR}
            size={30}
          />
        </TouchableOpacity>
        <View style={styles.itemView}>
          <Text style={styles.title}>{data.title}</Text>
        </View>
        <View
          style={[
            styles.dateView,
            {
              flexDirection: 'row',
              marginTop: responsiveHeight(1),
            },
          ]}>
          <Text style={styles.dropDownText}>
            Posted On: {getDay(data.date)}
          </Text>
          <Text style={styles.dropDownText}> {getMonthName(data.date)}</Text>
          <Text style={styles.dropDownText}> {getFullYear(data.date)}</Text>
        </View>

        <View style={styles.itemImageView}>
          {data.url ? (
            <ScrollView
              style={{marginTop: responsiveHeight(2)}}
              contentContainerStyle={{
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
              }}>
              {(data.type === 'image/jpeg' || data.type === 'image/png') && (
                <TouchableOpacity onPress={() => setIsVisible(true)}>
                  <AutoHeightImage
                    width={responsiveWidth(90)}
                    source={{uri: data.url}}
                    style={{
                      borderRadius: responsiveWidth(2),
                    }}
                  />
                </TouchableOpacity>
              )}
              {data.type === 'application/pdf' && (
                <View>
                  <Pdf
                    ref={pdfRef}
                    trustAllCerts={false}
                    source={{
                      uri: data.url,
                      cache: false,
                    }}
                    showsHorizontalScrollIndicator={true}
                    showsVerticalScrollIndicator={true}
                    enablePaging={true}
                    onLoadProgress={percent => {
                      console.log(percent);
                      setShowLoader(true);
                    }}
                    onLoadComplete={(numberOfPages, filePath) => {
                      console.log(`Number of pages: ${numberOfPages}`);
                      setShowLoader(false);

                      setShowLoader(false);
                    }}
                    onPageChanged={(page, numberOfPages) => {
                      console.log(`Current page: ${page}`);
                      setPageNo(page);
                      setTotalPage(numberOfPages);
                    }}
                    onError={error => {
                      console.log(error);
                    }}
                    onPressLink={async uri => {
                      console.log(`Link pressed: ${uri}`);

                      const supported = await Linking.canOpenURL(uri); //To check if URL is supported or not.
                      if (supported) {
                        await Linking.openURL(uri); // It will open the URL on browser.
                        console.log(uri);
                      } else {
                        Alert.alert(`Don't know how to open this URL: ${uri}`);
                      }
                    }}
                    style={{
                      flex: 1,
                      width: responsiveWidth(80),
                      height: responsiveHeight(60),
                      alignSelf: 'center',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  />
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: responsiveHeight(1),
                    }}>
                    <View>
                      {pageNo > 1 && (
                        <CustomButton
                          color={'orange'}
                          title={'Previous'}
                          onClick={() => {
                            pdfRef.current.setPage(pageNo - 1);
                          }}
                          size={'small'}
                          fontSize={14}
                        />
                      )}
                    </View>
                    {pageNo < totalPage && (
                      <View>
                        <CustomButton
                          title={'Next'}
                          onClick={() => {
                            pdfRef.current.setPage(pageNo + 1);
                          }}
                          size={'small'}
                          fontSize={14}
                        />
                      </View>
                    )}
                  </View>
                </View>
              )}
            </ScrollView>
          ) : (
            <Image
              source={require('../assets/images/memo.png')}
              style={{
                width: responsiveWidth(30),
                height: responsiveWidth(30),
                borderRadius: responsiveWidth(2),
              }}
            />
          )}
        </View>
        {data.url !== '' && (
          <TouchableOpacity
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
              margin: responsiveHeight(2),
            }}
            onPress={async () => await downloadFile(data.url, data.photoName)}>
            <MaterialIcons
              name="download-for-offline"
              color={'green'}
              size={30}
            />
            <Text style={[styles.text, {color: 'green'}]}>Download</Text>
          </TouchableOpacity>
        )}

        <View style={styles.itemView}>
          <Text style={styles.title}>{data.title}</Text>
        </View>
        <View style={styles.itemView}>
          <Text style={styles.title}>Memo Number</Text>
          <Text style={styles.title}>{data.memoNumber}</Text>
        </View>
        <View style={styles.itemView}>
          <Text style={styles.title}>Memo Date</Text>
          <Text style={styles.title}>{data.memoDate}</Text>
        </View>
        <View style={styles.itemView}>
          <Text style={styles.label}>{data.memoText}</Text>
        </View>
      </ScrollView>
      {data.type === 'image/jpeg' && (
        <ImageView
          images={[{uri: data.url}]}
          imageIndex={0}
          visible={visible}
          // presentationStyle={'overFullScreen'}
          onRequestClose={() => setIsVisible(false)}
          FooterComponent={() => {
            return (
              <TouchableOpacity
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignSelf: 'center',
                  marginTop: -responsiveHeight(95.5),
                  marginLeft: responsiveWidth(60),
                }}
                onPress={async () =>
                  await downloadFile(data.url, data.photoName)
                }>
                <MaterialIcons
                  name="download-for-offline"
                  color={'green'}
                  size={40}
                />
                <Text style={[styles.text, {color: 'white'}]}>Download</Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
      <Loader visible={showLoader} />
    </View>
  );
};

export default MemoDetails;

const styles = StyleSheet.create({
  title: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(3),
    fontWeight: '500',
    fontFamily: 'kalpurush',
    color: THEME_COLOR,
    textAlign: 'center',
  },
  label: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(3),
    fontWeight: '400',
    marginTop: responsiveHeight(0.3),
    color: THEME_COLOR,
    textAlign: 'center',
    fontFamily: 'kalpurush',
  },
  itemView: {
    width: responsiveWidth(92),
    backgroundColor: 'white',

    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: responsiveWidth(2),
    marginTop: responsiveHeight(1),
    marginBottom: responsiveHeight(1),
    padding: 5,
    shadowColor: 'black',
    elevation: 5,
  },
  itemImageView: {
    width: responsiveWidth(95),

    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: responsiveWidth(2),
    marginTop: responsiveHeight(1),
    marginBottom: responsiveHeight(1),
    padding: 5,
    shadowColor: 'black',
  },
  dateView: {
    width: responsiveWidth(92),
    backgroundColor: 'white',

    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: responsiveWidth(2),
    marginTop: responsiveHeight(0.3),
    marginBottom: responsiveHeight(0.3),
    paddingTop: responsiveHeight(1),
    paddingBottom: responsiveHeight(1),
    shadowColor: 'black',
    elevation: 5,
  },
  dateView2: {
    width: responsiveWidth(92),
    backgroundColor: 'white',

    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: responsiveWidth(2),
    marginTop: responsiveHeight(0.3),
    marginBottom: responsiveHeight(0.3),

    shadowColor: 'black',
  },
  dropDownText: {
    fontSize: responsiveFontSize(1.5),
    color: THEME_COLOR,
    alignSelf: 'center',
    textAlign: 'center',
  },
  text: {
    textAlign: 'center',
    fontSize: responsiveFontSize(1.5),
    fontWeight: '500',
    paddingLeft: responsiveWidth(5),
    paddingRight: responsiveWidth(5),
    color: THEME_COLOR,
    alignSelf: 'center',
  },
  modalView: {
    width: responsiveWidth(100),
    height: responsiveHeight(100),
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255,.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainView: {
    width: responsiveWidth(80),
    height: responsiveWidth(80),
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});
