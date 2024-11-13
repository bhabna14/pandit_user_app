import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import RazorpayCheckout from 'react-native-razorpay';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { base_url } from '../../../App';
import { Rating } from 'react-native-ratings';
import Sound from 'react-native-sound';
import Slider from '@react-native-community/slider';

const Index = (props) => {

    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [spinner, setSpinner] = useState(false);
    const bookingDetails = props.route.params;
    const [profileDetails, setProfileDetails] = useState({});
    const [rating, setRating] = useState(props.route.params?.rating_details?.rating || 0);

    const [sound, setSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentPosition, setCurrentPosition] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        return () => {
            if (sound) {
                sound.release(); // Release the sound object when the component is unmounted
            }
        };
    }, [sound]);

    const playAudio = (audioUrl) => {
        if (audioUrl) {
            const newSound = new Sound(audioUrl, null, (error) => {
                if (error) {
                    console.log('Failed to load the sound', error);
                    return;
                }
                setDuration(newSound.getDuration()); // Set the audio duration
                newSound.play((success) => {
                    if (success) {
                        console.log('Successfully finished playing');
                        setIsPlaying(false);
                        setCurrentPosition(0); // Reset position after finishing
                    } else {
                        console.log('Playback failed due to audio decoding errors');
                        setIsPlaying(false);
                    }
                });
            });
            setSound(newSound);
            setIsPlaying(true);
        }
    };

    const stopAudio = () => {
        if (sound) {
            sound.stop(() => {
                console.log('Audio stopped');
                setIsPlaying(false);
                setCurrentPosition(0);
            });
        }
    };

    const toggleAudio = () => {
        if (isPlaying) {
            stopAudio();
        } else {
            playAudio(bookingDetails?.rating_details?.audio_url);
        }
    };

    const updateCurrentPosition = () => {
        if (sound) {
            sound.getCurrentTime((seconds) => {
                setCurrentPosition(seconds);
            });
        }
    };

    useEffect(() => {
        if (isPlaying && sound) {
            const interval = setInterval(updateCurrentPosition, 1000); // Update position every second
            return () => clearInterval(interval);
        }
    }, [isPlaying, sound]);

    const seekAudio = (value) => {
        if (sound) {
            sound.setCurrentTime(value);
            setCurrentPosition(value);
        }
    };

    const totalAmount = bookingDetails.pooja_fee;
    const discountAmount = (totalAmount * 0.05).toFixed(2);
    const discountedTotalAmount = (totalAmount - discountAmount).toFixed(2);

    const getProfile = async () => {
        var access_token = await AsyncStorage.getItem('storeAccesstoken');
        try {
            const response = await fetch(base_url + 'api/user/details', {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access_token}`
                },
            });
            const responseData = await response.json();
            if (responseData.success === true) {
                // console.log("getProfile-------", responseData);
                setProfileDetails(responseData.user);
                // setImageSource(user.);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handlePayment = async (price, pay_type) => {
        var access_token = await AsyncStorage.getItem('storeAccesstoken');
        var options = {
            description: `Pandit Booking For ${bookingDetails?.pooja?.pooja_name}`,
            image: '',
            currency: 'INR',
            key: 'rzp_live_m8GAuZDtZ9W0AI',
            amount: price * 100,
            name: profileDetails.name,
            order_id: '',
            prefill: {
                email: profileDetails.email,
                contact: profileDetails.mobile_number,
                name: profileDetails.name
            },
            theme: { color: '#53a20e' }
        };

        RazorpayCheckout.open(options).then((data) => {
            // handle success
            console.log("Success:", data.razorpay_payment_id);
            // After a successful payment, make an API call
            const paymentDetails = {
                payment_id: data.razorpay_payment_id,
                payment_status: "paid",
                status: "paid",
                paid: price,
                payment_type: pay_type,
                payment_method: 'razorpay'
            };

            const url = `${base_url}api/process-payment/${bookingDetails.booking_id}`;
            fetch(url, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access_token}`
                },
                body: JSON.stringify(paymentDetails)
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Payment processed successfully:', data);
                    navigation.goBack();
                    // navigation.navigate('PanditBookingHistory');
                })
                .catch((error) => {
                    console.error('Error processing payment:', error);
                });
        }).catch((error) => {
            // handle failure
            console.log("Error:", error.code, error.description);
            // alert(`Error: ${error.code} | ${error.description}`);
        });
    }

    const remainingPayment = async (price) => {
        var access_token = await AsyncStorage.getItem('storeAccesstoken');
        var options = {
            description: `Pandit Booking For ${bookingDetails?.pooja?.pooja_name}`,
            image: '',
            currency: 'INR',
            key: 'rzp_live_m8GAuZDtZ9W0AI',
            amount: price * 100,
            name: profileDetails.name,
            order_id: '',
            prefill: {
                email: profileDetails.email,
                contact: profileDetails.mobile_number,
                name: profileDetails.name
            },
            theme: { color: '#53a20e' }
        };

        RazorpayCheckout.open(options).then((data) => {
            // handle success
            console.log("Success:", data.razorpay_payment_id);
            // After a successful payment, make an API call
            const paymentDetails = {
                payment_id: data.razorpay_payment_id,
                paid: price,
            };

            const url = `${base_url}api/process-remaining-payment/${bookingDetails.booking_id}`;
            fetch(url, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access_token}`
                },
                body: JSON.stringify(paymentDetails)
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Payment processed successfully:', data);
                    navigation.goBack();
                    // navigation.navigate('PanditBookingHistory');
                })
                .catch((error) => {
                    console.error('Error processing payment:', error);
                });
        }).catch((error) => {
            // handle failure
            console.log("Error:", error.code, error.description);
            // alert(`Error: ${error.code} | ${error.description}`);
        });
    }

    const handleCancel = () => {
        navigation.replace('CancelBooking', bookingDetails);
    }

    const handleRate = () => {
        navigation.replace('RatingPuja', bookingDetails);
    }

    const maskPhoneNumber = (phoneNumber) => {
        if (phoneNumber.length <= 4) {
            return phoneNumber;
        }
        const visiblePart = phoneNumber.slice(0, 4);
        const maskedPart = '*'.repeat(phoneNumber.length - 4);
        return `${visiblePart}${maskedPart}`;
    };

    const maskEmail = (email) => {
        if (!email) {
            return '';
        }

        const [localPart, domain] = email.split('@');
        if (localPart.length <= 2) {
            return email;
        }

        const visiblePart = localPart.slice(0, 2);
        const maskedPart = '*'.repeat(localPart.length - 2);
        return `${visiblePart}${maskedPart}@${domain}`;
    };

    useEffect(() => {
        if (isFocused) {
            getProfile();
            // console.log("get booking details by props", bookingDetails);
            setSpinner(true);
            setTimeout(() => {
                setSpinner(false);
            }, 500)
        }
    }, [isFocused]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerPart}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Feather name="chevron-left" color={'#555454'} size={30} />
                    <Text style={{ color: '#000', fontSize: 16, fontWeight: '500', marginBottom: 3, marginLeft: 5 }}>Booking Details</Text>
                </TouchableOpacity>
            </View>
            {spinner ? (
                <View style={styles.loadingContainer}>
                    <Text style={{ color: '#ffcb44', fontSize: 17 }}>Loading...</Text>
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                    <View style={styles.detailsBox}>
                        <View style={styles.profilePic}>
                            <Image style={styles.image} source={{ uri: bookingDetails?.pooja?.poojalist?.pooja_photo_url }} />
                        </View>
                        <View style={styles.detailTextContainer}>
                            <Text style={styles.mainText}>{bookingDetails?.pooja?.poojalist?.pooja_name}</Text>
                            <Text style={styles.subText}>{bookingDetails?.pandit?.title + " " + bookingDetails?.pandit?.name}</Text>
                            <Text style={styles.subText}>Duration: {bookingDetails?.pooja?.pooja_duration}</Text>
                        </View>
                    </View>
                    <View style={styles.detailsBox}>
                        <Text style={styles.sectionHeader}>Booking Information</Text>
                        <Text style={styles.infoText}>Booking ID: {bookingDetails?.booking_id}</Text>
                        <Text style={styles.infoText}>Booking Date: {bookingDetails?.booking_date}</Text>
                        <Text style={styles.infoText}>Advance Fee: ₹{bookingDetails?.advance_fee}</Text>
                        <Text style={styles.infoText}>Total Fee: ₹{bookingDetails?.pooja_fee}</Text>
                        <Text style={styles.infoText}>Status: {bookingDetails?.status}</Text>
                    </View>
                    <View style={styles.detailsBox}>
                        <Text style={styles.sectionHeader}>Pandit Information</Text>
                        <Text style={styles.infoText}>Name: {bookingDetails?.pandit?.title + " " + bookingDetails?.pandit?.name}</Text>
                        {bookingDetails?.pandit?.email ?
                            <Text style={styles.infoText}>Email: {maskEmail(bookingDetails?.pandit?.email)}</Text>
                            :
                            <Text style={styles.infoText}>Email: N/A</Text>
                        }
                        <Text style={styles.infoText}>Phone: {maskPhoneNumber(bookingDetails?.pandit?.whatsappno)}</Text>
                        <Text style={styles.infoText}>Language: {bookingDetails?.pandit?.language}</Text>
                        <Text style={styles.infoText}>Blood Group: {bookingDetails?.pandit?.bloodgroup}</Text>
                        <Text style={styles.infoText}>About: {bookingDetails?.pandit?.about_pandit}</Text>
                    </View>
                    <View style={[styles.detailsBox, !bookingDetails?.rating_details?.id ? { marginBottom: bookingDetails.status === "paid" && bookingDetails.payment_status === "paid" && bookingDetails.application_status === "approved" && bookingDetails.pooja_status === "pending" ? 90 : 50 } : null]}>
                        <Text style={styles.sectionHeader}>Address Information</Text>
                        <Text style={styles.infoText}>Apartment / Plot / Flat Number: {bookingDetails?.address?.apartment_flat_plot}</Text>
                        <Text style={styles.infoText}>Landmark: {bookingDetails?.address?.landmark}</Text>
                        <Text style={styles.infoText}>Locality: {bookingDetails?.address?.locality_details?.locality_name}</Text>
                        <Text style={styles.infoText}>City: {bookingDetails?.address?.city}</Text>
                        <Text style={styles.infoText}>State: {bookingDetails?.address?.state}</Text>
                        <Text style={styles.infoText}>Pincode: {bookingDetails?.address?.pincode}</Text>
                        <Text style={styles.infoText}>Residential: {bookingDetails?.address?.place_category}</Text>
                        <Text style={styles.infoText}>Type: {bookingDetails?.address?.address_type}</Text>
                    </View>
                    {bookingDetails?.rating_details?.id ?
                        <View style={[styles.detailsBox, { marginBottom: bookingDetails.status === "paid" && bookingDetails.payment_status === "paid" && bookingDetails.application_status === "approved" && bookingDetails.pooja_status === "pending" ? 90 : 50 }]}>
                            <Text style={styles.sectionHeader}>Pooja  Rating</Text>
                            <Rating
                                startingValue={rating}
                                // showRating={true}
                                readonly={true}
                                onFinishRating={(value) => setRating(value)}
                                style={{ width: 200, alignSelf: 'center', marginBottom: 10 }}
                            />
                            <Text style={styles.infoText}>Feedback:  {bookingDetails?.rating_details?.feedback_message}</Text>
                            <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                                {bookingDetails?.rating_details?.image_url &&
                                    <View style={{ width: '48%' }}>
                                        <Text style={styles.infoText}>Image Review:</Text>
                                        <Image source={{ uri: bookingDetails?.rating_details?.image_url }} style={{ width: 100, height: 120 }} />
                                    </View>
                                }
                                {bookingDetails?.rating_details?.audio_url &&
                                    <View style={{ width: '48%', alignItems: 'center' }}>
                                        <Text style={styles.infoText}>Audio Review:</Text>
                                        <TouchableOpacity
                                            style={styles.audioContainer}
                                            onPress={toggleAudio}
                                        >
                                            <Text style={styles.audioText}>{isPlaying ? 'Stop Audio' : 'Play Audio'}</Text>
                                        </TouchableOpacity>
                                        <Slider
                                            style={{ width: '100%', height: 40 }}
                                            minimumValue={0}
                                            maximumValue={duration}
                                            value={currentPosition}
                                            onValueChange={seekAudio}
                                            minimumTrackTintColor="#1FB28A"
                                            maximumTrackTintColor="#9c9a9a"
                                            thumbTintColor="#1FB28A"
                                        />
                                        <Text style={styles.durationText}>
                                            {Math.floor(currentPosition)}s / {Math.floor(duration)}s
                                        </Text>
                                    </View>
                                }
                            </View>
                        </View>
                        :
                        null
                    }
                </ScrollView>
            )}


            {bookingDetails.status === "pending" && bookingDetails.payment_status === "pending" && bookingDetails.application_status === "pending" && bookingDetails.pooja_status === "pending" &&
                <View style={[styles.fixedBtm, { backgroundColor: '#fa6a4d' }]}>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Pending</Text>
                </View>
            }

            {bookingDetails.status === "pending" && bookingDetails.payment_status === "pending" && bookingDetails.application_status === "approved" && bookingDetails.pooja_status === "pending" &&
                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={() => handlePayment(discountedTotalAmount, 'full')} style={styles.totalPayButton}>
                        <Text style={styles.buttonText}>Total Pay</Text>
                        <Text style={styles.discountText}>₹{discountedTotalAmount}</Text>
                        <Text style={styles.originalPriceText}><Text style={{ textDecorationLine: 'line-through' }}>₹{totalAmount}</Text>  (-5%)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handlePayment(bookingDetails.advance_fee, 'advance')} style={styles.advancePayButton}>
                        <Text style={styles.buttonText}>Advance Pay</Text>
                        <Text style={styles.buttonText}>₹{bookingDetails.advance_fee}</Text>
                    </TouchableOpacity>
                </View>
            }

            {bookingDetails.status === "paid" && bookingDetails.payment_status === "paid" && bookingDetails.application_status === "approved" && (bookingDetails.pooja_status === "pending" || bookingDetails.pooja_status === "started") && bookingDetails.payment.payment_type === "advance" &&
                <TouchableOpacity onPress={() => remainingPayment(bookingDetails.pooja_fee - bookingDetails.advance_fee)} style={[styles.fixedBtm, { marginBottom: 60 }]}>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginRight: 10 }}>Remaining Payment</Text>
                    <Text style={styles.buttonText}>₹{bookingDetails.pooja_fee - bookingDetails.advance_fee}</Text>
                </TouchableOpacity>
            }
            {bookingDetails.status === "paid" && bookingDetails.payment_status === "paid" && bookingDetails.application_status === "approved" && bookingDetails.pooja_status === "started" &&
                <View style={[styles.fixedBtm, { backgroundColor: '#f04029', marginBottom: 5 }]}>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Pooja Started</Text>
                </View>
            }
            {bookingDetails.status === "paid" && bookingDetails.payment_status === "paid" && bookingDetails.application_status === "approved" && bookingDetails.pooja_status === "pending" &&
                <TouchableOpacity onPress={() => handleCancel()} style={[styles.fixedBtm, { backgroundColor: '#f04029', marginBottom: 5 }]}>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Cancel Booking</Text>
                </TouchableOpacity>
            }
            {bookingDetails.status === "paid" && bookingDetails.payment_status === "paid" && bookingDetails.application_status === "approved" && bookingDetails.pooja_status === "completed" && bookingDetails.rating_details === null &&
                <TouchableOpacity onPress={() => handleRate()} style={styles.fixedBtm}>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Rate This Pooja</Text>
                </TouchableOpacity>
            }

            {bookingDetails.status === "rejected" && bookingDetails.payment_status === "rejected" && bookingDetails.application_status === "rejected" && bookingDetails.pooja_status === "rejected" &&
                <TouchableOpacity onPress={() => navigation.navigate('PujaDetails', bookingDetails.pooja.poojalist.slug)} style={[styles.fixedBtm, { backgroundColor: '#fa6a4d' }]}>
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>This pandit is booked, choose another pandit.</Text>
                </TouchableOpacity>
            }
        </SafeAreaView>
    );
};

export default Index;

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
        paddingHorizontal: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 13,
        elevation: 5
    },
    loadingContainer: {
        flex: 1,
        alignSelf: 'center',
        justifyContent: 'center'
    },
    detailsBox: {
        marginVertical: 10,
        backgroundColor: '#fff',
        padding: 20,
        marginHorizontal: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 13,
        elevation: 5
    },
    profilePic: {
        alignItems: 'center',
        marginBottom: 10,
    },
    image: {
        height: 200,
        width: '100%',
        borderRadius: 10,
        resizeMode: 'cover'
    },
    detailTextContainer: {
        alignItems: 'flex-start'
    },
    mainText: {
        color: '#000',
        fontSize: 18,
        fontWeight: '500',
        textTransform: 'capitalize',
        marginBottom: 5
    },
    subText: {
        color: '#000',
        fontSize: 14,
        fontWeight: '400',
        textTransform: 'capitalize',
        marginBottom: 3
    },
    sectionHeader: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10
    },
    infoText: {
        color: '#000',
        fontSize: 14,
        fontWeight: '400',
        marginBottom: 5
    },
    fixedBtm: {
        backgroundColor: '#28a745',
        width: '93%',
        alignSelf: 'center',
        borderRadius: 12,
        paddingVertical: 15,
        paddingHorizontal: 15,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 5
    },
    buttonContainer: {
        width: '95%',
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        position: 'absolute',
        bottom: 5,
    },
    totalPayButton: {
        width: '47%',
        backgroundColor: '#28a745',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 10,
        alignItems: 'center',
        position: 'relative'
    },
    advancePayButton: {
        width: '47%',
        backgroundColor: '#fc7914',
        borderRadius: 12,
        paddingVertical: 17,
        paddingHorizontal: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 'bold',
        fontFamily: 'Titillium Web'
    },
    discountText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 'bold',
        fontFamily: 'Titillium Web',
    },
    originalPriceText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'normal',
        // textDecorationLine: 'line-through',
        fontFamily: 'Titillium Web',
    },
    audioContainer: {
        backgroundColor: '#f1f1f1',
        borderRadius: 5,
        width: 120,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center'
    },
    audioText: {
        fontSize: 16,
        color: '#007BFF',
    },
});
