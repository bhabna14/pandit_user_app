import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Image, ScrollView, FlatList } from 'react-native';
import React, { useState, useEffect } from 'react';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { base_url } from '../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginModal from '../../Component/LoginModal';

const PanditDetails = (props) => {

    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [spinner, setSpinner] = useState(false);
    const [panditDetails, setPanditDetails] = useState({});
    const [pujaList, setPujaList] = useState([]);
    const [activeTab, setActiveTab] = useState('pujaList');
    const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);

    const getPanditDetails = async () => {
        try {
            setSpinner(true);
            const response = await fetch(base_url + 'api/our-pandit/' + props.route.params, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            });
            const responseData = await response.json();
            if (responseData.status === 200) {
                // console.log("getPanditDetails-------", responseData.data);
                setSpinner(false);
                setPanditDetails(responseData.data.pandit);
                setPujaList(responseData.data.poojas);
            }
        } catch (error) {
            console.log(error);
            setSpinner(false);
        }
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
        const [localPart, domain] = email.split('@');
        if (localPart.length <= 2) {
            return email;
        }
        const visiblePart = localPart.slice(0, 2);
        const maskedPart = '*'.repeat(localPart.length - 2);
        return `${visiblePart}${maskedPart}@${domain}`;
    };

    const goToCheckoutPage = async (puja) => {
        var access_token = await AsyncStorage.getItem('storeAccesstoken');
        let puja_details = {
            pujaName: puja.pooja_name,
            pujaId: puja.pooja_id,
            panditName: panditDetails.name,
            panditId: panditDetails.id,
            panditImage: panditDetails.profile_photo,
            pujaFee: puja.pooja_fee,
            addvanceFee: (puja.pooja_fee * 0.2).toFixed(2),
            poojaDate: puja.poojalist.pooja_date
        }
        if (access_token) {
            console.log("puja Details", puja_details);
            navigation.navigate('Checkout', puja_details);
        }
        else {
            // navigation.navigate('Login');
            setIsLoginModalVisible(true);
        }
    }

    useEffect(() => {
        if (isFocused) {
            console.log("Get Pandit Slug by Props-=-=", props.route.params);
            getPanditDetails();
        }
    }, [isFocused])

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f0f0' }}>
            <LoginModal visible={isLoginModalVisible} onClose={() => setIsLoginModalVisible(false)} />
            <View style={styles.headerPart}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Feather name="chevron-left" color={'#555454'} size={30} />
                    <Text style={styles.topHeaderText}>Pandit Details</Text>
                </TouchableOpacity>
            </View>
            {spinner === true ?
                <View style={{ flex: 1, alignSelf: 'center', top: '30%' }}>
                    <Text style={{ color: '#ffcb44', fontSize: 17 }}>Loading...</Text>
                </View>
                :
                <ScrollView contentContainerStyle={styles.contentContainer}>
                    <View style={styles.profileSection}>
                        {panditDetails.profile_photo &&
                            <Image
                                source={{ uri: panditDetails.profile_photo }}
                                style={styles.profileImage}
                            />
                        }
                        <Text style={styles.profileName}>{panditDetails.title} {panditDetails.name}</Text>
                        <Text style={styles.profileDescription}>{panditDetails.about_pandit}</Text>
                    </View>
                    <View style={styles.detailsSection}>
                        <Text style={styles.detailsTitle}>Contact</Text>
                        <Text style={styles.detailsText}><Feather name="map-pin" size={16} /> Location: Bhubaneswar, Odisha</Text>
                        {panditDetails.whatsappno && <Text style={styles.detailsText}><Feather name="phone" size={16} /> Phone: +91 {maskPhoneNumber(panditDetails.whatsappno)}</Text>}
                        {panditDetails.email && <Text style={styles.detailsText}><Feather name="mail" size={16} /> Email: {maskEmail(panditDetails.email)}</Text>}
                    </View>
                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
                            <TouchableOpacity
                                style={activeTab === "pujaList" ? styles.activeTabBtm : styles.tabBtm}
                                value="pujaList"
                                onPress={() => setActiveTab('pujaList')}
                            >
                                <Text style={activeTab === "pujaList" ? styles.activeTabBtmText : styles.tabBtmText}>Pooja List</Text>
                            </TouchableOpacity>
                            {/* <TouchableOpacity
                                style={activeTab === "review" ? styles.activeTabBtm : styles.tabBtm}
                                value="review"
                                onPress={() => setActiveTab('review')}
                            >
                                <Text style={activeTab === "review" ? styles.activeTabBtmText : styles.tabBtmText}>Review</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={activeTab === "photos" ? styles.activeTabBtm : styles.tabBtm}
                                value="photos"
                                onPress={() => setActiveTab('photos')}
                            >
                                <Text style={activeTab === "photos" ? styles.activeTabBtmText : styles.tabBtmText}>Photo's</Text>
                            </TouchableOpacity> */}
                        </View>
                        {activeTab === 'pujaList' &&
                            <View style={{ flex: 1, marginTop: 8 }}>
                                <FlatList
                                    showsVerticalScrollIndicator={false}
                                    data={pujaList}
                                    scrollEnabled={false}
                                    keyExtractor={(item) => item.id.toString()}
                                    renderItem={({ item }) => {
                                        return (
                                            <View style={styles.card}>
                                                <View style={styles.cardRow}>
                                                    <TouchableOpacity onPress={() => props.navigation.navigate('PujaDetails', item.poojalist.slug)} style={{ width: '12%', alignItems: 'center' }}>
                                                        <Image style={{ width: 42, height: 42, borderRadius: 100 }} source={{ uri: item.poojalist.pooja_photo }} />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => props.navigation.navigate('PujaDetails', item.poojalist.slug)} style={{ width: '30%', alignItems: 'flex-start' }}>
                                                        <Text style={styles.cardText}>{item.poojalist.pooja_name}</Text>
                                                    </TouchableOpacity>
                                                    <View style={{ width: '25%', alignItems: 'center' }}>
                                                        <Text style={styles.cardText}>₹{item.pooja_fee}</Text>
                                                    </View>
                                                    <TouchableOpacity onPress={() => goToCheckoutPage(item)} style={styles.bookBtn}>
                                                        <Text style={styles.bookBtnText}>Book</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        );
                                    }}
                                />
                            </View>
                        }
                        {activeTab === 'review' &&
                            <View style={{ flex: 1, marginTop: 8 }}></View>
                        }
                        {activeTab === 'photos' &&
                            <View style={{ flex: 1, marginTop: 8 }}></View>
                        }
                    </View>
                </ScrollView>
            }
        </SafeAreaView>
    );
};

