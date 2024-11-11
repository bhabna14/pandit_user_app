import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList, RefreshControl, Image, Dimensions, Modal, ImageBackground } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useNavigation, useIsFocused } from '@react-navigation/native'
import { FlatListSlider } from 'react-native-flatlist-slider';
import TrackPlayer, { State, usePlaybackState, useProgress, Capability, Event } from 'react-native-track-player';
import Slider from '@react-native-community/slider';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import { base_url } from '../../../App';

const Index = (props) => {

    const sliderImages = [
        {
            id: '1',
            banner_img_url: 'https://pandit.33crores.com/images/banner.png',
        },
        {
            id: '2',
            banner_img_url: 'https://poojastore.33crores.com/cdn/shop/files/3_6426324a-0668-4d7a-b907-cc51d2f0d0b1.png',
        },
    ];

    const screenWidth = Dimensions.get('window').width;
    const itemWidth = 0.6 * screenWidth;
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [spinner, setSpinner] = useState(false);
    const [refreshing, setRefreshing] = React.useState(false);
    const [allContent, setAllContent] = useState({});
    const [allPodcasts, setAllPodcasts] = useState([]);  // Original list
    const [filterPodcastList, setFilterPodcastList] = useState([]); // Display full list initially
    const [currentTrack, setCurrentTrack] = useState(null);
    const [currentMusic, setCurrentMusic] = useState(null);
    const playbackState = usePlaybackState();
    const progress = useProgress();
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isPlayerModalVisible, setIsPlayerModalVisible] = useState(false);
    const openPlayerModal = () => setIsPlayerModalVisible(true);
    const closePlayerModal = () => setIsPlayerModalVisible(false);
    const [selectPodcast, setSelectPodcast] = useState(null);

    const [allPodcastsModalVisisble, setAllPodcastsModalVisisble] = useState(false);
    const openAllPodcastsModal = () => setAllPodcastsModalVisisble(true);
    const closeAllPodcastsModal = () => setAllPodcastsModalVisisble(false);

    const clickMusic = (podcast) => {
        openPlayerModal();
        setSelectPodcast(podcast);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
            getPodcastData();
            getPodcastList();
            setSelectedCategory(null);
            setFilterPodcastList(allPodcasts);
            console.log("Refreshing Successful");
        }, 2000);
    }, []);

    const getPodcastData = async () => {
        try {
            setSpinner(true);
            const response = await fetch(base_url + 'api/podcasthomepage', {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            });
            const responseData = await response.json();
            if (responseData.status === 200) {
                // console.log("Podcast Data: ", responseData.data.categories);
                setSpinner(false);
                setAllContent(responseData.data);
            }
        } catch (error) {
            console.log(error);
            setSpinner(false);
        }
    };

    const getPodcastList = async () => {
        try {
            const response = await fetch(base_url + 'api/podcasts', {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            });
            const responseData = await response.json();
            if (responseData.status === 200) {
                // console.log("getAllPodcast-------", responseData.data);
                setAllPodcasts(responseData.data);
                setFilterPodcastList(responseData.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const togglePlayback = async (track) => {
        try {
            if (currentTrack !== track.id) {
                // console.log("Current Track ID:", currentTrack, "Selected Track ID:", track.id.toString());
                await TrackPlayer.reset();
                await TrackPlayer.add({
                    id: track.id.toString(),
                    url: track.music_url,
                    title: track.name,
                    artist: 'Unknown Artist',
                });
                setCurrentMusic(track);
                setCurrentTrack(track.id);
                await TrackPlayer.play();
            } else {
                // console.log("playbackState", playbackState, State.Playing);
                if (playbackState.state === State.Playing) {
                    await TrackPlayer.pause();
                } else {
                    await TrackPlayer.play();
                }
            }
        } catch (error) {
            console.error('Error during playback toggle:', error);
        }
    };

    const handleForward = async () => {
        const newPosition = progress.position + 10;
        if (newPosition < progress.duration) {
            await TrackPlayer.seekTo(newPosition);
        }
    }

    const handleBackward = async () => {
        const newPosition = progress.position - 10;
        if (newPosition > 0) {
            await TrackPlayer.seekTo(newPosition);
        } else {
            await TrackPlayer.seekTo(0);
        }
    }

    const closeMusic = async () => {
        setCurrentTrack(null);
        setCurrentMusic(null);
        await TrackPlayer.reset();
    }

    const filterContent = (id) => {
        if (selectedCategory === id) {
            // Deselect category and show all podcasts
            setSelectedCategory(null);
            setFilterPodcastList(allPodcasts);
        } else {
            // Select the new category and filter podcasts
            setSelectedCategory(id);
            const filteredPodcasts = allPodcasts.filter(podcast => podcast.podcast_category_id === id);
            setFilterPodcastList(filteredPodcasts);
        }
    };

    useEffect(() => {
        if (isFocused) {
            getPodcastData();
            getPodcastList();
        }
    }, [isFocused])

    useEffect(() => {
        const setup = async () => {
            try {
                await TrackPlayer.setupPlayer();
                await TrackPlayer.updateOptions({
                    stopWithApp: false,
                    capabilities: [
                        Capability.Play,
                        Capability.Pause,
                        // Capability.SkipToNext,
                        // Capability.SkipToPrevious,
                        // Capability.Stop,
                    ],
                    compactCapabilities: [
                        Capability.Play,
                        Capability.Pause,
                        // Capability.SkipToNext,
                        // Capability.SkipToPrevious,
                        // Capability.Stop,
                    ],
                    notificationCapabilities: [
                        Capability.Play,
                        Capability.Pause,
                        // Capability.SkipToNext,
                        // Capability.SkipToPrevious,
                        // Capability.Stop,
                    ],
                });
            } catch (error) {
                console.error('Error setting up TrackPlayer:', error);
            }
        };

        setup();
    }, []);

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            {/* <TouchableOpacity style={styles.searchBox}>
                <View style={{ width: '10%' }}>
                    <AntDesign name="search1" color={'#ffcb44'} size={28} />
                </View>
                <Text style={{ color: '#888888', fontSize: 17 }}>Search for Podcasts</Text>
            </TouchableOpacity> */}
            {spinner === true ?
                <View style={{ flex: 1, alignSelf: 'center', top: '30%' }}>
                    {/* <Image style={{ width: 50, height: 50 }} source={require('../../assets/img/loading.gif')} /> */}
                    <Text style={{ color: '#ffcb44', fontSize: 17 }}>Loading...</Text>
                </View>
                :
                <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} showsVerticalScrollIndicator={false} style={{ flex: 1, zIndex: 1, }}>
                    <View style={{ width: '95%', alignSelf: 'center', alignItems: 'center' }}>
                        <View style={{ width: '100%', marginBottom: 5, marginTop: 0, borderRadius: 10, overflow: 'hidden' }}>
                            <FlatListSlider
                                onPress={item => ""}
                                indicator={false}
                                data={sliderImages}
                                imageKey={'banner_img_url'}
                                height={195}
                                timer={8000}
                                animation
                                autoscroll={false}
                            />
                        </View>
                    </View>
                    {selectedCategory === null &&
                        <View style={{ width: '100%', height: 285, marginTop: 10 }}>
                            <View style={styles.mainBox}>
                                <Image style={{ height: '100%', width: '100%', borderRadius: 14, resizeMode: 'cover' }} source={{ uri: allContent?.recent_podcast?.image_url }} />
                                <TouchableOpacity onPress={() => clickMusic(allContent?.recent_podcast)} style={styles.overlay} />
                                <View style={styles.spiritual}>
                                    <Text style={{ color: '#fff', fontSize: 14, letterSpacing: 0.5 }}>Spiritual</Text>
                                </View>
                                <View style={styles.trackContainer}>
                                    {currentTrack === allContent?.recent_podcast?.id && playbackState.state === "playing" ?
                                        <FastImage
                                            style={{ width: '60%', height: 50 }}
                                            source={require('../../assets/GIF/giphy.gif')}
                                            resizeMode={FastImage.resizeMode.cover}
                                        />
                                        :
                                        <Image source={require('../../assets/images/track.png')} />
                                    }
                                    <TouchableOpacity onPress={() => togglePlayback(allContent.recent_podcast)} style={styles.playBtn}>
                                        <AntDesign name={currentTrack === allContent?.recent_podcast?.id && playbackState.state === "playing" ? "pausecircle" : "play"} color={'#c9170a'} size={40} />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.descBox}>
                                    <Text style={styles.podcastName}>{allContent?.recent_podcast?.name}</Text>
                                    <Text style={styles.podcastDesc}>{allContent?.recent_podcast?.description.length > 55 ? `${allContent?.recent_podcast?.description.slice(0, 55)}...` : allContent?.recent_podcast?.description}</Text>
                                </View>
                            </View>
                        </View>
                    }
                    {/* {allContent?.categories?.length > 0 &&
                        <View style={{ width: '100%', height: 120, marginTop: 5 }}>
                            <FlatList
                                horizontal
                                data={allContent.categories}
                                getItemLayout={(data, index) => ({
                                    length: 120,
                                    offset: 120 * index,
                                    index,
                                })}
                                decelerationRate="fast"
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity onPress={() => filterContent(item.id)} style={styles.itemContainer}>
                                        <View style={{ height: '65%', width: '100%' }}>
                                            <Image source={{ uri: item.image_url }} style={selectedCategory === item.id ? styles.selectedImage : styles.image} />
                                        </View>
                                        <View style={{ height: '35%', width: '100%' }}>
                                            <Text style={styles.name}>{item.category_name.length > 15 ? `${item.category_name.substring(0, 15)}...` : item.category_name}</Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    } */}
                    {/* {selectedCategory === null && allContent?.last_week_podcasts?.length > 0 &&
                        <View style={{ width: '100%', marginTop: 15 }}>
                            <View style={{ width: '93%', alignSelf: 'center', alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ color: '#000', fontSize: 17, letterSpacing: 0.3, fontWeight: '600' }}>Recent Podcast</Text>
                            </View>
                        </View>
                    } */}
                    {/* {allContent?.last_week_podcasts?.length > 0 && selectedCategory === null &&
                        <View style={{ width: '100%', marginTop: 15 }}>
                            <FlatList
                                data={allContent.last_week_podcasts}
                                horizontal
                                snapToAlignment="center"
                                decelerationRate="fast"
                                showsHorizontalScrollIndicator={false}
                                snapToInterval={itemWidth}
                                getItemLayout={(data, index) => ({
                                    length: itemWidth,
                                    offset: itemWidth * index,
                                    index,
                                })}
                                renderItem={({ item, index }) => (
                                    <View style={{ width: itemWidth, marginLeft: 10, backgroundColor: '#fff', borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 13, elevation: 5, marginBottom: 10 }}>
                                        <View style={{ width: '100%', height: 160, alignItems: 'center' }}>
                                            <Image source={{ uri: item.image_url }} style={styles.image1} />
                                            <View style={{ position: 'absolute', top: 50, left: 100 }}>
                                                <TouchableOpacity onPress={() => togglePlayback(item)} style={{ width: 50, height: 50, borderRadius: 50, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', right: 10, top: 10 }}>
                                                    <AntDesign name={currentTrack === item.id && playbackState.state === "playing" ? "pausecircle" : "play"} color={'#c9170a'} size={40} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        <View style={{ padding: 10, width: '90%', alignItems: 'flex-start', justifyContent: 'center' }}>
                                            <View style={{ width: '100%' }}>
                                                <Text style={{ color: '#000', fontSize: 15, fontWeight: '500', textTransform: 'capitalize' }}>{item.name}</Text>
                                            </View>
                                            <Text style={{ color: '#000', fontSize: 13, fontWeight: '300', textTransform: 'capitalize' }}>
                                                {item.description.length > 55 ? `${item.description.slice(0, 55)}...` : item.description}
                                            </Text>
                                        </View>
                                    </View>
                                )}
                            />
                        </View>
                    } */}
                    {filterPodcastList?.length > 0 ?
                        <View style={{ width: '100%', marginTop: 0 }}>
                            <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 18 }}>
                                <Text style={{ color: '#000', fontSize: 17, letterSpacing: 0.3, fontWeight: '600', marginLeft: 10 }}>All Podcasts</Text>
                                <TouchableOpacity onPress={() => openAllPodcastsModal()} style={{ marginRight: 10, flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ color: '#c9170a', fontSize: 15, fontWeight: '500' }}>View All</Text>
                                    <Feather name="chevrons-right" color={'#c9170a'} size={20} />
                                </TouchableOpacity>
                            </View>
                            <FlatList
                                data={filterPodcastList.slice(0, 7)}
                                keyExtractor={(item) => item.id}
                                scrollEnabled={false}
                                showsHorizontalScrollIndicator={false}
                                renderItem={({ item }) => (
                                    <View style={[styles.podcastList, currentTrack === item.id && { backgroundColor: '#f5dfdf' }]}>
                                        <TouchableOpacity onPress={() => clickMusic(item)} style={{ width: '15%', flexDirection: 'row', alignItems: 'center' }}>
                                            <Image source={{ uri: item.image_url }} style={{ width: 50, height: 50, borderRadius: 50 }} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => clickMusic(item)} style={{ width: '68%' }}>
                                            <Text style={{ color: '#000', fontSize: 15, fontWeight: '500', textTransform: 'capitalize' }}>{item.name}</Text>
                                            <Text style={{ color: '#000', fontSize: 13, fontWeight: '300', textTransform: 'capitalize' }}>
                                                {item.description.length > 55 ? `${item.description.slice(0, 55)}...` : item.description}
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => togglePlayback(item)} style={{ width: '15%', alignItems: 'flex-end' }}>
                                            <AntDesign name={currentTrack === item.id && playbackState.state === "playing" ? "pausecircle" : "play"} color={'#c9170a'} size={40} />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            />
                        </View>
                        :
                        <View style={{ width: '100%', height: 300, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ color: '#000', fontSize: 17 }}>No Podcasts Found</Text>
                        </View>
                    }
                </ScrollView>
            }
            {
                currentTrack !== null &&
                <TouchableOpacity onPress={() => clickMusic(currentMusic)} style={{ width: '100%' }}>
                    <View style={{ width: '105%', alignSelf: 'center', height: 4, position: 'absolute', top: -1, zIndex: 999 }}>
                        <Slider
                            style={{ width: '100%', height: 2, zIndex: 999 }}
                            value={progress.position}
                            minimumValue={0}
                            maximumValue={progress.duration}
                            thumbTintColor="red"
                            minimumTrackTintColor="#000"
                            maximumTrackTintColor="#ffb700"
                            onSlidingComplete={async (value) => {
                                await TrackPlayer.seekTo(value);
                            }}
                        />
                    </View>
                    <View style={styles.musicSection}>
                        <View style={{ width: '70%', flexDirection: 'row', alignItems: 'center', paddingLeft: 18 }}>
                            <Image style={styles.smallImg} source={{ uri: currentMusic?.image_url }} />
                            <View style={{ marginLeft: 20 }}>
                                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>{currentMusic?.name}</Text>
                                <Text style={{ color: '#d4d2d2', fontSize: 14 }}> Spiritual</Text>
                            </View>
                        </View>
                        <View style={{ width: '30%', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <TouchableOpacity onPress={() => togglePlayback(currentMusic)} style={{ marginRight: 15, padding: 3 }}>
                                <FontAwesome6 name={playbackState.state === "playing" ? "pause" : "play"} color={'#fff'} size={25} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={closeMusic} style={{ marginRight: 15 }}>
                                <Ionicons name={"close-outline"} color={'#fff'} size={28} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            }

            {/* All Podcast Modal Start */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={allPodcastsModalVisisble}
                onRequestClose={closeAllPodcastsModal}
            >
                <View style={{ flex: 1, backgroundColor: '#f0f0f0' }}>
                    <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', paddingVertical: 13, paddingHorizontal: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowRadius: 13, elevation: 5 }}>
                        <TouchableOpacity onPress={closeAllPodcastsModal} style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Feather name="chevron-left" color={'#000'} size={30} />
                            <Text style={{ color: '#000', fontSize: 18, fontWeight: '500', marginBottom: 3, marginLeft: 5 }}>All Podcast</Text>
                        </TouchableOpacity>
                    </View>
                    {filterPodcastList?.length > 0 ?
                        <View style={{ flex: 1, marginTop: 10 }}>
                            <FlatList
                                data={filterPodcastList}
                                keyExtractor={(item) => item.id}
                                // scrollEnabled={false}
                                showsHorizontalScrollIndicator={false}
                                renderItem={({ item }) => (
                                    <View style={[styles.podcastList, currentTrack === item.id && { backgroundColor: '#f5dfdf' }]}>
                                        <TouchableOpacity onPress={() => clickMusic(item)} style={{ width: '15%', flexDirection: 'row', alignItems: 'center' }}>
                                            <Image source={{ uri: item.image_url }} style={{ width: 50, height: 50, borderRadius: 50 }} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => clickMusic(item)} style={{ width: '68%' }}>
                                            <Text style={{ color: '#000', fontSize: 15, fontWeight: '500', textTransform: 'capitalize' }}>{item.name}</Text>
                                            <Text style={{ color: '#000', fontSize: 13, fontWeight: '300', textTransform: 'capitalize' }}>
                                                {item.description.length > 55 ? `${item.description.slice(0, 55)}...` : item.description}
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => togglePlayback(item)} style={{ width: '15%', alignItems: 'flex-end' }}>
                                            <AntDesign name={currentTrack === item.id && playbackState.state === "playing" ? "pausecircle" : "play"} color={'#c9170a'} size={40} />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            />
                        </View>
                        :
                        <View style={{ width: '100%', height: 300, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ color: '#000', fontSize: 17 }}>No Podcasts Found</Text>
                        </View>
                    }
                </View>
            </Modal>
            {/* All Podcast Modal End */}

            {/* Player Modal Start */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isPlayerModalVisible}
                onRequestClose={closePlayerModal}
            >
                <ImageBackground source={require('../../assets/images/podcastBG3.jpeg')} style={styles.modalContainer}>
                    <View style={styles.headerPart}>
                        <TouchableOpacity onPress={() => closePlayerModal()} style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Feather name="chevron-left" color={'#fff'} size={30} />
                            <Text style={styles.topHeaderText}>Back</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1, width: '90%', alignSelf: 'center', padding: 20, alignItems: 'center' }}>
                        <Image
                            source={{ uri: selectPodcast?.image_url }}
                            style={styles.coverImage}
                        />
                        <View style={styles.infoContainer}>
                            <Text style={styles.songTitle}>{selectPodcast?.name}</Text>
                            <Text style={styles.source}>{selectPodcast?.description}</Text>
                        </View>
                        <Slider
                            style={styles.progessContainer}
                            value={progress.position}
                            minimumValue={0}
                            maximumValue={progress.duration}
                            thumbTintColor="red"
                            minimumTrackTintColor="#fff"
                            maximumTrackTintColor="#000"
                            onSlidingComplete={async (value) => {
                                await TrackPlayer.seekTo(value);
                            }}
                        />
                        <View style={{ width: '92%', alignSelf: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                            <Text style={styles.timeText}>{formatTime(progress.position)}</Text>
                            <Text style={styles.timeText}>{formatTime(progress.duration)}</Text>
                        </View>
                        <View style={styles.controls}>
                            {/* <Text style={styles.timeText}>{formatTime(progress.position)}</Text> */}
                            <TouchableOpacity onPress={handleBackward}>
                                <Ionicons name="play-back" size={30} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => togglePlayback(selectPodcast)}>
                                <Ionicons name={currentTrack === selectPodcast?.id && playbackState.state === "playing" ? 'pause' : 'play'} size={50} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleForward}>
                                <Ionicons name="play-forward" size={30} color="#fff" />
                            </TouchableOpacity>
                            {/* <Text style={styles.timeText}>{formatTime(progress.duration)}</Text> */}
                        </View>
                    </View>
                </ImageBackground>
            </Modal>
            {/* Player Modal End */}
        </View >
    )
}

