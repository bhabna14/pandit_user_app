import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, Dimensions, Image, Modal, Alert, ScrollView, FlatList, RefreshControl, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useIsFocused } from '@react-navigation/native'
import Feather from 'react-native-vector-icons/Feather';
import DatePicker from 'react-native-date-picker';
import { base_url } from '../../../App';
import moment from 'moment';

const Index = (props) => {

    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [spinner, setSpinner] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [subscriptionList, setSubscriptionList] = useState([]);
    const [requested_orderList, setRequested_orderList] = useState([]);
    const [activeTab, setActiveTab] = useState('monthly_sub');

    const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() + 1)));
    const [endDate, setEndDate] = useState(new Date(new Date().setDate(new Date().getDate() + 1)));
    const [openStartDatePicker, setOpenStartDatePicker] = useState(false);
    const [openEndDatePicker, setOpenEndDatePicker] = useState(false);
    const [isPauseModalVisible, setPauseModalVisible] = useState(false);
    const openPauseModal = () => setPauseModalVisible(true);
    const closePauseModal = () => setPauseModalVisible(false);
    const [selectedPackageId, setSelectedPackageId] = useState(null);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
            console.log("Refreshing Successful");
        }, 2000);
    }, []);

    const getSubscriptionList = async () => {
        var access_token = await AsyncStorage.getItem('storeAccesstoken');
        setSpinner(true);

        await fetch(base_url + 'api/orders-list', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + access_token
            },
        }).then(response => response.json()).then(response => {
            if (response.success === 200) {
                // console.log("object", response.data);
                setSubscriptionList(response.data.subscriptions_order);
                setRequested_orderList(response.data.requested_orders);
                setSpinner(false);
            } else {
                console.error('Failed to fetch packages:', response.message);
                setSpinner(false);
            }
            setSpinner(false);
        }).catch((error) => {
            console.error('Error:', error);
            setSpinner(false);
        });
    };

    const handlePauseButton = (order_id) => {
        setSelectedPackageId(order_id);
        openPauseModal();
    };

    const submitPauseDates = async () => {
        // console.log("object", selectedPackageId);
        // return;
        const access_token = await AsyncStorage.getItem('storeAccesstoken');
        try {
            const response = await fetch(`${base_url}api/subscription/pause/${selectedPackageId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${access_token}`,
                },
                body: JSON.stringify({
                    pause_start_date: moment(startDate).format('YYYY-MM-DD'),
                    pause_end_date: moment(endDate).format('YYYY-MM-DD'),
                }),
            });

            const data = await response.json();
            if (response.status === 200) {
                closePauseModal();
                getSubscriptionList();
            } else {
                Alert.alert('Error', data.message);
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong');
        }
    };

    useEffect(() => {
        if (isFocused) {
            getSubscriptionList();
        }
    }, [isFocused])

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerPart}>
                <TouchableOpacity onPress={() => props.navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Feather name="chevron-left" color={'#555454'} size={30} />
                    <Text style={{ color: '#000', fontSize: 16, fontWeight: '500', marginBottom: 3, marginLeft: 5 }}>Flower subscription</Text>
                </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
                <TouchableOpacity
                    style={activeTab === "monthly_sub" ? styles.activeTabBtm : styles.tabBtm}
                    value="monthly_sub"
                    onPress={() => setActiveTab('monthly_sub')}
                >
                    <Text style={activeTab === "monthly_sub" ? styles.activeTabBtmText : styles.tabBtmText}>Monthly Subscription</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={activeTab === "flower_request" ? styles.activeTabBtm : styles.tabBtm}
                    value="flower_request"
                    onPress={() => setActiveTab('flower_request')}
                >
                    <Text style={activeTab === "flower_request" ? styles.activeTabBtmText : styles.tabBtmText}>Flower Request</Text>
                </TouchableOpacity>
            </View>
            {spinner === true ?
                <View style={{ flex: 1, alignSelf: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#ffcb44', fontSize: 17 }}>Loading...</Text>
                </View>
                :
                <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} showsVerticalScrollIndicator={false} style={{ flex: 1, marginBottom: 10 }}>
                    {activeTab === 'monthly_sub' ?
                        subscriptionList.length > 0 ?
                            <View style={{ width: '95%', alignSelf: 'center', marginTop: 10 }}>
                                <FlatList
                                    data={subscriptionList}
                                    scrollEnabled={false}
                                    keyExtractor={(item, index) => index.toString()}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            onPress={() => navigation.navigate("PackageDetails", item)}
                                            style={{ flexDirection: 'row', backgroundColor: '#fff', padding: 15, marginBottom: 15, borderRadius: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 6, overflow: 'hidden' }}
                                        >
                                            <Image source={{ uri: item.flower_product.product_image_url }} style={{ width: 90, height: 90, borderRadius: 12, borderWidth: 1, borderColor: '#eee' }} />
                                            <View style={{ flex: 1, marginLeft: 15 }}>
                                                <Text style={{ color: '#333', fontSize: 18, fontWeight: 'bold' }}>{item.flower_product.name}</Text>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                                    <Text style={{ color: '#ff6347', fontSize: 16, fontWeight: '600' }}>₹{item.flower_product.price}</Text>
                                                    <Text style={{ color: '#888', fontSize: 14, marginLeft: 8 }}>({item.flower_product.duration} Month)</Text>
                                                </View>
                                                {/* <Text style={{ color: '#666', fontSize: 14, marginTop: 4, lineHeight: 20 }}>{item.flower_product.category}</Text> */}
                                                <Text style={{ color: '#666', fontSize: 14 }}>Order Id: <Text style={{ color: '#000' }}>{item.order_id}</Text></Text>
                                                {item.subscription.status === "paused" ?
                                                    <Text style={{ color: '#c9170a', fontSize: 14, fontWeight: '600' }}>Your subscription is paused from {item.subscription.pause_start_date} to {item.subscription.pause_end_date}</Text>
                                                    :
                                                    <TouchableOpacity onPress={() => handlePauseButton(item.order_id)} style={{ backgroundColor: 'red', width: 70, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 5, marginTop: 8 }}>
                                                        <Text style={{ color: '#fff' }}>Pause</Text>
                                                    </TouchableOpacity>
                                                }
                                            </View>
                                        </TouchableOpacity>
                                    )}
                                />
                            </View>
                            :
                            <View style={{ flex: 1, alignItems: 'center', paddingTop: 300 }}>
                                <Text style={{ color: '#000', fontSize: 20, fontWeight: 'bold' }}>No Package Found</Text>
                            </View>
                        :
                        requested_orderList.length > 0 ?
                            <View style={{ width: '95%', alignSelf: 'center', marginTop: 10 }}>
                                <FlatList
                                    data={requested_orderList}
                                    scrollEnabled={false}
                                    keyExtractor={(item, index) => index.toString()}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            onPress={() => navigation.navigate("PackageDetails", item)}
                                            style={{ flexDirection: 'row', backgroundColor: '#fff', padding: 15, marginBottom: 15, borderRadius: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 6, overflow: 'hidden' }}
                                        >
                                            <Image source={{ uri: item.flower_product.product_image_url }} style={{ width: 90, height: 90, borderRadius: 12, borderWidth: 1, borderColor: '#eee' }} />
                                            <View style={{ flex: 1, marginLeft: 15 }}>
                                                <Text style={{ color: '#333', fontSize: 18, fontWeight: 'bold' }}>{item.flower_product.name}</Text>
                                                {item.order === null ?
                                                    <Text style={{ color: '#ff6347', fontSize: 16, fontWeight: '600' }}>{item.flower_product.immediate_price}</Text>
                                                    :
                                                    <Text style={{ color: '#ff6347', fontSize: 16, fontWeight: '600' }}>₹{item.order.total_price}</Text>
                                                }
                                                <Text style={{ color: '#666', fontSize: 14, marginTop: 4, lineHeight: 20 }}>{item.description}</Text>
                                                <Text style={{ color: '#666', fontSize: 14 }}>Request Id: {item.request_id}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    )}
                                />
                            </View>
                            :
                            <View style={{ flex: 1, alignItems: 'center', paddingTop: 300 }}>
                                <Text style={{ color: '#000', fontSize: 20, fontWeight: 'bold' }}>No Request Found</Text>
                            </View>
                    }
                </ScrollView>
            }
            <Modal
                animationType="slide"
                transparent={true}
                visible={isPauseModalVisible}
                onRequestClose={closePauseModal}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{ width: '90%', backgroundColor: '#fff', padding: 20, borderRadius: 10 }}>
                        <TouchableOpacity style={{ alignSelf: 'flex-end' }} onPress={closePauseModal}>
                            <Feather name="x" color={'#000'} size={30} />
                        </TouchableOpacity>
                        <Text style={styles.label}>Pause Start Time</Text>
                        <TouchableOpacity onPress={() => setOpenStartDatePicker(true)}>
                            <TextInput
                                style={styles.input}
                                value={startDate.toLocaleDateString()}
                                editable={false}
                            />
                        </TouchableOpacity>

                        <Text style={styles.label}>Pause End Time</Text>
                        <TouchableOpacity onPress={() => setOpenEndDatePicker(true)}>
                            <TextInput
                                style={styles.input}
                                value={endDate.toLocaleDateString()}
                                editable={false}
                            />
                        </TouchableOpacity>
                        <DatePicker
                            modal
                            open={openStartDatePicker}
                            date={startDate}
                            mode="date"
                            minimumDate={new Date(new Date().setDate(new Date().getDate() + 1))}
                            onConfirm={(date) => {
                                setOpenStartDatePicker(false);
                                setStartDate(date);
                            }}
                            onCancel={() => setOpenStartDatePicker(false)}
                        />

                        <DatePicker
                            modal
                            open={openEndDatePicker}
                            date={endDate}
                            mode="date"
                            minimumDate={new Date(new Date().setDate(new Date().getDate() + 1))}
                            onConfirm={(date) => {
                                setOpenEndDatePicker(false);
                                setEndDate(date);
                            }}
                            onCancel={() => setOpenEndDatePicker(false)}
                        />

                        <TouchableOpacity style={styles.dateButton} onPress={submitPauseDates}>
                            <Text style={styles.dateText}>Submit</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    activeTabBtm: {
        width: '49%',
        marginVertical: 10,
        alignItems: 'center',
        borderBottomColor: '#c3272e',
        borderBottomWidth: 1,
        marginBottom: 0,
        padding: 8
    },
    tabBtm: {
        width: '49%',
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
    dateButton: {
        alignItems: 'center',
        paddingVertical: 12,
        backgroundColor: '#c9170a',
        borderRadius: 5,
        marginVertical: 5,
    },
    dateText: {
        color: '#fff',
        fontSize: 16,
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