export default PanditDetails;

const styles = StyleSheet.create({
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
        elevation: 5,
    },
    topHeaderText: {
        color: '#000',
        fontSize: 18,
        fontWeight: '500',
        marginBottom: 3,
        marginLeft: 5,
    },
    contentContainer: {
        padding: 15,
    },
    profileSection: {
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        marginBottom: 20,
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        marginBottom: 15,
    },
    profileName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#000',
        textTransform: 'capitalize',
        width: '90%',
        textAlign: 'center'
    },
    profileDescription: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
    },
    detailsSection: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        marginBottom: 8,
    },
    detailsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#8f8f8f'
    },
    detailsText: {
        fontSize: 16,
        marginBottom: 5,
        color: '#8f8f8f'
    },
    headerRow: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    headerColumn: {
        width: '30%',
        alignItems: 'center',
    },
    headerText: {
        color: '#3d3d3d',
        fontSize: 16,
        fontWeight: 'bold',
    },
    headerUnderline: {
        backgroundColor: '#000',
        width: '100%',
        height: 1.4,
        marginTop: 1,
    },
    card: {
        width: '100%',
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardText: {
        color: '#3d3d3d',
        fontSize: 15,
        fontWeight: '400',
        textTransform: 'capitalize'
    },
    bookBtn: {
        backgroundColor: '#f01d1d',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 5,
    },
    bookBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    activeTabBtm: {
        width: '33%',
        marginVertical: 10,
        alignItems: 'center',
        borderBottomColor: '#c3272e',
        borderBottomWidth: 1,
        marginBottom: 0,
        padding: 8
    },
    tabBtm: {
        width: '33%',
        marginVertical: 10,
        alignItems: 'center',
        borderBottomColor: '#474747',
        padding: 8,
        borderBottomWidth: 0.5,
        marginBottom: 0
    },
    tabBtmText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#828282'
    },
    activeTabBtmText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#c3272e'
    },
});
