import React, { useState, useEffect  } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import Background from '../component/Background';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const HOURS = Array.from({ length: 18 }, (_, i) => i + 7); // 7~24시
const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function ScheduleForm() {
  const navigation = useNavigation();

  const [scheduleList, setScheduleList] = useState([]);
  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedDays, setSelectedDays] = useState([]); // 여러 요일 선택 가능
  const toggleDay = (dayIndex) => {
    setSelectedDays(prev =>
      prev.includes(dayIndex)
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex]
    );
  };

  const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const userId = await AsyncStorage.getItem('loggedInUserId');
        if (!userId) {
          Alert.alert('오류', '로그인 정보가 없습니다.');
          return;
        }

        const response = await axios.get(`https://routinut-backend.onrender.com/api/schedules/user/${userId}`);
        const fetched = response.data;

        const converted = fetched.map(item => ({
          name: item.title,
          day: DAYS.indexOf(item.dayOfWeek),
          startTime: parseInt(item.startTime.split(':')[0]),
          endTime: parseInt(item.endTime.split(':')[0]),
        }));

        setScheduleList(prev => [...prev, ...converted]);
      } catch (error) {
        console.error('일정 불러오기 실패:', error);
        Alert.alert('오류', '일정 불러오기에 실패했습니다.');
      }
    };

    fetchSchedules();
  }, []);

  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // { day, hour }


  const handleAdd = () => {
    if (!name || !startTime || !endTime || selectedDays.length === 0) return;

    const newSchedules = selectedDays.map(day => ({
      name,
      startTime: parseInt(startTime),
      endTime: parseInt(endTime), 
      day,
    }));

    setScheduleList([...scheduleList, ...newSchedules]);
    setName('');
    setStartTime('');
    setEndTime('');
    setSelectedDays([]); // 선택 초기화
  };

  const handleSubmitSchedules = async () => {
    try {
      const userInfo = await AsyncStorage.getItem('loggedInUserId');
      if (!userInfo) {``
        Alert.alert('오류', '로그인된 사용자 정보가 없습니다.');
        return;
      }
      const userId = userInfo;

      // scheduleList를 API 요청 형식에 맞게 변환
      const schedules = scheduleList.map(item => ({
        title: item.name,
        dayOfWeek: ['일', '월', '화', '수', '목', '금', '토'][item.day], // 숫자 인덱스를 요일 문자열로
        startTime: item.startTime,
        endTime: item.endTime,
      }));

      const requestBody = {
        userId,
        schedules,
      };

      const response = await axios.put('https://routinut-backend.onrender.com/api/schedules/bulk', requestBody);
      console.log('스케줄 저장 성공:', response.data);
      Alert.alert('성공', '스케줄이 저장되었습니다.');
      navigation.navigate('Routine');

    } catch (error) {
      console.error('스케줄 저장 오류:', error);
      Alert.alert('오류', '스케줄 저장 중 문제가 발생했습니다.');
    }
  };


  const handleDelete = (day, hour) => {
    const updated = scheduleList.filter(
      s => !(s.day === day && s.startTime <= hour && hour < s.endTime)
    );
    setScheduleList(updated);
  };

  return (
    <Background>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>일정표</Text>

        {/* 시간표 */}
        <ScrollView horizontal>
          <View style={styles.grid}>
            <View style={styles.row}>
              <View style={styles.cell} />
              {DAYS.map((d, i) => (
                <View key={i} style={styles.cell}>
                  <Text style={styles.headerText}>{d}</Text>
                </View>
              ))}
            </View>

            {HOURS.map(hour => (
              <View key={hour} style={styles.row}>
                <View style={styles.cell}>
                  <Text style={styles.headerText}>{hour}:00</Text>
                </View>
                {DAYS.map((_, colIdx) => {
                  const item = scheduleList.find(
                    s => s.day === colIdx && s.startTime <= hour && hour < s.endTime
                  );
                  return (
                    <TouchableOpacity
                      key={colIdx}
                      style={[styles.cell, item ? styles.activeCell : null]}
                      onPress={() => {
                        if (item) {
                          setSelectedItem({ day: colIdx, hour });
                          setPopupVisible(true);
                        }
                      }}
                    >
                      {item && <Text style={styles.cellText}>{item.name}</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>

        {/* 입력 폼 */}
        <Text style={styles.label}>일정명</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="예: 헬스"
          placeholderTextColor="#aaa"
        />

        {/* 요일 선택 */}
        <Text style={styles.label}>요일</Text>
        <View style={styles.daySelector}>
          {DAYS.map((d, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.dayButton,
                selectedDays.includes(i) && styles.dayButtonActive,
              ]}
              onPress={() => toggleDay(i)}
            >
              <Text
                style={[
                  styles.dayText,
                  selectedDays.includes(i) && styles.dayTextActive,
                ]}
              >
                {d}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>시간</Text>
        <View style={styles.timeRow}>
          <TextInput
            style={styles.timeInput}
            value={startTime}
            onChangeText={(text) => {
              if (/^\d*$/.test(text)) setStartTime(text);
            }}
            keyboardType="numeric"
            placeholder="시작 (예: 9)"
            placeholderTextColor="#aaa"
          />
          <TextInput
            style={styles.timeInput}
            value={endTime}
            onChangeText={(text) => {
              if (/^\d*$/.test(text)) setEndTime(text);
            }}
            keyboardType="numeric"
            placeholder="끝 (예: 18)"
            placeholderTextColor="#aaa"
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <Text style={styles.addText}>추가하기</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.doneButtonWrapper}>
          <TouchableOpacity
            style={styles.doneButton}
            onPress={handleSubmitSchedules}
          >
            <Text style={styles.doneText}>완료</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {popupVisible && selectedItem && (
        <View style={styles.popup}>
          <TouchableOpacity
            style={styles.popupButton}
            onPress={() => {
              handleDelete(selectedItem.day, selectedItem.hour);
              setPopupVisible(false);
            }}
          >
            <Text style={styles.popupText}>삭제하기</Text>
            <Text style={styles.popupIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
      )}
    </Background>
  );
}

const cellSize = 50;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 60,
  },
  title: {
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  grid: {
    borderWidth: 1,
    borderColor: '#555',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: cellSize,
    height: cellSize,
    borderWidth: 0.5,
    borderColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeCell: {
    backgroundColor: '#fff',
  },
  cellText: {
    fontSize: 12,
  },
  headerText: {
    color: 'white',
    fontSize: 12,
  },
  label: {
    color: 'white',
    marginTop: 20,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 10,
    padding: 10,
    color: 'white',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 10,
    padding: 10,
    color: 'white',
    width: 95,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#5D6BFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addText: {
    color: 'white',
    fontWeight: 'bold',
  },
  doneButton: {
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 30,
    height: 50,
  },
  doneText: {
    color: 'white',
    fontSize: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(128,128,128,0.5)', // 회색 반투명
    borderRadius: 12,
    height: 50,
    zIndex: 1,
    marginTop: 30,
  },
  daySelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    flexWrap: 'wrap',
  },
  dayButton: {
    padding: 8,
    marginHorizontal: 5,
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 20,
  },
  dayButtonActive: {
    backgroundColor: '#5D6BFF',
  },
  dayText: {
    color: 'white',
  },
  dayTextActive: {
    fontWeight: 'bold',
    color: '#fff',
  },
  popup: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },

  popupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },

  popupText: {
    color: '#e53935',
    fontSize: 16,
    marginRight: 8,
  },

  popupIcon: {
    fontSize: 18,
    color: '#e53935',
  },
});
