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
    const [allOrders, setAllOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('all_order');

    const getAllBookingHistory = async () => {
        var access_token = await AsyncStorage.getItem('storeAccesstoken');
        console.log("access_token", access_token);
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
                const nonPendingOrders = responseData.bookings.filter(order => (
                    (order.status === 'paid' & order.payment_status === 'paid' & order.application_status === 'approved' & order.pooja_status === 'completed')
                    ||
                    (order.status === 'canceled' & order.payment_status === 'refundprocess' & order.application_status === 'approved' & order.pooja_status === 'canceled')
                    ||
                    (order.status === 'rejected' & order.payment_status === 'rejected' & order.application_status === 'rejected' & order.pooja_status === 'rejected')
                ));
                setAllOrders(nonPendingOrders);
            }
        } catch (error) {
            console.log(error);
            setSpinner(false);
        }
    }

    const filteredOrders = allOrders.filter(order => {
        switch (activeTab) {
            case 'completed':
                return (
                    order.status === 'paid' &&
                    order.payment_status === 'paid' &&
                    order.application_status === 'approved' &&
                    order.pooja_status === 'completed'
                );
            case 'canceled':
                return (
                    order.status === 'canceled' &&
                    order.payment_status === 'refundprocess' &&
                    order.application_status === 'approved' &&
                    order.pooja_status === 'canceled'
                );
            case 'rejected':
                return (
                    order.status === 'rejected' &&
                    order.payment_status === 'rejected' &&
                    order.application_status === 'rejected' &&
                    order.pooja_status === 'rejected'
                );
            case 'all_order':
            default:
                return true;
        }
    });

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
                    <Text style={{ color: '#000', fontSize: 16, fontWeight: '500', marginBottom: 3, marginLeft: 5 }}>My Booking History</Text>
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
                            style={activeTab === "all_order" ? styles.activeTabBtm : styles.tabBtm}
                            onPress={() => setActiveTab('all_order')}
                        >
                            <Text style={activeTab === "all_order" ? styles.activeTabBtmText : styles.tabBtmText}>All</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={activeTab === "completed" ? [styles.activeTabBtm, { width: '25%' }] : [styles.tabBtm, { width: '25%' }]}
                            onPress={() => setActiveTab('completed')}
                        >
                            <Text style={activeTab === "completed" ? styles.activeTabBtmText : styles.tabBtmText}>Complete</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={activeTab === "canceled" ? styles.activeTabBtm : styles.tabBtm}
                            onPress={() => setActiveTab('canceled')}
                        >
                            <Text style={activeTab === "canceled" ? styles.activeTabBtmText : styles.tabBtmText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={activeTab === "rejected" ? styles.activeTabBtm : styles.tabBtm}
                            onPress={() => setActiveTab('rejected')}
                        >
                            <Text style={activeTab === "rejected" ? styles.activeTabBtmText : styles.tabBtmText}>Rejected</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={{ flex: 1, marginBottom: 10 }}>
                        {filteredOrders.length > 0 ?
                            <View style={{ width: '95%', alignSelf: 'center', marginTop: 10 }}>
                                <FlatList
                                    showsVerticalScrollIndicator={false}
                                    scrollEnabled={false}
                                    data={filteredOrders}
                                    keyExtractor={(item) => item.id.toString()}
                                    renderItem={({ item }) => {
                                        return (
                                            <TouchableOpacity onPress={() => props.navigation.navigate('BookingDetails', item)} style={styles.mostSalesItem}>
                                                <View style={{ width: '23%', height: 80 }}>
                                                    {item.pooja.poojalist.pooja_photo_url ?
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
                                                    {(item.status === 'paid' && item.payment_status === 'paid' && item.application_status === 'approved' && item.pooja_status === 'completed') &&
                                                        <View style={{ backgroundColor: 'green', paddingBottom: 3, width: 85, alignItems: 'center', borderRadius: 5, marginTop: 3 }}>
                                                            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>Completed</Text>
                                                        </View>
                                                    }
                                                    {(item.status === 'canceled' && item.payment_status === 'refundprocess' && item.application_status === 'approved' && item.pooja_status === 'canceled') &&
                                                        <View style={{ backgroundColor: '#de2e28', paddingBottom: 3, width: 75, alignItems: 'center', borderRadius: 5, marginTop: 3 }}>
                                                            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>Canceled</Text>
                                                        </View>
                                                    }
                                                    {(item.status === 'rejected' && item.payment_status === 'rejected' && item.application_status === 'rejected' && item.pooja_status === 'rejected') &&
                                                        <View style={{ backgroundColor: '#f7072b', paddingBottom: 3, width: 75, alignItems: 'center', borderRadius: 5, marginTop: 3 }}>
                                                            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>Rejected</Text>
                                                        </View>
                                                    }
                                                </View>
                                                <View style={{ width: '20%', alignItems: 'flex-end' }}>
                                                    {(item.status === 'paid' && item.payment_status === 'paid' && item.application_status === 'approved' && item.pooja_status === 'completed') && (
                                                        <Text style={{ color: '#06c409', fontSize: 16, fontWeight: '500' }}>Complete</Text>
                                                    )}
                                                    {(item.status === 'canceled' && item.payment_status === 'refundprocess' && item.application_status === 'approved' && item.pooja_status === 'canceled') && (
                                                        <Text style={{ color: '#cc2727', fontSize: 16, fontWeight: '500' }}>Canceled</Text>
                                                    )}
                                                    {(item.status === 'rejected' && item.payment_status === 'rejected' && item.application_status === 'rejected' && item.pooja_status === 'rejected') && (
                                                        <Text style={{ color: '#cc2727', fontSize: 16, fontWeight: '500' }}>Rejected</Text>
                                                    )}
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
        width: '24%',
        marginVertical: 10,
        alignItems: 'center',
        borderBottomColor: '#c3272e',
        borderBottomWidth: 1,
        marginBottom: 0,
        padding: 8
    },
    tabBtm: {
        width: '24%',
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