import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Feather from 'react-native-vector-icons/Feather';
import { launchImageLibrary } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import { Rating } from 'react-native-ratings';
import { base_url } from '../../../App';

const Index = (props) => {

    const navigation = useNavigation();
    const bookingDetails = props.route.params;
    const [imageSource, setImageSource] = useState(null);
    const [imageRes, setImageRes] = useState(null);
    const [audio, setAudio] = useState(null);
    const [audioRes, setAudioRes] = useState(null);
    const [rating, setRating] = useState(0);
    const [textReview, setTextReview] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const selectImage = async () => {
        const options = {
            mediaType: 'photo',
            quality: 1,
        };

        launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else {
                const source = response.assets[0].uri;
                setImageSource(source);
                setImageRes(response);
            }
        });
    };

    const pickAudio = async () => {
        try {
            const res = await DocumentPicker.pick({
                type: [DocumentPicker.types.audio],
            });
            setAudio(res[0].uri);
            setAudioRes(res[0]);
            // console.log("Audio Response", res[0]);
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                console.log('User cancelled audio picker');
            } else {
                throw err;
            }
        }
    };

    const submitReview = async () => {
        setIsLoading(true); // Start loading
        var access_token = await AsyncStorage.getItem('storeAccesstoken');
        // Create form data
        const formData = new FormData();
        formData.append('booking_id', bookingDetails?.id);
        formData.append('rating', rating);
        formData.append('feedback_message', textReview);
        formData.append('image', {
            uri: imageRes?.assets[0]?.uri,
            name: imageRes?.assets[0]?.fileName,
            filename: imageRes?.assets[0]?.fileName,
            type: imageRes?.assets[0]?.type
        });
        formData.append('audioFile', {
            uri: audioRes?.uri,
            type: audioRes?.type,
            name: audioRes?.name,
        });

        fetch(base_url + 'api/submit-rating',
            {
                method: 'POST',
                headers: {
                    "Content-Type": "multipart/form-data",
                    'Authorization': `Bearer ${access_token}`
                },
                body: formData
            })
            .then((response) => response.json())
            .then(async (responseData) => {
                setIsLoading(false); // Stop loading
                console.log("Review submitted successfully!----", responseData);
                navigation.goBack();
            })
            .catch((error) => {
                setIsLoading(false); // Stop loading
                console.error('There was an issue submitting your review.', error);
            });
    };

    useEffect(() => {
        // console.log("get Booking Details by Props", props.route.params);
    }, [])

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerPart}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="chevron-left" color={'#555454'} size={30} />
                    <Text style={styles.headerText}>Rate Pooja</Text>
                </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
                <View style={styles.detailsBox}>
                    <View style={styles.profilePic}>
                        <Image style={styles.image} source={{ uri: bookingDetails.pooja.poojalist.pooja_photo_url }} />
                    </View>
                    <View style={styles.detailTextContainer}>
                        <Text style={styles.mainText}>{bookingDetails?.pooja?.pooja_name}</Text>
                        <Text style={styles.subText}>{bookingDetails?.pandit?.title + " " + bookingDetails?.pandit?.name}</Text>
                    </View>
                    <View style={styles.ratingContainer}>
                        <Text style={styles.label}>Rate the Pooja:</Text>
                        <Rating
                            startingValue={rating}
                            showRating={true}
                            onFinishRating={(value) => setRating(value)}
                            style={{ width: 200, alignSelf: 'center' }}
                        />
                    </View>
                    <View style={styles.textReviewContainer}>
                        <Text style={styles.label}>Text Review:</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Write your review..."
                            placeholderTextColor={'#000'}
                            value={textReview}
                            onChangeText={setTextReview}
                            multiline
                        />
                    </View>
                    {imageSource && (
                        <View style={styles.uploadedContainer}>
                            <Image source={{ uri: imageSource }} style={styles.uploadedImage} />
                            <Text style={styles.uploadedFileName}>Image: {imageSource.split('/').pop()}</Text>
                        </View>
                    )}
                    <TouchableOpacity style={styles.uploadButton} onPress={selectImage}>
                        <Text style={styles.uploadButtonText}>Upload Image</Text>
                    </TouchableOpacity>
                    {audio && (
                        <View style={styles.uploadedContainer}>
                            <Text style={styles.uploadedFileName}>Audio: {audio.split('/').pop()}</Text>
                        </View>
                    )}
                    <TouchableOpacity style={styles.uploadButton} onPress={pickAudio}>
                        <Text style={styles.uploadButtonText}>Upload Audio</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.submitButton} onPress={submitReview} disabled={isLoading}>
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitButtonText}>Submit Review</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default Index

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5'
    },
    headerPart: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 13,
        paddingHorizontal: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 5
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    headerText: {
        color: '#000',
        fontSize: 18,
        fontWeight: '500',
        marginBottom: 3,
        marginLeft: 5
    },
    scrollView: {
        flex: 1,
        marginBottom: 50
    },
    detailsBox: {
        marginVertical: 10,
        backgroundColor: '#fff',
        padding: 20,
        marginHorizontal: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 5
    },
    profilePic: {
        alignItems: 'center',
        marginBottom: 15,
    },
    image: {
        height: 200,
        width: '100%',
        borderRadius: 10,
        resizeMode: 'cover'
    },
    detailTextContainer: {
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    mainText: {
        color: '#000',
        fontSize: 20,
        fontWeight: '600',
        textTransform: 'capitalize',
        marginBottom: 5,
    },
    subText: {
        color: '#555',
        fontSize: 16,
        fontWeight: '400',
        textTransform: 'capitalize',
    },
    ratingContainer: {
        marginBottom: 20,
    },
    label: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 5,
    },
    textReviewContainer: {
        marginBottom: 20,
    },
    textInput: {
        color: '#000',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        textAlignVertical: 'top',
        height: 100,
    },
    uploadButton: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginVertical: 10,
    },
    uploadButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    submitButton: {
        backgroundColor: '#28a745',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginVertical: 20,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    uploadedContainer: {
        marginTop: 10,
        alignItems: 'center',
    },
    uploadedImage: {
        width: '100%',
        height: 200,
        borderRadius: 10,
    },
    uploadedFileName: {
        color: '#555',
        fontSize: 14,
        marginTop: 5,
        textAlign: 'center',
    },
});
