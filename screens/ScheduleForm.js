import React, { useState } from 'react';
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

const HOURS = Array.from({ length: 14 }, (_, i) => i + 9); // 9~22시
const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function ScheduleForm() {
  const navigation = useNavigation();

  const [scheduleList, setScheduleList] = useState([]);
  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedDay, setSelectedDay] = useState(1); // 월요일

  const handleAdd = () => {
    if (!name || !startTime || !endTime) return;
    const newSchedule = {
      name,
      startTime: parseInt(startTime),
      endTime: parseInt(endTime),
      day: selectedDay,
    };
    setScheduleList([...scheduleList, newSchedule]);
    setName('');
    setStartTime('');
    setEndTime('');
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
                      onPress={() => item && handleDelete(colIdx, hour)}
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
                selectedDay === i && styles.dayButtonActive,
              ]}
              onPress={() => setSelectedDay(i)}
            >
              <Text
                style={[
                  styles.dayText,
                  selectedDay === i && styles.dayTextActive,
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
            onChangeText={setStartTime}
            keyboardType="numeric"
            placeholder="시작 (예: 9)"
            placeholderTextColor="#aaa"
          />
          <TextInput
            style={styles.timeInput}
            value={endTime}
            onChangeText={setEndTime}
            keyboardType="numeric"
            placeholder="끝 (예: 18)"
            placeholderTextColor="#aaa"
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <Text style={styles.addText}>추가하기</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.doneButton} onPress={() => navigation.navigate('Main')}>
          <Text style={styles.doneText}>완료</Text>
        </TouchableOpacity>
      </ScrollView>
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
    backgroundColor: '#5D6BFF',
  },
  cellText: {
    color: 'white',
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
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 30,
  },
  doneText: {
    color: 'white',
    fontSize: 16,
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
});
