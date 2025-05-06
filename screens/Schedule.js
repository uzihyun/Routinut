import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Background from '../component/Background';
import { useNavigation } from '@react-navigation/native';

export default function Schedule() {
  const navigation = useNavigation();

  const handleAddSchedule = () => {
    navigation.navigate('ScheduleForm');
  };

  return (
    <Background>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleAddSchedule} style={styles.starButton}>
          <Image source={require('../assets/star-plus.png')} style={styles.starIcon} />
        </TouchableOpacity>

        <Image
          source={require('../assets/astronaut-clock.png')}
          style={styles.astroImage}
          resizeMode="contain"
        />

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
