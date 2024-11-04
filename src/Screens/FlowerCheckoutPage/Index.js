import { SafeAreaView, StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Alert, Modal, ScrollView, FlatList, RefreshControl, ActivityIndicator, Animated, Easing } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import { useNavigation, useIsFocused } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import moment from 'moment';
import RazorpayCheckout from 'react-native-razorpay';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { base_url } from '../../../App';

const Index = (props) => {

    const [allAddresses, setAllAddresses] = useState([]);
    const [displayedAddresses, setDisplayedAddresses] = useState([]);
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [spinner, setSpinner] = useState(false);
    const [addressError, setAddressError] = useState('');
    const [addressErrorMessageVisible, setAddressErrorMessageVisible] = useState(false);
    const [selectedOption, setSelectedOption] = useState('');
    const [showAllAddresses, setShowAllAddresses] = useState(false);
    const [suggestions, setSuggestions] = useState("");
    const [anyFlower, setAnyFlower] = useState("");
    const [addAddressModal, setAddAddressModal] = useState(false);
    const [profileDetails, setProfileDetails] = useState({});

    const [orderModalVisible, setOrderModalVisible] = useState(false);
    const closeOrderModal = () => { setOrderModalVisible(false) };
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.2,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ]),
        ).start();
    }, []);

    const handleAddressChange = (option) => {
        setSelectedOption(option);
        // console.log("Address Id", option);
    };

    useEffect(() => {
        // When 'allAddresses' changes, update 'displayedAddresses' with the first address
        if (allAddresses.length > 0) {
            setDisplayedAddresses(allAddresses.slice(0, 1));
        }
    }, [allAddresses]);

    const toggleAddresses = () => {
        setShowAllAddresses(!showAllAddresses);
        if (!showAllAddresses) {
            setDisplayedAddresses(allAddresses);
        } else {
            setDisplayedAddresses(allAddresses.slice(0, 1));
        }
    };

    const [errorModal, setErrorModal] = useState(false);
    const closeErrorModal = () => { setErrorModal(false); }
    const [errormasg, setErrormasg] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const displayErrorMessage = (message) => {
        setAddressError(message);
        setAddressErrorMessageVisible(true);

        setTimeout(() => {
            setAddressErrorMessageVisible(false);
            setAddressError('');
        }, 10000); // 10 seconds
    };

    const handleBuy = async () => {
        const access_token = await AsyncStorage.getItem('storeAccesstoken');
        setIsLoading(true);

        try {
            if (selectedOption === "") {
                displayErrorMessage("Please Select Your Address");
                setIsLoading(false);
                return;
            }

            const options = {
                description: props.route.params.name,
                image: '',
                currency: 'INR',
                key: 'rzp_live_m8GAuZDtZ9W0AI',
                amount: props.route.params.price * 100,
                name: profileDetails.name,
                order_id: '', // Consider generating this on the server if needed
                prefill: {
                    email: profileDetails.email,
                    contact: profileDetails.mobile_number,
                    name: profileDetails.name
                },
                theme: { color: '#53a20e' }
            };
            const data = await RazorpayCheckout.open(options);

            // Proceed only if Razorpay payment succeeds
            const response = await fetch(base_url + 'api/purchase-subscription', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access_token}`
                },
                body: JSON.stringify({
                    product_id: props.route.params.product_id,
                    address_id: selectedOption,
                    payment_id: data.razorpay_payment_id || "", // capture Razorpay payment ID if available
                    paid_amount: props.route.params.price,
                    suggestion: suggestions
                }),
            });

            const responseData = await response.json();
            if (response.ok) {
                console.log("Booking successfully", responseData);
                setOrderModalVisible(true);
            } else {
                setErrorModal(true);
                setErrormasg(responseData.message);
                console.log("responseData", responseData);
            }
        } catch (error) {
            // Handle any errors, either from Razorpay or fetch
            setErrorModal(true);
            setErrormasg(error.message || "An error occurred during payment");
            console.log("An error occurred during payment", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnyFlowerBuy = async () => {
        const access_token = await AsyncStorage.getItem('storeAccesstoken');
        setIsLoading(true);

        try {
            if (anyFlower === "") {
                displayErrorMessage("Please Enter any flower you want to add.");
                setIsLoading(false);
                return;
            }
            if (selectedOption === "") {
                displayErrorMessage("Please Select Your Address.");
                setIsLoading(false);
                return;
            }

            const response = await fetch(base_url + 'api/flower-requests', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access_token}`
                },
                body: JSON.stringify({
                    product_id: props.route.params.product_id,
                    address_id: selectedOption,
                    description: anyFlower,
                    suggestion: suggestions
                }),
            });

            const responseData = await response.json();
            if (response.ok) {
                console.log("Booking successfully", responseData);
                setOrderModalVisible(true);
            } else {
                setErrorModal(true);
                setErrormasg(responseData.message);
                console.log("responseData", responseData);
            }
        } catch (error) {
            // Handle any errors, either from Razorpay or fetch
            setErrorModal(true);
            setErrormasg(error);
            console.log("Error", error);
        } finally {
            setIsLoading(false);
        }
    };

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

    const getAllAddress = async () => {
        var access_token = await AsyncStorage.getItem('storeAccesstoken');
        try {
            setSpinner(true);
            const response = await fetch(base_url + 'api/mngaddress', {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access_token}`
                },
            });
            const responseData = await response.json();
            if (responseData.success === 200) {
                // console.log("getAllAddress-------", responseData);
                setSpinner(false);
                setAllAddresses(responseData.addressData);
            }
        } catch (error) {
            console.log(error);
            setSpinner(false);
        }
    }

    // const [name, setName] = useState("");
    // const [phoneNumber, setPhoneNumber] = useState("");
    const [state, setState] = useState("");
    const [city, setCity] = useState("");
    const [pincode, setPincode] = useState("");
    const [area, setArea] = useState("");
    const [activeAddressType, setActiveAddressType] = useState('Home');
    const [errors, setErrors] = useState({});

    const saveAddress = async () => {
        if (!validateFields()) return;
        const access_token = await AsyncStorage.getItem('storeAccesstoken');
        try {
            const response = await fetch(base_url + 'api/saveaddress', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access_token}`
                },
                body: JSON.stringify({
                    // fullname: name,
                    // number: phoneNumber,
                    country: "India",
                    state: state,
                    city: city,
                    pincode: pincode,
                    area: area,
                    address_type: activeAddressType
                }),
            });

            const responseData = await response.json();
            console.log("responseData", responseData);

            if (response.ok) {
                console.log("Address saved successfully");
                setAddAddressModal(false);
                getAllAddress();
            } else {
                console.error('Failed to save address:', responseData.message);
            }

        } catch (error) {
            console.log("Error saving address:", error);
        }
    };

    const validateFields = () => {
        let valid = true;
        let errors = {};

        // if (name === "") {
        //     errors.name = "Name is required";
        //     valid = false;
        // }
        // if (phoneNumber === "") {
        //     errors.phoneNumber = "Phone Number is required";
        //     valid = false;
        // }
        if (state === "") {
            errors.state = "State is required";
            valid = false;
        }
        if (city === "") {
            errors.city = "City is required";
            valid = false;
        }
        if (pincode === "") {
            errors.pincode = "Pincode is required";
            valid = false;
        }
        if (area === "") {
            errors.area = "Area is required";
            valid = false;
        }

        setErrors(errors);
        return valid;
    };

    useEffect(() => {
        if (isFocused) {
            // console.log("get Package details by props", props.route.params);
            getAllAddress();
            getProfile();
        }
    }, [isFocused])

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f0f0' }}>
            <View style={styles.headerPart}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Feather name="chevron-left" color={'#555454'} size={30} />
                    <Text style={styles.topHeaderText}>Checkout</Text>
                </TouchableOpacity>
            </View>
            {spinner === true ?
                <View style={{ flex: 1, alignSelf: 'center', justifyContent: 'center' }}>
                    {/* <Image style={{ width: 50, height: 50 }} source={require('../../assets/img/loading.gif')} /> */}
                    <Text style={{ color: '#ffcb44', fontSize: 17 }}>Loading...</Text>
                </View>
                :
                <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, marginBottom: 80 }}>
                    <View style={styles.panditDetails}>
                        <View style={{ width: '35%', paddingVertical: 10 }}>
                            <View style={styles.profilePic}>
                                <Image style={{ flex: 1, borderRadius: 8, resizeMode: 'cover' }} source={{ uri: props.route.params.product_image }} />
                            </View>
                        </View>
                        <View style={{ width: '60%', alignItems: 'flex-start', justifyContent: 'center' }}>
                            <Text style={{ color: '#000', fontSize: 18, fontWeight: '500', textTransform: 'capitalize' }}>{props.route.params.name}</Text>
                            {props.route.params.category === "Immediateproduct" ?
                                <Text style={{ color: '#000', fontSize: 14, fontWeight: '400', textTransform: 'capitalize', marginTop: 5 }}>Price :  {props.route.params.immediate_price}</Text>
                                :
                                <Text style={{ color: '#000', fontSize: 14, fontWeight: '400', textTransform: 'capitalize', marginTop: 5 }}>Price :  ₹{props.route.params.price}</Text>
                            }
                        </View>
                    </View>
                    {props.route.params.category === "Immediateproduct" &&
                        <View style={styles.panditDetails}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginVertical: 10 }}>
                                <View style={{ width: '15%', height: 80, borderWidth: 0.8, borderRightWidth: 0, backgroundColor: '#fbfdff', alignItems: 'center', justifyContent: 'center', borderColor: '#edeff1', borderTopLeftRadius: 5, borderBottomLeftRadius: 5 }}>
                                    <MaterialCommunityIcons name="flower-outline" color={'#495057'} size={30} />
                                </View>
                                <View style={{ width: '85%', height: 80, borderWidth: 0.8, borderColor: '#edeff1', borderTopRightRadius: 5, borderBottomRightRadius: 5 }}>
                                    <TextInput
                                        style={{ flex: 1, paddingLeft: 15, fontSize: 15, textAlignVertical: 'top', color: '#000' }}
                                        onChangeText={setAnyFlower}
                                        value={anyFlower}
                                        multiline={true}
                                        type='text'
                                        placeholder="Enter any flower you want to add..."
                                        placeholderTextColor="#888888"
                                        underlineColorAndroid='transparent'
                                    />
                                </View>
                            </View>
                        </View>
                    }
                    <View style={styles.address}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <View style={{ width: '15%', height: 80, borderWidth: 0.8, borderRightWidth: 0, backgroundColor: '#fbfdff', alignItems: 'center', justifyContent: 'center', borderColor: '#edeff1', borderTopLeftRadius: 5, borderBottomLeftRadius: 5 }}>
                                <Feather name="message-square" color={'#495057'} size={20} />
                            </View>
                            <View style={{ width: '85%', height: 80, borderWidth: 0.8, borderColor: '#edeff1', borderTopRightRadius: 5, borderBottomRightRadius: 5 }}>
                                <TextInput
                                    style={{ flex: 1, paddingLeft: 15, fontSize: 15, textAlignVertical: 'top', color: '#000' }}
                                    onChangeText={setSuggestions}
                                    value={suggestions}
                                    multiline={true}
                                    type='text'
                                    placeholder="Any suggestions? We will pass it on..."
                                    placeholderTextColor="#888888"
                                    underlineColorAndroid='transparent'
                                />
                            </View>
                        </View>
                        <View style={{ flex: 1, marginTop: 15 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5, alignItems: 'center' }}>
                                <View style={{ width: '65%' }}>
                                    {addressErrorMessageVisible ?
                                        <Text style={{ color: '#f00c27', fontWeight: '500' }}>{addressError}</Text>
                                        : null
                                    }
                                </View>
                                <TouchableOpacity style={styles.addressAddBtm} onPress={() => setAddAddressModal(true)}>
                                    <Text style={{ color: '#555454', fontSize: 16, fontWeight: '500', textTransform: 'capitalize' }}>ADD ADDRESS</Text>
                                </TouchableOpacity>
                            </View>
                            <FlatList
                                showsHorizontalScrollIndicator={false}
                                data={displayedAddresses}
                                scrollEnabled={false}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={(address) => {
                                    return (
                                        <TouchableOpacity onPress={() => handleAddressChange(address.item.id)} style={{ borderColor: '#edeff1', borderWidth: 1, padding: 10, flexDirection: 'row', alignItems: 'center', borderRadius: 8, marginVertical: 5 }}>
                                            <View style={{ width: '8%', alignSelf: 'flex-start', marginTop: 2 }}>
                                                {address.item.address_type === "Home" && <Feather name="home" color={'#555454'} size={18} />}
                                                {address.item.address_type === "Work" && <Feather name="briefcase" color={'#555454'} size={17} />}
                                                {address.item.address_type === "Other" && <Feather name="globe" color={'#555454'} size={17} />}
                                            </View>
                                            <View style={{ width: '82%' }}>
                                                <View>
                                                    {address.item.address_type === "Home" && <Text style={{ color: '#000', fontSize: 15, fontWeight: '600' }}>Home</Text>}
                                                    {address.item.address_type === "Work" && <Text style={{ color: '#000', fontSize: 15, fontWeight: '600' }}>Work</Text>}
                                                    {address.item.address_type === "Other" && <Text style={{ color: '#000', fontSize: 15, fontWeight: '600' }}>Other</Text>}
                                                </View>
                                                <Text style={{ color: '#555454', fontSize: 13 }}>{address.item.area},  {address.item.city}</Text>
                                                <Text style={{ color: '#555454', fontSize: 13 }}>{address.item.state},  {address.item.pincode},  {address.item.country}</Text>
                                            </View>
                                            <View style={{ width: '10%', alignItems: 'center', justifyContent: 'center' }}>
                                                {selectedOption === address.item.id ?
                                                    <MaterialCommunityIcons name="record-circle" color={'#ffcb44'} size={24} />
                                                    :
                                                    < Feather name="circle" color={'#555454'} size={20} />
                                                }
                                            </View>
                                        </TouchableOpacity>
                                    )
                                }}
                            />
                            {allAddresses.length > 1 && (
                                !showAllAddresses ? (
                                    <TouchableOpacity onPress={toggleAddresses} style={{ backgroundColor: 'transparent', flexDirection: 'row', alignSelf: 'center', alignItems: 'center', marginTop: 5 }}>
                                        <Text style={{ color: '#555454', fontSize: 14, marginRight: 4, marginBottom: 3 }}>Show All Addresses</Text>
                                        <FontAwesome name="angle-double-down" color={'#555454'} size={17} />
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity onPress={toggleAddresses} style={{ backgroundColor: 'transparent', flexDirection: 'row', alignSelf: 'center', alignItems: 'center', marginTop: 5 }}>
                                        <Text style={{ color: '#555454', fontSize: 14, marginRight: 4, marginBottom: 2 }}>Hide</Text>
                                        <FontAwesome name="angle-double-up" color={'#555454'} size={17} />
                                    </TouchableOpacity>
                                )
                            )}
                        </View>
                    </View>
                </ScrollView>
            }
            {isLoading ? (
                <ActivityIndicator size="large" color="#c80100" />
            ) : (
                <TouchableOpacity onPress={props.route.params.category === "Immediateproduct" ? handleAnyFlowerBuy : handleBuy} style={styles.fixedBtm}>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>BUY NOW</Text>
                    <Feather name="arrow-right" color={'#fff'} size={24} marginLeft={10} marginTop={3} />
                </TouchableOpacity>
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={addAddressModal}
                onRequestClose={() => { setAddAddressModal(false) }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.headerPart}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 7 }}>
                            <Text style={styles.topHeaderText}>Add Address</Text>
                        </View>
                        <TouchableOpacity onPress={() => setAddAddressModal(false)} style={{ alignSelf: 'flex-end' }}>
                            <Ionicons name="close" color={'#000'} size={32} marginRight={8} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={{ width: '100%', marginTop: 20 }}>
                        {/* <View style={{ width: '90%', alignSelf: 'center', marginBottom: 25 }}>
                            <Text style={styles.inputLable}>Full name (First and Last name)</Text>
                            <View style={styles.card}>
                                <TextInput
                                    style={styles.inputs}
                                    onChangeText={setName}
                                    value={name}
                                    placeholder="Enter Your Name"
                                    placeholderTextColor="#424242"
                                    underlineColorAndroid='transparent'
                                />
                            </View>
                            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                        </View>
                        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 25 }}>
                            <Text style={styles.inputLable}>Mobile number</Text>
                            <View style={styles.card}>
                                <TextInput
                                    style={styles.inputs}
                                    onChangeText={setPhoneNumber}
                                    value={phoneNumber}
                                    keyboardType='number-pad'
                                    placeholder="Enter Your Mobile Number"
                                    placeholderTextColor="#424242"
                                    underlineColorAndroid='transparent'
                                />
                            </View>
                            {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
                        </View> */}
                        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 25 }}>
                            <Text style={styles.inputLable}>State</Text>
                            <View style={styles.card}>
                                <TextInput
                                    style={styles.inputs}
                                    onChangeText={setState}
                                    value={state}
                                    placeholder="Enter Your State"
                                    placeholderTextColor="#424242"
                                    underlineColorAndroid='transparent'
                                />
                            </View>
                            {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
                        </View>
                        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 25 }}>
                            <Text style={styles.inputLable}>Town/City</Text>
                            <View style={styles.card}>
                                <TextInput
                                    style={styles.inputs}
                                    onChangeText={setCity}
                                    value={city}
                                    placeholder="Enter Your Town/City"
                                    placeholderTextColor="#424242"
                                    underlineColorAndroid='transparent'
                                />
                            </View>
                            {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
                        </View>
                        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 25 }}>
                            <Text style={styles.inputLable}>Pincode</Text>
                            <View style={styles.card}>
                                <TextInput
                                    style={styles.inputs}
                                    onChangeText={setPincode}
                                    value={pincode}
                                    maxLength={6}
                                    keyboardType='number-pad'
                                    placeholder="Enter Your Pincode"
                                    placeholderTextColor="#424242"
                                    underlineColorAndroid='transparent'
                                />
                            </View>
                            {errors.pincode && <Text style={styles.errorText}>{errors.pincode}</Text>}
                        </View>
                        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 25 }}>
                            <Text style={styles.inputLable}>Area, Street, Sector, Village</Text>
                            <View style={styles.card}>
                                <TextInput
                                    style={styles.inputs}
                                    onChangeText={setArea}
                                    value={area}
                                    placeholder="Enter Your Area, Street, Sector, Village"
                                    placeholderTextColor="#424242"
                                    underlineColorAndroid='transparent'
                                />
                            </View>
                            {errors.area && <Text style={styles.errorText}>{errors.area}</Text>}
                        </View>
                        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 25 }}>
                            <Text style={styles.inputLable}>Type of address</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', height: 40, marginTop: 5 }}>
                                <TouchableOpacity onPress={() => setActiveAddressType('Home')} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: activeAddressType === 'Home' ? '#c7d4f0' : '#fff', marginRight: 20, borderWidth: 0.8, borderColor: activeAddressType === 'Home' ? '#074feb' : '#000', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 }}>
                                    <Entypo name="home" color={activeAddressType === 'Home' ? '#074feb' : '#000'} size={20} />
                                    <Text style={{ color: activeAddressType === 'Home' ? '#074feb' : '#000', fontSize: 13, fontWeight: '500', marginLeft: 6 }}>Home</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setActiveAddressType('Work')} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: activeAddressType === 'Work' ? '#c7d4f0' : '#fff', marginRight: 20, borderWidth: 0.8, borderColor: activeAddressType === 'Work' ? '#074feb' : '#000', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 }}>
                                    <MaterialCommunityIcons name="office-building" color={activeAddressType === 'Work' ? '#074feb' : '#000'} size={20} />
                                    <Text style={{ color: activeAddressType === 'Work' ? '#074feb' : '#000', fontSize: 13, fontWeight: '500', marginLeft: 6 }}>Work</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setActiveAddressType('Other')} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: activeAddressType === 'Other' ? '#c7d4f0' : '#fff', borderWidth: 0.8, borderColor: activeAddressType === 'Other' ? '#074feb' : '#000', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 }}>
                                    <Feather name="globe" color={activeAddressType === 'Other' ? '#074feb' : '#000'} size={20} />
                                    <Text style={{ color: activeAddressType === 'Other' ? '#074feb' : '#000', fontSize: 13, fontWeight: '500', marginLeft: 6 }}>Other</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                    <TouchableOpacity onPress={saveAddress} style={styles.saveAddress}>
                        <Text style={{ color: '#000', fontSize: 17, fontWeight: '600' }}>Save Address</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            <Modal
                animationType="slide"
                transparent={true}
                visible={orderModalVisible}
                onRequestClose={closeOrderModal}
            >
                <View style={styles.pModalContainer}>
                    <View style={styles.pModalContent}>
                        <Animated.View style={[styles.pModalCheckCircle, { transform: [{ scale: scaleAnim }] }]}>
                            <FontAwesome name='check' color={'#fff'} size={60} />
                        </Animated.View>
                        <Text style={styles.pModalCongratulationsText}>Congratulations!</Text>
                        <Text style={styles.pModalDetailText}>Your order has been placed successfully.</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.replace('PackageHistory')} style={styles.pModalButton}>
                        <Text style={styles.pModalButtonText}>Order Details</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            {/* Start Show Error Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={errorModal}
                onRequestClose={closeErrorModal}
            >
                <View style={styles.errorModalOverlay}>
                    <View style={styles.errorModalContainer}>
                        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 10 }}>
                            <View style={{ alignItems: 'center' }}>
                                <MaterialIcons name="report-gmailerrorred" size={100} color="red" />
                                <Text style={{ color: '#000', fontSize: 20, fontWeight: 'bold', textAlign: 'center', letterSpacing: 0.3 }}>{errormasg}</Text>
                            </View>
                        </View>
                        <View style={{ width: '95%', alignSelf: 'center', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', marginTop: 10 }}>
                            <TouchableOpacity onPress={closeErrorModal} style={styles.confirmDeleteBtn}>
                                <Text style={styles.btnText}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            {/* End Show Error Modal */}

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
    panditDetails: {
        marginTop: 15,
        backgroundColor: '#fff',
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 22
    },
    profilePic: {
        height: 120,
        width: 120,
        borderRadius: 8,
        backgroundColor: '#6c757d'
    },
    address: {
        marginTop: 15,
        backgroundColor: '#fff',
        width: '100%',
        paddingHorizontal: 20,
        paddingVertical: 15
    },
    addressAddBtm: {
        backgroundColor: '#ffcb44',
        paddingHorizontal: 6,
        paddingVertical: 5,
        borderRadius: 6
    },
    errorText: {
        color: '#f00c27',
        marginTop: 10,
        fontWeight: '500'
    },
    fixedBtm: {
        backgroundColor: '#28a745',
        width: '90%',
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
    modalContainer: {
        backgroundColor: '#f5f5f5',
        flex: 1
    },
    card: {
        width: '100%',
        alignSelf: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 13,
        elevation: 5,
    },
    inputs: {
        height: 50,
        width: '90%',
        alignSelf: 'center',
        fontSize: 16,
        color: '#000'
    },
    inputLable: {
        color: '#000',
        fontSize: 17,
        fontWeight: '400',
        marginBottom: 5
    },
    saveAddress: {
        width: '90%',
        backgroundColor: '#ffcb44',
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
        height: 50,
        borderRadius: 10,
        marginBottom: 15
    },
    pModalContainer: {
        flex: 1,
        backgroundColor: '#141416',
        alignItems: 'center',
        justifyContent: 'space-evenly',
    },
    pModalContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    pModalCheckCircle: {
        marginBottom: 20,
        width: 120,
        height: 120,
        borderRadius: 100,
        backgroundColor: '#4CAF50',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pModalCongratulationsText: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#fff'
    },
    pModalDetailText: {
        fontSize: 16,
        color: '#b6b6b6',
        textAlign: 'center',
        paddingHorizontal: 30,
    },
    pModalButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 30,
        paddingVertical: 10,
        borderRadius: 8,
        top: 100
    },
    pModalButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    errorModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorModalContainer: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
        padding: 20,
    },
    btnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600'
    },
    confirmDeleteBtn: {
        backgroundColor: 'green',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 7
    },
})