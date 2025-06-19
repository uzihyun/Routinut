  import React, { useState, useRef, useEffect } from 'react';
  import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Modal,
    TextInput,
    FlatList,
    Dimensions,
    Alert,
    TouchableWithoutFeedback
  } from 'react-native';
  import Background from '../component/Background';
  import BottomNav from '../component/BottomNav';
  import { useNavigation } from '@react-navigation/native';
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import axios from 'axios';

  const screenWidth = Dimensions.get('window').width;


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

  export default function GalaxyPlaza() {
    
    const [modalVisible, setModalVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [addedFriends, setAddedFriends] = useState([]);
    const [likedPosts, setLikedPosts] = useState([]);
    const [likes, setLikes] = useState([]);
    const [currentIndexMap, setCurrentIndexMap] = useState({});
    const [searchResults, setSearchResults] = useState([]);
    const [friendList, setFriendList] = useState([]);

    // 기존 useState 아래에 추가
    const [requestModalVisible, setRequestModalVisible] = useState(false);
    const [requestedFriends, setRequestedFriends] = useState([
      { id: 3, username: 'moonlight', image: require('../assets/프사3.png') },
      { id: 5, username: 'skylover', image: require('../assets/프사5.png') },
    ]);



    useEffect(() => {
      const delayDebounce = setTimeout(() => {
        if (searchText.trim()) {
          handleSearch();
        }
      }, 500); // 0.5초 입력 없으면 검색 실행

      return () => clearTimeout(delayDebounce);
    }, [searchText]);

    const [myId, setMyId] = useState(null);
    useEffect(() => {
      const fetchMyId = async () => {
        const id = await AsyncStorage.getItem('loggedInUserId');
        setMyId(id);
      };
      fetchMyId();
    }, []);
    useEffect(() => {
      const fetchRequestedFriends = async () => {
        try {
          const myId = await AsyncStorage.getItem('loggedInUserId');
          const res = await axios.get(`https://routinut-backend.onrender.com/api/friends/requests?userId=${myId}`);
          setRequestedFriends(res.data); // [{ id, nickname, profileImage }]
        } catch (err) {
          console.error('요청 목록 불러오기 실패', err);
        }
      };

      fetchRequestedFriends();
    }, []);

    const handleSearch = async () => {
      try {
        const myId = await AsyncStorage.getItem('loggedInUserId');
        if (!myId) throw new Error('로그인 정보 없음');

        const response = await axios.get('https://routinut-backend.onrender.com/api/friends/search', {
          params: {
            keyword: searchText,
            userId: myId,
          },
        });
        setSearchResults(response.data);
      } catch (err) {
        console.error(err);
        Alert.alert('검색 실패', '친구 검색 중 문제가 발생했습니다.');
      }
    };

    const handleAddFriend = async (targetId) => {
      try {
        const myId = await AsyncStorage.getItem('loggedInUserId');
        if (!myId) throw new Error('로그인 정보 없음');

        await axios.post(`https://routinut-backend.onrender.com/api/friends/request?userId=${myId}&friendId=${targetId}`);

        Alert.alert('친구 요청 완료');
        setSearchResults(prev =>
          prev.map(user =>
            user.userId === targetId ? { ...user, isRequested: true } : user
          )
        );
      } catch (err) {
        console.error(err);
        Alert.alert('요청 실패', '친구 요청 중 문제가 발생했습니다.');
      }
    };
    const handleAcceptFriend = async (requesterId, nickname, profileImage) => {
      try {
        const myId = await AsyncStorage.getItem('loggedInUserId');
        await axios.post(`https://routinut-backend.onrender.com/api/friends/accept?userId=${myId}&requesterId=${requesterId}`);
        Alert.alert('친구 수락 완료');

        // 친구 요청 목록에서 제거
        setRequestedFriends(prev => prev.filter(user => user.userId !== requesterId));

        // 검색 결과에서 친구 상태로 변경
        setSearchResults(prev =>
          prev.map(user =>
            user.userId === requesterId ? { ...user, isFriend: true } : user
          )
        );

        // 친구 목록에 추가
        setFriendList(prev => [...prev, { userId: requesterId, nickname, profileImage }]);

      } catch (err) {
        console.error('친구 수락 실패', err);
        Alert.alert('오류', '친구 요청 수락 중 문제가 발생했습니다.');
      }
    };

    useEffect(() => {
      const fetchFriendList = async () => {
        try {
          const myId = await AsyncStorage.getItem('loggedInUserId');
          const res = await axios.get(`https://routinut-backend.onrender.com/api/friends/list?userId=${myId}`);
          setFriendList(res.data); // [{ userId, nickname, profileImage }]
        } catch (err) {
          console.error('친구 목록 불러오기 실패', err);
        }
      };

      fetchFriendList(); // 컴포넌트 마운트 시 호출
    }, []);

    const navigation = useNavigation();

    const handleLike = async (postId) => {
      try {
        const myId = await AsyncStorage.getItem('loggedInUserId');
        const res = await axios.post(
          `https://routinut-backend.onrender.com/api/post-likes/toggle?routineCheckId=${postId}&userId=${myId}`
        );

        const liked = res.data.liked;

        // 1. likedPosts 업데이트
        setLikedPosts((prev) =>
          updatedLiked ? [...prev, postId] : prev.filter((id) => id !== postId)
        );
        await fetchLikeCount(postId); 
      } catch (err) {
        console.error('좋아요 처리 실패', err);
        Alert.alert('오류', '좋아요 처리 중 문제가 발생했습니다.');
      }
    };

    const fetchLikeCount = async (postId) => {
      try {
        const res = await axios.get(
          `https://routinut-backend.onrender.com/api/post-likes/count?routineCheckId=${postId}`
        );
        const count = res.data.likeCount;

        setLikes((prev) =>
          prev.map((item) =>
            item.id === postId ? { ...item, count } : item
          )
        );
      } catch (err) {
        console.error('좋아요 수 불러오기 실패:', err);
      }
    };



    const onScrollImage = (postId, event) => {
      const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
      setCurrentIndexMap(prev => ({ ...prev, [postId]: index }));
    };

    const [posts, setPosts] = useState([]);
    
    useEffect(() => {
      const fetchCommunityPosts = async () => {
        try {
          const myId = await AsyncStorage.getItem('loggedInUserId');
          const response = await axios.get(`https://routinut-backend.onrender.com/api/routine-checks/community/${myId}`);

          if (!Array.isArray(response.data)) {
            console.warn('Unexpected response:', response.data);
            setPosts([]);
            return;
          }

          const formattedPosts = response.data
            .sort((a, b) => b.check.id - a.check.id) // id 기준 내림차순 정렬
            .map((item) => {
              const imageArray = [];
              if (item.check.photoUrl) imageArray.push({ uri: item.check.photoUrl });
              if (item.check.photoUrl2) imageArray.push({ uri: item.check.photoUrl2 });

              return {
                id: item.check.id,
                username: item.user.nickname,
                image: imageMap[item.user.profileImage],
                caption: item.check.comment,
                date: item.check.checkDate,
                images: imageArray.length > 0 ? imageArray : [item.check.comment],
              };
            });

          setPosts(formattedPosts);
        } catch (err) {
          console.error('커뮤니티 루틴 불러오기 실패', err);
          setPosts([]);
        }
      };

      fetchCommunityPosts();
    }, []);


    useEffect(() => {
      setLikes(posts.map(post => ({
        id: post.id,
        count: 0, // 또는 서버에서 초기 count 받아오면 여기에 적용
      })));

      posts.forEach((post) => {
        fetchLikeCount(post.id); // ✅ 각 게시글에 대해 count fetch
      });

      setCurrentIndexMap(Object.fromEntries(posts.map(post => [post.id, 0])));
    }, [posts]);

    const handleLikeToggle = async (postId) => {
      try {
        const myId = await AsyncStorage.getItem('loggedInUserId');
        const res = await axios.post(
          `https://routinut-backend.onrender.com/api/post-likes/toggle?routineCheckId=${postId}&userId=${myId}`
        );

        const updatedLiked = res.data.liked;

        setLikedPosts((prev) => ({
          ...prev,
          [postId]: updatedLiked,
        }));

        await fetchLikeCount(postId); // ✅ 여기서 정확한 count로 반영
      } catch (err) {
        console.error('좋아요 실패:', err);
        Alert.alert('오류', '좋아요 처리 중 문제가 발생했습니다.');
      }
    };




    return (
      <Background>
        <Text style={styles.title}>은하 광장</Text>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.add} onPress={() => setModalVisible(true)}>
              <View style={styles.addCircle}>
                <Text style={styles.plus}>＋</Text>
              </View>
              <Text style={styles.addText}>New</Text>
            </TouchableOpacity>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.profileGroup}>
              {friendList.map(friend => (
                <View key={friend.userId} style={styles.profileItem}>
                  <Image source={imageMap[friend.profileImage]} style={styles.profileCircle} />
                  <Text style={styles.profileText}>{friend.nickname}</Text>
                </View>
              ))}
            </ScrollView>

          </View>

          <View style={styles.divider} />

          <ScrollView style={styles.feed} showsVerticalScrollIndicator={false}>
            {posts.map(post => (
              <View key={post.id} style={styles.postContainer}>
                <View style={styles.storyRow}>
                  <Image source={post.image} style={styles.storyProfileImage} />
                  <Text style={styles.storyUsername}>{post.username}</Text>
                </View>


                <FlatList
                  data={post.images}
                keyExtractor={(_, index) => `${post.id}_img_${index}`}
                horizontal
                pagingEnabled={post.images.length > 1}
                snapToInterval={screenWidth - 40}
                decelerationRate="fast"
                showsHorizontalScrollIndicator={false}
                scrollEnabled={post.images.length > 1} // ✅ 조건부 스크롤
                onScroll={event => onScrollImage(post.id, event)}
                renderItem={({ item }) => {
                  const isText = typeof item === 'string' && !item.startsWith('http');

                    return (
                      <View style={styles.postImageWrapper}>
                        {isText ? (
                          <View style={styles.textCardWrapper}>
                            <Text style={styles.textCardText}>{item}</Text>
                          </View>
                        ) : (
                          <Image
                            source={typeof item === 'string' ? { uri: item } : item}
                            style={styles.postImage}
                          />
                        )}
                      </View>
                    );
                  }}


                  ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
                />



                {/* 이미지 하단 인디케이터 */}
                <View style={styles.indicatorContainer}>
                  {post.images.map((_, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.indicatorDot,
                        currentIndexMap[post.id] === idx && styles.activeDot,
                      ]}
                    />
                  ))}
                </View>

                <View style={styles.postFooter}>
                  <View>
                    <View style={styles.captionRow}>
                      <Text style={styles.username}>{post.username}</Text>
                      <Text style={styles.caption}> {post.caption}</Text>
                    </View>
                    <Text style={styles.dateText}>{post.date}</Text> 
                  </View>


                  <TouchableOpacity onPress={() => handleLikeToggle(post.id)} style={styles.likeSection}>
                    <Text style={[styles.heart, likedPosts[post.id] && styles.heartFilled]}>
                      {likedPosts[post.id] ? '❤️' : '🤍'}
                    </Text>
                    <Text style={styles.likeCount}>
                      {likes.find((item) => item.id === post.id)?.count ?? 0}
                    </Text>
                  </TouchableOpacity>

                </View> 
              </View>
            ))}
          </ScrollView>

          <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
            <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback onPress={() => {}}>
                  <View style={styles.modalContainer}>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                      <TouchableOpacity
                        onPress={() => setRequestModalVisible(true)}
                        style={{
                          backgroundColor: '#fff',
                          paddingVertical: 8,
                          paddingHorizontal: 16,
                          borderRadius: 6,
                          borderWidth: 1,
                          borderColor: '#000',
                          marginBottom: 10,
                        }}
                      >
                        <Text style={{ fontSize: 14, color: '#000' }}>요청 친구</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.searchBox}>
                      <TouchableOpacity onPress={handleSearch}>
                        <Text style={styles.searchIcon}>🔍</Text>
                      </TouchableOpacity>
                      <TextInput
                        style={styles.searchInput}
                        placeholder="친구 아이디를 입력해주세요"
                        placeholderTextColor="#555"
                        value={searchText}
                        onChangeText={setSearchText}
                      />
                    </View>

                    <ScrollView style={styles.resultList}>
                      {searchResults.map(user => {
                        if (!myId) return null;
                        const isSelf = String(user.userId) === String(myId);
                        return (
                          <View key={user.userId} style={styles.resultBox}>
                            <Image source={imageMap[user.profileImage]} style={styles.resultImage} />
                            <Text style={styles.resultName}>{user.nickname}</Text>

                            {!isSelf && (
                              <TouchableOpacity
                                style={[
                                  styles.addFriendButton,
                                  (user.isFriend || user.isRequested) && { backgroundColor: '#ccc' }
                                ]}
                                onPress={() => {
                                  if (!user.isFriend && !user.isRequested) handleAddFriend(user.userId);
                                }}
                                disabled={user.isFriend || user.isRequested}
                              >
                                <Text style={styles.addFriendText}>
                                  {user.isFriend ? '친구' : user.isRequested ? '요청중' : '친구추가'}
                                </Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        );
                      })}
                    </ScrollView>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>


          <Modal visible={requestModalVisible} animationType="slide" transparent onRequestClose={() => setRequestModalVisible(false)}>
            <TouchableWithoutFeedback onPress={() => setRequestModalVisible(false)}>
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback onPress={() => {}}>
                  <View style={styles.modalContainer}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>친구 요청 목록</Text>

                    <ScrollView style={styles.resultList}>
                      {requestedFriends.map(user => (
                        <View key={user.id} style={styles.resultBox}>
                          <Image source={imageMap[user.profileImage]} style={styles.resultImage} />
                          <Text style={styles.resultName}>{user.nickname}</Text>
                          <TouchableOpacity
                            style={styles.addFriendButton}
                            onPress={() => handleAcceptFriend(user.userId, user.nickname, user.profileImage)}
                          >
                            <Text style={styles.addFriendText}>수락하기</Text>
                          </TouchableOpacity>

                        </View>
                      ))}
                    </ScrollView>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>



          <BottomNav navigation={navigation} />
        </View>
      </Background>
    );
  }

  const styles = StyleSheet.create({
    title: {
      fontSize: 22,
      color: 'white',
      marginBottom: 25,
      textAlign: 'center',
      marginTop: 10,
    },
    container: { flex: 1 },
    header: { flexDirection: 'row', paddingHorizontal: 10, paddingTop: 10 },
    add: {justifyContent: 'center', alignItems: 'center',},
    addCircle: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#fff', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    addText: {fontSize: 12, color: '#fff', marginRight: 10, marginTop: 3},
    plus: { fontSize: 24, color: '#fff', fontWeight: 'bold', },
    profileGroup: { flexDirection: 'row', alignItems: 'center' },
    profileItem: { alignItems: 'center', marginRight: 12 },
    profileCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff' },
    profileText: { fontSize: 10, color: '#fff', marginTop: 3 },
    divider: { height: 1, backgroundColor: '#999', opacity: 0.3, marginVertical: 10, marginHorizontal: 10 },
    feed: { flex: 1, paddingHorizontal: 20 },
    postContainer: { marginBottom: 25 },
    storyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
    storyProfileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
    storyUsername: { fontSize: 12, color: '#fff' },
    postImage: { width: screenWidth - 40, height: (screenWidth - 40) * 1.3, resizeMode: 'cover', marginRight: -15,},
    indicatorContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 6 },
    indicatorDot: {
      width: 8, height: 8, borderRadius: 4, backgroundColor: '#888', marginHorizontal: 3,
    },
    activeDot: { backgroundColor: '#fff' },
    postFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5, alignItems: 'center' },
    captionRow: { flexDirection: 'row', alignItems: 'center' },
    username: { fontWeight: 'bold', color: '#fff' },
    caption: { color: '#fff' },
    dateText: {
      color: '#aaa',
      fontSize: 12,
      marginTop: 2,
    },

    likeSection: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    heart: { fontSize: 20, color: '#fff' },
    heartFilled: { color: 'hotpink' },
    likeCount: { fontSize: 14, color: '#fff', marginLeft: 4 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    modalContainer: { width: '85%', backgroundColor: '#fff', padding: 20, borderRadius: 10, maxHeight: '80%' },
    closeText: { fontSize: 18, fontWeight: 'bold', color: '#000', position: 'relative', bottom: 5 },
    searchBox: { flexDirection: 'row', borderWidth: 1, borderColor: '#000', paddingHorizontal: 10, alignItems: 'center', marginTop: 10 },
    searchIcon: { fontSize: 18, marginRight: 8 },
    searchInput: { flex: 1, height: 40, fontSize: 14, color: '#000' },
    resultList: { marginTop: 20, maxHeight: 250 },
    resultBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 10, borderRadius: 5 },
    resultImage: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff' },
    resultName: { flex: 1, marginLeft: 10, fontSize: 14, color: '#000' },
    addFriendButton: { borderWidth: 1, borderColor: '#000', borderRadius: 5, paddingHorizontal: 10, paddingVertical: 5 },
    addFriendText: { fontSize: 12, color: '#000' },
    addedText: { fontSize: 12, color: '#000' },
    textPost: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#333',
      padding: 20,
    },
    textPostContent: {
      color: '#fff',
      fontSize: 16,
      textAlign: 'center',
    },
    textOnlyWrapper: {
      width: screenWidth - 40,
      height: screenWidth - 40,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginRight: -15,
    },
    overlayText: {
      color: '#fff',
      fontSize: 16,
      textAlign: 'center',
    },
    textCardWrapper: {
      width: screenWidth - 40,
      height: screenWidth - 40,
      backgroundColor: '#fff',
      justifyContent: 'center', // 수직 중앙
      alignItems: 'center',     // 수평 중앙
      borderColor: '#000',
      borderWidth: 2,
      paddingHorizontal: 20,
      paddingVertical: 20,      // 여백 추가 (필요시 조절)
    },
    textCardText: {
      fontSize: 30,
      fontWeight: 'bold',
      color: '#000',
      textAlign: 'center',
      position: "relative",
      right: 30
    },
    
  });
