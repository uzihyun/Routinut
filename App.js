import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Platform  } from 'react-native';
import { useCallback, useEffect  } from 'react';

import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';


import Login from './screens/Login';
import Schedule from './screens/Schedule';
import Join from './screens/Join';
import ScheduleForm from './screens/ScheduleForm';
import Main from './screens/Main.js';
import Routine from './screens/Routine.js';
import Statistics from './screens/Statistics.js';
import MyPage from './screens/MyPage.js';
import GalaxyPlaza from './screens/GalaxyPlaza.js';
import RoutineForm from './screens/RoutineForm.js';
import MyPageUpdate from './screens/MyPageUpdate.js';
import Chatbot from './screens/Chatbot.js';

const startHourlyAlarmAtExactHour = async () => {
  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setMinutes(0);
  nextHour.setSeconds(0);
  nextHour.setMilliseconds(0);
  nextHour.setHours(now.getHours() + 1); // 다음 정각

  const secondsUntilNextHour = Math.floor((nextHour.getTime() - now.getTime()) / 1000);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⏰ 자투리 알림',
      body: '정각입니다! 새로운 한 시간의 시작이에요 🚀',
      sound: true,
    },
    trigger: {
      seconds: secondsUntilNextHour,
      repeats: true, // 매 시간 반복
    },
  });

  console.log(`✅ 매 정각 반복 알림 예약됨 (${secondsUntilNextHour}초 뒤부터 시작)`);
};

const scheduleRoutineAlarmsForToday = async () => {
  try {
    const userId = await AsyncStorage.getItem('loggedInUserId');
    if (!userId) return;

    const response = await axios.get(`https://routinut-backend.onrender.com/api/routines/today?userId=${userId}`);
    const routines = response.data;

    const now = new Date();

    for (const routine of routines) {
      const title = routine.title;

      // ⏰ "HH:MM:SS" 분리
      const [hour, minute, second] = routine.startTime.split(':').map(str => parseInt(str));

      const baseTime = new Date(); // 오늘 날짜 기준
      baseTime.setHours(hour, minute, second || 0, 0); // 정확한 시각 설정

      const fiveMinBefore = new Date(baseTime.getTime() - 5 * 60 * 1000);
      const fiveMinAfter = new Date(baseTime.getTime() + 5 * 60 * 1000);

      // ⏱ 현재 시각보다 미래일 때만 예약
      if (fiveMinBefore > now) {
        const diffSec = Math.floor((fiveMinBefore.getTime() - now.getTime()) / 1000);
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '⏰ 루틴 알림',
            body: `"${title}" 루틴 시작 5분 전입니다!`,
            sound: true,
          },
          trigger: { seconds: diffSec, channelId: 'default' },
        });
      }

      if (fiveMinAfter > now) {
        const diffSec = Math.floor((fiveMinAfter.getTime() - now.getTime()) / 1000);
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '루틴 시간!',
            body: `"${title}" 루틴을 할 시간입니다.`,
            sound: true,
          },
          trigger: { seconds: diffSec, channelId: 'default' },
        });
      }
    }

    const all = await Notifications.getAllScheduledNotificationsAsync();
    console.log('✅ 예약된 알림:', all);
  } catch (error) {
    console.error('⛔️ 루틴 알람 예약 실패:', error);
  }
};


export default function App() {

useEffect(() => {
  const initialize = async () => {
    await Notifications.requestPermissionsAsync();

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: '기본 채널',
        importance: Notifications.AndroidImportance.HIGH,
      });
    }

    await startHourlyAlarmAtExactHour(); // ✅ 정각 알림 예약
  };

  initialize();
}, []);


  useEffect(() => {
    const initialize = async () => {
      await Notifications.requestPermissionsAsync();

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: '기본 채널',
          importance: Notifications.AndroidImportance.HIGH,
        });
      }

      // ✅ 로그인 여부 체크 후 실행
      const userId = await AsyncStorage.getItem('loggedInUserId');
      if (!userId) {
        console.log('❌ 로그인되지 않음 - 알람 예약 생략');
        return;
      }

      await scheduleRoutineAlarmsForToday(); // 🔔 알람 예약 실행
    };

    initialize();
  }, []);



  const [fontsLoaded] = Font.useFonts({
    'CuteFont': require('./assets/font/font.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync(); // 폰트 로드되면 스플래시 제거
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // 로딩 중에는 아무것도 안 보여줌
  }

  const Stack = createNativeStackNavigator();

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Login" component={Login} options={{ headerShown: false }}/>
          <Stack.Screen name="Schedule" component={Schedule} options={{ headerShown: false }}/>
          <Stack.Screen name="Join" component={Join} options={{ headerShown: false }}/>
          <Stack.Screen name="ScheduleForm" component={ScheduleForm} options={{ headerShown: false }}/>
          <Stack.Screen name="Main" component={Main} options={{ headerShown: false }}/>
          <Stack.Screen name="Routine" component={Routine} options={{ headerShown: false }}/>
          <Stack.Screen name="Statistics" component={Statistics} options={{ headerShown: false }}/>
          <Stack.Screen name="MyPage" component={MyPage} options={{ headerShown: false }}/>
          <Stack.Screen name="GalaxyPlaza" component={GalaxyPlaza} options={{ headerShown: false }}/>
          <Stack.Screen name="RoutineForm" component={RoutineForm} options={{ headerShown: false }}/>
          <Stack.Screen name="MyPageUpdate" component={MyPageUpdate} options={{ headerShown: false }}/>
          <Stack.Screen name="Chatbot" component={Chatbot} /* options={{ headerShown: false }} *//>
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'CuteFont'
  },
});
