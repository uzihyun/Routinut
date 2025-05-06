import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';

export default function Background({ children }) {
  return (
    <ImageBackground source={require('../assets/star-background.jpg')} style={styles.background}>
      <View style={styles.overlay} />
      <View style={styles.content}>{children}</View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 15, 40, 0.6)'
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
  },
});
