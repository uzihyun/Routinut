import React, { useState, useEffect  } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Modal,
  TextInput,
  Dimensions,
  Alert,
  Pressable
} from 'react-native';
import Background from '../component/Background';
import BottomNav from '../component/BottomNav';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebaseConfig';
import * as ImageManipulator from 'expo-image-manipulator';

const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const screenWidth = Dimensions.get('window').width;
const timeSlots = Array.from({ length: 18 }, (_, i) => `${7 + i}:00`);
const weekDays = ['일', '월', '화', '수', '목','금','토'];

export default function Routine({ navigation }) {
  const categoryMap = {
    1: {
      name: '건강 & 운동',
      color: '#C9F6F8',
      badgeColor: '#6EC5D9',
      icon: require('../assets/건강&운동.png'),
    },
    2: {
      name: '공부 & 업무',
      color: '#A3A9F2',
      badgeColor: '#5C67E0',
      icon: require('../assets/공부&업무.png'),
    },
    3: {
      name: '감정 & 정신 건강',
      color: '#F5A5C2',
      badgeColor: '#E54486',
      icon: require('../assets/감정&정신건강.png'),
    },
    4: {
      name: '취미 & 자기계발',
      color: '#E5C9FF',
      badgeColor: '#C488FF',
      icon: require('../assets/취미&자기계발.png'),
    },
    5: {
      name: '자기관리',
      color: '#FBE8B4',
      badgeColor: '#F8C851',
      icon: require('../assets/자기관리.png'),
    },
  };

  const [routines, setRoutines] = useState([]);
  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        const userId = await AsyncStorage.getItem('loggedInUserId');
        console.log('✅ userId:', userId);

        if (!userId) {
          console.warn('❌ 저장된 userId가 없습니다.');
          return;
        }

        const response = await axios.get(`https://routinut-backend.onrender.com/api/routines/today?userId=${userId}`);
        const data = response.data;

        const enriched = data.map(r => {
          const cat = categoryMap[r.category] || {};
          return {
            id: r.id,
            title: r.title,
            category: cat.name || '기타',
            color: cat.color || '#ddd',
            badgeColor: cat.badgeColor || '#aaa',
            icon: cat.icon,
            done: r.checkedToday,
            routineDayId: r.routineDayId,         
            timerDuration: r.timerDuration,       
          };
        });

        setRoutines(enriched);
      } catch (err) {
        console.error('루틴 불러오기 실패:', err);
        Alert.alert('루틴 로딩 실패', '서버에서 데이터를 불러오지 못했습니다.');
      }
    };

    fetchRoutines();
  }, []);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const userId = await AsyncStorage.getItem('loggedInUserId');
        const res = await axios.get(`https://routinut-backend.onrender.com/api/schedules/user/${userId}`);
        const data = res.data;

        // 시간표 데이터 형식으로 가공
        const mapped = data.map(schedule => {
          const startHour = parseInt(schedule.startTime.split(':')[0]);
          const endHour = parseInt(schedule.endTime.split(':')[0]);

          return {
            title: schedule.title,
            day: schedule.dayOfWeek,
            startTime: startHour,
            endTime: endHour,
            color: '#fff', // 기본 색 (필요 시 매핑 가능)
          };
        });

        setTimetableData(prev => [...prev, ...mapped]);
      } catch (err) {
        console.error('스케줄 불러오기 실패:', err);
      }
    };

    fetchSchedules();
  }, []);

  const dayMapEngToKor = {
    MONDAY: '월',
    TUESDAY: '화',
    WEDNESDAY: '수',
    THURSDAY: '목',
    FRIDAY: '금',
    SATURDAY: '토',
    SUNDAY: '일',
  };

  const categoryColors = {
    1: '#C9F6F8', // 건강 & 운동
    2: '#A3A9F2', // 공부 & 업무
    3: '#F5A5C2',
    4: '#E5C9FF',
    5: '#FBE8B4',
  };

  const [timetableData, setTimetableData] = useState([]);
  useEffect(() => {
    const fetchAllRoutines = async () => {
      try {
        const userId = await AsyncStorage.getItem('loggedInUserId');
        const response = await axios.get(`https://routinut-backend.onrender.com/api/routines/user/${userId}`);
        const data = response.data;

        const routineSlots = data.flatMap(item => {
          const startHour = parseInt(item.startTime.split(':')[0]);
          const endHour = parseInt(item.endTime.split(':')[0]);
          const color = categoryColors[item.category] || '#ccc';

          return item.dayOfWeek.map(dayEng => ({
            title: item.title,
            day: dayMapEngToKor[dayEng],
            startTime: startHour,
            endTime: endHour,
            color,
          }));
        });

        setTimetableData(prev => [...prev, ...routineSlots]);
      } catch (err) {
        console.error('루틴 전체 불러오기 실패:', err);
      }
    };

    fetchAllRoutines();
  }, []);


  const [share, setAlarm] = useState(false);
  const toggleAlarm = () => setAlarm(!share);

  const openImagePicker = async () => {
    if (selectedImages.length >= 2) {
      alert('이미지는 최대 2장까지 추가할 수 있습니다.');
      return;
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('사진 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const newUri = result.assets[0].uri;
      setSelectedImages((prev) => [...prev, newUri]);
    }
  };


  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState(null);

  const toggleRoutine = (routine) => {
    if (routine.done) return;

    setSelectedRoutine({
      ...routine, 
    });
    setModalVisible(true);
  };


  const completeRoutine = () => {
    setRoutines(prev =>
      prev.map(r =>
        r.id === selectedRoutine.id ? { ...r, done: true } : r
      )
    );

    setModalVisible(false);
    setSelectedRoutine(null);
    setSelectedImages([]);
    setComment('');
  };

  const [comment, setComment] = useState('');
  const [routineId, setRoutineId] = useState(null);
  const [routineDayId, setRoutineDayId] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [timerDuration, setTimerDuration] = useState(null);

   // ✅ API 호출로 routineId, routineDayId 불러오기
  useEffect(() => {
    const fetchRoutineData = async () => {
      try {
        const userId = await AsyncStorage.getItem('loggedInUserId'); // 또는 고정 ID 사용
        const response = await axios.get(`https://routinut-backend.onrender.com/api/routines/today?userId=${userId}`);
        /* const todayRoutine = response.data[0]; // 오늘의 루틴이 여러 개일 경우 첫 번째만 사용

        if (todayRoutine) {
          setRoutineId(todayRoutine.id); // routineId
          setRoutineDayId(todayRoutine.routineDayId); // routineDayId
          setTimerDuration(todayRoutine.timerDuration);
        } */
      } catch (err) {
        console.error('루틴 정보 불러오기 실패', err);
        Alert.alert('루틴 정보를 불러올 수 없습니다.');
      }
    };

    fetchRoutineData();
  }, []);

  const resizeImage = async (uri) => {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 800, height: 800 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result.uri;
  };

  const uploadImageToFirebase = async (uri, userId, index) => {
    try {
      const resizedUri = await resizeImage(uri);
      console.log('✅ Resized URI:', resizedUri);
      
      const response = await fetch(resizedUri);
      if (!response.ok) throw new Error('📛 Blob fetch 실패');
      
      const blob = await response.blob();
      
      const uuid = uuidv4();
      const path = `routine-checks/${userId}/${uuid}_${index}.jpg`;
      const fileRef = ref(storage, path);
      
      console.log('userId:', userId);
      console.log('resizedUri:', resizedUri);
      console.log('path:', path);
      console.log('📤 Uploading to Firebase Storage path:', path);
      const snapshot = await uploadBytes(fileRef, blob);

      const downloadURL = await getDownloadURL(fileRef);
      console.log('✅ Download URL:', downloadURL);

      return downloadURL;
    } catch (error) {
      console.error('🔥 Firebase 업로드 실패:', error);
      throw error;
    }
    
  };


  const handleSubmit = async () => {
    try {
      if (!selectedRoutine || !selectedRoutine.id || !selectedRoutine.routineDayId) {
        Alert.alert('루틴 정보가 없습니다.');
        return;
      }

      if (!comment.trim()) {
        Alert.alert('입력 오류', '내용을 입력해주세요.');
        return;
      }

      const userId = await AsyncStorage.getItem('loggedInUserId');

      const photoUrl = selectedImages[0] || '';
      const photoUrl2 = selectedImages[1] || '';

      await axios.post('https://routinut-backend.onrender.com/api/routine-checks', {
        routineId: selectedRoutine.id,
        routineDayId: selectedRoutine.routineDayId,
        checkDate: new Date().toISOString().slice(0, 10),
        timerDuration: selectedRoutine.timerDuration,
        photoUrl,
        photoUrl2,
        comment,
        checked: share,
      });

      Alert.alert('루틴 완료!', '사진과 기록이 저장되었습니다.');
      completeRoutine();
    } catch (err) {
      console.error('루틴 완료 실패', err);
      Alert.alert('오류', '루틴 완료 중 문제가 발생했습니다.');
    }
  };





  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [routineToDelete, setRoutineToDelete] = useState(null);
  
  const handleDeleteRoutine = async () => {
    try {
      await axios.delete(`https://routinut-backend.onrender.com/api/routines/${routineToDelete.id}`);
      setRoutines(prev => prev.filter(r => r.id !== routineToDelete.id));
      setDeleteModalVisible(false);
      setRoutineToDelete(null);
      Alert.alert('삭제 완료', '루틴이 삭제되었습니다.');
    } catch (err) {
      console.error('삭제 실패', err);
      Alert.alert('오류', '루틴 삭제 중 문제가 발생했습니다.');
    }
};

  return (
    <Background>
      <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>루틴</Text>

      <View style={{ height: 245 }}>
       <ScrollView nestedScrollEnabled={true}>
          {routines.map((routine) => (
            <TouchableOpacity
              key={routine.id}
              activeOpacity={1}
              delayLongPress={500}
              onLongPress={() => {
                setRoutineToDelete(routine);
                setDeleteModalVisible(true);
              }}
            >
              <View style={[styles.routineCard, { backgroundColor: routine.color }]}>
                <Image source={routine.icon} style={styles.planetIcon} />
                <View style={styles.routineInfo}>
                  <Text style={styles.routineTitle}>{routine.title}</Text>
                  <Text style={styles.routineCategory}>{routine.category}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.statusBadge, { backgroundColor: routine.badgeColor }]}
                  onPress={() => toggleRoutine(routine)}
                >
                  <Text style={styles.statusText}>{routine.done ? '완료' : '미완료'}</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>

          ))}
        </ScrollView>
      </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('RoutineForm')}>
            <Text style={styles.buttonText}>루틴 추가하기</Text>
          </TouchableOpacity>
        </View>

        {/* 시간표 */}
        <Text style={styles.title}>시간표</Text>
        <ScrollView horizontal>
          <View style={styles.grid}>
            {/* 요일 헤더 */}
            <View style={styles.row}>
              <View style={styles.cell} />
              {weekDays.map((d, i) => (
                <View key={i} style={styles.cell}>
                  <Text style={styles.headerText}>{d}</Text>
                </View>
              ))}
            </View>

            {/* 시간 + 일정 표시 */}
            {timeSlots.map((time, i) => {
              const hour = parseInt(time);
              return (
                <View key={hour} style={styles.row}>
                  <View style={styles.cell}>
                    <Text style={styles.headerText}>{time}</Text>
                  </View>
                  {weekDays.map((day, colIdx) => {
                    const routine = timetableData.find(
                      s => s.day === day && s.startTime <= hour && hour < s.endTime
                    );
                    return (
                      <View
                        key={colIdx}
                        style={[styles.cell, routine && { backgroundColor: routine.color }]}
                      >
                        {routine && <Text style={styles.cellText}>{routine.title}</Text>}
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ScheduleForm')}>
            <Text style={styles.buttonText}>일정 수정하기</Text>
          </TouchableOpacity>
        </View>



        {/* 모달 */}
        <Modal visible={modalVisible} transparent animationType="fade">
          <Pressable style={styles.overlay} onPress={() => setModalVisible(false)}>
            <Pressable onPress={() => {}} style={styles.popup}>
              {selectedRoutine && (
                 <>
                    {/* 상단 헤더: 아이콘 + 루틴 이름 */}
                    <View style={styles.popupHeader}>
                      <Image source={selectedRoutine.icon} style={styles.popupIcon} />
                      <View>
                        <Text style={styles.popupTitle}>{selectedRoutine.title}</Text>
                        <Text style={styles.popupSubtitle}>{selectedRoutine.category}</Text>
                      </View>
                    </View>

                    {/* 1. 사진 첨부하기 버튼 */}
                    <TouchableOpacity onPress={openImagePicker} style={styles.imageAttachButton}>
                      <Ionicons name="camera" size={20} color="#27c2b5" />
                      <Text style={styles.imageAttachText}>사진 첨부하기</Text>
                    </TouchableOpacity>

                    {/* 2. 이미지 미리보기 */}
                    {selectedImages.length > 0 && (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                        {selectedImages.map((uri, index) => (
                          <View key={index} style={styles.previewWrapper}>
                            <Image source={{ uri }} style={styles.previewImage} />
                            <TouchableOpacity
                              style={styles.deleteButtonImg}
                              onPress={() => {
                                setSelectedImages(prev => prev.filter((_, i) => i !== index));
                              }}
                            >
                              <Text style={styles.deleteTextImg}>❌</Text>
                            </TouchableOpacity>
                          </View>
                        ))}
                      </ScrollView>
                    )}

                    {/* 3. 텍스트 입력창 */}
                    <TextInput
                      style={styles.textArea}
                      placeholder="내용을 입력해주세요"
                      value={comment}
                      onChangeText={setComment}
                      multiline={true}
                      numberOfLines={4}
                      textAlignVertical="top"
                    />

                    {/* 완료 및 공유 버튼 */}
                    <View style={styles.bottomRow}>
                      <TouchableOpacity onPress={toggleAlarm} style={styles.alarmRow}>
                        <Text>{share ? '☑' : '☐'} 은하광장에 공유하기</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handleSubmit} style={styles.confirmButton}>
                        <Text style={{ color: 'white' }}>완료</Text>
                      </TouchableOpacity>
                    </View>
                  </>
              )}
            </Pressable>
          </Pressable>
        </Modal>

        <Modal visible={deleteModalVisible} transparent animationType="fade">
          <View style={styles.overlay}>
            <View style={styles.deleteModal}>
              <Text style={styles.deleteTitle}>{routineToDelete?.title} 루틴을 삭제할까요?</Text>

              <View style={styles.deleteButtonRow}>
                <TouchableOpacity
                  style={[styles.deleteButton, styles.cancelButton]}
                  onPress={() => setDeleteModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.deleteButton, styles.confirmDeleteButton]}
                  onPress={handleDeleteRoutine}
                >
                  <Text style={styles.confirmDeleteText}>삭제</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </ScrollView>
      <BottomNav navigation={navigation} />
    </Background>
  );
}

const cellSize = 50;
const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 22,
    color: 'white',
    marginBottom: 25,
    textAlign: 'center',
    marginTop: 10,
  },
  routineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  planetIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginRight: 12,
  },
  routineInfo: {
    flex: 1,
  },
  routineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  routineCategory: {
    fontSize: 12,
    color: '#333',
    marginTop: 2,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  buttonRow: {
    alignItems: 'flex-end',
    marginTop: 20,
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  buttonText: {
    color: 'black',
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
  },
  headerCell: {
    width: 60,
    height: 40,
    borderWidth: 1,
    borderColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  headerText: {
    color: 'white',
    fontSize: 12,
  },
  timeCell: {
    width: 60,
    height: 40,
    borderWidth: 1,
    borderColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    color: 'white',
    fontSize: 12,
  },
  cell: {
    width: 60,
    height: 40,
    borderWidth: 1,
    borderColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    backgroundColor: '#fff',
    width: 300,
    padding: 20,
    borderRadius: 20,
  },
  popupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  popupIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginRight: 10,
  },
  popupTitle: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  popupSubtitle: {
    fontSize: 13,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 10,
    fontSize: 14,
    color: '#000',
  },
  photoArea: {
    backgroundColor: 'rgba(0,0,0,0)',
    height: 200, // 기존 150 -> 200으로 확대
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#666',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cellText: {
    color: 'black',
    fontSize: 8.5,
    fontWeight: 'bold',
  },
  
  grid: {
    borderWidth: 1,
    borderColor: '#555',
  },
  cell: {
    width: cellSize,
    height: cellSize,
    borderWidth: 0.5,
    borderColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  previewImage: {
    width: 120,
    height: 120, // 유지
    borderRadius: 8,
    marginRight: 10,
  },
  deleteModal: {
    backgroundColor: 'white',
    width: 280,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 5,
  },
  deleteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  deleteButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },

  deleteButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },

  cancelButton: {
    backgroundColor: '#E0E0E0',
  },

  confirmDeleteButton: {
    backgroundColor: '#E53935',
  },

  cancelButtonText: {
    color: '#333',
    fontSize: 13,
    fontWeight: '500',
  },

  confirmDeleteText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },

  imageAttachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#27c2b5',
    borderRadius: 8,
    paddingVertical: 10,
    width: "100%",
    alignSelf: 'center',
    marginBottom: 10,
  },
  imageAttachText: {
    color: '#27c2b5',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '600',
  },

  deleteButtonImg: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  deleteTextImg: {
    color: 'white',
    fontSize: 14,
  },

});
