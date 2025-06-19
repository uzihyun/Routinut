import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  ScrollView, Dimensions, Animated, Pressable, Easing
} from 'react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import Background from '../component/Background';
import BottomNav from '../component/BottomNav';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SCREEN_WIDTH = Dimensions.get('window').width;
const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

function generateCalendarDates(year, month) {
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const startDay = firstDayOfMonth.getDay();
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(firstDayOfMonth.getDate() - startDay);

  const days = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    days.push({
      date,
      isCurrentMonth: date.getMonth() === (month - 1),
      isToday: date.toDateString() === new Date().toDateString(),
      dayOfWeek: date.getDay()
    });
  }
  return days;
}

function getWeekDates(baseDate) {
  const startOfWeek = new Date(baseDate);
  startOfWeek.setDate(baseDate.getDate() - baseDate.getDay());
  const week = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    week.push({
      date,
      day: dayNames[i],
      isToday: date.toDateString() === new Date().toDateString(),
    });
  }
  return week;
}

const formatHourToHMS = (hourFloat) => {
  const totalSeconds = Math.floor(hourFloat * 3600);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export default function Statistics() {
  const navigation = useNavigation();
  const [baseDate, setBaseDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState('자투리');

  const year = baseDate.getFullYear();
  const month = baseDate.getMonth() + 1;
  const calendarDates = generateCalendarDates(year, month);
  const weekDates = getWeekDates(baseDate);

  /* const todayUsage = selectedDate.getDate() % 12 + 1;
  const weeklyUsage = weekDates.map((d) => d.date.getDate() % 12 + 1);
  const weeklyGoal = [5, 5, 5, 5, 5, 3, 3];
   */

  const [spareTodayUsage, setSpareTodayUsage] = useState(0);
  const [spareWeeklyUsage, setSpareWeeklyUsage] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [spareTodayRaw, setSpareTodayRaw] = useState('00:00:00');

  useEffect(() => {
    const fetchSpareStatistics = async () => {
      try {
        const userId = await AsyncStorage.getItem('loggedInUserId');
        const date = selectedDate.toISOString().slice(0, 10);

        const response = await axios.get(`https://routinut-backend.onrender.com/api/spare-time/statistics?userId=${userId}&baseDate=${date}`);
        const data = response.data;

        const dayOrder = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

        const timeToMinutes = (str) => {
          const [h, m, s] = str.split(':').map(Number);
          return Math.round(h * 60 + m + (s / 60));
        };

        const weekly = dayOrder.map(day => timeToMinutes(data[day] || '00:00:00'));
        const todayRaw = data[`TOTAL_${date}`] || '00:00:00';
        const today = timeToMinutes(todayRaw);

        setSpareTodayRaw(todayRaw);         // ✅ 이 줄 추가
        setSpareTodayUsage(today);
        setSpareWeeklyUsage(weekly);
      } catch (err) {
        console.error('자투리 통계 불러오기 실패', err);
      }
    };

    fetchSpareStatistics();
  }, [selectedDate]);



  const sparePieData = [
    { name: '사용 시간', time: spareTodayUsage, color: '#fff', legendFontColor: 'white', legendFontSize: 14 },
    { name: '남은 시간', time: 1440 - spareTodayUsage, color: '#555', legendFontColor: 'white', legendFontSize: 14 }, // 24시간 = 1440분
  ];

  const spareBarData = {
    labels: ['일', '월', '화', '수', '목', '금', '토'],
    datasets: [
      { data: spareWeeklyUsage, color: () => 'white' },
      { data: [20, 20, 20, 20, 20, 10, 10], color: () => 'gray' }, // 목표도 분 단위
    ],
    legend: ['실제', '목표'],
  };

  const [routineTodayUsage, setRoutineTodayUsage] = useState(0);
  const [routineWeeklyUsage, setRoutineWeeklyUsage] = useState([0, 0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    const fetchRoutineStatistics = async () => {
      try {
        const userId = await AsyncStorage.getItem('loggedInUserId');
        const date = selectedDate.toISOString().slice(0, 10); // baseDate → selectedDate

        const response = await axios.get(`https://routinut-backend.onrender.com/api/statistics/time-usage?userId=${userId}&date=${date}`);
        const data = response.data;

        const dayOrder = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        const weekly = dayOrder.map(day => data[day] || 0);

        setRoutineTodayUsage(data[`TOTAL_${date}`] || 0);
        setRoutineWeeklyUsage(weekly);
      } catch (err) {
        console.error('루틴 통계 불러오기 실패', err);
      }
    };

    fetchRoutineStatistics();
  }, [selectedDate]); // baseDate → selectedDate


  /* const pieData = [
    { name: '사용 시간', time: todayUsage, color: '#fff', legendFontColor: 'white', legendFontSize: 14 },
    { name: '남은 시간', time: 24 - todayUsage, color: '#555', legendFontColor: 'white', legendFontSize: 14 },
  ]; */

  const routinePieData = [
    {
      name: '사용 시간',
      time: routineTodayUsage,
      color: '#fff',
      legendFontColor: 'white',
      legendFontSize: 14,
    },
    {
      name: '남은 시간',
      time: 24 - routineTodayUsage,
      color: '#555',
      legendFontColor: 'white',
      legendFontSize: 14,
    },
  ];

  const routineBarData = {
    labels: ['일', '월', '화', '수', '목', '금', '토'],
    datasets: [
      { data: routineWeeklyUsage, color: () => 'white' },
      { data: [5, 5, 5, 5, 5, 3, 3], color: () => 'gray' }, // 목표치 예시
    ],
    legend: ['실제', '목표'],
  };

  const pieScale = useState(new Animated.Value(0))[0];
  const textOpacity = useState(new Animated.Value(0))[0];
  const barTranslateY = useState(new Animated.Value(100))[0];

  const routinePieScale = useState(new Animated.Value(0))[0];
  const routineTextOpacity = useState(new Animated.Value(0))[0];
  const routineBarTranslateY = useState(new Animated.Value(100))[0];

  useEffect(() => {
    // 애니메이션 초기화
    pieScale.setValue(0);
    textOpacity.setValue(0);
    barTranslateY.setValue(100);
    routinePieScale.setValue(0);
    routineTextOpacity.setValue(0);
    routineBarTranslateY.setValue(100);

    // 탭에 따라 애니메이션 실행
    if (selectedTab === '자투리') {
      Animated.sequence([
        Animated.timing(pieScale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.parallel([
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(barTranslateY, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.out(Easing.exp),
          }),
        ])
      ]).start();
    } else if (selectedTab === '루틴') {
      Animated.sequence([
        Animated.timing(routinePieScale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.parallel([
          Animated.timing(routineTextOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(routineBarTranslateY, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.out(Easing.exp),
          }),
        ])
      ]).start();
    }
  }, [selectedTab]);

  const handleMonthToggle = () => setModalVisible(!isModalVisible);
  const handleDateSelect = (dateObj) => {
    setSelectedDate(dateObj);
    setModalVisible(false);
  };
  const goToPrevWeek = () => {
    const newDate = new Date(baseDate);
    newDate.setDate(baseDate.getDate() - 7);
    setBaseDate(newDate);
  };
  const goToNextWeek = () => {
    const newDate = new Date(baseDate);
    newDate.setDate(baseDate.getDate() + 7);
    setBaseDate(newDate);
  };
  const goToPrevMonth = () => {
    const newDate = new Date(baseDate);
    newDate.setMonth(baseDate.getMonth() - 1);
    setBaseDate(newDate);
  };
  const goToNextMonth = () => {
    const newDate = new Date(baseDate);
    newDate.setMonth(baseDate.getMonth() + 1);
    setBaseDate(newDate);
  };

  const calendarRows = [];
  for (let i = 0; i < calendarDates.length; i += 7) {
    calendarRows.push(calendarDates.slice(i, i + 7));
  }

  return (
    <Background>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.monthRow}>
          <TouchableOpacity onPress={goToPrevWeek}>
            <Text style={styles.arrow}>{'◀'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleMonthToggle}>
            <Text style={styles.monthText}>{year}년 {month}월 ▼</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={goToNextWeek}>
            <Text style={styles.arrow}>{'▶'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.weekNav}>
          {weekDates.map((item, idx) => {
            const isSelected = item.date.toDateString() === selectedDate.toDateString();
            return (
              <View key={idx} style={styles.dateBlock}>
                <Text style={styles.dayText}>{item.day}</Text>
                <TouchableOpacity onPress={() => setSelectedDate(item.date)}>
                  <View style={[
                    styles.dateCircle,
                    isSelected && styles.selectedCircle,
                    item.isToday && styles.todayCircle
                  ]}>
                    <Text style={[
                      styles.dateText,
                      isSelected && styles.selectedText
                    ]}>
                      {String(item.date.getDate()).padStart(2, '0')}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <View style={styles.tabWrapper}>
          <TouchableOpacity
            style={[
              styles.tabButton, styles.leftTab,
              selectedTab === '자투리' && styles.activeTab
            ]}
            onPress={() => setSelectedTab('자투리')}
          >
            <Text style={[styles.tabText, selectedTab === '자투리' && styles.activeTabText]}>자투리</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton, styles.rightTab,
              selectedTab === '루틴' && styles.activeTab
            ]}
            onPress={() => setSelectedTab('루틴')}
          >
            <Text style={[styles.tabText, selectedTab === '루틴' && styles.activeTabText]}>루틴</Text>
          </TouchableOpacity>
        </View>

        {/* 자투리 탭 */}
        {selectedTab === '자투리' && (
          <View>
            <Animated.View style={{ transform: [{ scale: pieScale }] }}>
              <PieChart
                data={sparePieData}
                width={SCREEN_WIDTH}
                height={200}
                chartConfig={chartConfig}
                accessor="time"
                backgroundColor="transparent"
                paddingLeft="65"
                hasLegend={false}
              />
            </Animated.View>
            <Animated.Text style={[styles.statsText, { opacity: textOpacity }]}>
              하루 자투리 총 사용 시간: {spareTodayRaw}
            </Animated.Text>
            <Animated.View style={{ transform: [{ translateY: barTranslateY }] }}>
              <BarChart
                data={spareBarData}
                width={SCREEN_WIDTH - 40}
                height={220}
                fromZero
                /* yAxisSuffix="분" */
                segments={6} // 0~60 고정 눈금
                chartConfig={{
                  ...spareChartConfig,
                  formatYLabel: (value) => `${parseInt(value, 10)}`
                }}
                style={{ alignSelf: 'center', position: 'relative', right: 20 }}
              />
            </Animated.View>
            <Animated.Text style={[styles.statsText, { opacity: textOpacity }]}>
              일주일 자투리 총 사용 시간: {formatHourToHMS(spareWeeklyUsage.reduce((a, b) => a + b, 0) / 60)}
            </Animated.Text>
          </View>
        )}

        {/* 루틴 탭 */}
        {selectedTab === '루틴' && (
          <View>
            <Animated.View style={{ transform: [{ scale: routinePieScale }] }}>
              <PieChart
                data={routinePieData}
                width={SCREEN_WIDTH}
                height={200}
                chartConfig={chartConfig}
                accessor="time"
                backgroundColor="transparent"
                paddingLeft="65"
                hasLegend={false}
              />
            </Animated.View>
            <Animated.Text style={[styles.statsText, { opacity: routineTextOpacity }]}>
              하루 루틴 총 사용 시간: {routineTodayUsage}H
            </Animated.Text>
            <Animated.View style={{ transform: [{ translateY: routineBarTranslateY }] }}>
              <BarChart
                data={routineBarData}
                width={SCREEN_WIDTH - 40}
                height={220}
                fromZero
                chartConfig={chartConfig}
                style={{ alignSelf: 'center', position: 'relative', right: 20 }}
              />
            </Animated.View>
            <Animated.Text style={[styles.statsText, { opacity: routineTextOpacity }]}>
              일주일 루틴 총 사용 시간: {routineWeeklyUsage.reduce((a, b) => a + b)}H
            </Animated.Text>
          </View>
        )}


        {/* 캘린더 모달 */}
        <Modal visible={isModalVisible} transparent animationType="fade">
          <Pressable style={styles.modalBackdrop} onPress={() => setModalVisible(false)}>
            <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={goToPrevMonth}>
                  <Text style={styles.arrow}>{'◀'}</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>{year}년 {month}월</Text>
                <TouchableOpacity onPress={goToNextMonth}>
                  <Text style={styles.arrow}>{'▶'}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.calendarHeader}>
                {dayNames.map((d, i) => (
                  <Text key={i} style={styles.dayLabel}>{d}</Text>
                ))}
              </View>
              <View style={styles.calendarGrid}>
                {calendarRows.map((week, rowIdx) => (
                  <View key={rowIdx} style={styles.calendarRow}>
                    {week.map((d, i) => {
                      const isSelected = d.date.toDateString() === selectedDate.toDateString();
                      return (
                        <TouchableOpacity
                          key={i}
                          style={[
                            styles.modalDate,
                            isSelected && styles.modalSelectedCircle,
                            d.isToday && styles.todayCircle,
                            !d.isCurrentMonth && styles.inactiveDate
                          ]}
                          onPress={() => handleDateSelect(d.date)}
                        >
                          <Text style={[
                            { color: d.isCurrentMonth ? '#000' : '#888' },
                            isSelected && styles.modalSelectedText
                          ]}>
                            {String(d.date.getDate()).padStart(2, '0')}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>
            </View>
          </Pressable>
        </Modal>
      </ScrollView>
      <BottomNav navigation={navigation} />
    </Background>
  );
}

const chartConfig = {
  backgroundGradientFrom: '#000',
  backgroundGradientTo: '#000',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: () => '#fff',
};

const spareChartConfig = {
  backgroundGradientFrom: '#000',
  backgroundGradientTo: '#000',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: () => '#fff',
  formatYLabel: (value) => {
    const minutes = Math.round(value * 60);
    return `${minutes}`;
  },
};

const styles = StyleSheet.create({
  container: { paddingTop: 50, paddingBottom: 80 },
  monthRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 30, marginBottom: 10,
  },
  monthText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  arrow: { color: 'white', fontSize: 20 },
  statsText: { color: 'white', textAlign: 'center', marginVertical: 10, fontSize: 14 },
  weekNav: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
    gap: 3, 
  },
  dateBlock: {
    alignItems: 'center',
    marginHorizontal: 1, 
  },
  dayText: { color: 'white', fontSize: 13, marginBottom: 4 },
  dateCircle: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: '#333',
    justifyContent: 'center', alignItems: 'center',
  },
  selectedCircle: { backgroundColor: '#fff' },
  selectedText: { color: '#000', fontWeight: 'bold' },
  todayCircle: { borderColor: 'white', borderWidth: 2 },
  dateText: { fontSize: 14, color: 'white' },
  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#111', borderRadius: 10,
    padding: 20, width: SCREEN_WIDTH * 0.9,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  modalTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  calendarHeader: {
    flexDirection: 'row', justifyContent: 'space-around',
    marginBottom: 5, width: 330, position: 'relative', right: 10
  },
  dayLabel: { textAlign: 'center', color: '#fff', fontWeight: 'bold' },
  calendarGrid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center',
  },
  calendarRow: { flexDirection: 'row', justifyContent: 'center' },
  modalDate: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    margin: 4, borderWidth: 1, borderColor: '#000', backgroundColor: '#fff',
  },
  modalSelectedCircle: { backgroundColor: '#000', borderColor: '#fff' },
  modalSelectedText: { color: '#fff', fontWeight: 'bold' },
  inactiveDate: { backgroundColor: '#ccc', borderColor: '#ccc' },
  tabWrapper: {
    flexDirection: 'row', alignSelf: 'center',
    borderWidth: 2, borderColor: '#fff',
    borderRadius: 10, overflow: 'hidden', marginVertical: 20,
  },
  tabButton: {
    width: 130,
    paddingVertical: 10,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  leftTab: { borderTopLeftRadius: 8, borderBottomLeftRadius: 8 },
  rightTab: { borderTopRightRadius: 8, borderBottomRightRadius: 8 },
  tabText: { color: 'gray', fontSize: 16 },
  activeTab: { backgroundColor: '#fff' },
  activeTabText: { color: '#000', fontWeight: 'bold' }
});
