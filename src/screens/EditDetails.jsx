import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  BackHandler,
  Switch,
  TouchableOpacity,
  DeviceEventEmitter,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useIsFocused} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import {THEME_COLOR} from '../utils/Colors';
import CustomTextInput from '../components/CustomTextInput';
import CustomButton from '../components/CustomButton';
import Toast from 'react-native-toast-message';
import Loader from '../components/Loader';
import {compareObjects} from '../modules/calculatefunctions';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import {useGlobalContext} from '../context/Store';
import axios from 'axios';

const EditDetails = () => {
  const isFocused = useIsFocused();
  const {state, teachersState, setTeachersState, stateObject} =
    useGlobalContext();
  const user = state.USER;
  const data = stateObject.data;
  const navigation = stateObject.navigation;
  const [editMember, setEditMember] = useState(data);
  const [disable, setDisable] = useState(true);
  const [bankData, setBankData] = useState({});
  const [showLoader, setShowLoader] = useState(false);
  const [isMale, setIsMale] = useState(false);
  const [isDesigEnabled, setIsDesigEnabled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isQuesAdmin, setIsQuesAdmin] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isHoi, setIsHoi] = useState(false);
  const [isInservice, setIsInservice] = useState(false);
  const [gp, setGp] = useState([
    {gp: 'AMORAGORI'},
    {gp: 'BKBATI'},
    {gp: 'GAZIPUR'},
    {gp: 'JHAMTIA'},
    {gp: 'JHIKIRA'},
    {gp: 'JOYPUR'},
    {gp: 'NOWPARA'},
    {gp: 'THALIA'},
  ]);
  const [unfgp, setUnfGp] = useState([
    {gp: 'AMORAGORI'},
    {gp: 'BKBATI'},
    {gp: 'GAZIPUR'},
    {gp: 'JHAMTIA'},
    {gp: 'JHIKIRA'},
    {gp: 'JOYPUR'},
    {gp: 'NOWPARA'},
    {gp: 'THALIA'},
  ]);
  const [isGpClicked, setIsGpClicked] = useState(false);
  const [selectedGP, setSelectedGP] = useState('Select GP Name');
  const ifsc_ser = () => {
    fetch(`https://ifsc.razorpay.com/${data.ifsc}`)
      .then(res => res.json())
      .then(data => setBankData(data));
  };
  const updateData = async () => {
    let equalObject = compareObjects(data, editMember);
    if (!equalObject) {
      const url = `https://awwbtpta.vercel.app/api/updself`;
      let response = await axios.post(url, editMember);
      let record = response.data;
      if (record.success) {
        setShowLoader(true);
        await firestore()
          .collection('teachers')
          .doc(editMember.id)
          .update(editMember)
          .then(async () => {
            let x = teachersState.filter(el => el.id !== editMember.id);
            x = [...x, editMember];
            const newData = x.sort(
              (a, b) => a.school.localeCompare(b.school) && b.rank > a.rank,
            );
            setTeachersState(newData);
            setShowLoader(false);
            showToast('success', 'Teacher Details Updated Successfully');
            navigation.navigate('Home');
          });
      } else {
        setShowLoader(false);
        showToast('error', 'Something Went Wrong!');
      }
    } else {
      showToast('error', 'Data is Same, No need to Update.');
      setDisable(true);
    }
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
    ifsc_ser();
    setEditMember(data);
    data?.desig === 'HT' ? setIsDesigEnabled(true) : setIsDesigEnabled(false);
    data?.gender === 'female' ? setIsMale(true) : setIsMale(false);
    data?.circle === 'admin' ? setIsAdmin(true) : setIsAdmin(false);
    data?.question === 'admin' ? setIsQuesAdmin(true) : setIsQuesAdmin(false);
    data?.disability === 'YES' ? setIsDisabled(true) : setIsDisabled(false);
    data?.hoi === 'Yes' ? setIsHoi(true) : setIsHoi(false);
    data?.service === 'inservice'
      ? setIsInservice(true)
      : setIsInservice(false);
    setGp(gp.map(el => el.gp === data?.gp));
    setSelectedGP(data.gp);
  }, [isFocused]);

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
  }, [isFocused]);
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>DETAILS OF {data.tname}</Text>
      <ScrollView
        style={{
          marginTop: responsiveHeight(2),
        }}>
        <Text style={styles.dataText}>Name</Text>
        <CustomTextInput
          placeholder={'Enter Member Name'}
          value={editMember.tname}
          onChangeText={text => {
            setDisable(false);
            setEditMember({...editMember, tname: text});
          }}
        />
        <Text style={styles.dataText}>Father's Name</Text>
        <CustomTextInput
          placeholder={"Enter Father's Name"}
          value={editMember.fname}
          onChangeText={text => {
            setDisable(false);
            setEditMember({...editMember, fname: text});
          }}
        />
        {user.circle === 'admin' ? (
          <>
            <Text style={styles.dataText}>Gender</Text>

            <View
              style={{
                flexDirection: 'row',
                alignSelf: 'center',
                marginTop: responsiveHeight(0.5),
                marginBottom: responsiveHeight(0.5),
              }}>
              <Text
                style={[styles.title, {paddingRight: responsiveWidth(1.5)}]}>
                Male
              </Text>
              <Switch
                trackColor={{false: '#767577', true: '#81b0ff'}}
                thumbColor={isMale ? '#f5dd4b' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => {
                  setIsMale(!isMale);
                  setDisable(false);
                  if (!isMale) {
                    setEditMember({...editMember, gender: 'female'});
                  } else {
                    setEditMember({...editMember, gender: 'male'});
                  }
                }}
                value={isMale}
              />

              <Text style={[styles.title, {paddingRight: 5}]}>Female</Text>
            </View>
            <Text style={styles.dataText}>UDISE</Text>
            <CustomTextInput
              placeholder={'Enter UDISE'}
              value={editMember.udise}
              onChangeText={text => {
                setDisable(false);
                setEditMember({...editMember, udise: text});
              }}
            />
            <Text style={styles.dataText}>Designation</Text>

            <View
              style={{
                flexDirection: 'row',
                alignSelf: 'center',
                marginTop: responsiveHeight(0.5),
                marginBottom: responsiveHeight(0.5),
              }}>
              <Text
                style={[styles.title, {paddingRight: responsiveWidth(1.5)}]}>
                AT
              </Text>
              <Switch
                trackColor={{false: '#767577', true: '#81b0ff'}}
                thumbColor={isDesigEnabled ? '#f5dd4b' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => {
                  setIsDesigEnabled(!isDesigEnabled);
                  setDisable(false);
                  if (!isDesigEnabled) {
                    setEditMember({...editMember, desig: 'HT'});
                  } else {
                    setEditMember({...editMember, desig: 'AT'});
                  }
                }}
                value={isDesigEnabled}
              />

              <Text style={[styles.title, {paddingRight: 5}]}>HT</Text>
            </View>
            {user.circle === 'admin' ? (
              <View>
                <Text style={styles.dataText}>Employee ID</Text>
                <CustomTextInput
                  placeholder={'Enter Employee ID'}
                  value={editMember.empid}
                  onChangeText={text => {
                    setDisable(false);
                    setEditMember({...editMember, empid: text});
                  }}
                />
              </View>
            ) : null}
            <Text style={styles.dataText}>Gram Panchayet</Text>

            <TouchableOpacity
              style={[styles.dropDownnSelector, {marginTop: 5}]}
              onPress={() => {
                setIsGpClicked(!isGpClicked);
                setSelectedGP('Select GP Name');
                setGp(unfgp);
              }}>
              {isGpClicked ? (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <Text
                    style={[
                      styles.dropDownText,
                      {paddingRight: responsiveWidth(2)},
                    ]}>
                    {selectedGP}
                  </Text>

                  <AntDesign name="up" size={30} color={THEME_COLOR} />
                </View>
              ) : (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <Text
                    style={[
                      styles.dropDownText,
                      {paddingRight: responsiveWidth(2)},
                    ]}>
                    {selectedGP}
                  </Text>

                  <AntDesign name="down" size={30} color={THEME_COLOR} />
                </View>
              )}
            </TouchableOpacity>
            {isGpClicked ? (
              <ScrollView style={styles.dropDowArea}>
                {gp.map((item, index) => {
                  return (
                    <TouchableOpacity
                      key={index}
                      style={styles.AdminName}
                      onPress={() => {
                        setIsGpClicked(false);
                        setSelectedGP(item.gp);
                        setGp(gp.filter(el => el.gp.match(item.gp)));
                        setEditMember({...editMember, gp: item.gp});
                        setDisable(false);
                      }}>
                      <Text style={styles.dropDownText}>{item.gp}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : null}
            <Text style={styles.dataText}>Training Status</Text>
            <CustomTextInput
              placeholder={'Enter Training Status'}
              value={editMember.training}
              onChangeText={text => {
                setDisable(false);
                setEditMember({...editMember, training: text});
              }}
            />
            <Text style={styles.dataText}>Association</Text>
            <CustomTextInput
              placeholder={'Enter Association'}
              value={editMember.association}
              onChangeText={text => {
                setDisable(false);
                setEditMember({...editMember, association: text});
              }}
            />
            <Text style={styles.dataText}>Teacher Search Name</Text>
            <CustomTextInput
              placeholder={'Enter Teacher Search Name'}
              value={editMember.tsname}
              onChangeText={text => {
                setDisable(false);
                setEditMember({...editMember, tsname: text});
              }}
            />
            <Text style={styles.dataText}>Access</Text>

            <View
              style={{
                flexDirection: 'row',
                alignSelf: 'center',
                marginTop: responsiveHeight(0.5),
                marginBottom: responsiveHeight(0.5),
              }}>
              <Text
                style={[styles.title, {paddingRight: responsiveWidth(1.5)}]}>
                Member
              </Text>
              <Switch
                trackColor={{false: '#767577', true: '#81b0ff'}}
                thumbColor={isAdmin ? '#f5dd4b' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => {
                  setIsAdmin(!isAdmin);
                  setDisable(false);
                  if (!isAdmin) {
                    setEditMember({...editMember, circle: 'admin'});
                  } else {
                    setEditMember({...editMember, circle: 'taw'});
                  }
                }}
                value={isAdmin}
              />

              <Text style={[styles.title, {paddingRight: 5}]}>Admin</Text>
            </View>
            <Text style={styles.dataText}>Question Access</Text>

            <View
              style={{
                flexDirection: 'row',
                alignSelf: 'center',
                marginTop: responsiveHeight(0.5),
                marginBottom: responsiveHeight(0.5),
              }}>
              <Text
                style={[styles.title, {paddingRight: responsiveWidth(1.5)}]}>
                Member
              </Text>
              <Switch
                trackColor={{false: '#767577', true: '#81b0ff'}}
                thumbColor={isQuesAdmin ? '#f5dd4b' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => {
                  setIsQuesAdmin(!isQuesAdmin);
                  setDisable(false);
                  if (!isQuesAdmin) {
                    setEditMember({...editMember, question: 'admin'});
                  } else {
                    setEditMember({...editMember, question: 'taw'});
                  }
                }}
                value={isQuesAdmin}
              />

              <Text style={[styles.title, {paddingRight: 5}]}>Admin</Text>
            </View>
            <Text style={styles.dataText}>Disability</Text>

            <View
              style={{
                flexDirection: 'row',
                alignSelf: 'center',
                marginTop: responsiveHeight(0.5),
                marginBottom: responsiveHeight(0.5),
              }}>
              <Text
                style={[styles.title, {paddingRight: responsiveWidth(1.5)}]}>
                NO
              </Text>
              <Switch
                trackColor={{false: '#767577', true: '#81b0ff'}}
                thumbColor={isDisabled ? '#f5dd4b' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => {
                  setIsDisabled(!isDisabled);
                  setDisable(false);
                  if (!isDisabled) {
                    setEditMember({...editMember, disability: 'YES'});
                  } else {
                    setEditMember({...editMember, disability: 'NO'});
                  }
                }}
                value={isDisabled}
              />

              <Text style={[styles.title, {paddingRight: 5}]}>YES</Text>
            </View>
            <Text style={styles.dataText}>IS HOI?</Text>

            <View
              style={{
                flexDirection: 'row',
                alignSelf: 'center',
                marginTop: responsiveHeight(0.5),
                marginBottom: responsiveHeight(0.5),
              }}>
              <Text
                style={[styles.title, {paddingRight: responsiveWidth(1.5)}]}>
                NO
              </Text>
              <Switch
                trackColor={{false: '#767577', true: '#81b0ff'}}
                thumbColor={isHoi ? '#f5dd4b' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => {
                  setIsHoi(!isHoi);
                  setDisable(false);
                  if (!isHoi) {
                    setEditMember({...editMember, hoi: 'Yes'});
                  } else {
                    setEditMember({...editMember, hoi: 'No'});
                  }
                }}
                value={isHoi}
              />

              <Text style={[styles.title, {paddingRight: 5}]}>YES</Text>
            </View>
            <Text style={styles.dataText}>Service Status</Text>

            <View
              style={{
                flexDirection: 'row',
                alignSelf: 'center',
                marginTop: responsiveHeight(0.5),
                marginBottom: responsiveHeight(0.5),
              }}>
              <Text
                style={[styles.title, {paddingRight: responsiveWidth(1.5)}]}>
                Retired
              </Text>
              <Switch
                trackColor={{false: '#767577', true: '#81b0ff'}}
                thumbColor={isInservice ? '#f5dd4b' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => {
                  setIsInservice(!isInservice);
                  setDisable(false);
                  if (!isInservice) {
                    setEditMember({...editMember, service: 'inservice'});
                  } else {
                    setEditMember({...editMember, service: 'retired'});
                  }
                }}
                value={isInservice}
              />

              <Text style={[styles.title, {paddingRight: 5}]}>In Service</Text>
            </View>
          </>
        ) : null}
        <Text style={styles.dataText}>Mobile</Text>
        <CustomTextInput
          placeholder={'Enter Mobile'}
          value={editMember.phone}
          type={'number-pad'}
          onChangeText={text => {
            setDisable(false);
            setEditMember({...editMember, phone: text});
          }}
        />
        <Text style={styles.dataText}>Email</Text>
        <CustomTextInput
          placeholder={'Enter Email'}
          value={editMember.email}
          type={'email-address'}
          onChangeText={text => {
            setDisable(false);
            setEditMember({...editMember, email: text});
          }}
        />
        <Text style={styles.dataText}>Date of Birth</Text>
        <CustomTextInput
          placeholder={'Enter Date of Birth'}
          value={editMember.dob}
          type={'number-pad'}
          onChangeText={text => {
            setDisable(false);
            setEditMember({...editMember, dob: text});
          }}
        />
        <Text style={styles.dataText}>Date of Joining</Text>
        <CustomTextInput
          placeholder={'Enter Date of Joining'}
          value={editMember.doj}
          type={'number-pad'}
          onChangeText={text => {
            setDisable(false);
            setEditMember({...editMember, doj: text});
          }}
        />
        <Text style={styles.dataText}>Date of Joining in Current School</Text>
        <CustomTextInput
          placeholder={'Enter Date of Joining in Current School'}
          value={editMember.dojnow}
          type={'number-pad'}
          onChangeText={text => {
            setDisable(false);
            setEditMember({...editMember, dojnow: text});
          }}
        />
        <Text style={styles.dataText}>Date of Retirement</Text>
        <CustomTextInput
          placeholder={'Enter Date of Retirement'}
          value={editMember.dor}
          type={'number-pad'}
          onChangeText={text => {
            setDisable(false);
            setEditMember({...editMember, dor: text});
          }}
        />

        <Text style={styles.dataText}>PAN</Text>
        <CustomTextInput
          placeholder={'Enter PAN'}
          value={editMember.pan}
          onChangeText={text => {
            setDisable(false);
            setEditMember({...editMember, pan: text});
          }}
        />
        <Text style={styles.dataText}>Address</Text>
        <CustomTextInput
          placeholder={'Enter Address'}
          value={editMember.address}
          multiline={true}
          size={'medium'}
          onChangeText={text => {
            setDisable(false);
            setEditMember({...editMember, address: text});
          }}
        />

        {user.circle === 'admin' ? (
          <View>
            <Text style={styles.dataText}>Bank</Text>
            <CustomTextInput
              placeholder={'Enter Bank'}
              value={editMember.bank}
              multiline={true}
              onChangeText={text => {
                setDisable(false);
                setEditMember({...editMember, bank: text});
              }}
            />
            <Text style={styles.dataText}>Account No</Text>
            <CustomTextInput
              placeholder={'Enter Account No'}
              value={editMember.account}
              multiline={true}
              onChangeText={text => {
                setDisable(false);
                setEditMember({...editMember, account: text});
              }}
            />
            <Text style={styles.dataText}>IFS Code</Text>
            <CustomTextInput
              placeholder={'Enter IFS Code'}
              value={editMember.ifsc}
              multiline={true}
              onChangeText={text => {
                setDisable(false);
                setEditMember({...editMember, ifsc: text});
                ifsc_ser(text.toUpperCase());
              }}
            />
            <View style={styles.dataView}>
              <Text style={styles.bankDataText}>
                Bank Name: {bankData.BANK}
              </Text>
              <Text style={styles.bankDataText}>Branch: {bankData.BRANCH}</Text>
              <Text style={styles.bankDataText}>
                Address: {bankData.ADDRESS}
              </Text>
              <Text style={styles.bankDataText}>MICR: {bankData.MICR}</Text>
            </View>
            <Text style={styles.dataText}>July BASIC</Text>
            <CustomTextInput
              placeholder={'Enter July BASIC'}
              value={editMember.basic.toString()}
              type={'number-pad'}
              onChangeText={text => {
                setDisable(false);
                setEditMember({...editMember, basic: parseInt(text)});
              }}
            />
            <Text style={styles.dataText}>July DA</Text>
            <CustomTextInput
              placeholder={'Enter July DA'}
              value={editMember.da.toString()}
              type={'number-pad'}
              onChangeText={text => {
                setDisable(false);
                setEditMember({...editMember, da: parseInt(text)});
              }}
            />
            <Text style={styles.dataText}>July HRA</Text>
            <CustomTextInput
              placeholder={'Enter July HRA'}
              value={editMember.hra.toString()}
              type={'number-pad'}
              onChangeText={text => {
                setDisable(false);
                setEditMember({...editMember, hra: parseInt(text)});
              }}
            />
            <Text style={styles.dataText}>July Gross</Text>
            <CustomTextInput
              placeholder={'Enter July Gross'}
              value={editMember.gross.toString()}
              type={'number-pad'}
              onChangeText={text => {
                setDisable(false);
                setEditMember({...editMember, gross: parseInt(text)});
              }}
            />
            <Text style={styles.dataText}>July Net Pay</Text>
            <CustomTextInput
              placeholder={'Enter July Net Pay'}
              value={editMember.netpay.toString()}
              type={'number-pad'}
              onChangeText={text => {
                setDisable(false);
                setEditMember({...editMember, netpay: parseInt(text)});
              }}
            />
            <Text style={styles.dataText}>June BASIC</Text>
            <CustomTextInput
              placeholder={'Enter June BASIC'}
              value={editMember.mbasic.toString()}
              type={'number-pad'}
              onChangeText={text => {
                setDisable(false);
                setEditMember({...editMember, mbasic: parseInt(text)});
              }}
            />
            <Text style={styles.dataText}>June DA</Text>
            <CustomTextInput
              placeholder={'Enter June DA'}
              value={editMember.mda.toString()}
              type={'number-pad'}
              onChangeText={text => {
                setDisable(false);
                setEditMember({...editMember, mda: parseInt(text)});
              }}
            />
            <Text style={styles.dataText}>June HRA</Text>
            <CustomTextInput
              placeholder={'Enter June HRA'}
              value={editMember.mhra.toString()}
              type={'number-pad'}
              onChangeText={text => {
                setDisable(false);
                setEditMember({...editMember, mhra: parseInt(text)});
              }}
            />
            <Text style={styles.dataText}>June Gross</Text>
            <CustomTextInput
              placeholder={'Enter June Gross'}
              value={editMember.mgross.toString()}
              type={'number-pad'}
              onChangeText={text => {
                setDisable(false);
                setEditMember({...editMember, mgross: parseInt(text)});
              }}
            />
            <Text style={styles.dataText}>June Net Pay</Text>
            <CustomTextInput
              placeholder={'Enter June Net Pay'}
              value={editMember.mnetpay.toString()}
              type={'number-pad'}
              onChangeText={text => {
                setDisable(false);
                setEditMember({...editMember, mnetpay: parseInt(text)});
              }}
            />
            <Text style={styles.dataText}>GPF</Text>
            <CustomTextInput
              placeholder={'Enter GPF'}
              value={editMember.gpf.toString()}
              type={'number-pad'}
              onChangeText={text => {
                setDisable(false);
                setEditMember({...editMember, gpf: parseInt(text)});
              }}
            />
            <Text style={styles.dataText}>Previous GPF</Text>
            <CustomTextInput
              placeholder={'Enter Previous GPF'}
              value={editMember.gpfprev.toString()}
              type={'number-pad'}
              onChangeText={text => {
                setDisable(false);
                setEditMember({...editMember, gpfprev: parseInt(text)});
              }}
            />
            <Text style={styles.dataText}>Additional</Text>
            <CustomTextInput
              placeholder={'Enter Additional'}
              value={editMember.addl.toString()}
              type={'number-pad'}
              onChangeText={text => {
                setDisable(false);
                setEditMember({...editMember, addl: parseInt(text)});
              }}
            />
            <Text style={styles.dataText}>Medical Allowance</Text>
            <CustomTextInput
              placeholder={'Enter Medical Allowance'}
              value={editMember.ma.toString()}
              type={'number-pad'}
              onChangeText={text => {
                setDisable(false);
                setEditMember({...editMember, ma: parseInt(text)});
              }}
            />
            <Text style={styles.dataText}>GSLI</Text>
            <CustomTextInput
              placeholder={'Enter GSLI'}
              value={editMember.gsli.toString()}
              type={'number-pad'}
              onChangeText={text => {
                setDisable(false);
                setEditMember({...editMember, gsli: parseInt(text)});
              }}
            />
            <Text style={styles.dataText}>Bonus</Text>
            <CustomTextInput
              placeholder={'Enter Bonus'}
              value={editMember.bonus.toString()}
              type={'number-pad'}
              onChangeText={text => {
                setDisable(false);
                setEditMember({...editMember, bonus: parseInt(text)});
              }}
            />
          </View>
        ) : null}
        <View style={{marginBottom: responsiveHeight(2)}}>
          <CustomButton
            title={'Update'}
            btnDisable={disable}
            onClick={updateData}
          />
          <CustomButton
            title={'Go Back'}
            color={'purple'}
            onClick={() => navigation.navigate('Home')}
          />
        </View>
      </ScrollView>
      <Loader visible={showLoader} />
      <Toast />
    </View>
  );
};

export default EditDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  heading: {
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
    fontSize: responsiveFontSize(2),
    color: THEME_COLOR,
    textAlign: 'center',
    marginTop: responsiveHeight(0.5),
  },
  bankDataText: {
    alignSelf: 'center',
    fontSize: 15,
    color: THEME_COLOR,
    textAlign: 'center',
    padding: 1,
  },
  dropDownnSelector: {
    width: responsiveWidth(60),
    height: responsiveHeight(7),
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
    width: responsiveWidth(60),

    borderRadius: responsiveWidth(2),
    marginTop: responsiveHeight(1),
    backgroundColor: '#fff',
    elevation: 5,
    alignSelf: 'center',
    marginBottom: responsiveHeight(1),
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
  desc: {
    textAlign: 'center',
    fontSize: responsiveFontSize(2.5),
    fontWeight: '500',
    paddingLeft: responsiveWidth(5),
    paddingRight: responsiveWidth(5),
    color: THEME_COLOR,
  },
});