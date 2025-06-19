import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  ImageBackground,
  Animated, 
  Easing
} from 'react-native';
import Background from '../component/Background';
import BottomNav from '../component/BottomNav';
import { useNavigation } from '@react-navigation/native';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Main() {
  const navigation = useNavigation();
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [wasStopped, setWasStopped] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(true);
  const [resultText, setResultText] = useState('');
  const [routines, setRoutines] = useState([]);
  const animation = useRef(new Animated.Value(0)).current;
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryRoutines, setCategoryRoutines] = useState([]);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);


  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const userId = await AsyncStorage.getItem('loggedInUserId');
        if (!userId) {
          console.warn('userId가 없습니다.');
          return;
        }

        const response = await axios.get(`https://routinut-backend.onrender.com/api/statistics/weekly?userId=${userId}`);
        const data = response.data;

        const routineMap = {
          1: { title: '건강&운동', image: require('../assets/건강&운동.png') },
          2: { title: '공부&업무', image: require('../assets/공부&업무.png') },
          3: { title: '감정&정신건강', image: require('../assets/감정&정신건강.png') },
          4: { title: '취미&자기계발', image: require('../assets/취미&자기계발.png') },
          5: { title: '자기관리', image: require('../assets/자기관리.png') },
        };

        const updatedRoutines = data.map(item => ({
          id: item.category,
          title: routineMap[item.category].title,
          image: routineMap[item.category].image,
          stars: item.stars,
          level: item.successRate,
        }));

        setRoutines(updatedRoutines);
      } catch (error) {
        console.error('루틴 통계 불러오기 실패:', error);
      }
    };

    fetchStatistics();
  }, []);



  const rowsShotRef = useRef();

  useEffect(() => {
    let interval;
    if (timerActive) {
      interval = setInterval(() => setTimer(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const startTimer = () => {
    setTimer(0);
    setTimerActive(true);
    setShowTimerModal(true);
  };

  const stopTimer = () => {
    setTimerActive(false);
    setWasStopped(true);
  };

  const resumeTimer = () => {
    setTimerActive(true);
    setWasStopped(false);
  };

  const openCategoryModal = async (categoryId) => {
    try {
      const userId = await AsyncStorage.getItem('loggedInUserId');
      if (!userId) return;

      const response = await axios.get(`https://routinut-backend.onrender.com/api/routines/today?userId=${userId}`);
      const allRoutines = response.data;

      const filtered = allRoutines.filter(r => r.category === categoryId);
      setCategoryRoutines(filtered);
      setSelectedCategory(categoryId);
      setCategoryModalVisible(true);
    } catch (error) {
      console.error('카테고리 루틴 불러오기 실패:', error);
    }
  };

  const completeTimer = async () => {
    setTimerActive(false);
    setShowTimerModal(false);

    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    setShowSuggestion(true);
    setResultText(`자투리 시간을 ${minutes}분 ${seconds}초 활용하였습니다.`);

    try {
      const userId = await AsyncStorage.getItem('loggedInUserId');
      if (!userId) {
        console.warn('userId가 없습니다.');
        return;
      }

      const now = new Date();
      const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

      const hours = String(Math.floor(timer / 3600)).padStart(2, '0');
      const mins = String(Math.floor((timer % 3600) / 60)).padStart(2, '0');
      const secs = String(timer % 60).padStart(2, '0');
      const duration = `${hours}:${mins}:${secs}`;

      const requestBody = {
        userId: parseInt(userId, 10),
        date: dateStr,
        duration: duration,
      };

      await axios.put('https://routinut-backend.onrender.com/api/spare-time', requestBody);
      console.log('자투리 시간 저장 완료:', requestBody);
    } catch (err) {
      console.error('자투리 시간 저장 실패:', err);
    }
  };


  const captureRowsOnly = async () => {
    try {
      const uri = await rowsShotRef.current.capture();
      await Sharing.shareAsync(uri);
    } catch (e) {
      console.error(e);
      Alert.alert('오류', '캡처에 실패했습니다.');
    }
  };

  const renderStars = count => {
    const translateY = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [-3, 3],
    });

    const positions = [
      { top: -10, left: 40 },
      { top: 10, left: 3 },
      { top: 10, right: 3 },
      { bottom: 20, left: 10 },
      { bottom: 20, right: 10 },
    ];

    return positions.slice(0, count).map((pos, idx) => (
      <Animated.Image
        key={idx}
        source={require('../assets/star.png')}
        style={[styles.star, pos, { transform: [{ translateY }] }]}
      />
    ));
  };

  const renderItem = item => {
    const translateY = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [-5, 5],
    });

    return (
      <TouchableOpacity onPress={() => openCategoryModal(item.id)}>
        <Animated.View style={[styles.planetWrapper, { transform: [{ translateY }] }]}>
          {renderStars(item.stars)}
          <Image source={item.image} style={[styles.planet]} />
          <Text style={styles.label}>{item.title}</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderRows = () => {
    const rows = [];
    for (let i = 0; i < routines.length; i += 3) {
      const rowItems = routines.slice(i, i + 3);
      rows.push(
        <View key={i} style={styles.row}>
          {rowItems.map(item => (
            <View key={item.id} style={styles.item}>{renderItem(item)}</View>
          ))}
        </View>
      );
    }
    return rows;
  };

  return (
    <Background>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollArea}>
          <ViewShot
            ref={rowsShotRef}
            options={{ format: 'png', quality: 1 }}
            style={{ width: '100%', paddingVertical: 20, alignItems: 'center' }} // 캡처 안정성 확보
          >
            <ImageBackground
              source={require('../assets/star-background.jpg')}
              style={styles.backgroundImage}
              imageStyle={{ resizeMode: 'cover' }}
            >
              {renderRows()}
            </ImageBackground>
          </ViewShot>


            <View style={styles.suggestionBox}>
            {showSuggestion && (
              <View style={styles.bubble}>
                <Text style={styles.suggestionText}>
                  {resultText || '자투리 시간을 활용해 자기계발 해보는게 어떨까요?'}
                </Text>
                {!resultText && (
                  <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.choiceButton} onPress={startTimer}>
                      <Text style={styles.buttonText}>좋아요</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.laterButton} onPress={() => setShowSuggestion(false)}>
                      <Text style={styles.buttonText}>나중에할게요</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
            <View style={styles.bubbleTail} />
              <TouchableOpacity onPress={() => navigation.navigate('Chatbot')}>
                <Animated.Image
                  source={require('../assets/우주인.png')}
                  style={[styles.astronaut, { transform: [{ translateY: animation.interpolate({ inputRange: [0, 1], outputRange: [-5, 5] }) }] }]}
                />
              </TouchableOpacity>
            </View>
        </ScrollView>

        <TouchableOpacity style={styles.screenshotButton} onPress={captureRowsOnly}>
          <Text style={styles.screenshotText}>📸</Text>
        </TouchableOpacity>

        <BottomNav navigation={navigation} />

        <Modal visible={showTimerModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.timerText}>
                {String(Math.floor(timer / 3600)).padStart(2, '0')}:
                {String(Math.floor((timer % 3600) / 60)).padStart(2, '0')}:
                {String(timer % 60).padStart(2, '0')}
              </Text>
              <View style={styles.modalButtons}>
                {wasStopped ? (
                  <TouchableOpacity onPress={resumeTimer} style={styles.choiceButton}>
                    <Text style={styles.buttonText}>시작하기</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={stopTimer} style={styles.choiceButton}>
                    <Text style={styles.buttonText}>중단하기</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={completeTimer} style={styles.choiceButton}>
                  <Text style={styles.buttonText}>완료하기</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>

      <Modal
        visible={categoryModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPressOut={() => setCategoryModalVisible(false)}
          style={styles.modalOverlay}
        >
          <TouchableOpacity activeOpacity={1} style={styles.categoryModal}>
            <Text style={styles.categoryTitle}>루틴 목록</Text>
            <ScrollView style={{ maxHeight: 300, marginVertical: 10 }}>
              {categoryRoutines.map((routine) => (
                <View key={routine.id} style={styles.routineBox}>
                  <Text style={styles.routineText}>📌 {routine.title}</Text>
                  <Text style={styles.routineText}>
                    ⏰ {routine.startTime.slice(0, 5)} ~ {routine.endTime.slice(0, 5)}
                  </Text>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setCategoryModalVisible(false)} style={styles.choiceButton}>
              <Text style={styles.buttonText}>닫기</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

    </Background>
  );
}

const styles = StyleSheet.create({
  viewShot: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 20,
  },
  backgroundImage: {
    width: '100%',
    paddingVertical: 30,
    alignItems: 'center',
  },
  container: { flex: 1 },
  scrollArea: { paddingTop: 20, paddingBottom:5, height: 430, },
  row: { flexDirection: 'row', justifyContent: 'space-around', },
  item: { alignItems: 'center', flex: 1, marginTop: 50, },
  planetWrapper: { alignItems: 'center', justifyContent: 'center', position: 'relative', width: 100, height: 100 },
  planet: { width: 80, height: 80, resizeMode: 'contain' },
  star: { width: 14, height: 14, resizeMode: 'contain', position: 'absolute' },
  label: { color: 'white', fontSize: 12, marginTop: 5 },
  suggestionBox: { position: 'absolute', bottom: -200, left: 0, right: 0, alignItems: 'center', zIndex: 10 },
  bubble: { backgroundColor: 'rgba(26, 23, 48, 0.8)', borderRadius: 15, padding: 10, alignItems: 'center' },
  bubbleTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(26, 23, 48, 0.8)',
    marginBottom: -5,
  },
  suggestionText: { color: 'white', fontSize: 13, textAlign: 'center', marginBottom: 10 },
  buttonRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  choiceButton: { backgroundColor: '#5A86E9', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, marginHorizontal: 5 },
  laterButton: { backgroundColor: 'rgba(50, 47, 76, 0.7)', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: 'white', marginHorizontal: 5 },
  buttonText: { color: 'white', fontSize: 12 },
  astronaut: { width: 110, height: 110, resizeMode: 'contain', marginTop: 5 },
  screenshotButton: { position: 'absolute', bottom: 120, right: 20, borderWidth: 1, borderColor: '#fff',padding: 12, borderRadius: 30, elevation: 5 },
  screenshotText: { fontSize: 20, position: 'relative', bottom: 3},
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', padding: 30, borderRadius: 20, alignItems: 'center' },
  timerText: { fontSize: 40, fontWeight: 'bold', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', gap: 10 },
  categoryModal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    width: '80%',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  routineBox: {
    backgroundColor: '#ECECEC',
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
  },
  routineText: {
    fontSize: 14,
    color: '#333',
  },
});
