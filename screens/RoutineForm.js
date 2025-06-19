import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Alert, } from 'react-native';
import Background from '../component/Background';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const categories = [
  {
    id: 1,
    name: '건강 & 운동',
    icon: require('../assets/건강&운동.png'),
  },
  {
    id: 2,
    name: '공부 & 업무',
    icon: require('../assets/공부&업무.png'),
  },
  {
    id: 3,
    name: '감정 & 정신 건강',
    icon: require('../assets/감정&정신건강.png'),
  },
  {
    id: 4,
    name: '취미 & 자기계발',
    icon: require('../assets/취미&자기계발.png'),
  },
  {
    id: 5,
    name: '자기관리',
    icon: require('../assets/자기관리.png'),
  },
];

const days = ['월', '화', '수', '목', '금', '토', '일'];

export default function RoutineForm({ navigation }) {
  const [routine, setRoutine] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [alarm, setAlarm] = useState(false);
  const isSubmitDisabled = !routine || selectedDays.length === 0 || !startTime || !endTime || !selectedCategory;

  const toggleDay = (day) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const toggleAlarm = () => setAlarm(!alarm);

  const handleAdd = async () => {
    try {
      const userIdRaw = await AsyncStorage.getItem('loggedInUserId');
      const userId = parseInt(userIdRaw);
      if (!userId) {
        Alert.alert('오류', '로그인 정보를 불러올 수 없습니다.');
        return;
      }

      const dayMap = {
        '월': 'MONDAY',
        '화': 'TUESDAY',
        '수': 'WEDNESDAY',
        '목': 'THURSDAY',
        '금': 'FRIDAY',
        '토': 'SATURDAY',
        '일': 'SUNDAY',
      };

      const englishDays = selectedDays.map(day => dayMap[day]);

      await axios.post('https://routinut-backend.onrender.com/api/routines', {
        userId,
        title: routine,
        dayOfWeek: englishDays, // ✅ 영어 요일 배열로 전달
        startTime: parseInt(startTime),
        endTime: parseInt(endTime),
        category: selectedCategory,
        alarmEnabled: alarm,
      });

      Alert.alert('성공', '루틴이 저장되었습니다.');
      navigation.navigate('Routine', { refresh: true });
    } catch (error) {
      console.error('루틴 저장 오류:', error);
      Alert.alert('오류', '루틴 저장 중 문제가 발생했습니다.');
    }
  };


  return (
    <Background>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>루틴 추가하기</Text>

        <Text style={styles.label}>루틴</Text>
        <TextInput
          style={styles.input}
          placeholder="루틴 이름을 입력하세요"
          placeholderTextColor="white"
          value={routine}
          onChangeText={setRoutine}
        />

        <Text style={styles.label}>요일</Text>
        <View style={styles.dayRow}>
          {days.map((day, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.dayButton, selectedDays.includes(day) && styles.daySelected]}
              onPress={() => toggleDay(day)}
            >
              <Text style={styles.dayText}>{day}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>시간</Text>
        <View style={styles.timeRow}>
            <TextInput
              style={styles.timeInput}
              placeholder="시작 시간 (예: 9)"
              placeholderTextColor="white"
              keyboardType="numeric"
              value={startTime}
              onChangeText={(text) => {
                if (/^\d*$/.test(text)) setStartTime(text);
              }}
            />
            <TextInput
              style={styles.timeInput}
              placeholder="종료 시간 (예: 18)"
              placeholderTextColor="white"
              keyboardType="numeric"
              value={endTime}
              onChangeText={(text) => {
                if (/^\d*$/.test(text)) setEndTime(text);
              }}
            />
        </View>

        <Text style={styles.label}>카테고리</Text>
        <View style={styles.categoryRow}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryItem,
                selectedCategory === cat.id && styles.categorySelected,
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Image source={cat.icon} style={styles.categoryIcon} />
              <Text style={styles.categoryText}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={toggleAlarm} style={styles.alarmRow}>
          <Text style={{ color: 'white' }}>{alarm ? '☑' : '☐'} 알림설정</Text>
        </TouchableOpacity>

        <View style={styles.submitWrapper}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleAdd}
            disabled={isSubmitDisabled}
          >
            <Text style={styles.submitText}>완료</Text>
          </TouchableOpacity>
          {isSubmitDisabled && <View style={styles.overlay} />}
        </View>

      </ScrollView>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    color: 'white',
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 25,
  },
  label: {
    color: 'white',
    marginTop: 15,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: 'white',       // 테두리 흰색
    backgroundColor: 'transparent', // 배경 투명
    color: 'white',             // 입력된 글자 흰색
    height: 40,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  dayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  dayButton: {
    borderWidth: 1,
    borderColor: 'white',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginRight: 6,
    marginTop: 4,
  },
  daySelected: {
    backgroundColor: '#5A86E9',
  },
  dayText: {
    color: 'white',
    fontSize: 12,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: 'white',
    backgroundColor: 'transparent',
    color: 'white',
    height: 40,
    paddingHorizontal: 10,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 5,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    width: 300,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 10,
    width: 75,
    paddingBottom: 9,
  },
  categorySelected: {
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 10,
},
  categoryIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  categoryText: {
    fontSize: 10,
    color: 'white',
    marginTop: 2,
    textAlign: 'center',
  },
  alarmRow: {
    marginTop: 20,
    marginBottom: 20,
  },
  submitButton: {
    borderWidth: 1,
    borderColor: 'white',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    height: 50,
  },
  submitText: {
    color: 'white',
    fontWeight: 'bold',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(128,128,128,0.5)', // 회색 반투명
    borderRadius: 12,
    height: 50,
    zIndex: 1,
  },
});
