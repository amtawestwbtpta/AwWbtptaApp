import {
  BackHandler,
  DeviceEventEmitter,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import {THEME_COLOR} from '../utils/Colors';
import {GEMEINI_API_KEY} from '../modules/constants';
import {GoogleGenerativeAI} from '@google/generative-ai';
import CustomTextInput from '../components/CustomTextInput';
import CustomButton from '../components/CustomButton';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import AutoHeightImage from 'react-native-auto-height-image';
const genAl = new GoogleGenerativeAI(GEMEINI_API_KEY);
export default function AiChatBot() {
  const isFocused = useIsFocused();

  const navigation = useNavigation();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();
  const scrollToBottom = () => {
    scrollRef.current?.scrollToEnd({animated: true});
  };

  const handleSend = async () => {
    scrollToBottom();
    if (input.trim() !== '') {
      let msg = [...messages];
      const userMessage = {text: input, sender: 'user'};
      msg = [...msg, userMessage];
      setMessages(msg);
      setInput('');

      // Call Gemini AI chat API (replace with actual API endpoint)
      //   const response = await axios.post('YOUR_Gemini_API_ENDPOINT', { message: input });
      try {
        const response = await generateGeminiReply(input);
        if (response !== '') {
          const aiMessage = {
            text: response,
            sender: 'Gemini',
          };
          msg = [...msg, aiMessage];
          setMessages(msg);
        } else {
          toast.error('Error sending message to Gemini AI. Please try again.');
        }
      } catch (error) {
        console.error('Error sending message to Gemini AI: ', error);

        // If Gemini AI fails to respond, display a default message
        const defaultMessage = {
          text: "I'm sorry, I couldn't understand that. Please try again.",
          sender: 'Gemini',
        };
        setMessages([...messages, defaultMessage]);
      }
    }
  };
  const generateGeminiReply = async prompt => {
    try {
      const model = genAl.getGenerativeModel({model: 'gemini-pro'});
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      return response;
    } catch (error) {
      console.error('Error generating text:', error);
      return '';
    }
  };
  useEffect(() => {}, [messages]);
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
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
          alignItems: 'center',
          alignSelf: 'center',
        }}>
        <Text style={styles.title}>Ask Gemini </Text>
        <Text style={styles.bankDataText}>Powered By </Text>
        <AutoHeightImage
          width={responsiveWidth(15)}
          source={{
            uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Google_Gemini_logo.svg/320px-Google_Gemini_logo.svg.png',
          }}
        />
      </View>
      <ScrollView
        ref={scrollRef}
        style={{
          padding: responsiveWidth(2),
        }}>
        <View style={{marginVertical: responsiveHeight(2)}}>
          {messages.length > 0 && (
            <FlatList
              data={messages}
              renderItem={({item, index}) => (
                <View
                  key={index}
                  style={{
                    backgroundColor:
                      item.sender === 'user' ? 'cornsilk' : 'honeydew',
                    marginBottom: responsiveHeight(1),
                    padding: responsiveWidth(2),
                    borderRadius: responsiveWidth(3),
                  }}>
                  <Text selectable style={styles.bankDataText}>
                    {item.text}
                  </Text>
                </View>
              )}
            />
          )}
        </View>
      </ScrollView>
      <View
        style={{
          marginVertical: responsiveHeight(1),
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: responsiveWidth(95),
          paddingHorizontal: responsiveWidth(2),
        }}>
        <CustomTextInput
          style={styles.input}
          size={'medium'}
          value={input}
          onChangeText={text => setInput(text)}
          placeholder="Ask Gemini..."
        />

        <View style={{marginLeft: responsiveWidth(2)}}>
          <CustomButton
            size={'xsmall'}
            color={'green'}
            title={'Send'}
            onClick={handleSend}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  title: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(3),
    fontWeight: '500',
    color: THEME_COLOR,
    textAlign: 'center',
    padding: 5,
  },
  bottom: {
    marginBottom: responsiveHeight(8),
  },
  dataView: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: '#eee',
    marginTop: responsiveHeight(1),
    borderRadius: 10,
    padding: 10,
    width: responsiveWidth(90),
  },
  dataText: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(2),
    color: THEME_COLOR,
    textAlign: 'center',
    padding: 5,
  },
  bankDataText: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(1.5),
    color: THEME_COLOR,
    textAlign: 'center',
    padding: 1,
  },
  modalView: {
    flex: 1,

    width: responsiveWidth(90),
    height: responsiveWidth(30),
    padding: responsiveHeight(2),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  mainView: {
    width: responsiveWidth(90),
    height: responsiveHeight(30),
    padding: responsiveHeight(2),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: 'white',
    borderRadius: 10,

    backgroundColor: 'white',
    alignSelf: 'center',
  },
  label: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(2),
    fontWeight: '500',
    margin: responsiveHeight(1),
    color: THEME_COLOR,
    textAlign: 'center',
  },
});
