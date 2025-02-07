/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
import {onDisplayNotification} from './src/modules/notification';
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
  onDisplayNotification(
    remoteMessage.notification.title,
    remoteMessage.notification.body,
  );
});
AppRegistry.registerComponent(appName, () => App);
