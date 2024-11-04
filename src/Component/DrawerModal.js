import { StyleSheet, Text, View, Modal, Button, TouchableWithoutFeedback, TouchableOpacity, Alert, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useIsFocused } from '@react-navigation/native'
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { base_url } from '../../App';
import messaging from '@react-native-firebase/messaging';

const DrawerModal = ({ visible, onClose }) => {

    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [accessToken, setAccessToken] = useState(null);
    const [fcmToken, setFcmToken] = useState(null);

    async function getFCMToken() {
        try {
            const token = await messaging().getToken();
            // console.log('FCM Token:', token)
            setFcmToken(token);
        } catch (error) {
            console.log('Error getting FCM token:', error);
        }
    }

    const confirmLogout = () => {
        onClose();
        try {
            fetch(base_url + 'api/userLogout', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    device_id: fcmToken,
                }),
            })
                .then((response) => response.json())
                .then(async (responseData) => {
                    if (responseData.status === 200) {
                        // console.log(responseData)
                        AsyncStorage.removeItem('storeAccesstoken');
                        navigation.replace('Home');
                    } else {
                        // console.log("Error-----", responseData.message);
                        alert(responseData.message);
                    }
                })
        } catch (error) {
            console.log("error", error)
        }
    };

    const isLogout = () => {
        onClose();
        Alert.alert('Confirm Logout', 'Are you sure you want to Logout ?', [
            { text: 'cancel' },
            { text: 'OK', onPress: confirmLogout },
        ]);
    };

    const getAccesstoken = async () => {
        var access_token = await AsyncStorage.getItem('storeAccesstoken');
        console.log("access_token=-=-", access_token);
        setAccessToken(access_token);
    }

    useEffect(() => {
        if (isFocused) {
            getFCMToken();
            getAccesstoken();
        }
    }, [isFocused])

    const goToProfile = () => {
        if (accessToken) {
            onClose();
            navigation.navigate('Profile');
        } else {
            onClose();
            navigation.navigate('Login');
        }
    }

    const goToPanditBookingHistory = () => {
        if (accessToken) {
            onClose();
            navigation.navigate('PanditBookingHistory');
        } else {
            onClose();
            navigation.navigate('Login');
        }
    }

    const goToPendingBooking = () => {
        if (accessToken) {
            onClose();
            navigation.navigate('BookingPending');
        } else {
            onClose();
            navigation.navigate('Login');
        }
    }

    const gotoFlowerHistoryPage = () => {
        if (accessToken) {
            onClose();
            navigation.navigate('PackageHistory');
        } else {
            onClose();
            navigation.navigate('Login');
        }
    };

    const goToAddressPage = () => {
        if (accessToken) {
            onClose();
            navigation.navigate('AllAddress');
        } else {
            onClose();
            navigation.navigate('Login');
        }
    }

    return (
        <View>
            <Modal
                visible={visible}
                animationType="none"
                transparent={true}
                onRequestClose={onClose}
            >
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <View style={styles.variantModalContainer}>
                            <View style={{ width: '100%', height: 60, backgroundColor: '#000' }}>
                                <View style={{ width: '92%', height: '100%', alignSelf: 'flex-start', justifyContent: 'center' }}>
                                    <Image style={{ width: '80%', height: '80%', resizeMode: 'contain' }} source={require('../assets/images/whitelogo.png')} />
                                </View>
                            </View>
                            {/* <View style={{ backgroundColor: '#000', width: '100%', height: 0.4 }}></View> */}
                            <TouchableOpacity onPress={() => goToProfile()} style={styles.drawerCell}>
                                <Feather name="user" color={'#fff'} size={22} />
                                <Text style={styles.drawerLable}>Profile</Text>
                            </TouchableOpacity>
                            {/* <TouchableOpacity onPress={() => { onClose(); navigation.navigate('Favorites') }} style={styles.drawerCell}>
                                <AntDesign name="hearto" color={'#fff'} size={22} />
                                <Text style={styles.drawerLable}>Favorite</Text>
                            </TouchableOpacity> */}
                            <TouchableOpacity onPress={() => goToPanditBookingHistory()} style={styles.drawerCell}>
                                <Image style={{ height: 27, width: 27 }} source={require("../assets/logo/orderHistory.png")} />
                                <Text style={styles.drawerLable}>Pandit Booking History</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => goToPendingBooking()} style={styles.drawerCell}>
                                <Image style={{ height: 27, width: 27 }} source={require("../assets/logo/orderHistory.png")} />
                                <Text style={styles.drawerLable}>Booking Pending</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => gotoFlowerHistoryPage()} style={styles.drawerCell}>
                                {/* <Image style={{ height: 27, width: 27 }} source={require("../assets/logo/orderHistory.png")} /> */}
                                <Ionicons name="flower-outline" color={'#fff'} size={22} />
                                <Text style={styles.drawerLable}>Flower Subscription</Text>
                            </TouchableOpacity>
                            {/* <TouchableOpacity onPress={() => { onClose(); navigation.navigate('OrderHistory') }} style={styles.drawerCell}>
                                <Image style={{ height: 27, width: 27 }} source={require("../assets/logo/orderHistory.png")} />
                                <Text style={styles.drawerLable}>Order History</Text>
                            </TouchableOpacity> */}
                            <TouchableOpacity onPress={() => goToAddressPage()} style={styles.drawerCell}>
                                <Feather name="map-pin" color={'#fff'} size={22} />
                                <Text style={styles.drawerLable}>Address</Text>
                            </TouchableOpacity>
                            {/* <TouchableOpacity onPress={() => { onClose(); navigation.navigate('Offer') }} style={styles.drawerCell}>
                                <Image style={{ height: 23, width: 23 }} source={require("../assets/logo/offerLogo.png")} />
                                <Text style={styles.drawerLable}>Offers</Text>
                            </TouchableOpacity> */}
                            <TouchableOpacity onPress={() => { onClose(); navigation.navigate('TermsOfUse') }} style={styles.drawerCell}>
                                <AntDesign name="infocirlceo" color={'#fff'} size={22} />
                                <Text style={styles.drawerLable}>Terms Of Use</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { onClose(); navigation.navigate('PrivacyPolicy') }} style={styles.drawerCell}>
                                <Feather name="lock" color={'#fff'} size={22} />
                                <Text style={styles.drawerLable}>Privacy Policy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { onClose(); navigation.navigate('AboutUs') }} style={styles.drawerCell}>
                                <Image style={{ height: 28, width: 28 }} source={require("../assets/logo/aboutUs.png")} />
                                <Text style={styles.drawerLable}>About Us</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { onClose(); navigation.navigate('ContactUs') }} style={styles.drawerCell}>
                                <AntDesign name="contacts" color={'#fff'} size={22} />
                                {/* <Image style={{ height: 23, width: 23 }} source={require("../assets/logo/offerLogo.png")} /> */}
                                <Text style={styles.drawerLable}>Contact Us</Text>
                            </TouchableOpacity>
                            {accessToken ?
                                <TouchableOpacity onPress={isLogout} style={styles.drawerCell}>
                                    <MaterialCommunityIcons name="logout" color={'#fff'} size={25} />
                                    <Text style={styles.drawerLable}>Logout</Text>
                                </TouchableOpacity>
                                :
                                <TouchableOpacity onPress={() => { onClose(); navigation.navigate('Login') }} style={styles.drawerCell}>
                                    <MaterialCommunityIcons name="login" color={'#fff'} size={25} />
                                    <Text style={styles.drawerLable}>Login</Text>
                                </TouchableOpacity>
                            }
                            <TouchableOpacity style={styles.drawerCell}>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.drawerCell}>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.drawerCell}>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.drawerCell}>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.drawerCell}>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.drawerCell}>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.drawerCell}>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    )
}

export default DrawerModal

const styles = StyleSheet.create({
    variantModalContainer: {
        width: '70%',
        height: '100%',
        left: 0,
        backgroundColor: '#fff',
        bottom: 0,
        position: 'absolute',
        alignSelf: 'center',
    },
    drawerCell: {
        width: '100%',
        height: 60,
        backgroundColor: '#dc3545',
        alignSelf: 'flex-end',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 20
    },
    drawerLable: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '500',
        letterSpacing: 0.6,
        marginLeft: 15
    }
})