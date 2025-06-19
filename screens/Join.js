import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet, View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Background from '../component/Background';
import { Image } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Join() {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');

  const [selectedAvatar, setSelectedAvatar] = useState(null);

  const isDisabled = !nickname || !password || !selectedAvatar || !username;

  const profileImage = [
    require('../assets/프사1.png'),
    require('../assets/프사2.png'),
    require('../assets/프사3.png'),
    require('../assets/프사4.png'),
    require('../assets/프사5.png'),
    require('../assets/프사6.png'),
    require('../assets/프사7.png'),
    require('../assets/프사8.png'),
  ];

  const profileImageNames = [
    '프사1.png',
    '프사2.png',
    '프사3.png',
    '프사4.png',
    '프사5.png',
    '프사6.png',
    '프사7.png',
    '프사8.png',
  ];

  const selectedImageName = profileImageNames[selectedAvatar - 1];

  const handleSignup = async () => {
  try {
    const response = await axios.post('https://routinut-backend.onrender.com/api/users/signup', {
      username,
      nickname,
      password,
      profileImage: selectedImageName, // 문자열로 보냄 (예: '프사2.png')
    });

    const { id, nickname: returnedNickname, profileImage: returnedImage } = response.data;

    if (returnedNickname) {
      // ✅ 유저 정보 저장
      await AsyncStorage.setItem(
        'loggedInUser',
        JSON.stringify({ id, nickname: returnedNickname, profileImage: returnedImage })
      );
      console.log('회원가입 성공, 저장된 유저:', returnedNickname);

      // ✅ Alert 띄우고 확인 시 로그인 화면으로 이동
      Alert.alert(
        '회원가입 완료',
        '성공적으로 회원가입되었습니다.',
        [
          {
            text: '확인',
            onPress: () => navigation.navigate('Login'),
          },
        ],
        { cancelable: false }
      );
    } else {
      Alert.alert('회원가입 실패', '응답에 닉네임이 없습니다.');
    }
  } catch (error) {
    console.error('요청 에러:', error);
    Alert.alert('서버 오류', '회원가입 요청 중 문제가 발생했습니다.');
  }
};


  return (
    <Background>
      <View style={styles.inner}>
        <Text style={styles.welcomeTitle}>환영합니다.</Text>
        <Text style={styles.subtext}>자투리 시간에도 자기개발할 수 있도록,
        작은 순간을 성장의 기회로 바꿔주는 루틴 실천 플랫폼입니다.</Text>
        <View style={styles.avatarContainer}>
          {profileImage.map((img, i) => {
            const index = i + 1;
            const isSelected = selectedAvatar === index;
            return (
              <TouchableOpacity key={index} onPress={() => setSelectedAvatar(index)}>
                <View
                  style={[
                    styles.avatarWrapper,
                    isSelected && styles.selectedAvatarWrapper,
                  ]}
                >
                  <View style={isSelected && styles.overlay} />
                  <Image
                    source={img}
                    style={styles.avatarImage}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        <TextInput
          style={styles.input}
          placeholder="사용자 이름"
          placeholderTextColor="#ccc"
          value={username}
          onChangeText={setUsername}
        />
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
          style={[styles.signupButton, isDisabled && styles.signupButtonDisabled]}
          onPress={handleSignup}
          disabled={isDisabled}
        >
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
    paddingBottom: 30,
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
    backgroundColor: '#5A86E9',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1,
  },
  signupButtonDisabled: {
    opacity: 0.5, // 흐릿하게 보이도록
  },
  avatarLabel: {
    color: 'white',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  avatarContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  avatarWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    margin: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedAvatarWrapper: {
    borderWidth: 4,
    borderColor: 'white',
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.2)',
    zIndex: 1,
    borderRadius: 30,
  },

});
