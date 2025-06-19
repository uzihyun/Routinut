import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Text } from 'react-native';
import { useRoute } from '@react-navigation/native';

export default function BottomNav({ navigation }) {
  const route = useRoute();
  const [selectedIndex, setSelectedIndex] = useState(2);

  const menu = [
    { key: 0, label: '루틴', icon: require('../assets/icon1.png'), screen: 'Routine' },
    { key: 1, label: '통계', icon: require('../assets/icon2.png'), screen: 'Statistics' },
    { key: 2, label: '', icon: require('../assets/icon3.png'), screen: 'Main' },
    { key: 3, label: '은하 광장', icon: require('../assets/icon4-2.png'), screen: 'GalaxyPlaza' },
    { key: 4, label: '마이페이지', icon: require('../assets/icon5.png'), screen: 'MyPage' },
  ];
  useEffect(() => {
    const mypageScreens = ['MyPage', 'MyPageUpdate'];
    if (mypageScreens.includes(route.name)) {
      setSelectedIndex(4);
    } else {
      const matchedItem = menu.find(item => item.screen === route.name);
      if (matchedItem) {
        setSelectedIndex(matchedItem.key);
      }
    }
  }, [route.name]);

  // 현재 route 기준으로 selectedIndex 업데이트
  useEffect(() => {
    const current = menu.find(item => item.screen === route.name);
    if (current) {
      setSelectedIndex(current.key);
    }
  }, [route.name]);

  return (
    <View style={styles.all}>
      <View style={styles.container}>
        {menu.map(item => (
          <TouchableOpacity
            key={item.key}
            onPress={() => navigation.navigate(item.screen)}
            style={styles.menuItem}
          >
            <Image
              source={item.icon}
              style={[
                styles.icon,
                item.key === 2 && styles.centerIcon,
              ]}
            />
            <Text
              style={[
                styles.label,
                selectedIndex === item.key ? {} : { opacity: 0 },
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  all : {
    backgroundColor: '#000',
    paddingTop: 25
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'black',
    borderRadius: 40,
    paddingRight: 20,
    paddingLeft: 20,
    paddingTop: 5,
    paddingBottom: 5,
    borderColor: '#fff',
    borderWidth: 2, 
  },
  menuItem: {
    alignItems: 'center',
    height: 60, // 아이콘 + 텍스트 높이 확보
    justifyContent: 'center',
  },
  
  icon: {
    width: 35,
    height: 35,
    resizeMode: 'contain',
  },
  centerIcon: {
    width: 70,
    height: 70,
    position: 'relative',
    bottom: 15,
    left: 7,
    backgroundColor: '#000'
  },
  label: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
});
