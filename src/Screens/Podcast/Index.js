import React, { useState, useEffect } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet, FlatList, ImageBackground, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import TrackPlayer, { State, usePlaybackState, useProgress, Capability, Event } from 'react-native-track-player';
import Slider from '@react-native-community/slider';
import FastImage from 'react-native-fast-image';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { base_url } from '../../../App';

const Index = () => {

  const [spinner, setSpinner] = useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [allPodcast, setAllPodcast] = useState([]);
  const [latestPodcast, setLatestPodcast] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentMusic, setCurrentMusic] = useState(null);
  const playbackState = usePlaybackState();
  const progress = useProgress();

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      getAllPodcast();
      console.log("Refreshing Successful")
    }, 2000);
  }, []);

  useEffect(() => {
    getAllPodcast();
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

  const getAllPodcast = async () => {
    try {
      setSpinner(true);
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
        setSpinner(false);
        setAllPodcast(responseData.data);
        setLatestPodcast(responseData.data[0]);
      }
    } catch (error) {
      console.log(error);
      setSpinner(false);
    }
  };

  const togglePlayback = async (track) => {
    setLatestPodcast(track);
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

  const closeMusic = async () => {
    setCurrentTrack(null);
    setCurrentMusic(null);
    await TrackPlayer.reset();
  }

  return (
    <View style={{ flex: 1 }}>
      {spinner === true ?
        <View style={{ flex: 1, alignSelf: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="red" />
          <Text style={{ color: 'red', fontSize: 17 }}>Loading...</Text>
        </View>
        :
        <ScrollView style={{ flex: 1 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          <View style={{ width: '100%', height: 370, borderBottomEndRadius: 20, borderBottomLeftRadius: 20 }}>
            <ImageBackground source={require('../../assets/images/bg6.jpg')} style={{ width: '100%', height: '100%' }}>
              <View>
                {latestPodcast?.image_url ?
                  <Image style={styles.mainImg} source={{ uri: latestPodcast?.image_url }} />
                  :
                  <Image style={styles.mainImg} source={require('../../assets/images/LordJagannath.jpg')} />
                }
              </View>
              <View style={{ marginTop: 10 }}>
                <Text style={styles.title}>{latestPodcast?.name}</Text>
                <Text style={{ color: '#000', fontSize: 15, textAlign: 'center' }}>{latestPodcast?.description}</Text>
              </View>
              <View style={{ width: '90%', alignSelf: 'center', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', marginTop: 5 }}>
                <Text style={{ color: '#000', fontSize: 13 }}>{formatTime(progress.position)}</Text>
                <Slider
                  style={styles.progessContainer}
                  value={progress.position}
                  minimumValue={0}
                  maximumValue={progress.duration}
                  thumbTintColor="red"
                  minimumTrackTintColor="#e8979c"
                  maximumTrackTintColor="#000"
                  onSlidingComplete={async (value) => {
                    await TrackPlayer.seekTo(value);
                  }}
                />
                <Text style={{ color: '#000', fontSize: 13 }}>{formatTime(progress.duration)}</Text>
              </View>
              <View style={{ borderBottomEndRadius: 20, borderBottomLeftRadius: 20, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <View style={styles.musicControls}>
                  <TouchableOpacity onPress={handleBackward}>
                    <AntDesign name="banckward" size={25} color="#c80100" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => togglePlayback(latestPodcast)}>
                    <Ionicons name={playbackState.state === State.Playing ? 'pause-circle' : 'play-circle'} size={70} color="#c80100" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleForward}>
                    <AntDesign name="forward" size={25} color="#c80100" />
                  </TouchableOpacity>
                </View>
              </View>
            </ImageBackground>
          </View>
          <View style={{ flex: 1, paddingTop: 6 }}>
            <FlatList
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              data={allPodcast}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => {
                const isPlaying = playbackState.state === State.Playing && currentTrack === item.id;
                return (
                  <View style={{ width: '100%', height: 390 }}>
                    <View style={styles.mainBox}>
                      {item?.image_url &&
                        <Image style={{ height: '100%', width: '100%', borderRadius: 14, resizeMode: 'cover' }} source={{ uri: item?.image_url }} />
                      }
                      <View style={styles.overlay} />
                      <View style={styles.spiritual}>
                        <Text style={{ color: '#fff', fontSize: 14, letterSpacing: 0.5 }}>Spiritual</Text>
                      </View>
                      <View style={styles.trackContainer}>
                        {isPlaying ?
                          <FastImage
                            style={{ width: '60%', height: 50 }}
                            source={require('../../assets/GIF/giphy.gif')}
                            resizeMode={FastImage.resizeMode.cover}
                          />
                          :
                          <Image source={require('../../assets/images/track.png')} />
                        }
                        <TouchableOpacity
                          style={styles.playBtn}
                          onPress={(() => togglePlayback(item))}
                        >
                          <AntDesign name={isPlaying ? "pausecircle" : "play"} color={'#f24949'} size={40} />
                        </TouchableOpacity>
                      </View>
                      <View style={styles.descBox}>
                        <Text style={styles.podcastName}>{item.name}</Text>
                        <Text style={styles.podcastDesc}>{item.description}</Text>
                      </View>
                    </View>
                  </View>
                );
              }}
            />
          </View>
        </ScrollView>
      }
      {currentMusic &&
        <View style={styles.musicSection}>
          <View style={{ width: '70%', flexDirection: 'row', alignItems: 'center', paddingLeft: 18 }}>
            <Image style={styles.smallImg} source={{ uri: currentMusic.image_url }} />
            <View style={{ marginLeft: 20 }}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>{currentMusic.name}</Text>
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
      }
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({
  mainBox: {
    backgroundColor: '#d7d7d9',
    width: '90%',
    height: 280,
    alignSelf: 'center',
    borderRadius: 14
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 14
  },
  descBox: {
    backgroundColor: '#fff',
    position: 'absolute',
    width: '85%',
    height: 140,
    top: 230,
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
  spiritual: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#f01a3e',
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
  musicSection: {
    backgroundColor: '#f24949',
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
    width: '80%',
    height: 180,
    alignSelf: 'center',
    marginTop: 15,
    borderRadius: 10
  },
  progessContainer: {
    width: '90%',
    height: 10,
    alignSelf: 'center'
  },
  musicControls: {
    flexDirection: 'row',
    width: '60%',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    color: '#000'
  },
});
