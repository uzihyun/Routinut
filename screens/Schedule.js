import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Background from '../component/Background';
import { useNavigation } from '@react-navigation/native';
import BottomNav from '../component/BottomNav';

export default function Schedule() {
  const navigation = useNavigation();
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [floatAnim]);

  const handleAddSchedule = () => {
    navigation.navigate('ScheduleForm');
  };

  return (
    <Background>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleAddSchedule} style={styles.starButton}>
          <Image source={require('../assets/star-plus.png')} style={styles.starIcon} />
        </TouchableOpacity>

        <Animated.Image
          source={require('../assets/astronaut-clock.png')}
          style={[styles.astroImage, { transform: [{ translateY: floatAnim }] }]}
          resizeMode="contain"
        />

        <Text style={styles.text}>일정을 등록해주세요!</Text>
      </View>
      <BottomNav navigation={navigation} />
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
    position: 'relative',
    top: 15,
  },
  text: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
    position: 'relative',
    top: 25,
  },
});
