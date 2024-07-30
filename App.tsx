import {View, LogBox, KeyboardAvoidingView, Alert} from 'react-native';
import React, {useEffect} from 'react';
import {GlobalContextProvider} from './src/context/Store';
import AppNavigator from './src/navigation/AppNavigator';
import messaging from '@react-native-firebase/messaging';
import {
  notificationListener,
  onDisplayNotification,
  requestUserPermission,
} from './src/modules/notification';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

LogBox.ignoreAllLogs();
const App = () => {
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert(
        'New Notification From AWWBTPTA',
        `${remoteMessage.notification?.body}\n${remoteMessage.notification?.title}`,
      );

      onDisplayNotification(
        remoteMessage.notification?.title,
        remoteMessage.notification?.body,
      );
    });

    return unsubscribe;
  }, []);
  useEffect(() => {
    requestUserPermission();
    notificationListener();
  }, []);
  return (
    <GlobalContextProvider>
      <View style={{flex: 1}}>
        <GestureHandlerRootView style={{flex: 1}}>
          <KeyboardAvoidingView style={{flex: 1}}>
            <AppNavigator />
          </KeyboardAvoidingView>
        </GestureHandlerRootView>
      </View>
    </GlobalContextProvider>
  );
};

export default App;
