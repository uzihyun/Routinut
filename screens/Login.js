import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet, View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Background from '../component/Background';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login() {
  const navigation = useNavigation();
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');

  const isDisabled = !nickname || !password;

  const handleLogin = async () => {
    try {
      const response = await axios.post('https://routinut-backend.onrender.com/api/users/login', {
        nickname,
        password,
      });

      const { message, userId } = response.data;

      if (message === '로그인 성공') {
        // 1. 사용자 정보 저장
        await AsyncStorage.setItem('loggedInUser', nickname);
        await AsyncStorage.setItem('loggedInUserId', String(userId));
        console.log('로그인된 유저:', nickname, '(id:', userId, ')');

        // 2. 저장된 userId로 스케줄 비동기 요청
        const scheduleRes = await axios.get(`https://routinut-backend.onrender.com/api/schedules/user/${userId}`);
        const schedules = scheduleRes.data;

        // 3. 스케줄 존재 여부에 따라 라우팅
        if (Array.isArray(schedules) && schedules.length > 0) {
          navigation.navigate('Main');
        } else {
          navigation.navigate('Schedule');
        }

      } else {
        Alert.alert('로그인 실패', message);
      }
    } catch (error) {
      console.error('요청 에러:', error);
      Alert.alert('서버 오류', '로그인 요청 중 문제가 발생했습니다.');
    }
  };


  return (
    <Background>
      <View style={styles.inner}>
        <Text style={styles.title}>Routinut</Text>

        <TextInput
          style={styles.input}
          placeholder="아이디"
          placeholderTextColor="#ccc"
          value={nickname}
          onChangeText={setNickname}
        />
        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          placeholderTextColor="#ccc"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={[styles.loginButton, isDisabled && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={isDisabled}
        >
          <Text style={styles.loginText}>로그인</Text>
        </TouchableOpacity>

        <View style={styles.signupRow}>
          <Text style={styles.signupText}>루티넛은 처음이신가요?</Text>
          <TouchableOpacity style={styles.signupButton} onPress={() => navigation.navigate('Join')}>
            <Text style={styles.signupButtonText}>회원가입</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  inner: {
    marginBottom: 70,  
  },
  title: {
    fontSize: 55,
    color: 'white',
    alignSelf: 'center',
    marginBottom: 70,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 30,
    fontSize: 16,
    color: '#fff',
    paddingVertical: 8,
  },
  loginButton: {
    backgroundColor: '#5A86E9',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginVertical: 20,
    marginTop: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 6, // Android 그림자
  },
  loginButtonDisabled: {
    backgroundColor: '#5A86E9',
    opacity: 0.5, // 회색 느낌
  },
  loginText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: 'white',
    marginRight: 10,
  },
  signupButton: {
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
  },
  signupButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
