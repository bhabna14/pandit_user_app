import { SafeAreaView, StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Alert, Modal, ScrollView, FlatList, RefreshControl, ActivityIndicator, Animated, Easing } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import { useNavigation, useIsFocused } from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { base_url } from '../../../App';

const Index = (props) => {

    const [allAddresses, setAllAddresses] = useState([]);
    const [displayedAddresses, setDisplayedAddresses] = useState([]);
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [spinner, setSpinner] = useState(false);
    const [eventDate, setEventDate] = useState(new Date())
    const maxDate = new Date();
    maxDate.setDate(eventDate.getDate() + 15);
    const [eventDateOpen, setEventDateOpen] = useState(false)
    const [addressError, setAddressError] = useState('');
    const [addressErrorMessageVisible, setAddressErrorMessageVisible] = useState(false);
    const [selectedOption, setSelectedOption] = useState('');
    const [showAllAddresses, setShowAllAddresses] = useState(false);
    const [suggestions, setSuggestions] = useState("");
    const [addAddressModal, setAddAddressModal] = useState(false);

    const [orderModalVisible, setOrderModalVisible] = useState(false);
    const closeOrderModal = () => { setOrderModalVisible(false) };
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const [bookingDetails, setBookingDetails] = useState(null);

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

    const bookPandit = async () => {
        // console.log("pandit_id", props.route.params.panditId,
        //     "pooja_id", props.route.params.pujaId,
        //     "pooja_fee", props.route.params.pujaFee,
        //     "advance_fee", props.route.params.addvanceFee,
        //     "booking_date", moment(eventDate).format('YYYY-MM-DD H:mm'),
        //     "address_id", selectedOption)
        //     return;
        const access_token = await AsyncStorage.getItem('storeAccesstoken');
        setIsLoading(true);
        try {
            if (selectedOption === "") {
                displayErrorMessage("Please Select Your Address");
                setIsLoading(false);
                return false;
            }
            const response = await fetch(base_url + 'api/booking/confirm', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access_token}`
                },
                body: JSON.stringify({
                    pandit_id: props.route.params.panditId,
                    pooja_id: props.route.params.pujaId,
                    pooja_fee: props.route.params.pujaFee,
                    advance_fee: props.route.params.addvanceFee,
                    booking_date: moment(eventDate).format('YYYY-MM-DD H:mm'),
                    address_id: selectedOption
                }),
            });

            const responseData = await response.json();
            // console.log("responseData", responseData.booking);
            if (response.ok) {
                console.log("Booking successfully");
                setBookingDetails(responseData.booking);
                setOrderModalVisible(true);
            } else {
                // console.error('Failed to confirm booking:', responseData.message);
                setErrorModal(true);
                setErrormasg(responseData.message);
            }

        } catch (error) {
            // console.log("Error For confirm booking:", error);
            setErrorModal(true);
            setErrormasg(error);
        } finally {
            setIsLoading(false);
        }
    }

    const displayErrorMessage = (message) => {
        setAddressError(message);
        setAddressErrorMessageVisible(true);

        setTimeout(() => {
            setAddressErrorMessageVisible(false);
            setAddressError('');
        }, 10000); // 10 seconds
    };

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
                if (responseData.addressData.length === 1 && responseData.addressData[0].default === 0) {
                    handleDefaultAddress(responseData.addressData[0].id);
                    // console.log("0 Index Address Id", responseData.addressData[0].id);
                }
            }
        } catch (error) {
            console.log(error);
            setSpinner(false);
        }
    }

    const getAllLocality = async () => {
        try {
            const response = await fetch(base_url + 'api/localities', {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            });
            const responseData = await response.json();
            if (responseData.success === 200) {
                const localityData = responseData.data.map((item) => ({
                    label: item.locality_name,
                    value: String(item.unique_code),  // Ensure value is a string for consistency
                    pincode: item.pincode, // Include pincode in the object
                }));
                console.log('Fetched Locality Data:', localityData); // Debug: Check the fetched data
                setLocalityList(localityData);
            }
        } catch (error) {
            console.log('Error fetching localities:', error);
        }
    };

    const handleLocalitySelect = (value) => {
        // console.log('Selected Value:', value); // Debug: Check selected value
        setLocalityValue(value);

        // Additional log to see if localityList has correct data
        // console.log('Current Locality List:', localityList);

        const selectedLocality = localityList.find(locality => String(locality.value) === String(value));
        if (selectedLocality) {
            console.log('Found Locality:', selectedLocality); // Check if locality is correctly found
            setPincode(selectedLocality.pincode); // Set pincode state
        } else {
            console.log('Locality not found in list.'); // Debug: No match found
        }
    };

    const [isFocus, setIsFocus] = useState(false);
    const [seletedAddress, setSeletedAddress] = useState(null);
    const options = [
        { label: 'Individual', value: 'individual' },
        { label: 'Apartment', value: 'apartment' },
        { label: 'Business', value: 'business' },
        { label: 'Temple', value: 'temple' },
    ];
    const [apartment, setApartment] = useState("");
    const [localityOpen, setLocalityOpen] = useState(false);
    const [localityValue, setLocalityValue] = useState(null);
    const [localityList, setLocalityList] = useState([]);
    const [landmark, setLandmark] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [pincode, setPincode] = useState("");
    const [activeAddressType, setActiveAddressType] = useState(null);
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
                    country: "India",
                    state: state,
                    city: city,
                    pincode: pincode,
                    address_type: activeAddressType,
                    locality: localityValue,
                    place_category: String(selectedOption),
                    apartment_flat_plot: apartment,
                    landmark: landmark
                }),
            });

            const responseData = await response.json();
            console.log("responseData", responseData);

            if (responseData.success === 200) {
                console.log("Address saved successfully");
                setAddAddressModal(false);
                getAllAddress();
                closeAddAddressModal();
            } else {
                console.error('Failed to save address:', responseData.message);
            }

        } catch (error) {
            console.log("Error saving address:", error);
        }
    };

    const closeAddAddressModal = () => {
        setSeletedAddress(null);
        setApartment("");
        setLocalityValue(null);
        setLandmark("");
        setState("");
        setCity("");
        setPincode("");
        setActiveAddressType(null);
        setAddAddressModal(false);
    }

    const validateFields = () => {
        let valid = true;
        let errors = {};

        if (selectedOption === null) {
            errors.residential = "Please select residential type";
            valid = false;
        }
        if (apartment === "") {
            errors.apartment = "Apartment/Plot/Flat Number is required";
            valid = false;
        }
        if (localityValue === null) {
            errors.locality = "Locality is required";
            valid = false;
        }
        if (landmark === "") {
            errors.landmark = "Landmark is required";
            valid = false;
        }
        if (city === "") {
            errors.city = "City is required";
            valid = false;
        }
        if (state === "") {
            errors.state = "State is required";
            valid = false;
        }
        if (pincode === "") {
            errors.pincode = "Pincode is required";
            valid = false;
        }
        if (pincode.length !== 6) {
            errors.pincode = "Pincode must be 6 digits";
            valid = false;
        }
        if (activeAddressType === null) {
            errors.activeAddressType = "Please select address type";
            valid = false;
        }

        setErrors(errors);
        return valid;
    };

    useEffect(() => {
        if (isFocused) {
            // console.log("get puja details by props", props.route.params);
            const poojadate = props.route.params.poojaDate;
            if (poojadate) {
                setEventDate(new Date(poojadate));
            }
            getAllAddress();
            getAllLocality();
        }
    }, [isFocused])

    // useEffect(() => {
    //     console.log("eventDate", moment(eventDate).format("MMMM Do YYYY, h:mm a"));
    // }, [eventDate])

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
                                <Image style={{ flex: 1, borderRadius: 8, resizeMode: 'cover' }} source={{ uri: props.route.params.panditImage }} />
                            </View>
                        </View>
                        <View style={{ width: '60%', paddingTop: 15, alignItems: 'flex-start' }}>
                            <Text style={{ color: '#000', fontSize: 18, fontWeight: '500', textTransform: 'capitalize' }}>{props.route.params.panditName}</Text>
                            <Text style={{ color: '#000', fontSize: 14, fontWeight: '400', textTransform: 'capitalize' }}>{props.route.params.pujaName}</Text>
                            <Text style={{ color: '#000', fontSize: 14, fontWeight: '400', textTransform: 'capitalize' }}>Total Fee: ₹{props.route.params.pujaFee}</Text>
                            <Text style={{ color: '#000', fontSize: 14, fontWeight: '400', textTransform: 'capitalize' }}>Advance Fee: ₹{props.route.params.addvanceFee}</Text>
                        </View>
                    </View>
                    <View style={styles.timeZoon}>
                        <Text style={{ color: '#000', fontSize: 16, fontWeight: '400', width: '93%', alignSelf: 'center', marginBottom: 10 }}>Select Your Pooja Time :</Text>
                        <TouchableOpacity onPress={() => setEventDateOpen(true)} style={{ width: '95%', height: 50, alignSelf: 'center', flexDirection: 'row', justifyContent: 'space-evenly', borderWidth: 0.8, borderColor: '#edeff1', borderRadius: 5, paddingLeft: 10 }}>
                            <TextInput
                                style={{ color: '#555454', width: '80%' }}
                                type="text"
                                value={eventDate ? moment(eventDate).format("MMMM Do YYYY, h:mm a") : ''}
                                editable={false}
                                placeholder="Select Your Pooja Time"
                                placeholderTextColor="#b7b7c2"
                                underlineColorAndroid="transparent"
                            />
                            <View style={{ width: '20%', alignItems: 'center', justifyContent: 'center' }}>
                                <MaterialIcons name="date-range" color={'#555454'} size={25} />
                            </View>
                        </TouchableOpacity>
                        <View>
                            {props?.route?.params?.poojaDate ?
                                <DatePicker
                                    modal
                                    mode="time"
                                    open={eventDateOpen}
                                    date={eventDate}
                                    onConfirm={(time) => {
                                        const updatedDate = new Date(
                                            eventDate.getFullYear(),
                                            eventDate.getMonth(),
                                            eventDate.getDate(),
                                            time.getHours(),
                                            time.getMinutes()
                                        );
                                        setEventDateOpen(false);
                                        setEventDate(updatedDate);
                                    }}
                                    onCancel={() => {
                                        setEventDateOpen(false);
                                    }}
                                />
                                :
                                <DatePicker
                                    modal
                                    mode="datetime"
                                    minimumDate={new Date()}
                                    // maximumDate={maxDate}
                                    open={eventDateOpen}
                                    date={eventDate}
                                    onConfirm={(data) => {
                                        setEventDateOpen(false)
                                        setEventDate(data)
                                    }}
                                    onCancel={() => {
                                        setEventDateOpen(false);
                                    }}
                                />
                            }
                        </View>
                    </View>
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
                                                <Text style={{ color: '#555454', fontSize: 13 }}>{address.item.apartment_flat_plot},  {address.item.landmark}</Text>
                                                <Text style={{ color: '#555454', fontSize: 13 }}>{address.item.locality_details.locality_name},  {address.item.city},  {address.item.state}</Text>
                                                <Text style={{ color: '#555454', fontSize: 13 }}>{address.item.pincode},  {address.item.place_category}</Text>
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
                <TouchableOpacity onPress={bookPandit} style={styles.fixedBtm}>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>BOOK NOW</Text>
                    <Feather name="arrow-right" color={'#fff'} size={24} marginLeft={10} marginTop={3} />
                </TouchableOpacity>
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={addAddressModal}
                onRequestClose={() => { closeAddAddressModal }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.headerPart}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 7 }}>
                            <Text style={styles.topHeaderText}>Add Address</Text>
                        </View>
                        <TouchableOpacity onPress={closeAddAddressModal} style={{ alignSelf: 'flex-end' }}>
                            <Ionicons name="close" color={'#000'} size={32} marginRight={8} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={{ width: '100%', marginTop: 20 }}>
                        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 20 }}>
                            <Text style={styles.inputLable}>Residential Type</Text>
                            {options.reduce((rows, option, index) => {
                                if (index % 2 === 0) rows.push([]);
                                rows[rows.length - 1].push(option);
                                return rows;
                            }, []).map((row, rowIndex) => (
                                <View key={rowIndex} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                                    {row.map((option) => (
                                        <TouchableOpacity
                                            key={option.value}
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                paddingVertical: 10,
                                                paddingHorizontal: 15,
                                                borderRadius: 20,
                                                backgroundColor: seletedAddress === option.value ? '#007AFF' : '#f0f0f0',
                                                borderWidth: seletedAddress === option.value ? 0 : 1,
                                                borderColor: '#ccc',
                                                flex: 1,
                                                marginHorizontal: 5,
                                            }}
                                            onPress={() => setSeletedAddress(option.value)}
                                        >
                                            <View
                                                style={{
                                                    height: 16,
                                                    width: 16,
                                                    borderRadius: 8,
                                                    borderWidth: 2,
                                                    borderColor: seletedAddress === option.value ? '#fff' : '#007AFF',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginRight: 8,
                                                }}
                                            >
                                                {seletedAddress === option.value && (
                                                    <View
                                                        style={{
                                                            height: 8,
                                                            width: 8,
                                                            borderRadius: 4,
                                                            backgroundColor: '#fff',
                                                        }}
                                                    />
                                                )}
                                            </View>
                                            <Text style={{ color: seletedAddress === option.value ? '#fff' : '#333', fontWeight: 'bold' }}>
                                                {option.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            ))}
                            {errors.residential && <Text style={styles.errorText}>{errors.residential}</Text>}
                        </View>
                        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 20 }}>
                            <Text style={styles.inputLable}>Apartment / Plot / Flat  Number</Text>
                            <View style={styles.card}>
                                <TextInput
                                    style={styles.inputs}
                                    onChangeText={setApartment}
                                    value={apartment}
                                    placeholder="Enter Your Apartment/Plot/Flat Number"
                                    placeholderTextColor="#424242"
                                    underlineColorAndroid='transparent'
                                />
                            </View>
                            {errors.apartment && <Text style={styles.errorText}>{errors.apartment}</Text>}
                        </View>
                        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 20, zIndex: localityOpen ? 10 : 1 }}>
                            <Text style={styles.inputLable}>Locality</Text>
                            <View style={styles.card}>
                                <DropDownPicker
                                    style={{ borderColor: 'transparent' }}
                                    placeholder={!isFocus ? 'Locality' : '...'}
                                    open={localityOpen}
                                    value={localityValue}
                                    items={localityList}
                                    setOpen={setLocalityOpen}
                                    setValue={(callback) => {
                                        const selectedValue = typeof callback === 'function' ? callback(localityValue) : callback;
                                        handleLocalitySelect(selectedValue);
                                    }}
                                    setItems={setLocalityList}
                                    itemSeparator={true}
                                    listMode="SCROLLVIEW"
                                    autoScroll={true}
                                />
                            </View>
                            {errors.locality && <Text style={styles.errorText}>{errors.locality}</Text>}
                        </View>
                        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 20 }}>
                            <Text style={styles.inputLable}>LandMark</Text>
                            <View style={styles.card}>
                                <TextInput
                                    style={styles.inputs}
                                    onChangeText={setLandmark}
                                    value={landmark}
                                    placeholder="Enter Your LandMark"
                                    placeholderTextColor="#424242"
                                    underlineColorAndroid='transparent'
                                />
                            </View>
                            {errors.landmark && <Text style={styles.errorText}>{errors.landmark}</Text>}
                        </View>
                        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 20 }}>
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
                        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 20 }}>
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
                        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 20 }}>
                            <Text style={styles.inputLable}>Pincode</Text>
                            <View style={[styles.card, { backgroundColor: '#ebe8e8' }]}>
                                <TextInput
                                    style={styles.inputs}
                                    onChangeText={setPincode}
                                    value={pincode} // This should reflect the updated pincode
                                    maxLength={6}
                                    editable={false} // Disable editing of pincode
                                    keyboardType="number-pad"
                                    placeholder="Enter Your Pincode"
                                    placeholderTextColor="#424242"
                                    underlineColorAndroid="transparent"
                                />
                            </View>
                            {errors.pincode && <Text style={styles.errorText}>{errors.pincode}</Text>}
                        </View>
                        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 20 }}>
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
                            {errors.activeAddressType && <Text style={styles.errorText}>{errors.activeAddressType}</Text>}
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
                    <ScrollView style={styles.pModalContent}>
                        <View style={{ alignItems: 'center', marginVertical: 20 }}>
                            <Animated.View style={[styles.pModalCheckCircle, { transform: [{ scale: scaleAnim }] }]}>
                                <FontAwesome name='check' color={'#fff'} size={60} />
                            </Animated.View>
                            <Text style={styles.pModalCongratulationsText}>Congratulations!</Text>
                            <Text style={styles.pModalDetailText}>Your Booking confirmed successfully!</Text>
                        </View>
                        <View style={styles.detailsBox}>
                            <View style={{ width: '100%', alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ color: '#332e2e', fontSize: 16, fontWeight: '400', width: '50%' }}>Booking ID</Text>
                                <Text style={styles.details}>{bookingDetails?.booking_id}</Text>
                            </View>
                            <View style={{ width: '100%', alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                                <Text style={{ color: '#332e2e', fontSize: 16, fontWeight: '400', width: '50%' }}>Booking Date</Text>
                                <Text style={styles.details}>{bookingDetails?.booking_date}</Text>
                            </View>
                            <View style={{ width: '100%', alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                                <Text style={{ color: '#332e2e', fontSize: 16, fontWeight: '400', width: '50%' }}>Paid Amount</Text>
                                <Text style={styles.details}>0</Text>
                            </View>
                            <View style={{ width: '100%', alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                                <Text style={{ color: '#332e2e', fontSize: 16, fontWeight: '400', width: '50%' }}>Total Amount</Text>
                                <Text style={styles.details}>{bookingDetails?.pooja_fee}</Text>
                            </View>
                            <View style={{ width: '100%', alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                                <Text style={{ color: '#332e2e', fontSize: 16, fontWeight: '400', width: '50%' }}>Status</Text>
                                <Text style={styles.details}>{bookingDetails?.status}</Text>
                            </View>
                        </View>
                        <View style={{ width: '93%', alignSelf: 'center', marginTop: 20 }}>
                            <Text style={{ color: '#000', fontSize: 18, fontWeight: '600' }}>Your Information</Text>
                        </View>
                        <View style={styles.detailsBox}>
                            <View style={{ width: '100%', alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ color: '#332e2e', fontSize: 16, fontWeight: '400', width: '50%' }}>First name</Text>
                                {bookingDetails?.user?.name ?
                                    <Text style={styles.details}>{bookingDetails?.user?.name}</Text>
                                    :
                                    <Text style={styles.details}>N/A</Text>
                                }
                            </View>
                            <View style={{ width: '100%', alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                                <Text style={{ color: '#332e2e', fontSize: 16, fontWeight: '400', width: '50%' }}>Email</Text>
                                {bookingDetails?.user?.email ?
                                    <Text style={styles.details}>{bookingDetails?.user?.email}</Text>
                                    :
                                    <Text style={styles.details}>N/A</Text>
                                }
                            </View>
                            <View style={{ width: '100%', alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                                <Text style={{ color: '#332e2e', fontSize: 16, fontWeight: '400', width: '50%' }}>Phone</Text>
                                <Text style={styles.details}>{bookingDetails?.user?.mobile_number}</Text>
                            </View>
                            <View style={{ width: '100%', alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                                <Text style={{ color: '#332e2e', fontSize: 16, fontWeight: '400', width: '50%' }}>Address</Text>
                                <Text style={styles.details}>{bookingDetails?.address?.area}, {bookingDetails?.address?.city}, {bookingDetails?.address?.state}, {bookingDetails?.address?.pincode}, {bookingDetails?.address?.country}</Text>
                            </View>
                        </View>
                        <View style={{ width: '93%', alignSelf: 'center', marginTop: 20 }}>
                            <Text style={{ color: '#000', fontSize: 18, fontWeight: '600' }}>Pooja Information</Text>
                        </View>
                        <View style={styles.detailsBox}>
                            <View style={{ width: '100%', alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ color: '#332e2e', fontSize: 16, fontWeight: '400', width: '50%' }}>Pooja Name</Text>
                                <Text style={styles.details}>{bookingDetails?.poojalist?.pooja_name}</Text>
                            </View>
                            <View style={{ width: '100%', alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                                <Text style={{ color: '#332e2e', fontSize: 16, fontWeight: '400', width: '50%' }}>Pandit Name</Text>
                                <Text style={styles.details}>{bookingDetails?.pandit?.name}</Text>
                            </View>
                            <View style={{ width: '100%', alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                                <Text style={{ color: '#332e2e', fontSize: 16, fontWeight: '400', width: '50%' }}>Total Fee</Text>
                                <Text style={styles.details}>{bookingDetails?.pooja_fee}</Text>
                            </View>
                            <View style={{ width: '100%', alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                                <Text style={{ color: '#332e2e', fontSize: 16, fontWeight: '400', width: '50%' }}>Advance Fee</Text>
                                <Text style={styles.details}>{bookingDetails?.advance_fee}</Text>
                            </View>
                        </View>
                    </ScrollView>
                    <View style={{}}>
                        <TouchableOpacity onPress={() => { props.navigation.replace('BookingPending'), closeOrderModal() }} style={styles.fixedBtm_delivered}>
                            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '500', marginRight: 20 }}>Done</Text>
                        </TouchableOpacity>
                    </View>
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
    topImgContainer: {
        width: '100%',
        height: 270,
        backgroundColor: 'red'
    },
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 100,
        bottom: 0,
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
    timeZoon: {
        marginTop: 15,
        backgroundColor: '#fff',
        width: '100%',
        padding: 10
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
    promoSection: {
        marginTop: 15,
        backgroundColor: '#fff',
        width: '100%',
        paddingHorizontal: 20,
        paddingVertical: 15
    },
    applyPromo: {
        width: '100%',
        height: 42,
        backgroundColor: '#ffcb44',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        borderTopRightRadius: 5,
        borderBottomRightRadius: 5,
    },
    errorText: {
        color: '#f00c27',
        marginTop: 10,
        fontWeight: '500'
    },
    totalCalculation: {
        marginTop: 15,
        backgroundColor: '#fff',
        width: '100%',
        paddingHorizontal: 20,
        paddingVertical: 15,
        marginBottom: 90
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
        backgroundColor: '#e8e7e6',
    },
    pModalContent: {
        flex: 1,
        marginBottom: 65
        // backgroundColor: '#e8e7e6',
    },
    pModalCheckCircle: {
        marginBottom: 20,
        width: 80,
        height: 80,
        borderRadius: 100,
        backgroundColor: '#4CAF50',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pModalCongratulationsText: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#000'
    },
    pModalDetailText: {
        fontSize: 16,
        color: '#000',
        textAlign: 'center',
        // paddingHorizontal: 20,
    },
    detailsBox: {
        width: '95%',
        backgroundColor: '#f0eded',
        alignSelf: 'center',
        marginVertical: 5,
        padding: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 5,
    },
    fixedBtm_delivered: {
        backgroundColor: '#28a745',
        width: '90%',
        alignSelf: 'center',
        borderRadius: 12,
        paddingVertical: 16,
        // paddingHorizontal: 15,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 5
    },
    details: {
        color: '#626363',
        fontSize: 16,
        fontWeight: '400',
        width: '50%',
        // textTransform: 'capitalize'
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