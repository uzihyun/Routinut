import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Background from '../component/Background';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Chatbot() {
  
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const userId = await AsyncStorage.getItem('loggedInUserId');
        if (!userId) return;

        const response = await axios.get(`https://routinut-backend.onrender.com/api/chatbot/history/${userId}`);
        const history = response.data;

        // 히스토리를 메시지 형식으로 변환
        const formatted = history.flatMap((item) => {
          const msgs = [
            {
              id: item.id * 2 - 1,
              sender: 'me',
              text: item.message,
            },
          ];
          if (item.response && item.response.trim()) {
            msgs.push({
              id: item.id * 2,
              sender: 'other',
              text: item.response,
            });
          }
          return msgs;
        });

        setMessages(formatted);
      } catch (error) {
        console.error('❌ 채팅 기록 불러오기 실패:', error);
      }
    };

    fetchChatHistory();
  }, []);
  const astronautImage = require('../assets/우주인.png');

  const sendMessage = async () => {
    const trimmed = messageText.trim();
    if (!trimmed) return;

    const userId = await AsyncStorage.getItem('loggedInUserId');

    // 사용자 메시지 추가
    const newUserMsg = {
      id: Date.now(),
      sender: 'me',
      text: trimmed,
    };
    setMessages((prev) => [...prev, newUserMsg]);
    setMessageText('');

    try {
      const response = await axios.post('https://routinut-backend.onrender.com/api/chatbot/message', {
        userId: userId || 0,
        message: trimmed,
      });

      const replyText = response.data?.response || '답변이 없습니다.';
      const newBotMsg = {
        id: Date.now() + 1,
        sender: 'other',
        text: replyText,
      };
      setMessages((prev) => [...prev, newBotMsg]);
    } catch (error) {
      console.error('❌ 메시지 전송 실패:', error);
      const errorMsg = {
        id: Date.now() + 2,
        sender: 'other',
        text: '서버 오류가 발생했어요. 잠시 후 다시 시도해주세요.',
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}
    >
      <Background>
        <ScrollView
          style={styles.chatContainer}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageRow,
                msg.sender === 'me' ? styles.rowRight : styles.rowLeft,
              ]}
            >
              {msg.sender === 'other' && (
                <View style={styles.avatarWrapper}>
                  <Image source={astronautImage} style={styles.avatarImage} resizeMode="cover" />
                </View>
              )}
              <View
                style={[
                  styles.messageBubble,
                  msg.sender === 'me' ? styles.myMessage : styles.otherMessage,
                ]}
              >
                <Text style={msg.sender === 'me' ? styles.myText : styles.otherText}>
                  {msg.text}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputContainer}>
          <View style={styles.textBox}>
            <TextInput
              style={styles.textInput}
              placeholder="메시지 보내기..."
              placeholderTextColor="#888"
              multiline
              value={messageText}
              onChangeText={setMessageText}
            />
          </View>

          {messageText.trim().length > 0 && (
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Feather name="send" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </Background>
    </KeyboardAvoidingView>
  );
}

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  chatContainer: {
    flex: 1,
    paddingHorizontal: 2,
    position: 'relative',
    right: 15,
  },
  messageRow: {
    marginBottom: 8,
  },
  rowRight: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: screenWidth * 0.7,
    padding: 10,
    borderRadius: 15,
    marginVertical: 5,
  },
  myMessage: {
    backgroundColor: '#8e44ad',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 0,
  },
  otherMessage: {
    backgroundColor: '#f1f1f1',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 0,
  },
  myText: {
    color: 'white',
    fontSize: 14,
  },
  otherText: {
    color: '#333',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  textBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
    color: '#000',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4f4f4f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
    overflow: 'hidden',
    alignSelf: 'flex-start',
    position: 'relative',
    top: 10,
  },
  avatarImage: {
    width: 55,
    height: 55,
    transform: [{ scale: 1.2 }],
    position: 'relative',
    top: 8,
  },
});
