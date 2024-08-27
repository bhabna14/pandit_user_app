import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import YoutubePlayer from 'react-native-youtube-iframe';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { base_url } from '../../../App';

const Index = (props) => {

    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [spinner, setSpinner] = useState(false);
    const screenWidth = Dimensions.get('window').width;
    const [allYoutubeVideo, setAllYoutubeVideo] = useState([]);

    const getAllYoutubeVideo = async () => {
        try {
            setSpinner(true);
            const response = await fetch(base_url + 'api/manage-youtube', {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
            });
            const responseData = await response.json();
            if (responseData.status === 200) {
                console.log("getAllAddress-------", responseData.data);
                setSpinner(false);
                setAllYoutubeVideo(responseData.data);
            }
        } catch (error) {
            console.log(error);
            setSpinner(false);
        }
    }

    useEffect(() => {
        if (isFocused) {
            getAllYoutubeVideo();
        }
    }, [isFocused])

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => props.navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => props.navigation.goBack()}>
                            <Feather name="chevron-left" color={'#555454'} size={30} />
                        </TouchableOpacity>
                        <Text style={{ color: '#000', fontSize: 17, fontWeight: '500' }}>Back</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {spinner === true ?
                <View style={{ flex: 1, alignSelf: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#ffcb44', fontSize: 17 }}>Loading...</Text>
                </View>
                :
                <View style={styles.content}>
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        data={allYoutubeVideo}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.videoContainer}>
                                <YoutubePlayer
                                    height={200}
                                    width={screenWidth * 0.9}
                                    play={false}
                                    videoId={item.youtube_url}
                                    initialPlayerParams={{ controls: true }}
                                />
                                <View style={styles.descBox}>
                                    <Text style={styles.podcastName}>{item.title}</Text>
                                    <Text style={styles.podcastDesc}>{item.description}</Text>
                                </View>
                            </View>
                        )}
                    />
                </View>
            }
        </SafeAreaView>
    );
};

export default Index;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f2f2'
    },
    header: {
        width: '100%',
        height: 58,
        backgroundColor: '#fff'
    },
    headerContent: {
        width: '95%',
        height: '100%',
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // backgroundColor:'yellow'
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#00000080',
        padding: 10,
        borderRadius: 20
    },
    backButtonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '500',
        marginLeft: 5
    },
    content: {
        flex: 1,
        width: '95%',
        alignSelf: 'center',
        marginTop: 10
    },
    videoContainer: {
        marginBottom: 20,
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    descBox: {
        backgroundColor: '#fff',
        width: '100%',
        borderRadius: 10,
        padding: 15,
        marginTop: 10,
    },
    podcastName: {
        color: '#333',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5
    },
    podcastDesc: {
        color: '#555',
        fontSize: 15,
        lineHeight: 22
    }
});
