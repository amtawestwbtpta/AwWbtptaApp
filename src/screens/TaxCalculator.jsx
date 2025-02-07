import {
  StyleSheet,
  Text,
  View,
  BackHandler,
  ScrollView,
  Switch,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {THEME_COLOR} from '../utils/Colors';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import CustomTextInput from '../components/CustomTextInput';
import {avoidNaN} from '../modules/calculatefunctions';
import {useGlobalContext} from '../context/Store';

const TaxCalculator = () => {
  const {setActiveTab} = useGlobalContext();
  const [inputField, setInputField] = useState({
    junebasic: 0,
    julybasic: 0,
    addl: 0,
    ph: 0,
    ma: 0,
    arrear: 0,
    bonus: 0,
    gpf: 0,
    gsli: 0,
    lic: 0,
    nsc: 0,
    ppf: 0,
    sukanya: 0,
    fd5y: 0,
    hbloan: 0,
    ihbloan: 0,
    tfee: 0,
    mediclaim: 0,
    tdisease: 0,
  });
  const [julyBasic, setJulyBasic] = useState(0);

  let junebasic = inputField.junebasic;
  let addl = inputField.addl;
  let ph = inputField.ph;
  let ma = inputField.ma;
  let arrear = inputField.arrear;
  let bonus = inputField.bonus;
  let gpf = inputField.gpf;
  let gsli = inputField.gsli;
  let lic = inputField.lic;
  let nsc = inputField.nsc;
  let ppf = inputField.ppf;
  let sukanya = inputField.sukanya;
  let fd5y = inputField.fd5y;
  let hbloan = inputField.hbloan;
  let ihbloan = inputField.ihbloan;
  let tfee = inputField.tfee;
  let mediclaim = inputField.mediclaim;
  let tdisease = inputField.tdisease;

  let RoundTo = (number, roundto) => roundto * Math.round(number / roundto);

  let getRndInteger = (min, max) =>
    Math.floor(Math.random() * (max - min)) + min;

  const [tgpf, setTgpf] = useState(0);
  const [mda, setMda] = useState(0);
  const [mhra, setMhra] = useState(0);
  const [mgross, setMgross] = useState(0);
  const [mptax, setMptax] = useState(0);
  const [mnetPay, setMnetPay] = useState(0);
  const [jda, setJda] = useState(0);
  const [incDa, setIncDa] = useState(0);
  const [jhra, setJhra] = useState(0);
  const [jgross, setJgross] = useState(0);
  const [jptax, setJptax] = useState(0);
  const [incPtax, setIncPtax] = useState(0);
  const [jnetPay, setJnetPay] = useState(0);
  const [incNetPay, setIncNetPay] = useState(0);
  const [gross, setGross] = useState(0);
  const [incGross, setIncGross] = useState(0);
  const [ptax, setPtax] = useState(0);
  const [tgross, setTgross] = useState(0);
  const rand = getRndInteger(1000, 3000);
  const [eightyc, setEightyc] = useState(0);
  const [eightyd, setEightyd] = useState(0);
  const [c80, setC80] = useState(0);
  const [phded, setPhded] = useState(0);

  const [totalTaxableIncome, setTotalTaxableIncome] = useState(0);
  const [slabCalculation, setSlabCalculation] = useState(0);

  const [isEnabled, setIsEnabled] = useState(false);

  const toggleSwitch = () => {
    setIsEnabled(!isEnabled);
    if (isEnabled) {
      setInputField({...inputField, ph: 0});
    } else {
      setInputField({...inputField, ph: 1});
    }
  };

  useEffect(() => {
    setJulyBasic(
      junebasic !== '' ? RoundTo(junebasic + junebasic * 0.03, 100) : '',
    );
    setTgpf(gpf > 0 ? gpf * 12 : 0);
    setMda(Math.round(junebasic * 0.1));
    setMhra(Math.round(junebasic * 0.12));
    setMgross(junebasic + addl + mda + mhra + ma);
    setMptax(
      ph === 1
        ? 0
        : mgross > 40000
        ? 200
        : mgross > 25000
        ? 150
        : mgross > 15000
        ? 130
        : mgross > 10000
        ? 110
        : 0,
    );

    setMnetPay(mgross - gpf - mptax - gsli);
    setJda(Math.round(julyBasic * 0.06));
    setIncDa(Math.round(julyBasic * 0.1));
    setJhra(Math.round(julyBasic * 0.12));
    setJgross(julyBasic + addl + jda + jhra + ma);
    setIncGross(julyBasic + addl + incDa + jhra + ma);
    setJptax(
      ph === 1
        ? 0
        : jgross > 40000
        ? 200
        : jgross > 25000
        ? 150
        : jgross > 15000
        ? 130
        : jgross > 10000
        ? 110
        : 0,
    );
    setIncPtax(
      ph === 1
        ? 0
        : incGross > 40000
        ? 200
        : incGross > 25000
        ? 150
        : incGross > 15000
        ? 130
        : incGross > 10000
        ? 110
        : 0,
    );
    setJnetPay(jgross - gpf - jptax - gsli);
    setIncNetPay(incGross - gpf - incPtax - gsli);
    setGross(mgross * 4 + jgross * 6 + incGross * 2);
    setPtax(mptax * 4 + jptax * 6 + incPtax * 2);
    setTgross(gross + arrear + bonus);
    setEightyc(
      gsli * 12 + lic + tgpf + nsc + ppf + sukanya + fd5y + hbloan + tfee,
    );
    setEightyd(mediclaim + tdisease + phded);
    setC80(eightyc > 150000 ? 150000 : eightyc);
    setPhded(ph === 1 ? 50000 : 0);
    setTotalTaxableIncome(
      RoundTo(
        tgross + rand - 50000 - ihbloan - ptax - c80 - eightyd - rand,
        10,
      ),
    );
    setSlabCalculation(
      totalTaxableIncome > 1000000
        ? Math.round(
            12500 + 100000 + ((totalTaxableIncome - 1000000) * 30) / 100,
          )
        : totalTaxableIncome > 500000
        ? Math.round(12500 + ((totalTaxableIncome - 500000) * 20) / 100)
        : totalTaxableIncome > 250000
        ? Math.round(((totalTaxableIncome - 250000) * 5) / 100)
        : totalTaxableIncome < 250000
        ? 'NIL'
        : null,
    );
  }, [
    inputField,
    mda,
    mhra,
    mgross,
    mptax,
    julyBasic,
    jda,
    jhra,
    jgross,
    jptax,
    gross,
    phded,
    eightyc,
    tgross,
    rand,
    ptax,
    c80,
    eightyd,
    totalTaxableIncome,
    tgpf,
    incDa,
    incGross,
    incPtax,
    incNetPay,
  ]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        setActiveTab(0);
        return true;
      },
    );
    return () => backHandler.remove();
  }, []);
  return (
    <View style={{flex: 1}}>
      <Text selectable style={styles.title}>
        Tax Calculator
      </Text>
      <ScrollView
        nestedScrollEnabled={true}
        contentContainerStyle={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
        style={{
          width: responsiveWidth(96),
          marginBottom: responsiveHeight(1),
        }}>
        <View>
          <Text selectable style={styles.label}>
            June Basic
          </Text>
          <CustomTextInput
            placeholder={'JUNE BASIC'}
            // value={inputField.junebasic.toString()}
            value={avoidNaN(inputField.junebasic).toString()}
            onChangeText={text => {
              setInputField({
                ...inputField,
                junebasic: parseInt(text),
                julybasic:
                  text !== ''
                    ? RoundTo(parseInt(text) + parseInt(text) * 0.03, 100)
                    : 0,
              });
            }}
          />
          <Text selectable style={styles.label}>
            July Basic
          </Text>
          <CustomTextInput
            placeholder={'July BASIC'}
            editable={false}
            // value={inputField.julybasic.toString()}
            value={avoidNaN(inputField.julybasic).toString()}
            onChangeText={text => {
              setInputField({...inputField, julybasic: parseInt(text)});
            }}
          />
          <Text selectable style={styles.label}>
            Additional Allowance
          </Text>
          <CustomTextInput
            placeholder={'Additional Allowance'}
            // value={inputField.addl.toString()}
            value={avoidNaN(inputField.addl).toString()}
            onChangeText={text => {
              setInputField({...inputField, addl: parseInt(text)});
            }}
          />
          <Text selectable style={styles.label}>
            Is Physically Chalanged ?
          </Text>

          <View
            style={{
              flexDirection: 'row',
              alignSelf: 'center',
              marginTop: responsiveHeight(1),
              marginBottom: responsiveHeight(1),
            }}>
            <Text
              selectable
              style={[styles.label, {paddingRight: responsiveWidth(1.5)}]}>
              No
            </Text>
            <Switch
              trackColor={{false: '#767577', true: '#81b0ff'}}
              thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleSwitch}
              // value={isEnabled}
              value={avoidNaN(inputField.julybasic).toString()}
            />
            <Text
              selectable
              style={[styles.label, {paddingLeft: responsiveWidth(1.5)}]}>
              Yes
            </Text>
          </View>
          <Text selectable style={styles.label}>
            Medical Allowance
          </Text>
          <CustomTextInput
            placeholder={'Medical Allowance'}
            // value={inputField.ma.toString()}
            value={avoidNaN(inputField.ma).toString()}
            onChangeText={text => {
              setInputField({...inputField, ma: parseInt(text)});
            }}
          />
          <Text selectable style={styles.label}>
            Arrear
          </Text>
          <CustomTextInput
            placeholder={'Arrear'}
            // value={inputField.arrear.toString()}
            value={avoidNaN(inputField.arrear).toString()}
            onChangeText={text => {
              setInputField({...inputField, arrear: parseInt(text)});
            }}
          />
          <Text selectable style={styles.label}>
            Bonus
          </Text>
          <CustomTextInput
            placeholder={'Bonus'}
            // value={inputField.bonus.toString()}
            value={avoidNaN(inputField.bonus).toString()}
            onChangeText={text => {
              setInputField({...inputField, bonus: parseInt(text)});
            }}
          />
          <Text selectable style={styles.label}>
            GPF
          </Text>
          <CustomTextInput
            placeholder={'GPF'}
            // value={inputField.gpf.toString()}
            value={avoidNaN(inputField.gpf).toString()}
            onChangeText={text => {
              setInputField({...inputField, gpf: parseInt(text)});
            }}
          />
          <Text selectable style={styles.label}>
            GSLI
          </Text>
          <CustomTextInput
            placeholder={'GSLI'}
            // value={inputField.gsli.toString()}
            value={avoidNaN(inputField.gsli).toString()}
            onChangeText={text => {
              setInputField({...inputField, gsli: parseInt(text)});
            }}
          />
          <Text selectable style={styles.label}>
            LIC
          </Text>
          <CustomTextInput
            placeholder={'LIC'}
            // value={inputField.lic.toString()}
            value={avoidNaN(inputField.lic).toString()}
            onChangeText={text => {
              setInputField({...inputField, lic: parseInt(text)});
            }}
          />
          <Text selectable style={styles.label}>
            NSC
          </Text>
          <CustomTextInput
            placeholder={'NSC'}
            // value={inputField.nsc.toString()}
            value={avoidNaN(inputField.nsc).toString()}
            onChangeText={text => {
              setInputField({...inputField, nsc: parseInt(text)});
            }}
          />
          <Text selectable style={styles.label}>
            PPF
          </Text>
          <CustomTextInput
            placeholder={'PPF'}
            // value={inputField.ppf.toString()}
            value={avoidNaN(inputField.ppf).toString()}
            onChangeText={text => {
              setInputField({...inputField, ppf: parseInt(text)});
            }}
          />
          <Text selectable style={styles.label}>
            Deposit in Sukanya Samriddhi Account
          </Text>
          <CustomTextInput
            placeholder={'Deposit in Sukanya Samriddhi Account'}
            // value={inputField.sukanya.toString()}
            value={avoidNaN(inputField.sukanya).toString()}
            onChangeText={text => {
              setInputField({...inputField, sukanya: parseInt(text)});
            }}
          />
          <Text selectable style={styles.label}>
            F.D.in Sch. Bank not less than 5 years
          </Text>
          <CustomTextInput
            placeholder={'F.D.in Sch. Bank not less than 5 years'}
            // value={inputField.sukanya.toString()}
            value={avoidNaN(inputField.fd5y).toString()}
            onChangeText={text => {
              setInputField({...inputField, fd5y: parseInt(text)});
            }}
          />
          <Text selectable style={styles.label}>
            Recovery of Principal Amount of House Building Loan
          </Text>
          <CustomTextInput
            placeholder={'Recovery of Principal Amount of House Building Loan'}
            // value={inputField.hbloan.toString()}
            value={avoidNaN(inputField.hbloan).toString()}
            onChangeText={text => {
              setInputField({...inputField, hbloan: parseInt(text)});
            }}
          />
          <Text selectable style={styles.label}>
            Interest On House Building Loan
          </Text>
          <CustomTextInput
            placeholder={'Interest On House Building Loan'}
            // value={inputField.ihbloan.toString()}
            value={avoidNaN(inputField.ihbloan).toString()}
            onChangeText={text => {
              setInputField({...inputField, ihbloan: parseInt(text)});
            }}
          />
          <Text selectable style={styles.label}>
            Tution Fees Maximum Rs. 1,00,000/- ( for two childern )
          </Text>
          <CustomTextInput
            placeholder={
              'Tution Fees Maximum Rs. 1,00,000/- ( for two childern )'
            }
            // value={inputField.tfee.toString()}
            value={avoidNaN(inputField.tfee).toString()}
            onChangeText={text => {
              setInputField({...inputField, tfee: parseInt(text)});
            }}
          />
          <Text selectable style={styles.label}>
            Medical Insurance Premium
          </Text>
          <CustomTextInput
            placeholder={'Medical Insurance Premium'}
            // value={inputField.mediclaim.toString()}
            value={avoidNaN(inputField.mediclaim).toString()}
            onChangeText={text => {
              setInputField({...inputField, mediclaim: parseInt(text)});
            }}
          />
          <Text selectable style={styles.label}>
            Medical treatment of dependent person with terminal Disease
          </Text>
          <CustomTextInput
            placeholder={
              'Medical treatment of dependent person with terminal Disease'
            }
            // value={inputField.tdisease.toString()}
            value={avoidNaN(inputField.tdisease).toString()}
            onChangeText={text => {
              setInputField({...inputField, tdisease: parseInt(text)});
            }}
          />
        </View>
        {inputField.junebasic > 0 ? (
          <View>
            <View
              style={{
                marginTop: responsiveHeight(1),
                marginBottom: responsiveHeight(1),
              }}>
              <Text selectable style={styles.label}>
                March to June Gross Salary: {mgross}
              </Text>
              <Text selectable style={styles.label}>
                June Net Salary: {mnetPay}
              </Text>
              <Text selectable style={styles.label}>
                July to December Gross Salary: {jgross}
              </Text>
              <Text selectable style={styles.label}>
                January to February Gross Salary: {incGross}
              </Text>
              <Text selectable style={styles.label}>
                July to December Net Salary: {jnetPay}
              </Text>
              <Text selectable style={styles.label}>
                January to February Net Salary: {incNetPay}
              </Text>
            </View>
            <Text selectable style={styles.title}>
              Calculated Tax Section
            </Text>
            <View
              style={{
                marginTop: responsiveHeight(1),
                marginBottom: responsiveHeight(1),
              }}>
              <Text selectable style={styles.label}>
                Gross Income: {tgross}
              </Text>
              <Text selectable style={styles.label}>
                Standard Deduction: 50000
              </Text>
              <Text selectable style={styles.label}>
                80C Deduction: {eightyc}
              </Text>
              <Text selectable style={styles.label}>
                80D Deduction: {eightyd}
              </Text>
            </View>
            <Text selectable style={styles.title}>
              Gross Income After Deduction: {totalTaxableIncome}
            </Text>
            {slabCalculation > 12500 ? (
              <View
                style={{
                  marginTop: responsiveHeight(1),
                  marginBottom: responsiveHeight(1),
                }}>
                <Text selectable style={styles.label}>
                  Total Tax Payable: {slabCalculation}
                </Text>
                <Text selectable style={styles.label}>
                  Health & Education Cess (4% of Total Tax):{' '}
                  {Math.round((slabCalculation * 4) / 100)}
                </Text>
              </View>
            ) : null}
            <Text selectable style={styles.title}>
              Net Tax Payable:{' '}
              {slabCalculation < 12500
                ? 'NIL'
                : slabCalculation + Math.round((slabCalculation * 4) / 100)}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

export default TaxCalculator;

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
});
