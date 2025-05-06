import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Login from './screens/Login';
import Schedule from './screens/Schedule';
import Join from './screens/Join';
import ScheduleForm from './screens/ScheduleForm';
import Main from './screens/Main.js';

export default function App() {
  const Stack = createNativeStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={Login} /* options={{ headerShown: false }} *//>
        <Stack.Screen name="Schedule" component={Schedule} /* options={{ headerShown: false }} *//>
        <Stack.Screen name="Join" component={Join} /* options={{ headerShown: false }} *//>
        <Stack.Screen name="ScheduleForm" component={ScheduleForm} /* options={{ headerShown: false }} *//>
        <Stack.Screen name="Main" component={Main} /* options={{ headerShown: false }} *//>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
