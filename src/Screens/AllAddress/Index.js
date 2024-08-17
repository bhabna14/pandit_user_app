import { SafeAreaView, StyleSheet, Text, View, TextInput, TouchableOpacity, Dimensions, Image, Modal, Alert, ScrollView, FlatList, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useIsFocused } from '@react-navigation/native'
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { base_url } from '../../../App';

const Index = (props) => {

    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [spinner, setSpinner] = useState(false);
    const [allAddresses, setAllAddresses] = useState([]);
    const [addAddressModal, setAddAddressModal] = useState(false);
    const [editAddressModal, setEditAddressModal] = useState(false);

    const [addressId, setAddressId] = useState(null);
    // const [name, setName] = useState("");
    // const [phoneNumber, setPhoneNumber] = useState("");
    const [state, setState] = useState("");
    const [city, setCity] = useState("");
    const [pincode, setPincode] = useState("");
    const [area, setArea] = useState("");
    const [activeAddressType, setActiveAddressType] = useState('Home');
    const [errors, setErrors] = useState({});

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
                    console.log("0 Index Address Id", responseData.addressData[0].id);
                }
            }
        } catch (error) {
            console.log(error);
            setSpinner(false);
        }
    }

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
                // setName("");
                // setPhoneNumber("");
                setState("");
                setCity("");
                setPincode("");
                setArea("");
                setActiveAddressType('Home');
            } else {
                console.error('Failed to save address:', responseData.message);
            }

        } catch (error) {
            console.log("Error saving address:", error);
        }
    };

    const closeAddAddressModal = () => {
        // setName("");
        // setPhoneNumber("");
        setState("");
        setCity("");
        setPincode("");
        setArea("");
        setActiveAddressType('Home');
        setAddAddressModal(false);
    }

    const closeEditAddressModal = () => {
        // setName("");
        // setPhoneNumber("");
        setState("");
        setCity("");
        setPincode("");
        setArea("");
        setActiveAddressType('Home');
        setEditAddressModal(false);
    }

    const getAddressById = (address) => {
        console.log("address-=-=-=-=", address);
        setAddressId(address.id);
        // setName(address.fullname);
        // setPhoneNumber(address.number);
        setState(address.state);
        setCity(address.city);
        setPincode(address.pincode);
        setArea(address.area);
        setActiveAddressType(address.address_type);
        setEditAddressModal(true);
    }

    const editAddress = async () => {
        if (!validateFields()) return;
        const access_token = await AsyncStorage.getItem('storeAccesstoken');
        try {
            const response = await fetch(base_url + 'api/update-address', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access_token}`
                },
                body: JSON.stringify({
                    id: addressId,
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
                console.log("Address Updated successfully");
                setEditAddressModal(false);
                getAllAddress();
                // setName("");
                // setPhoneNumber("");
                setState("");
                setCity("");
                setPincode("");
                setArea("");
                setActiveAddressType('Home');
            } else {
                console.error('Failed to Edit Address:', responseData.message);
            }

        } catch (error) {
            console.log("Error when Edit Address:", error);
        }
    }

    const [openDeleteAreaModal, setOpenDeleteAreaModal] = useState(false);
    const closeDeleteAreaModal = () => { setOpenDeleteAreaModal(false); setDeleteAreaId(null); };
    const [deleteAreaId, setDeleteAreaId] = useState(null);

    const confirmDelete = (addressId) => {
        console.log("addressId", addressId);
        setDeleteAreaId(addressId);
        setOpenDeleteAreaModal(true);
    }

    const deleteAddress = async () => {
        try {
            const access_token = await AsyncStorage.getItem('storeAccesstoken');
            const response = await fetch(`${base_url}api/user/address/${deleteAreaId}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access_token}`
                }
            });
            const responseData = await response.json();
            console.log("Delete Address Response: ", responseData);
            if (response.ok) {
                closeDeleteAreaModal();
                console.log("Address deleted successfully");
                getAllAddress();
                // Refresh the address list or update the state as needed
            } else {
                console.log("Failed to delete address: ", responseData.message);
            }
        } catch (error) {
            console.error("Error deleting address: ", error);
        }
    };

    const handleDefaultAddress = async (addressId) => {
        // console.log("addressId", addressId);
        const access_token = await AsyncStorage.getItem('storeAccesstoken');
        try {
            const response = await fetch(`${base_url}api/addresses/${addressId}/set-default`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access_token}`
                },
            });

            const responseData = await response.json();
            console.log("responseData", responseData);

            if (response.ok) {
                console.log("Default Address save successfully");
                getAllAddress();
            } else {
                console.error('Failed to save Default Address:', responseData.message);
            }

        } catch (error) {
            console.log("Error when save Default Address:", error);
        }
    }

    useEffect(() => {
        if (isFocused) {
            getAllAddress();
        }
    }, [isFocused])

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerPart}>
                <TouchableOpacity onPress={() => props.navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Feather name="chevron-left" color={'#555454'} size={30} />
                    <Text style={{ color: '#000', fontSize: 16, fontWeight: '500', marginBottom: 3, marginLeft: 5 }}>My Addresses</Text>
                </TouchableOpacity>
            </View>
            {spinner === true ?
                <View style={{ flex: 1, alignSelf: 'center', justifyContent: 'center' }}>
                    {/* <Image style={{ width: 50, height: 50 }} source={require('../../assets/img/loading.gif')} /> */}
                    <Text style={{ color: '#ffcb44', fontSize: 17 }}>Loading...</Text>
                </View>
                :
                <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, marginBottom: 10 }}>
                    <View style={styles.currentLocation}>
                        <TouchableOpacity onPress={() => setAddAddressModal(true)} style={{ width: '95%', alignSelf: 'center', flexDirection: 'row', alignItems: 'center', paddingVertical: 3 }}>
                            <View style={{ width: '70%', flexDirection: 'row', alignItems: 'center' }}>
                                <FontAwesome6 name="plus" color={'#ffcb44'} size={22} />
                                <Text style={{ color: '#ffcb44', fontSize: 16, fontWeight: '500', marginLeft: 10 }}> Add a new address</Text>
                            </View>
                            {/* <View style={{ width: '30%', alignItems: 'flex-end' }}>
                                <Feather name="chevron-right" color={'#88888a'} size={27} />
                            </View> */}
                        </TouchableOpacity>
                    </View>
                    <View style={{ width: '95%', alignSelf: 'center', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', marginTop: 20 }}>
                        <View style={{ backgroundColor: '#7a7979', height: 0.4, width: 80, alignSelf: 'center', marginVertical: 10 }}></View>
                        <Text style={{ color: '#7a7979', fontSize: 14, fontWeight: '500', letterSpacing: 2 }}>SAVED ADDRESS</Text>
                        <View style={{ backgroundColor: '#7a7979', height: 0.4, width: 80, alignSelf: 'center', marginVertical: 10 }}></View>
                    </View>
                    {allAddresses.length > 0 ?
                        <View style={{ flex: 1 }}>
                            <FlatList
                                showsHorizontalScrollIndicator={false}
                                data={allAddresses.reverse()}
                                scrollEnabled={false}
                                keyExtractor={(key) => {
                                    return key.id
                                }}
                                renderItem={(address) => {
                                    return (
                                        <View style={styles.addressBox}>
                                            <View style={{ width: '15%', alignItems: 'center', justifyContent: 'center' }}>
                                                {address.item.address_type === "Home" && <AntDesign name="home" color={'#555454'} size={22} />}
                                                {address.item.address_type === "Work" && <MaterialIcons name="work-outline" color={'#555454'} size={22} />}
                                                {address.item.address_type === "Other" && <Fontisto name="world-o" color={'#555454'} size={22} />}

                                                {address.item.address_type === "Home" && <Text style={{ fontSize: 13, fontWeight: '400', color: '#616161' }}>Home</Text>}
                                                {address.item.address_type === "Work" && <Text style={{ fontSize: 13, fontWeight: '400', color: '#616161' }}>Work</Text>}
                                                {address.item.address_type === "Other" && <Text style={{ fontSize: 13, fontWeight: '400', color: '#616161' }}>Other</Text>}
                                            </View>
                                            <View style={{ width: '3%' }}></View>
                                            <View style={{ width: '72%', alignItems: 'flex-start', justifyContent: 'center' }}>
                                                <Text style={{ fontSize: 14, fontWeight: '500', color: '#545353', letterSpacing: 0.6 }}>{address.item.area},  {address.item.city}</Text>
                                                <Text style={{ fontSize: 14, fontWeight: '500', color: '#545353', letterSpacing: 0.6 }}>{address.item.state},  {address.item.pincode}</Text>
                                                {address.item.default === 1 ?
                                                    <View style={{ marginTop: 4, flexDirection: 'row', alignItems: 'center' }}>
                                                        <FontAwesome name='check-circle' color='#5286f7' size={18} />
                                                        <Text style={{ fontSize: 15, fontWeight: '500', color: '#5286f7', letterSpacing: 0.6, marginLeft: 5 }}>Default Address</Text>
                                                    </View>
                                                    :
                                                    <TouchableOpacity onPress={() => handleDefaultAddress(address.item.id)} style={{ marginTop: 4 }}>
                                                        <Text style={{ fontSize: 15, fontWeight: '500', color: '#5286f7', letterSpacing: 0.6 }}>Set as default</Text>
                                                    </TouchableOpacity>
                                                }
                                            </View>
                                            <View style={{ width: '10%', alignItems: 'flex-end', paddingRight: 5, flexDirection: 'column', justifyContent: 'space-evenly' }}>
                                                <TouchableOpacity onPress={() => getAddressById(address.item)} style={{ backgroundColor: '#fff' }}>
                                                    <MaterialCommunityIcons name="circle-edit-outline" color={'#ffcb44'} size={25} />
                                                </TouchableOpacity>
                                                {address.item.default === 0 &&
                                                    <TouchableOpacity onPress={() => confirmDelete(address.item.id)} style={{ backgroundColor: '#fff' }}>
                                                        <MaterialCommunityIcons name="delete-circle-outline" color={'#ffcb44'} size={26} />
                                                    </TouchableOpacity>
                                                }
                                            </View>
                                        </View>
                                    )
                                }}
                            />
                        </View>
                        :
                        <View style={{ flex: 1, alignItems: 'center', paddingTop: 200 }}>
                            <Text style={{ color: '#000', fontSize: 20, fontWeight: 'bold' }}>No Address Saved</Text>
                        </View>
                    }
                </ScrollView>
            }

            {/* Add Address */}
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

            {/* Edit Address */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={editAddressModal}
                onRequestClose={() => { setEditAddressModal(false) }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.headerPart}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 7 }}>
                            <Text style={styles.topHeaderText}>Add Address</Text>
                        </View>
                        <TouchableOpacity onPress={closeEditAddressModal} style={{ alignSelf: 'flex-end' }}>
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
                    <TouchableOpacity onPress={editAddress} style={styles.saveAddress}>
                        <Text style={{ color: '#000', fontSize: 17, fontWeight: '600' }}>Edit Address</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            {/* Start Delete Area Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={openDeleteAreaModal}
                onRequestClose={closeDeleteAreaModal}
            >
                <View style={styles.deleteModalOverlay}>
                    <View style={styles.deleteModalContainer}>
                        <View style={{ width: '90%', alignSelf: 'center', marginBottom: 10 }}>
                            <View style={{ alignItems: 'center' }}>
                                <MaterialIcons name="report-gmailerrorred" size={100} color="red" />
                                <Text style={{ color: '#000', fontSize: 23, fontWeight: 'bold', textAlign: 'center', letterSpacing: 0.3 }}>Are You Sure To Delete This Address</Text>
                                <Text style={{ color: 'gray', fontSize: 17, fontWeight: '500', marginTop: 4 }}>You won't be able to revert this!</Text>
                            </View>
                        </View>
                        <View style={{ width: '95%', alignSelf: 'center', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', marginTop: 10 }}>
                            <TouchableOpacity onPress={closeDeleteAreaModal} style={styles.cancelDeleteBtn}>
                                <Text style={styles.btnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={deleteAddress} style={styles.confirmDeleteBtn}>
                                <Text style={styles.btnText}>Yes, delete it!</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            {/* End Delete Area Modal */}

        </SafeAreaView>
    )
}

export default Index

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column'
        // backgroundColor: '#fff'
    },
    headerPart: {
        width: '100%',
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        paddingVertical: 13,
        paddingHorizontal: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 13,
        elevation: 5
    },
    topHeaderText: {
        color: '#000',
        fontSize: 18,
        fontWeight: '500',
        marginBottom: 3,
        marginLeft: 5,
    },
    currentLocation: {
        backgroundColor: '#fff',
        marginTop: 15,
        width: '95%',
        alignSelf: 'center',
        padding: 10,
        borderRadius: 10
    },
    addressBox: {
        width: '95%',
        alignSelf: 'center',
        padding: 12,
        backgroundColor: '#fff',
        marginTop: 10,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between'
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
    errorText: {
        color: 'red',
        fontSize: 13,
        marginTop: 5,
    },
    deleteModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteModalContainer: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 15, // Slightly more rounded corners
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 }, // More pronounced shadow
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
        padding: 20,
    },
    cancelDeleteBtn: {
        backgroundColor: 'red',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 7
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