import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Background from '../component/Background';

export default function Join() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = () => {
    // TODO: Spring 서버에 회원가입 요청 보내기
    console.log('회원가입 정보:', { name, username, password });
    navigation.navigate('Login');
  };

  return (
    <Background>
      <View style={styles.inner}>
        <Text style={styles.welcomeTitle}>환영합니다.</Text>
        <Text style={styles.subtext}>자투리 시간에도 자기개발할 수 있도록,
        작은 순간을 성장의 기회로 바꿔주는 루틴 실천 플랫폼입니다.</Text>

        <TextInput
          style={styles.input}
          placeholder="이름"
          placeholderTextColor="#ccc"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="아이디"
          placeholderTextColor="#ccc"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          placeholderTextColor="#ccc"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
          <Text style={styles.signupButtonText}>회원가입</Text>
        </TouchableOpacity>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  inner: {
    marginBottom: 50,
  },
  welcomeTitle: {
    fontSize: 40,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtext: {
    fontSize: 15,
    color: 'white',
    textAlign: 'center',
    marginBottom: 40,
    paddingBottom: 20,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 30,
    fontSize: 16,
    color: '#fff',
    paddingVertical: 8,
  },
  signupButton: {
    backgroundColor: '#5D6BFF', // 진한 남색 (Navy)
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 6, // Android 그림자
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1,
  },
});
