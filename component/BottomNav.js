// components/BottomNav.js
import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';

export default function BottomNav({ navigation }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate('Schedule')}>
        <Image source={require('../assets/루틴.png')} style={styles.icon} />
      </TouchableOpacity>
      <TouchableOpacity>
        <Image source={require('../assets/통계.png')} style={styles.icon} />
      </TouchableOpacity>
      <TouchableOpacity>
        <Image source={require('../assets/홈.jpg')} style={styles.icon} />
      </TouchableOpacity>
      <TouchableOpacity>
        <Image source={require('../assets/커뮤니티2.png')} style={styles.icon} />
      </TouchableOpacity>
      <TouchableOpacity>
        <Image source={require('../assets/사용자.png')} style={styles.icon} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: 'black',
  },
  icon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
});
