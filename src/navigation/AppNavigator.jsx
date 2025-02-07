import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import Splash from '../screens/Splash';
import Login from '../screens/Login';
import Home from '../screens/Home';
import SignOut from '../screens/SignOut';
import ChangePhoto from '../screens/ChangePhoto';
import Signup from '../screens/Signup';
import OTPForm from '../screens/OTPForm';
import ViewDetails from '../screens/ViewDetails';
import EditDetails from '../screens/EditDetails';
import RegUsers from '../screens/RegUsers';
import ComplainDetails from '../screens/ComplainDetails';
import QuestionSection from '../screens/QuestionSection';
import Accounts from '../screens/Accounts';
import ChatRoom from '../screens/ChatRoom';
import NoticeDetails from '../screens/NoticeDetails';
import AllTeachersSalary from '../screens/AllTeachersSalary';
import ExitApp from '../screens/ExitApp';
import AllQuestionData from '../screens/AllQuestionData';
import VideoPlayer from '../components/VideoPlayer';
import UpdateSlides from '../screens/UpdateSlides';
import WbtptaChatRoom from '../screens/WbtptaChatRoom';
import WbtptaWorkingChatRoom from '../screens/WbtptaWorkingChatRoom';
import WeFourGroup from '../screens/WeFourGroup';
import MemoDetails from '../screens/MemoDetails';
import TokensView from '../screens/TokensView';
import TeacherServiceLife from '../screens/TeacherServiceLife';
import YearwiseTeachers from '../screens/YearwiseTeachers';
import QuestionRequisition from '../screens/QuestionRequisition';
import UserLoacation from '../screens/UserLoacation';
import Retirement from '../screens/Retirement';

const Stack = createNativeStackNavigator();
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Splash"
          component={Splash}
          options={{headerShown: false, drawerItemStyle: {height: 0}}}
        />
        <Stack.Screen
          name="Login"
          component={Login}
          options={{headerShown: false, drawerItemStyle: {height: 0}}}
        />
        <Stack.Screen
          name="Signup"
          component={Signup}
          options={{headerShown: false, drawerItemStyle: {height: 0}}}
        />
        <Stack.Screen
          name="Home"
          component={Home}
          options={{headerShown: false, drawerItemStyle: {height: 0}}}
        />
        <Stack.Screen
          name="SignOut"
          component={SignOut}
          options={{headerShown: false, drawerItemStyle: {height: 0}}}
        />
        <Stack.Screen
          name="ExitApp"
          component={ExitApp}
          options={{headerShown: false, drawerItemStyle: {height: 0}}}
        />
        <Stack.Screen
          name="ChangePhoto"
          component={ChangePhoto}
          options={{headerShown: false, drawerItemStyle: {height: 0}}}
        />
        <Stack.Screen
          name="OTPForm"
          component={OTPForm}
          options={{headerShown: false, drawerItemStyle: {height: 0}}}
        />
        <Stack.Screen
          name="ViewDetails"
          component={ViewDetails}
          options={{headerShown: false, drawerItemStyle: {height: 0}}}
        />
        <Stack.Screen
          name="NoticeDetails"
          component={NoticeDetails}
          options={{headerShown: false, drawerItemStyle: {height: 0}}}
        />
        <Stack.Screen
          name="MemoDetails"
          component={MemoDetails}
          options={{headerShown: false, drawerItemStyle: {height: 0}}}
        />

        <Stack.Screen
          name="VideoPlayer"
          component={VideoPlayer}
          options={{headerShown: false, drawerItemStyle: {height: 0}}}
        />
        <Stack.Screen
          name="EditDetails"
          component={EditDetails}
          options={{headerShown: false, drawerItemStyle: {height: 0}}}
        />
        <Stack.Screen
          name="RegUsers"
          component={RegUsers}
          options={{headerShown: false, drawerItemStyle: {height: 0}}}
        />
        <Stack.Screen
          name="AllTeachersSalary"
          component={AllTeachersSalary}
          options={{headerShown: false, drawerItemStyle: {height: 0}}}
        />
        <Stack.Screen
          name="ComplainDetails"
          component={ComplainDetails}
          options={{headerShown: false, drawerItemStyle: {height: 0}}}
        />
        <Stack.Screen
          name="QuestionSection"
          component={QuestionSection}
          options={{headerShown: false, drawerItemStyle: {height: 0}}}
        />
        <Stack.Screen
          name="QuestionRequisition"
          component={QuestionRequisition}
          options={{headerShown: false, drawerItemStyle: {height: 0}}}
        />
        <Stack.Screen
          name="TokensView"
          component={TokensView}
          options={{headerShown: false, drawerItemStyle: {height: 0}}}
        />
        <Stack.Screen
          name="UserLoacation"
          component={UserLoacation}
          options={{headerShown: false, drawerItemStyle: {height: 0}}}
        />
        <Stack.Screen
          name="AllQuestionData"
          component={AllQuestionData}
          options={{headerShown: false, drawerItemStyle: {height: 0}}}
        />
        <Stack.Screen
          name="UpdateSlides"
          component={UpdateSlides}
          options={{headerShown: false, drawerItemStyle: {height: 0}}}
        />
        <Stack.Screen
          name="Accounts"
          component={Accounts}
          options={{headerShown: false, drawerItemStyle: {height: 0}}}
        />
        <Stack.Screen
          name="TeacherServiceLife"
          component={TeacherServiceLife}
          options={{headerShown: false, drawerItemStyle: {height: 0}}}
        />
        <Stack.Screen
          name="YearwiseTeachers"
          component={YearwiseTeachers}
          options={{headerShown: false, drawerItemStyle: {height: 0}}}
        />
        <Stack.Screen
          name="Retirement"
          component={Retirement}
          options={{headerShown: false, drawerItemStyle: {height: 0}}}
        />
        <Stack.Screen
          name="ChatRoom"
          component={ChatRoom}
          options={{headerShown: false, drawerItemStyle: {height: 0}}}
        />
        <Stack.Screen
          name="WbtptaChatRoom"
          component={WbtptaChatRoom}
          options={{headerShown: false, drawerItemStyle: {height: 0}}}
        />
        <Stack.Screen
          name="WbtptaWorkingChatRoom"
          component={WbtptaWorkingChatRoom}
          options={{headerShown: false, drawerItemStyle: {height: 0}}}
        />
        <Stack.Screen
          name="WeFourGroup"
          component={WeFourGroup}
          options={{headerShown: false, drawerItemStyle: {height: 0}}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
