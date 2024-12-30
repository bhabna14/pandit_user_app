import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, TouchableHighlight, RefreshControl, Image, Alert, ScrollView, FlatList, Dimensions, KeyboardAvoidingView, Platform, LogBox, BackHandler, ToastAndroid } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useIsFocused } from '@react-navigation/native'
import Octicons from 'react-native-vector-icons/Octicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { FlatListSlider } from 'react-native-flatlist-slider';
// import { WebView } from 'react-native-webview';
import DrawerModal from '../../Component/DrawerModal';
// import Podcast from '../Podcast/Index'
import New_podcast from '../New_podcast/Index'
import Flower from '../Flower/Index'
import Shop from '../Shop/Index'
import { base_url } from '../../../App';
import Notification from '../../Component/Notification';

LogBox.ignoreLogs(['The player has already been initialized via setupPlayer.']);

const Index = (props) => {

  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [isModalVisible, setModalVisible] = useState(false);
  const openModal = () => { setModalVisible(true) };
  const closeModal = () => { setModalVisible(false) };
  const screenWidth = Dimensions.get('window').width;
  const itemWidth = 0.6 * screenWidth;
  const [spinner, setSpinner] = useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [activeTab, setActiveTab] = useState('podcast');
  const [backPressCount, setBackPressCount] = useState(0);
  const [allContent, setAllContent] = useState({});

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      getAllDataForHomePage();
      console.log("Refreshing Successful");
    }, 2000);
  }, []);

  useEffect(() => {
    const handleBackPress = () => {
      if (activeTab !== 'podcast') {
        setActiveTab('podcast');
        return true; // Prevent default behavior
      }

      if (backPressCount === 1) {
        BackHandler.exitApp(); // Exit the app if back button is pressed twice within 2 seconds
        return true;
      }

      ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
      setBackPressCount(1);

      const timeout = setTimeout(() => {
        setBackPressCount(0);
      }, 2000); // Reset back press count after 2 seconds

      return true; // Prevent default behavior
    };

    if (isFocused) {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

      return () => backHandler.remove(); // Cleanup the event listener when the component unmounts or navigates away
    }
  }, [backPressCount, activeTab, isFocused]);

  const getAllDataForHomePage = async () => {
    try {
      setSpinner(true);
      const response = await fetch(base_url + 'api/homepage', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const responseData = await response.json();
      if (responseData.status === 200) {
        // console.log("getAllDataForHomePage-------", responseData.data);
        setSpinner(false);
        setAllContent(responseData.data);
      }
    } catch (error) {
      console.log(error);
      setSpinner(false);
    }
  }

  const [accessToken, setAccessToken] = useState(null);

  const getAccesstoken = async () => {
    var access_token = await AsyncStorage.getItem('storeAccesstoken');
    console.log("access_token", access_token);
    setAccessToken(access_token);
  }

  useEffect(() => {
    if (isFocused) {
      getAllDataForHomePage();
      getAccesstoken();
    }
  }, [isFocused])

  const goToPendingBooking = () => {
    if (accessToken) {
      navigation.navigate('BookingPending');
    } else {
      navigation.navigate('Login');
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, flexDirection: 'column', backgroundColor: '#fff' }}>
      {accessToken && <Notification />}
      <DrawerModal visible={isModalVisible} navigation={navigation} onClose={closeModal} />
      <View style={{ width: '100%', alignItems: 'center', paddingVertical: 10, backgroundColor: '#fff' }}>
        <View style={{ width: '95%', alignSelf: 'center', alignItems: 'center', flexDirection: 'row', justifyContent: 'space-around', marginTop: 0 }}>
          <TouchableOpacity onPress={() => setActiveTab('podcast')} style={{ backgroundColor: activeTab === 'podcast' ? '#c9170a' : '#e3e3e1', width: '23.5%', paddingVertical: 8, borderRadius: 6, alignItems: 'center', alignItems: 'center', justifyContent: 'center' }}>
            <Image
              source={require('../../assets/logo/microphone.png')}
              style={{ width: 22, height: 22 }}
            />
            <Text style={{ color: activeTab === 'podcast' ? '#fff' : '#000', fontSize: 16, fontWeight: '600', marginLeft: 6 }}>Podcast</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('flower')} style={{ backgroundColor: activeTab === 'flower' ? '#c9170a' : '#e3e3e1', width: '23.5%', paddingVertical: 8, borderRadius: 6, alignItems: 'center', alignItems: 'center', justifyContent: 'center' }}>
            <Image
              source={require('../../assets/logo/flower.png')}
              style={{ width: 25, height: 25 }}
            />
            <Text style={{ color: activeTab === 'flower' ? '#fff' : '#000', fontSize: 16, fontWeight: '600', marginLeft: 6 }}>Flower</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('product')} style={{ backgroundColor: activeTab === 'product' ? '#c9170a' : '#e3e3e1', width: '23.5%', paddingVertical: 8, borderRadius: 6, alignItems: 'center', alignItems: 'center', justifyContent: 'center' }}>
            <Image
              source={require('../../assets/logo/product.png')}
              style={{ width: 50, height: 25 }}
            />
            <Text style={{ color: activeTab === 'product' ? '#fff' : '#000', fontSize: 16, fontWeight: '600', marginLeft: 6 }}>Product</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('pandit')} style={{ backgroundColor: activeTab === 'pandit' ? '#c9170a' : '#e3e3e1', width: '23.5%', paddingVertical: 8, borderRadius: 6, alignItems: 'center', alignItems: 'center', justifyContent: 'center' }}>
            <Image
              source={require('../../assets/logo/priest.png')}
              style={{ width: 22, height: 25 }}
            />
            <Text style={{ color: activeTab === 'pandit' ? '#fff' : '#000', fontSize: 16, fontWeight: '600', marginLeft: 6 }}>Pandit</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        {activeTab === 'podcast' &&
          <View style={{ flex: 1 }}>
            <New_podcast />
          </View>
        }
        {activeTab === 'flower' &&
          <View style={{ flex: 1 }}>
            <Flower />
          </View>
        }
        {activeTab === 'product' &&
          <View style={{ flex: 1 }}>
            <Shop />
          </View>
        }
        {activeTab === 'pandit' &&
          <View style={{ flex: 1 }}>
            <TouchableOpacity onPress={() => navigation.navigate('SearchPage')} style={styles.searchBox}>
              <View style={{ width: '10%' }}>
                <AntDesign name="search1" color={'#ffcb44'} size={28} />
              </View>
              <Text style={{ color: '#888888', fontSize: 17 }}>Search for pooja or pandit</Text>
            </TouchableOpacity>
            {spinner === true ?
              <View style={{ flex: 1, alignSelf: 'center', top: '30%' }}>
                {/* <Image style={{ width: 50, height: 50 }} source={require('../../assets/img/loading.gif')} /> */}
                <Text style={{ color: '#ffcb44', fontSize: 17 }}>Loading...</Text>
              </View>
              :
              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <View style={styles.helpContainer}>
                  <TouchableOpacity onPress={() => navigation.navigate('Help')} style={{ width: '100%', height: '100%', }}>
                    <Image source={require('../../assets/logo/Help.jpeg')} style={{ resizeMode: 'cover', width: '100%', height: '100%', borderRadius: 50 }} />
                  </TouchableOpacity>
                </View>
                <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} showsVerticalScrollIndicator={false} style={{ flex: 1, zIndex: 1, }}>
                  {allContent.section_01.data.length > 0 &&
                    <View style={{ width: '95%', alignSelf: 'center', alignItems: 'center' }}>
                      <View style={{ width: '100%', marginBottom: 5, marginTop: 0, borderRadius: 10, overflow: 'hidden' }}>
                        <FlatListSlider
                          onPress={item => ""}
                          indicator={false}
                          data={allContent.section_01.data}
                          imageKey={'banner_img_url'}
                          height={195}
                          timer={8000}
                          animation
                          autoscroll={false}
                        />
                      </View>
                    </View>
                  }
                  {allContent.section_02.data.length > 0 &&
                    <View style={{ width: '100%', height: 120, marginTop: 5 }}>
                      <FlatList
                        horizontal
                        data={allContent.section_02.data}
                        getItemLayout={(data, index) => ({
                          length: 120,
                          offset: 120 * index,
                          index,
                        })}
                        decelerationRate="fast"
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                          <TouchableOpacity onPress={() => props.navigation.navigate('PujaDetails', item.slug)} style={styles.itemContainer}>
                            <View style={{ height: '65%', width: '100%' }}>
                              <Image source={{ uri: item.pooja_img_url }} style={styles.image} />
                            </View>
                            <View style={{ height: '35%', width: '100%' }}>
                              <Text style={styles.name}>{item.pooja_name.length > 15 ? `${item.pooja_name.substring(0, 15)}...` : item.pooja_name}</Text>
                            </View>
                          </TouchableOpacity>
                        )}
                      />
                    </View>
                  }
                  {allContent.section_03.data.length > 0 &&
                    <View style={{ width: '100%', marginTop: 15 }}>
                      <View style={{ width: '93%', alignSelf: 'center', alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ color: '#000', fontSize: 16, letterSpacing: 0.3, fontWeight: '600' }}>{allContent.section_03.name}</Text>
                        {/* <TouchableOpacity onPress={() => props.navigation.navigate('AllPuja')} style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
                          <Text style={{ color: '#ffcb44', fontSize: 14, fontWeight: '600' }}>View all</Text>
                          <Feather name="chevrons-right" color={'#ffcb44'} size={16} />
                        </TouchableOpacity> */}
                      </View>
                    </View>
                  }
                  {allContent.section_03.data.length > 0 &&
                    <View style={{ width: '100%', marginTop: 15 }}>
                      <FlatList
                        data={allContent.section_03.data}
                        horizontal
                        snapToAlignment="center"
                        decelerationRate="fast"
                        showsHorizontalScrollIndicator={false}
                        snapToInterval={itemWidth}
                        getItemLayout={(data, index) => ({
                          length: itemWidth, // Replace itemWidth with the width of your items
                          offset: itemWidth * index,
                          index,
                        })}
                        // keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item, index }) => (
                          <TouchableOpacity onPress={() => props.navigation.navigate('PujaDetails', item.slug)} style={{ width: itemWidth, marginLeft: 10, backgroundColor: '#fff', borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 13, elevation: 5, marginBottom: 10 }}>
                            <View style={{ width: '100%', height: 160, alignItems: 'center' }}>
                              <Image source={{ uri: item.pooja_img_url }} style={styles.image1} />
                              {/* <View style={{ position: 'absolute', top: 7, left: 15, backgroundColor: '#f00062', padding: 2, borderRadius: 6 }}>
                                <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>HOT</Text>
                              </View>
                              <TouchableOpacity style={styles.saveBtm}>
                                <FontAwesome name="bookmark-o" color={'#000'} size={16} />
                              </TouchableOpacity>
                              <View style={{ position: 'absolute', bottom: 10, right: 6, backgroundColor: '#28a745', width: 45, height: 23, borderRadius: 6, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                <Feather name="star" color={'#fff'} size={13} />
                                <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold', marginLeft: 3 }}>{item.rating}</Text>
                              </View> */}
                            </View>
                            <View style={{ padding: 10, width: '90%', alignItems: 'flex-start', justifyContent: 'center' }}>
                              <TouchableOpacity onPress={() => props.navigation.navigate('PujaDetails', item.slug)} style={{ width: '100%' }}>
                                <Text style={{ color: '#000', fontSize: 15, fontWeight: '500', textTransform: 'capitalize' }}>{item.pooja_name}</Text>
                              </TouchableOpacity>
                              <Text style={{ color: '#000', fontSize: 13, fontWeight: '300', textTransform: 'capitalize' }}>
                                {item.short_description.length > 55 ? `${item.short_description.slice(0, 55)}...` : item.short_description}
                              </Text>
                            </View>
                            {/* <View style={{ marginTop: 4, marginBottom: 10, marginHorizontal: 10, alignItems: 'flex-start', flexDirection: 'row' }}>
                              <View style={{ backgroundColor: '#f00062', paddingHorizontal: 3, paddingVertical: 2, borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                                <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>OFFER</Text>
                              </View>
                              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ color: '#000', fontSize: 13, fontWeight: '400' }}>FLAT 20% OFF</Text>
                              </View>
                            </View> */}
                          </TouchableOpacity>
                        )}
                      />
                    </View>
                  }
                  {/* <View style={{ width: '97%', alignSelf: 'center', marginTop: 15 }}>
                    <View style={{ width: '100%' }}>
                      <FlatList
                        horizontal
                        data={section_2}
                        getItemLayout={(data, index) => ({
                          length: 145,
                          offset: 145 * index,
                          index,
                        })}
                        decelerationRate="fast"
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                          <TouchableOpacity style={styles.bigItemContainer}>
                            <Image source={{ uri: item.image }} style={styles.bigImage} />
                          </TouchableOpacity>
                        )}
                      />
                    </View>
                  </View>
                  <View style={{ width: '97%', alignSelf: 'center', marginTop: 15 }}>
                    <Image
                      style={{ height: 220, width: '100%', borderRadius: 10 }}
                      source={{ uri: 'https://img.freepik.com/free-psd/spiritual-retreat-event-banner-template-design_23-2149236975.jpg' }}
                    />
                  </View> */}
                  {allContent.section_04.data.length > 0 &&
                    <View style={{ width: '100%', marginTop: 15 }}>
                      <View style={{ width: '93%', alignSelf: 'center', alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ color: '#000', fontSize: 16, letterSpacing: 0.3, fontWeight: '600' }}>{allContent.section_04.name}</Text>
                        <TouchableOpacity onPress={() => props.navigation.navigate('AllPandit')} style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
                          <Text style={{ color: '#ffcb44', fontSize: 14, fontWeight: '600' }}>View all</Text>
                          <Feather name="chevrons-right" color={'#ffcb44'} size={16} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  }
                  <View style={{ width: '96%', alignSelf: 'center', marginTop: 15 }}>
                    <FlatList
                      showsVerticalScrollIndicator={false}
                      data={allContent.section_04.data}
                      scrollEnabled={false}
                      numColumns={2}
                      keyExtractor={(key) => {
                        return key.id
                      }}
                      renderItem={(content) => {
                        return (
                          <TouchableOpacity onPress={() => props.navigation.navigate('PanditDetails', content.item.slug)} style={styles.mostPPlrItem}>
                            <View style={{ width: '100%', height: 120, borderRadius: 10 }}>
                              <Image source={{ uri: content.item.profile_photo }} style={styles.mostPPImage} />
                              {/* <TouchableOpacity style={styles.saveBtm}>
                                <FontAwesome name="bookmark-o" color={'#000'} size={16} />
                              </TouchableOpacity> */}
                            </View>
                            <View style={{ margin: 10, width: '90%', alignItems: 'flex-start', justifyContent: 'center' }}>
                              <TouchableOpacity onPress={() => props.navigation.navigate('PanditDetails', content.item.slug)} style={{ width: '100%' }}>
                                <Text style={{ color: '#000', fontSize: 15, fontWeight: '500', textTransform: 'capitalize' }}>{content.item.title} {content.item.name}</Text>
                              </TouchableOpacity>
                              {content.item.about_pandit &&
                                <Text style={{ color: '#000', fontSize: 13, fontWeight: '300', textTransform: 'capitalize' }}>{content.item.about_pandit.length > 40 ? `${content.item.about_pandit.substring(0, 40)}...` : content.item.about_pandit}</Text>
                              }
                            </View>
                            {/* <View style={{ marginBottom: 10, marginHorizontal: 10, alignItems: 'flex-start', flexDirection: 'row' }}>
                              <View style={{ backgroundColor: '#f00062', paddingHorizontal: 3, paddingVertical: 2, borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                                <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>OFFER</Text>
                              </View>
                              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ color: '#000', fontSize: 13, fontWeight: '400' }}>70% off</Text>
                              </View>
                            </View> */}
                          </TouchableOpacity>
                        )
                      }}
                    />
                  </View>
                </ScrollView>
              </KeyboardAvoidingView>
            }
          </View>
        }
      </View>
      <View style={{ padding: 0, height: 58, borderRadius: 0, backgroundColor: '#fff', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', margin: 0 }}>
          <View style={{ padding: 0, width: '20%' }}>
            <TouchableHighlight activeOpacity={0.6} underlayColor="#DDDDDD" onPress={goToPendingBooking} style={{ backgroundColor: '#fff', padding: 10, flexDirection: 'column', alignItems: 'center' }}>
              <View style={{ alignItems: 'center' }}>
                <MaterialIcons name="work-history" color={'#000'} size={21} />
                <Text style={{ color: '#000', fontSize: 11, fontWeight: '500', marginTop: 4, height: 17 }}>BOOKING</Text>
              </View>
            </TouchableHighlight>
          </View>
          <View style={{ padding: 0, width: '19%' }}>
            <TouchableHighlight activeOpacity={0.6} underlayColor="#DDDDDD" onPress={() => props.navigation.navigate('NotificationPage')} style={{ backgroundColor: '#fff', padding: 10, flexDirection: 'column', alignItems: 'center' }}>
              <View style={{ alignItems: 'center' }}>
                <FontAwesome name="bell" color={'#000'} size={22} />
                <Text style={{ color: '#000', fontSize: 11, fontWeight: '500', marginTop: 4, height: 17 }}>NOTIFY</Text>
              </View>
            </TouchableHighlight>
          </View>
          <View style={{ padding: 0, width: '23%' }}>
            <View style={{ backgroundColor: '#fff', padding: 8, height: 90, flexDirection: 'column', alignItems: 'center', bottom: 25, borderRadius: 100 }}>
              <TouchableHighlight onPress={() => setActiveTab('podcast')} activeOpacity={0.6} underlayColor="#DDDDDD" style={{ backgroundColor: '#c9170a', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center', borderRadius: 60 }}>
                <MaterialCommunityIcons style={{}} name="podcast" color={'#fff'} size={40} />
              </TouchableHighlight>
            </View>
          </View>
          <View style={{ padding: 0, width: '19%' }}>
            <TouchableHighlight activeOpacity={0.6} underlayColor="#DDDDDD" onPress={() => props.navigation.navigate('YoutubeLive')} style={{ backgroundColor: '#fff', padding: 10, flexDirection: 'column', alignItems: 'center' }}>
              <View style={{ alignItems: 'center' }}>
                <MaterialIcons name="live-tv" color={'#000'} size={22} />
                <Text style={{ color: '#000', fontSize: 11, fontWeight: '500', marginTop: 4, height: 17 }}>LIVE</Text>
              </View>
            </TouchableHighlight>
          </View>
          <View style={{ padding: 0, width: '19%' }}>
            <TouchableHighlight activeOpacity={0.6} underlayColor="#DDDDDD" onPress={openModal} style={{ backgroundColor: '#fff', padding: 10, flexDirection: 'column', alignItems: 'center' }}>
              <View style={{ alignItems: 'center' }}>
                <Octicons name="three-bars" color={'#000'} size={22} />
                <Text style={{ color: '#000', fontSize: 11, fontWeight: '500', marginTop: 4, height: 17 }}>MENU</Text>
              </View>
            </TouchableHighlight>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default Index

const styles = StyleSheet.create({
  image1: {
    width: '100%',
    height: '100%',
    // aspectRatio: 1,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    marginHorizontal: 10,
  },
  searchBox: {
    backgroundColor: '#fff',
    width: '95%',
    alignSelf: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 13,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10
  },
  searchModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  inputs: {
    height: 55,
    width: '90%',
    alignSelf: 'center',
    // marginLeft: 10,
    color: '#888888',
    fontSize: 17
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    width: '95%',
    // height: '90%',
    maxHeight: 400,
    alignSelf: 'center',
    marginTop: 2,
    paddingHorizontal: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 13,
    elevation: 5,
    position: 'absolute',
    zIndex: 2, // Higher z-index to overlay other content
    top: 110,
  },
  dishesContainer: {
    height: 55,
    width: 55,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 13,
    elevation: 5
  },
  itemContainer: {
    width: 85,
    justifyContent: 'center',
    alignItems: 'center',
    height: 120,
    // paddingHorizontal: 10,
    marginHorizontal: 7
  },
  image: {
    width: 75,
    height: 75,
    borderRadius: 50,
    resizeMode: 'cover'
  },
  name: {
    fontSize: 13,
    marginTop: 5,
    color: '#5f5959',
    textAlign: 'center'
  },
  bigItemContainer: {
    width: 141,
    justifyContent: 'center',
    alignItems: 'center',
    height: 170,
    marginHorizontal: 3,
    // backgroundColor: 'red'
  },
  bigImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    resizeMode: 'cover'
  },
  mostPPlrItem: {
    backgroundColor: '#fff',
    width: '48%',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 13,
    elevation: 5,
    marginBottom: 10,
    marginHorizontal: '1.3%'
  },
  mostPPImage: {
    height: '100%',
    width: '100%',
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    resizeMode: 'cover'
  },
  hotBtm: {
    position: 'absolute',
    top: 10,
    left: 6,
    backgroundColor: '#f00062',
    padding: 2,
    borderRadius: 6
  },
  saveBtm: {
    position: 'absolute',
    top: 10,
    right: 6,
    backgroundColor: '#fff',
    width: 26,
    height: 26,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center'
  },
  ratedBtm: {
    position: 'absolute',
    bottom: 10,
    right: 6,
    backgroundColor: '#28a745',
    width: 45,
    height: 23,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  bannerImg: {
    flex: 1,
    resizeMode: 'cover',
    borderRadius: 10
  },
  mostSalesItem: {
    backgroundColor: '#fff',
    width: '98%',
    height: 160,
    alignSelf: 'center',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 13,
    elevation: 4,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 6
  },
  mostSalesImage: {
    height: '100%',
    width: '100%',
    borderRadius: 10,
    resizeMode: 'cover'
  },
  promoBtm: {
    position: 'absolute',
    top: 10,
    left: 6,
    backgroundColor: '#343a40',
    padding: 3,
    borderRadius: 6
  },
  helpContainer: {
    backgroundColor: '#e6e0da',
    height: 75,
    width: 75,
    position: 'absolute',
    bottom: '2%',
    right: '4%',
    borderRadius: 50,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  }
})