import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, FlatList, Image, Modal, ImageBackground } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useNavigation, useIsFocused } from '@react-navigation/native';
import TrackPlayer, { State, usePlaybackState, useProgress, Capability, Event } from 'react-native-track-player';
import Slider from '@react-native-community/slider';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Index = (props) => {

    const navigation = useNavigation();
    const playbackState = usePlaybackState();
    const progress = useProgress();
    const [podcastList, setPodcastList] = useState([]);
    const [isPlayerModalVisible, setIsPlayerModalVisible] = useState(false);
    const openPlayerModal = () => setIsPlayerModalVisible(true);
    const closePlayerModal = () => setIsPlayerModalVisible(false);
    const [selectPodcast, setSelectPodcast] = useState(null);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [currentMusic, setCurrentMusic] = useState(null);

    const clickMusic = (podcast) => {
        openPlayerModal();
        setSelectPodcast(podcast);
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

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    useEffect(() => {
        // console.log("All Podcast", props.route.params);
        setPodcastList(props.route.params);
    }, [])

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f0f0' }}>
            <View style={styles.headerPart}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Feather name="chevron-left" color={'#555454'} size={30} />
                    <Text style={styles.topHeaderText}>All Podcast</Text>
                </TouchableOpacity>
            </View>
            {podcastList?.length > 0 ?
                <View style={{ flex: 1, marginTop: 10 }}>
                    <FlatList
                        data={podcastList}
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

            {/* Player Modal Start */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isPlayerModalVisible}
                onRequestClose={closePlayerModal}
            >
                <ImageBackground source={require('../../assets/images/podcastBG3.jpeg')} style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => closePlayerModal()} style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Feather name="chevron-left" color={'#fff'} size={30} />
                            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '500', marginBottom: 3, marginLeft: 5 }}>Back</Text>
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

        </SafeAreaView>
    )
}

export default Index

const styles = StyleSheet.create({
    headerPart: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        paddingVertical: 13,
        paddingHorizontal: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 13,
        elevation: 5,
    },
    topHeaderText: {
        color: '#000',
        fontSize: 18,
        fontWeight: '500',
        marginBottom: 3,
        marginLeft: 5,
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
    modalHeader: {
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
    progessContainer: {
        width: '100%',
        height: 10,
        alignSelf: 'center',
        marginTop: 20
    },
    modalContainer: {
        flex: 1,
        resizeMode: 'contain',
    },
})