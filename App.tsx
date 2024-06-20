import {View, Text, LogBox, KeyboardAvoidingView} from 'react-native';
import React from 'react';
import {GlobalContextProvider} from './src/context/Store';
import AppNavigator from './src/navigation/AppNavigator';
LogBox.ignoreAllLogs();
const App = () => {
  return (
    <GlobalContextProvider>
      <View style={{flex: 1}}>
        <KeyboardAvoidingView style={{flex: 1}}>
          <AppNavigator />
        </KeyboardAvoidingView>
      </View>
    </GlobalContextProvider>
  );
};

export default App;
