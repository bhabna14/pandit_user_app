import { SafeAreaView, StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Alert, Modal, ScrollView, FlatList, Linking, ActivityIndicator, Animated, Easing } from 'react-native'
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
import DropDownPicker from 'react-native-dropdown-picker';
import { Calendar } from 'react-native-calendars';
import DatePicker from 'react-native-date-picker';

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
    const [addAddressModal, setAddAddressModal] = useState(false);
    const [profileDetails, setProfileDetails] = useState({});

    const [dob, setDob] = useState(props.route.params.category === "Immediateproduct" ? new Date() : new Date(new Date().setDate(new Date().getDate() + 1)));
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const openDatePicker = () => { setDatePickerVisibility(true) };
    const closeDatePicker = () => { setDatePickerVisibility(false) };

    const [deliveryTime, setDeliveryTime] = useState(new Date(new Date().getTime() + 2 * 60 * 60 * 1000));
    const [openTimePicker, setOpenTimePicker] = useState(false);

    useEffect(() => {
        setDeliveryTime(dob.toDateString() === new Date().toDateString() ? new Date(new Date().getTime() + 2 * 60 * 60 * 1000) : new Date());
    }, [dob]);

    const [orderModalVisible, setOrderModalVisible] = useState(false);
    const closeOrderModal = () => { setOrderModalVisible(false) };
    const [flowerRequestModalVisible, setFlowerRequestModalVisible] = useState(false);
    const closeFlowerRequestModal = () => { setFlowerRequestModalVisible(false) };
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const [flowerDetails, setFlowerDetails] = useState([
        {
            flowerName: null,
            flowerQuantity: '',
            flowerUnit: null,
            flowerNameOpen: false,
            flowerUnitOpen: false,
        },
    ]);

    const handleAddMore = () => {
        setFlowerDetails([...flowerDetails, {
            flowerName: null,
            flowerQuantity: '',
            flowerUnit: null,
            flowerNameOpen: false,
            flowerUnitOpen: false,
        }]);
    };

    const handleRemove = (index) => {
        if (index > 0) {
            const newFlowerDetails = [...flowerDetails];
            newFlowerDetails.splice(index, 1);
            setFlowerDetails(newFlowerDetails);
        }
    };

    const [flowerNames, setFlowerNames] = useState([]);
    const [flowerUnits, setFlowerUnits] = useState([]);

    const getUnitList = async () => {
        const access_token = await AsyncStorage.getItem('storeAccesstoken');
        try {
            const response = await fetch(base_url + 'api/manageunit', {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access_token}`
                },
            });
            const responseData = await response.json();
            if (response.ok) {
                // console.log("Units fetched successfully", responseData);
                const units = responseData.data.map(unit => ({
                    label: unit.unit_name,
                    value: unit.unit_name
                }));
                setFlowerUnits(units);
            } else {
                console.error('Failed to fetch units:', responseData.message);
            }
        } catch (error) {
            console.error('Error fetching units:', error);
        }
    };

    const getFlowerList = async () => {
        await fetch(base_url + 'api/products', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        }).then(response => response.json()).then(response => {
            if (response.status === 200) {
                // console.log("Flower List", response.data);
                const flowers = response.data.filter(product => product.category === "Flower");
                const flowerNames = flowers.map(flower => ({
                    label: flower.name,
                    value: flower.name
                }));
                setFlowerNames(flowerNames);
            } else {
                console.error('Failed to fetch packages:', response.message);
            }
        }).catch((error) => {
            console.error('Error:', error);
        });
    };

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
                    // payment_id: "pay_29QQoUBi66xm2f",
                    paid_amount: props.route.params.price,
                    duration: props.route.params.duration,
                    suggestion: suggestions,
                    start_date: moment(dob).format('YYYY-MM-DD')
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
            if (flowerDetails.some(detail => !detail.flowerName || !detail.flowerQuantity || !detail.flowerUnit)) {
                displayErrorMessage("Please fill in all flower details");
                setIsLoading(false);
                return;
            }
            if (selectedOption === "") {
                displayErrorMessage("Please Select Your Address");
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
                    suggestion: suggestions,
                    date: moment(dob).format('YYYY-MM-DD'),
                    time: moment(deliveryTime).format('hh:mm A'),
                    flower_name: flowerDetails.map(detail => detail.flowerName),
                    flower_unit: flowerDetails.map(detail => detail.flowerUnit),
                    flower_quantity: flowerDetails.map(detail => detail.flowerQuantity)
                }),
            });

            const responseData = await response.json();
            if (response.ok) {
                console.log("Booking successfully", responseData);
                setFlowerRequestModalVisible(true);
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
                    apartment: item.apartment || [], // Include apartment list in the object
                }));
                // console.log('Fetched Locality Data:', localityData); // Debug: Check the fetched data
                setLocalityList(localityData);
            }
        } catch (error) {
            console.log('Error fetching localities:', error);
        }
    };

    const handleLocalitySelect = (value) => {
        setLocalityValue(value); // Update selected locality value

        // Find the selected locality from localityList
        const selectedLocality = localityList.find(locality => String(locality.value) === String(value));
        if (selectedLocality) {
            // Update pincode and apartment list
            setPincode(selectedLocality.pincode);

            // Map apartment list to dropdown-compatible format
            const apartments = selectedLocality.apartment.map(apartment => ({
                label: apartment.apartment_name,
                value: apartment.apartment_name,
            }));
            setApartmentList(apartments);

            // Reset apartment selection if locality changes
            setApartmentValue(null);
        } else {
            console.log('Locality not found in list.');
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
    const [plotFlatNumber, setPlotFlatNumber] = useState("");
    const [localityOpen, setLocalityOpen] = useState(false);
    const [localityValue, setLocalityValue] = useState(null);
    const [localityList, setLocalityList] = useState([]);
    const [apartmentOpen, setApartmentOpen] = useState(false);
    const [apartmentValue, setApartmentValue] = useState(null);
    const [apartmentList, setApartmentList] = useState([]);
    const [newApartment, setNewApartment] = useState('');
    const [landmark, setLandmark] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [pincode, setPincode] = useState("");
    const [activeAddressType, setActiveAddressType] = useState(null);
    const [errors, setErrors] = useState({});

    const saveAddress = async () => {
        if (!validateFields()) return;
        const apartment = apartmentValue && apartmentValue !== 'add_new' ? apartmentValue : newApartment;
        const access_token = await AsyncStorage.getItem('storeAccesstoken');
        // let addressData = JSON.stringify({
        //     country: "India",
        //     state: state,
        //     city: city,
        //     pincode: pincode,
        //     address_type: activeAddressType,
        //     locality: localityValue,
        //     apartment_name: apartmentValue,
        //     place_category: String(seletedAddress),
        //     apartment_flat_plot: apartment,
        //     landmark: landmark
        // });
        // console.log("addressData", addressData);
        // return;
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
                    apartment_name: apartment,
                    place_category: String(seletedAddress),
                    apartment_flat_plot: plotFlatNumber,
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
        setSelectedOption(null);
        setPlotFlatNumber("");
        setLocalityValue(null);
        setApartmentValue(null);
        setNewApartment("");
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

        if (seletedAddress === null) {
            errors.residential = "Please select residential type";
            valid = false;
        }
        if (plotFlatNumber === "") {
            errors.plotFlatNumber = "Plot/Flat Number is required";
            valid = false;
        }
        if (localityValue === null) {
            errors.locality = "Locality is required";
            valid = false;
        }
        if (apartmentValue === null && newApartment === "") {
            errors.apartment = "Apartment is required";
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

    const handleDayPress = (day) => {
        setDob(new Date(day.dateString));
        closeDatePicker();
    };

    useEffect(() => {
        if (isFocused) {
            // console.log("get Package details by props", props.route.params);
            getAllAddress();
            getAllLocality();
            getProfile();
            getUnitList();
            getFlowerList();
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
                        <View style={{ marginTop: 15, backgroundColor: '#fff', width: '100%', paddingHorizontal: 15, zIndex: 2000 }}>
                            {flowerDetails.map((flowerDetail, index) => (
                                <View key={index} style={{ width: '100%', padding: 10, marginVertical: 10, borderColor: '#7e7f80', borderWidth: 0.7, borderRadius: 7 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <View style={{ width: '30%', marginBottom: 15, zIndex: 2000, elevation: 2000 }}>
                                            <Text style={styles.label}>Flower</Text>
                                            <View style={{ zIndex: 2000, elevation: 2000 }}>
                                                <DropDownPicker
                                                    open={flowerDetail.flowerNameOpen}
                                                    value={flowerDetail.flowerName}
                                                    items={flowerNames}
                                                    setOpen={(open) => {
                                                        setFlowerDetails(prevDetails => {
                                                            const newDetails = [...prevDetails];
                                                            newDetails[index].flowerNameOpen = open;
                                                            return newDetails;
                                                        });
                                                    }}
                                                    setValue={(callback) => {
                                                        setFlowerDetails(prevDetails => {
                                                            const newDetails = [...prevDetails];
                                                            newDetails[index].flowerName = callback(newDetails[index].flowerName);
                                                            return newDetails;
                                                        });
                                                    }}
                                                    placeholder="Flower"
                                                    listMode="MODAL"
                                                    style={{ borderColor: '#edeff1', borderRadius: 5, marginTop: 5 }}
                                                    dropDownContainerStyle={{ borderColor: '#edeff1' }}
                                                    zIndex={2000}
                                                    zIndexInverse={1000}
                                                />
                                            </View>
                                        </View>
                                        <View style={{ width: '25%', marginBottom: 15, zIndex: 1500, elevation: 1500 }}>
                                            <Text style={styles.label}>Quantity</Text>
                                            <TextInput
                                                style={{ borderColor: '#edeff1', borderRadius: 5, borderWidth: 1, padding: 10, fontSize: 15, color: '#000', marginTop: 3 }}
                                                onChangeText={(text) => {
                                                    setFlowerDetails(prevDetails => {
                                                        const newDetails = [...prevDetails];
                                                        newDetails[index].flowerQuantity = text;
                                                        return newDetails;
                                                    });
                                                }}
                                                value={flowerDetail.flowerQuantity}
                                                keyboardType="numeric"
                                                placeholder="Quantity"
                                                placeholderTextColor="#888888"
                                                underlineColorAndroid='transparent'
                                            />
                                        </View>
                                        <View style={{ width: '40%', zIndex: 1000, elevation: 1000 }}>
                                            <Text style={styles.label}>Select Unit</Text>
                                            <View style={{ zIndex: 1000, elevation: 1000 }}>
                                                <DropDownPicker
                                                    open={flowerDetail.flowerUnitOpen}
                                                    value={flowerDetail.flowerUnit}
                                                    items={flowerUnits}
                                                    setOpen={(open) => {
                                                        setFlowerDetails(prevDetails => {
                                                            const newDetails = [...prevDetails];
                                                            newDetails[index].flowerUnitOpen = open;
                                                            return newDetails;
                                                        });
                                                    }}
                                                    setValue={(callback) => {
                                                        setFlowerDetails(prevDetails => {
                                                            const newDetails = [...prevDetails];
                                                            newDetails[index].flowerUnit = callback(newDetails[index].flowerUnit);
                                                            return newDetails;
                                                        });
                                                    }}
                                                    placeholder="Unit"
                                                    // listMode="MODAL"
                                                    style={{ borderColor: '#edeff1', borderRadius: 5, marginTop: 5 }}
                                                    dropDownContainerStyle={{ borderColor: '#edeff1' }}
                                                    zIndex={1000}
                                                    zIndexInverse={2000}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', width: '100%' }}>
                                        {index === flowerDetails.length - 1 && (
                                            <TouchableOpacity onPress={handleAddMore} style={{ backgroundColor: '#28a745', borderRadius: 5, alignItems: 'center', width: 100, height: 46, alignItems: 'center', justifyContent: 'center' }}>
                                                <Text style={{ color: '#fff', fontSize: 16 }}>Add More</Text>
                                            </TouchableOpacity>
                                        )}
                                        {index > 0 && (
                                            <TouchableOpacity onPress={() => handleRemove(index)} style={{ backgroundColor: '#dc3545', borderRadius: 5, alignItems: 'center', width: 100, height: 46, alignItems: 'center', justifyContent: 'center', marginLeft: 8 }}>
                                                <Text style={{ color: '#fff', fontSize: 16 }}>Remove</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            ))}
                        </View>
                    }
                    <View style={styles.address}>
                        <View style={{ width: '100%', marginBottom: 5 }}>
                            {props.route.params.category === "Immediateproduct" ?
                                <Text style={styles.label}>Delivery Flower Date</Text>
                                :
                                <Text style={styles.label}>Subscription Start Date</Text>
                            }
                            <TouchableOpacity onPress={openDatePicker}>
                                <TextInput
                                    style={styles.input}
                                    value={dob ? moment(dob).format('DD-MM-YYYY') : ""}
                                    editable={false}
                                />
                                <MaterialCommunityIcons name="calendar-month" color={'#555454'} size={26} style={{ position: 'absolute', right: 10, top: 10 }} />
                            </TouchableOpacity>
                        </View>
                        {props.route.params.category === "Immediateproduct" &&
                            <View style={{ width: '100%', marginBottom: 15 }}>
                                <Text style={styles.label}>Delivery Flower Time</Text>
                                <TouchableOpacity onPress={() => setOpenTimePicker(true)}>
                                    <TextInput
                                        style={styles.input}
                                        value={deliveryTime ? moment(deliveryTime).format('hh:mm A') : ""}
                                        editable={false}
                                    />
                                    <MaterialCommunityIcons name="av-timer" color={'#555454'} size={26} style={{ position: 'absolute', right: 10, top: 10 }} />
                                </TouchableOpacity>
                                <DatePicker
                                    modal
                                    mode="time"
                                    open={openTimePicker}
                                    date={deliveryTime}
                                    onConfirm={(date) => {
                                        setDeliveryTime(date);
                                        setOpenTimePicker(false);
                                    }}
                                    onCancel={() => setOpenTimePicker(false)}
                                    minimumDate={dob.toDateString() === new Date().toDateString() ? new Date(new Date().getTime() + 2 * 60 * 60 * 1000) : undefined}
                                />
                            </View>
                        }
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
                                                <Text style={{ color: '#555454', fontSize: 13 }}>{address.item.apartment_name},  {address.item.apartment_flat_plot},  {address.item.landmark}</Text>
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
                                        <Text style={{ color: '#000', fontSize: 15, fontWeight: '600', marginBottom: 3, marginRight: 3 }}>Show All Addresses</Text>
                                        <FontAwesome name="angle-double-down" color={'#000'} size={17} />
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity onPress={toggleAddresses} style={{ backgroundColor: 'transparent', flexDirection: 'row', alignSelf: 'center', alignItems: 'center', marginTop: 5 }}>
                                        <Text style={{ color: '#000', fontSize: 15, fontWeight: '600', marginBottom: 2, marginRight: 3 }}>Hide</Text>
                                        <FontAwesome name="angle-double-up" color={'#000'} size={17} />
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
                visible={isDatePickerVisible}
                onRequestClose={closeDatePicker}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <View style={{ width: '90%', padding: 20, backgroundColor: 'white', borderRadius: 10, elevation: 5 }}>
                        <Calendar
                            onDayPress={handleDayPress}
                            markedDates={{
                                [moment(dob).format('YYYY-MM-DD')]: {
                                    selected: true,
                                    marked: true,
                                    selectedColor: 'blue'
                                }
                            }}
                            minDate={props.route.params.category === "Immediateproduct" ? new Date() : moment().add(1, 'days').format('YYYY-MM-DD')}
                        />
                    </View>
                </View>
            </Modal>

            {/* Add Address Modal */}
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
                                    listMode="MODAL"
                                    searchable={true}
                                    searchPlaceholder="Locality..."
                                // autoScroll={true}
                                />
                            </View>
                            {errors.locality && <Text style={styles.errorText}>{errors.locality}</Text>}
                        </View>
                        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 20, zIndex: localityOpen ? 10 : 1 }}>
                            <Text style={styles.inputLable}>Apartment</Text>
                            {apartmentList.length > 0 ?
                                <View style={styles.card}>
                                    <DropDownPicker
                                        style={{ borderColor: 'transparent' }}
                                        placeholder={!isFocus ? 'Apartment' : '...'}
                                        open={apartmentOpen}
                                        value={apartmentValue}
                                        items={[
                                            ...apartmentList,
                                            { label: 'Add Your Apartment', value: 'add_new' }, // Special "Other" option
                                        ]}
                                        setOpen={setApartmentOpen}
                                        setValue={(callback) => {
                                            const selectedValue = typeof callback === 'function' ? callback(apartmentValue) : callback;
                                            setApartmentValue(selectedValue);
                                        }}
                                        setItems={setApartmentList}
                                        itemSeparator={true}
                                        listMode="MODAL"
                                        searchable={true}
                                        searchPlaceholder="Apartment..."
                                    // autoScroll={true}
                                    />
                                </View>
                                :
                                <View style={styles.card}>
                                    <TextInput
                                        style={styles.inputs}
                                        onChangeText={setNewApartment}
                                        value={newApartment}
                                        placeholder="Enter Your Apartment Name"
                                        placeholderTextColor="#424242"
                                        underlineColorAndroid="transparent"
                                    />
                                </View>
                            }
                            {errors.apartment && <Text style={styles.errorText}>{errors.apartment}</Text>}
                            {apartmentValue === 'add_new' && (
                                <View style={[styles.card, { marginTop: 15 }]}>
                                    <TextInput
                                        style={styles.inputs}
                                        onChangeText={setNewApartment}
                                        value={newApartment}
                                        placeholder="Enter Your Apartment Name"
                                        placeholderTextColor="#424242"
                                        underlineColorAndroid="transparent"
                                    />
                                </View>
                            )}
                            {errors.apartment && <Text style={styles.errorText}>{errors.apartment}</Text>}
                        </View>
                        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 20 }}>
                            <Text style={styles.inputLable}>Plot / Flat  Number</Text>
                            <View style={styles.card}>
                                <TextInput
                                    style={styles.inputs}
                                    onChangeText={setPlotFlatNumber}
                                    value={plotFlatNumber}
                                    placeholder="Enter Your Plot/Flat Number"
                                    placeholderTextColor="#424242"
                                    underlineColorAndroid='transparent'
                                />
                            </View>
                            {errors.plotFlatNumber && <Text style={styles.errorText}>{errors.plotFlatNumber}</Text>}
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
                    <View style={styles.pModalContent}>
                        <Animated.View style={[styles.pModalCheckCircle, { transform: [{ scale: scaleAnim }] }]}>
                            <FontAwesome name='check' color={'#fff'} size={60} />
                        </Animated.View>
                        <Text style={styles.pModalCongratulationsText}>Congratulations!</Text>
                        <Text style={styles.pModalDetailText}>Your order has been placed successfully.</Text>
                        <Text style={[styles.pModalCallText, { marginTop: 10 }]}>For any inquiry call us at this number</Text>
                        <TouchableOpacity onPress={() => Linking.openURL('tel:9776888887')}>
                            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '500', textAlign: 'center', marginTop: 5 }}>9776888887</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => navigation.replace('PackageHistory')} style={styles.pModalButton}>
                        <Text style={styles.pModalButtonText}>Order Details</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            <Modal
                animationType="slide"
                transparent={true}
                visible={flowerRequestModalVisible}
                onRequestClose={closeFlowerRequestModal}
            >
                <View style={styles.pModalContainer}>
                    <View style={styles.pModalContent}>
                        <Animated.View style={[styles.pModalCheckCircle, { transform: [{ scale: scaleAnim }] }]}>
                            <FontAwesome name='check' color={'#fff'} size={60} />
                        </Animated.View>
                        <Text style={styles.pModalCongratulationsText}>Congratulations!</Text>
                        <Text style={styles.pModalDetailText}>Your order has been placed successfully.</Text>
                        <Text style={[styles.pModalCallText, { marginTop: 10 }]}>For any inquiry call us at this number</Text>
                        <TouchableOpacity onPress={() => Linking.openURL('tel:9776888887')}>
                            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '500', textAlign: 'center', marginTop: 5 }}>9776888887</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => navigation.replace('Flower_req_history')} style={styles.pModalButton}>
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
        paddingHorizontal: 15
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
        paddingVertical: 15,
        zIndex: 1000
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
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: '#757473',
        marginBottom: 10,
        color: '#333',
    },
})