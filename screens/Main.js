import React from 'react';
import { View, StyleSheet } from 'react-native';
import Background from '../component/Background';
import BottomNav from '../component/BottomNav';
import { useNavigation } from '@react-navigation/native';

export default function Main() {
  const navigation = useNavigation();

  return (
    <Background>
      <View style={styles.container}>
        {/* 중간에 별, 행성 등 기타 요소 */}
        <View style={{ flex: 1 }}>
          {/* TODO: 행성/루틴/제안 UI 구성 */}
        </View>

        <BottomNav navigation={navigation} />
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
});
