import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TouchableWithoutFeedback,
  Image,
  Dimensions,
} from 'react-native';
import Background from '../component/Background';
import BottomNav from '../component/BottomNav';
import { useNavigation, useIsFocused, useRoute } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';


import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
const screenWidth = Dimensions.get('window').width;
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function MyPage() {
  const navigation = useNavigation();
  const [alarmOn, setAlarmOn] = useState(false);
  const [popupVisibleIndex, setPopupVisibleIndex] = useState(null);
  const [notificationId, setNotificationId] = useState(null);
  const isFocused = useIsFocused();
  const route = useRoute();

  useEffect(() => {
    if (isFocused || route.params?.refreshed) {
      fetchUserInfo(); // 사용자 정보 다시 불러오는 함수
    }
  }, [isFocused, route.params?.refreshed]);

  const [userInfo, setUserInfo] = useState({
    username: '',
    nickname: '',
    profileImage: '',
  });

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      navigation.navigate('Main'); // 알림 클릭 시 Main으로 이동
    });
    return () => subscription.remove();
  }, []);

  const handleLogout = async () => {
    Alert.alert('로그아웃', '정말 로그아웃하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '확인',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('loggedInUser');
            await AsyncStorage.setItem('alarmOn', 'false');
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); // 스택 초기화 후 로그인 화면으로 이동
          } catch (err) {
            console.error('로그아웃 실패:', err);
            Alert.alert('오류', '로그아웃 중 문제가 발생했습니다.');
          }
        },
      },
    ]);
  };

  const handleToggle = async () => {
    /* if (!Device.isDevice) {
      Alert.alert('알림', '알림은 실제 기기에서만 작동합니다.');
      return;
    } */

    if (!alarmOn) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: '루틴 알림',
          body: '오늘의 루틴을 실천해볼까요? 🌱',
        },
        trigger: {
          hour: 9,
          minute: 0,
          repeats: true,
        },
      });
      setNotificationId(id);
      setAlarmOn(true);
      Alert.alert('알림', '알람이 켜졌습니다.');
    } else {
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      }
      setNotificationId(null);
      setAlarmOn(false);
      Alert.alert('알림', '알람이 꺼졌습니다.');
    }
  };

  const handlePublic = async (postId) => {
    try {
      await axios.put(`https://routinut-backend.onrender.com/api/routine-checks/${postId}/restore`);

      setMyPosts(prev =>
        prev.map(post =>
          post.id === postId ? { ...post, checked: true } : post
        )
      );

      Alert.alert('알림', '공개로 설정되었습니다.');
    } catch (err) {
      console.error('공개 처리 실패:', err.response?.data || err);
      Alert.alert('오류', '공개 처리 중 문제가 발생했습니다.');
    }
  };

  const handlePrivate = async (postId) => {
    try {
      await axios.put(`https://routinut-backend.onrender.com/api/routine-checks/${postId}/delete`);
      
      setMyPosts(prev =>
        prev.map(post =>
          post.id === postId ? { ...post, checked: false } : post
        )
      );

      Alert.alert('알림', '비공개로 설정되었습니다.');
    } catch (err) {
      console.error('비공개 처리 실패:', err.response?.data || err);
      Alert.alert('오류', '비공개 처리 중 문제가 발생했습니다.');
    }
  };

  const imageMap = {
    '프사1.png': require('../assets/프사1.png'),
    '프사2.png': require('../assets/프사2.png'),
    '프사3.png': require('../assets/프사3.png'),
    '프사4.png': require('../assets/프사4.png'),
    '프사5.png': require('../assets/프사5.png'),
    '프사6.png': require('../assets/프사6.png'),
    '프사7.png': require('../assets/프사7.png'),
    '프사8.png': require('../assets/프사8.png'),
  };

  const fetchUserInfo = async () => {
    try {
      const userId = await AsyncStorage.getItem('loggedInUserId');
      const res = await axios.get(`https://routinut-backend.onrender.com/api/users/${userId}`);
      const user = res.data;

      setUserInfo({
        username: user.username ?? '이름 없음',
        nickname: user.nickname ?? '아이디 없음',
        profileImage: user.profileImage ?? '프사1.png',
      });
    } catch (err) {
      console.error('유저 정보 불러오기 실패:', err);
    }
  };

  const [myPosts, setMyPosts] = useState([]);

  useEffect(() => {
    const fetchMyRoutineChecks = async () => {
      try {
        const userId = await AsyncStorage.getItem('loggedInUserId');
        const res = await axios.get(`https://routinut-backend.onrender.com/api/routine-checks/mypage/all/${userId}`);

        if (res.data.length > 0) {
          const formatted = res.data
            .map(item => ({
              id: item.check.id,
              comment: item.check.comment,
              photoUrl: item.check.photoUrl,
              date: item.check.checkDate,
              checked: item.check.checked
            }))
            .sort((a, b) => b.id - a.id); // 🔽 check.id 기준 내림차순 정렬

          setMyPosts(formatted);
        }
      } catch (err) {
        console.error('내 루틴 기록 불러오기 실패:', err);
      }
    };

    // ✅ 여기에서 유저 정보 호출
    const init = async () => {
      await fetchUserInfo();           // 🔹 유저 정보 불러오기
      await fetchMyRoutineChecks();    // 🔹 루틴 체크 기록 불러오기
    };

    init(); // useEffect 내부에서 실행

  }, []);



  return (
    <Background>
      <TouchableWithoutFeedback onPress={() => popupVisibleIndex !== null && setPopupVisibleIndex(null)}>
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>내 정보</Text>
              <View style={styles.profileSection}>
                <View>
                  <Text style={styles.name}>{userInfo.username || '이름 없음'}</Text>
                  <Text style={styles.username}>@{userInfo.nickname}</Text>
                  <TouchableOpacity onPress={handleToggle} style={styles.alarmWrapper}>
                    <View style={[styles.alarmCircle, alarmOn && styles.alarmCircleOn]} />
                  </TouchableOpacity>
                </View>
                <View style={styles.profileWrapper}>
                  <Image
                    source={imageMap[userInfo.profileImage]}
                    style={styles.profileImage}
                  />
                  <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('MyPageUpdate')}>
                    <Text style={styles.editIcon}>✎</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity onPress={handleLogout}>
                <Text style={styles.logout}>로그아웃</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.grid}>
              {myPosts.map((post, i) => (
                <View key={post.id} style={styles.gridItemWrapper}>
                  <TouchableOpacity style={styles.gridItem} activeOpacity={0.8}>
                    {post.photoUrl ? (
                      <Image source={{ uri: post.photoUrl }} style={styles.gridImage} />
                    ) : (
                      <View style={[styles.gridImage, styles.textOnlyBox]}>
                        <Text style={styles.textOnlyText}>{post.comment}</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => setPopupVisibleIndex(i)}
                  >
                    <Text style={styles.menuIcon}>⋮</Text>
                  </TouchableOpacity>

                  {popupVisibleIndex === i && (
                    <View style={styles.popupBox}>
                      {post.checked ? ( // ✅ 현재 공개 상태면 → "비공개로 바꾸기"
                        <TouchableOpacity style={styles.popupOption} onPress={() => handlePrivate(post.id)}>
                          <Text style={[styles.popupText, { color: '#9E9E9E' }]}>비공개</Text>
                          <Text style={[styles.popupIcon, { color: '#9E9E9E' }]}>🔒</Text>
                        </TouchableOpacity>
                      ) : ( // ✅ 현재 비공개 상태면 → "공개로 바꾸기"
                        <TouchableOpacity style={styles.popupOption} onPress={() => handlePublic(post.id)}>
                          <Text style={[styles.popupText, { color: '#2196F3' }]}>공개</Text>
                          <Text style={[styles.popupIcon, { color: '#2196F3' }]}>🌐</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              ))}
            </View>
          </ScrollView>

          <BottomNav navigation={navigation} />
        </View>
      </TouchableWithoutFeedback>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, paddingBottom: 20 },
  header: {
    backgroundColor: '#fff',
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
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: { fontSize: 22, fontWeight: 'bold', marginBottom: 6 },
  username: {
    backgroundColor: '#eee',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 14,
  },
  profileWrapper: { position: 'relative' },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#ddd',
    borderRadius: 12,
    padding: 4,
  },
  editIcon: { fontSize: 12 },
  logout: {
    alignSelf: 'flex-end',
    marginTop: 25,
    backgroundColor: '#eee',
    borderRadius: 20,
    padding: 6,
    paddingRight: 12,
    paddingLeft: 12
  },
  alarmWrapper: {
    alignSelf: 'flex-start',
    marginTop: 10,
    backgroundColor: '#eee',
    borderRadius: 20,
    padding: 6,
    
  },
  alarmCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#555' },
  alarmCircleOn: { backgroundColor: '#5A86E9' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingTop: 16,
    gap: 12,
  },
  gridItemWrapper: {
    width: '30%',
    aspectRatio: 1,
    position: 'relative',
  },
  gridItem: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 6,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  menuButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    padding: 4,
    zIndex: 10,
  },
  menuIcon: {
    fontSize: 18,
    color: '#000',
  },
  popupBox: {
    position: 'absolute',
    top: 35,
    left: 0,
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    paddingVertical: 5,
    width: 130,
    zIndex: 9999,
    elevation: 10,
  },
  popupOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  popupText: {
    color: '#fff',
    fontSize: 14,
  },
  popupIcon: {
    fontSize: 16,
    color: '#fff',
  },
  gridImage: {
    width: screenWidth / 3 - 15,
    height: screenWidth / 3 - 15,
    resizeMode: 'cover',
    borderRadius: 8,
    marginBottom: 10,
  },

  textOnlyBox: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
  },

  textOnlyText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 6,
    position: "relative",
    right: 7,
    bottom: 7,
  },
});
