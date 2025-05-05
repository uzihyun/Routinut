import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Background from '../component/Background';
import { useNavigation } from '@react-navigation/native';

export default function Schedule() {
  const navigation = useNavigation();

  const handleAddSchedule = () => {
    // 여기서 다른 화면으로 이동할 수 있어요. 예: ScheduleForm
    // navigation.navigate('ScheduleForm');
    console.log('일정 추가 버튼 클릭됨');
  };

  return (
    <Background>
      <View style={styles.container}>
        {/* 오른쪽 상단 별+ 버튼 */}
        <TouchableOpacity onPress={handleAddSchedule} style={styles.starButton}>
          <Image source={require('../assets/star-plus.png')} style={styles.starIcon} />
        </TouchableOpacity>

        {/* 중앙 우주인 시계 이미지 */}
        <Image
          source={require('../assets/astronaut-clock.png')}
          style={styles.astroImage}
          resizeMode="contain"
        />

        {/* 하단 안내 문구 */}
        <Text style={styles.text}>일정을 등록해주세요!</Text>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  starButton: {
    position: 'absolute',
    top: 40,
    right: 30,
    zIndex: 10,
  },
  starIcon: {
    width: 70,
    height: 70,
  },
  astroImage: {
    height: 250,
    marginBottom: 30,
  },
  text: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
  },
});
