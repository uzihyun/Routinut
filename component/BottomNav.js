import React, { useState } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Text } from 'react-native';

export default function BottomNav({ navigation }) {
  const [selectedIndex, setSelectedIndex] = useState(2); // 기본 선택: icon3

  const menu = [
    { key: 0, label: '루틴', icon: require('../assets/icon1.png'), onPress: () => navigation.navigate('Schedule') },
    { key: 1, label: '통계', icon: require('../assets/icon2.png'), onPress: () => {} },
    { key: 2, label: '홈', icon: require('../assets/icon3.png'), onPress: () => {} },
    { key: 3, label: '커뮤니티', icon: require('../assets/icon4-2.png'), onPress: () => {} },
    { key: 4, label: '사용자', icon: require('../assets/icon5.png'), onPress: () => {} },
  ];

  return (
    <View style={styles.container}>
      {menu.map(item => (
        <TouchableOpacity
          key={item.key}
          onPress={() => {
            setSelectedIndex(item.key);
            item.onPress();
          }}
          style={styles.menuItem}
        >
          <Image
            source={item.icon}
            style={[
              styles.icon,
              item.key === 2 && styles.centerIcon, // icon3만 크게
            ]}
          />
          {selectedIndex === item.key && item.key !== 2 && (
            <Text style={styles.label}>{item.label}</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 90,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'black',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
    paddingRight: 5,
    paddingLeft: 5,
  },
  menuItem: {
    alignItems: 'center',
  },
  icon: {
    width: 35,
    height: 35,
    resizeMode: 'contain',
  },
  centerIcon: {
    width: 65,
    height: 65,
  },
  label: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
});
