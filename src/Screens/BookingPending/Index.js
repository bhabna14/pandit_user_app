import { SafeAreaView, StyleSheet, Text, View, TextInput, TouchableOpacity, Dimensions, Image, Modal, Alert, ScrollView, FlatList, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useIsFocused } from '@react-navigation/native'
import Feather from 'react-native-vector-icons/Feather';
import { base_url } from '../../../App';

const Index = (props) => {

    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [spinner, setSpinner] = useState(false);
    const [allPendingOrders, setAllPendingOrders] = useState([]);
    const [allPaidOrders, setAllPaidOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('pending');

    const getAllBookingHistory = async () => {
        var access_token = await AsyncStorage.getItem('storeAccesstoken');
        // console.log("access_token", access_token);
        try {
            setSpinner(true);
            const response = await fetch(base_url + 'api/order-history', {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access_token}`
                },
            });
            const responseData = await response.json();
            if (responseData.success === true) {
                // console.log("getAllOrder-------=====", responseData);
                setSpinner(false);
                const pendingOrders = responseData.bookings.filter(order => order.status === 'pending');
                const paidOrders = responseData.bookings.filter(order => order.status === 'paid');
                setAllPendingOrders(pendingOrders);
                setAllPaidOrders(paidOrders);
            }
        } catch (error) {
            console.log(error);
            setSpinner(false);
        }
    }

    useEffect(() => {
        if (isFocused) {
            getAllBookingHistory();
        }
    }, [isFocused])

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerPart}>
                <TouchableOpacity onPress={() => props.navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Feather name="chevron-left" color={'#555454'} size={30} />
                    <Text style={{ color: '#000', fontSize: 16, fontWeight: '500', marginBottom: 3, marginLeft: 5 }}>Booking Pending</Text>
                </TouchableOpacity>
            </View>
            {spinner === true ?
                <View style={{ flex: 1, alignSelf: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#ffcb44', fontSize: 17 }}>Loading...</Text>
                </View>
                :
                <View style={{ flex: 1, marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', width: '95%', alignSelf: 'center', justifyContent: 'space-between' }}>
                        <TouchableOpacity
                            style={activeTab === "pending" ? styles.activeTabBtm : styles.tabBtm}
                            onPress={() => setActiveTab('pending')}
                        >
                            <Text style={activeTab === "pending" ? styles.activeTabBtmText : styles.tabBtmText}>Pending</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={activeTab === "paid" ? styles.activeTabBtm : styles.tabBtm}
                            onPress={() => setActiveTab('paid')}
                        >
                            <Text style={activeTab === "paid" ? styles.activeTabBtmText : styles.tabBtmText}>Paid</Text>
                        </TouchableOpacity>
                    </View>
                    {activeTab === "pending" &&
                        <ScrollView style={{ flex: 1, marginBottom: 10 }}>
                            {allPendingOrders.length > 0 ?
                                <View style={{ width: '95%', alignSelf: 'center', marginTop: 10 }}>
                                    <FlatList
                                        showsVerticalScrollIndicator={false}
                                        scrollEnabled={false}
                                        data={allPendingOrders}
                                        keyExtractor={(item) => item.id.toString()}
                                        renderItem={({ item }) => {
                                            return (
                                                <TouchableOpacity onPress={() => props.navigation.navigate('BookingDetails', item)} style={styles.mostSalesItem}>
                                                    <View style={{ width: '23%', height: 80 }}>
                                                        {item.pooja?.poojalist.pooja_photo_url ?
                                                            <Image
                                                                style={{ flex: 1, borderRadius: 10, resizeMode: 'cover' }}
                                                                source={{ uri: item.pooja.poojalist.pooja_photo_url }}
                                                            />
                                                            :
                                                            <Image
                                                                style={{ flex: 1, borderRadius: 10, resizeMode: 'contain' }}
                                                                source={{ uri: 'https://www.suzukijember.com/gallery/gambar_product/default.jpg' }}
                                                            />
                                                        }
                                                    </View>
                                                    <View style={{ width: '3%' }}></View>
                                                    <View style={{ width: '54%' }}>
                                                        <Text style={{ color: '#000', fontSize: 17, fontWeight: '500' }}>{item?.pooja?.poojalist?.pooja_name}</Text>
                                                        <Text style={{ color: '#6e6e6e', fontSize: 14, fontWeight: '400' }}>{item?.booking_date}</Text>
                                                        {item.status === 'pending' &&
                                                            <View style={{ backgroundColor: '#f5a04c', paddingBottom: 3, width: 75, alignItems: 'center', borderRadius: 5, marginTop: 3 }}>
                                                                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>{item.status}</Text>
                                                            </View>
                                                        }
                                                        {item.status === 'paid' &&
                                                            <View style={{ backgroundColor: 'green', paddingBottom: 3, width: 55, alignItems: 'center', borderRadius: 5, marginTop: 3 }}>
                                                                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>{item.status}</Text>
                                                            </View>
                                                        }
                                                        {item.status === 'canceled' &&
                                                            <View style={{ backgroundColor: '#de2e28', paddingBottom: 3, width: 75, alignItems: 'center', borderRadius: 5, marginTop: 3 }}>
                                                                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>{item.status}</Text>
                                                            </View>
                                                        }
                                                        {item.status === 'rejected' &&
                                                            <View style={{ backgroundColor: '#f7072b', paddingBottom: 3, width: 75, alignItems: 'center', borderRadius: 5, marginTop: 3 }}>
                                                                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>{item.status}</Text>
                                                            </View>
                                                        }
                                                    </View>
                                                    <View style={{ width: '20%', alignItems: 'flex-end' }}>
                                                        {item.application_status === 'pending' &&
                                                            <Text style={{ color: '#cc2727', fontSize: 14, fontWeight: '500' }}>Waiting For Approval</Text>
                                                        }
                                                        {item.application_status === 'approved' &&
                                                            <TouchableOpacity onPress={() => props.navigation.navigate('BookingDetails', item)} style={{ backgroundColor: 'green', width: '100%', paddingVertical: 8, alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}>
                                                                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 2 }}>PAY</Text>
                                                            </TouchableOpacity>
                                                        }
                                                        {item.application_status === 'paid' &&
                                                            <Text style={{ color: '#cc2727', fontSize: 16, fontWeight: '500' }}>₹{item.pooja_fee}</Text>
                                                        }
                                                        {item.application_status === 'canceled' &&
                                                            <Text style={{ color: '#cc2727', fontSize: 16, fontWeight: '500' }}>{item.application_status}</Text>
                                                        }
                                                        {item.application_status === 'rejected' &&
                                                            <Text style={{ color: '#cc2727', fontSize: 16, fontWeight: '500' }}>{item.application_status}</Text>
                                                        }
                                                    </View>
                                                </TouchableOpacity>
                                            )
                                        }}
                                    />
                                </View>
                                :
                                <View style={{ flex: 1, alignItems: 'center', paddingTop: 200 }}>
                                    <Text style={{ color: '#000', fontSize: 20, fontWeight: 'bold' }}>No Booking Found</Text>
                                </View>
                            }
                        </ScrollView>
                    }
                    {activeTab === "paid" &&
                        <ScrollView style={{ flex: 1, marginBottom: 10 }}>
                            {allPaidOrders.length > 0 ?
                                <View style={{ width: '95%', alignSelf: 'center', marginTop: 10 }}>
                                    <FlatList
                                        showsVerticalScrollIndicator={false}
                                        scrollEnabled={false}
                                        data={allPaidOrders}
                                        keyExtractor={(item) => item.id.toString()}
                                        renderItem={({ item }) => {
                                            return (
                                                <TouchableOpacity onPress={() => props.navigation.navigate('BookingDetails', item)} style={styles.mostSalesItem}>
                                                    <View style={{ width: '23%', height: 80 }}>
                                                        {item.pooja?.poojalist.pooja_photo_url ?
                                                            <Image
                                                                style={{ flex: 1, borderRadius: 10, resizeMode: 'cover' }}
                                                                source={{ uri: item.pooja.poojalist.pooja_photo_url }}
                                                            />
                                                            :
                                                            <Image
                                                                style={{ flex: 1, borderRadius: 10, resizeMode: 'contain' }}
                                                                source={{ uri: 'https://www.suzukijember.com/gallery/gambar_product/default.jpg' }}
                                                            />
                                                        }
                                                    </View>
                                                    <View style={{ width: '3%' }}></View>
                                                    <View style={{ width: '54%' }}>
                                                        <Text style={{ color: '#000', fontSize: 17, fontWeight: '500' }}>{item?.pooja?.poojalist?.pooja_name}</Text>
                                                        <Text style={{ color: '#6e6e6e', fontSize: 14, fontWeight: '400' }}>{item?.booking_date}</Text>
                                                        {item?.payment?.payment_type === "advance" &&
                                                            <View style={{ backgroundColor: 'green', paddingBottom: 3, width: 100, alignItems: 'center', borderRadius: 5, marginTop: 3 }}>
                                                                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>Advance Paid</Text>
                                                            </View>
                                                        }
                                                        {item?.payment?.payment_type === "full" &&
                                                            <View style={{ backgroundColor: 'green', paddingBottom: 3, width: 80, alignItems: 'center', borderRadius: 5, marginTop: 3 }}>
                                                                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>Full Paid</Text>
                                                            </View>
                                                        }
                                                    </View>
                                                    <View style={{ width: '20%', alignItems: 'flex-end' }}>
                                                        {item.payment.payment_type === "advance" &&
                                                            <View style={{ width: '100%' }}>
                                                                <Text style={{ color: '#cc2727', fontSize: 16, fontWeight: '500' }}>₹{item.payment.paid}</Text>
                                                                <TouchableOpacity onPress={() => props.navigation.navigate('BookingDetails', item)} style={{ backgroundColor: 'green', width: '100%', paddingVertical: 8, paddingHorizontal: 2, marginTop: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}>
                                                                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700', letterSpacing: 1 }}>Full Pay</Text>
                                                                </TouchableOpacity>
                                                            </View>
                                                        }
                                                        {item.payment_type === "full" &&
                                                            <Text style={{ color: '#cc2727', fontSize: 16, fontWeight: '500' }}>₹{item.payment.paid}</Text>
                                                        }
                                                    </View>
                                                </TouchableOpacity>
                                            )
                                        }}
                                    />
                                </View>
                                :
                                <View style={{ flex: 1, alignItems: 'center', paddingTop: 200 }}>
                                    <Text style={{ color: '#000', fontSize: 20, fontWeight: 'bold' }}>No Booking Found</Text>
                                </View>
                            }
                        </ScrollView>
                    }
                </View>
            }
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
    mostSalesItem: {
        backgroundColor: '#fff',
        width: '100%',
        // height: 120,
        marginBottom: 15,
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 13,
        elevation: 5,
    },
    activeTabBtm: {
        width: '48%',
        marginVertical: 10,
        alignItems: 'center',
        borderBottomColor: '#c3272e',
        borderBottomWidth: 1,
        marginBottom: 0,
        padding: 8
    },
    tabBtm: {
        width: '48%',
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
})