export default Index

const styles = StyleSheet.create({
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
    itemContainer: {
        width: 85,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 7
    },
    image: {
        width: 70,
        height: 70,
        borderRadius: 50,
        resizeMode: 'cover',
        borderColor: '#ffcb44',
        borderWidth: 1
    },
    selectedImage: {
        width: 75,
        height: 75,
        borderRadius: 50,
        resizeMode: 'cover',
        borderColor: '#c9170a',
        borderWidth: 3
    },
    name: {
        fontSize: 13,
        marginTop: 5,
        color: '#5f5959',
        textAlign: 'center'
    },
    mainBox: {
        backgroundColor: '#d7d7d9',
        width: '94%',
        height: 200,
        alignSelf: 'center',
        borderRadius: 14
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        borderRadius: 14
    },
    spiritual: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: '#c9170a',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 6
    },
    trackContainer: {
        position: 'absolute',
        top: '55%',
        alignSelf: 'center',
        width: '90%',
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around'
    },
    descBox: {
        backgroundColor: '#fff',
        position: 'absolute',
        width: '85%',
        height: 100,
        top: 170,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 13,
        elevation: 5,
        padding: 15
    },
    playBtn: {
        backgroundColor: '#fff',
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#f24949',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 13,
        elevation: 5,
    },
    podcastName: {
        color: '#5e5e5d',
        fontSize: 18,
        fontWeight: 'bold'
    },
    podcastDesc: {
        marginTop: 10,
        color: '#5e5e5d',
        fontSize: 15,
        fontWeight: '400'
    },
    image1: {
        width: '100%',
        height: '100%',
        // aspectRatio: 1,
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        marginHorizontal: 10,
    },
    podcastList: {
        width: '95%',
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 13,
        elevation: 5,
        marginBottom: 10
    },
    musicSection: {
        backgroundColor: '#c9170a',
        width: '100%',
        height: 60,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    smallImg: {
        height: 40,
        width: 40,
        borderRadius: 100
    },
    mainImg: {
        width: 90,
        height: 90,
        alignSelf: 'center',
        // marginTop: 15,
        borderRadius: 50
    },
    progessContainer: {
        width: '100%',
        height: 10,
        alignSelf: 'center',
        marginTop: 20
    },
    modalContainer: {
        flex: 1,
        // backgroundColor: '#e8e7e6',
        resizeMode: 'contain',
    },
    headerPart: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // backgroundColor: '#fff',
        paddingVertical: 13,
        paddingHorizontal: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 13,
        elevation: 5,
    },
    topHeaderText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '500',
        marginBottom: 3,
        marginLeft: 5,
    },
    coverImage: {
        width: '100%',
        height: 290,
        borderRadius: 10,
        marginTop: 40
    },
    infoContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    songTitle: {
        fontSize: 18,
        // fontWeight: 'bold',
        fontFamily: 'Montserrat-SemiBold',
        textAlign: 'center',
        color: '#fff'
    },
    source: {
        marginVertical: 5,
        fontSize: 14,
        // color: 'gray',
        color: '#fff',
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 20
    },
    timeText: {
        fontSize: 12,
        color: '#fff',
    },

})