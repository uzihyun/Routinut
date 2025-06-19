import React, { useState, useEffect  } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Background from '../component/Background';
import BottomNav from '../component/BottomNav';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MyPageUpdate() {
  const navigation = useNavigation();
  const [nickname, setNickname] = useState('');
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userId = await AsyncStorage.getItem('loggedInUserId'); // 또는 직접 ID 넣어도 됨
        const response = await axios.get(`https://routinut-backend.onrender.com/api/users/${userId}`);
        const data = response.data;

        setUsername(data.username || '');
        setNickname(data.nickname || '');

        const imageIndex = parseInt(data.profileImage.replace('프사', '').replace('.png', ''));
        setSelectedAvatar(imageIndex);
      } catch (error) {
        console.error('사용자 정보 불러오기 실패:', error);
      }
    };

    fetchUserInfo();
  }, []);


  const avatarImages = [
    require('../assets/프사1.png'),
    require('../assets/프사2.png'),
    require('../assets/프사3.png'),
    require('../assets/프사4.png'),
    require('../assets/프사5.png'),
    require('../assets/프사6.png'),
    require('../assets/프사7.png'),
    require('../assets/프사8.png'),
  ];

  const handleUpdate = async () => {
    try {
      const userId = await AsyncStorage.getItem('loggedInUserId');
      if (!userId) {
        Alert.alert('오류', '로그인 정보를 불러올 수 없습니다.');
        return;
      }

      const requestBody = {
        username: username,
        nickname: nickname,
        profileImage: `프사${selectedAvatar}.png`,
      };

      await axios.put(`https://routinut-backend.onrender.com/api/users/${userId}`, requestBody);

      Alert.alert('수정 완료', '내 정보가 성공적으로 수정되었습니다.');
      navigation.navigate('MyPage', { refreshed: true }); 
    } catch (error) {
      console.error('정보 수정 실패:', error);
      Alert.alert('오류', '내 정보 수정 중 문제가 발생했습니다.');
    }
  };


  return (
    <Background>
      <View style={styles.container}>
        {/* 상단 프로필 */}
        <View style={styles.profileSection}>
          <Text style={styles.title}>내 정보 수정</Text>
          <View style={styles.profileImageWrapper}>
            <Image
              source={avatarImages[selectedAvatar - 1] || require('../assets/프사8.png')}
              style={styles.profileImage}
            />
          </View>
        </View>

        {/* 입력 폼 */}
        <View style={styles.form}>
          <View style={styles.avatarContainer}>
            {avatarImages.map((img, i) => {
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
          {/* <Text style={styles.avatarLabel}>프로필 사진을 선택해주세요</Text> */}
            
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


          <TouchableOpacity
            style={[styles.updateButton]}
            onPress={handleUpdate}
          >
            <Text style={styles.updateButtonText}>수정하기</Text>
          </TouchableOpacity>

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
  profileSection: {
    alignItems: 'center',
    paddingTop: 40,
    backgroundColor: 'white',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 24,

  },
  title: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 25,
  },
  profileImageWrapper: {
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#000',
  },
  editIconWrapper: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#eee',
    borderRadius: 15,
    padding: 5,
  },
  editIcon: {
    width: 16,
    height: 16,
    tintColor: '#444',
  },
  form: {
    position:'relative',
    top: 10,
  },
  label: {
    color: 'white',
    marginBottom: 4,
    marginLeft: 4,
    fontSize: 14,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 30,
    fontSize: 16,
    color: '#fff',
    paddingVertical: 8,
  },
  updateButton: {
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
  updateButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1,
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
});
