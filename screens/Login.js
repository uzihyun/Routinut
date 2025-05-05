import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Background from '../component/Background';

export default function Login() {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    navigation.navigate('Schedule');
  };

  return (
    <Background>
      <View style={styles.inner}>
        <Text style={styles.title}>Routin’ut</Text>

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

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
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
    fontSize: 40,
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
    backgroundColor: '#5D6BFF', // 진한 남색 (Navy)
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
