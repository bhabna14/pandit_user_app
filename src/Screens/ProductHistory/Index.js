import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, Dimensions, Image, Modal, Alert, ScrollView, FlatList, RefreshControl, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useIsFocused } from '@react-navigation/native'
import Feather from 'react-native-vector-icons/Feather';
import { Calendar } from 'react-native-calendars';
import { base_url } from '../../../App';
import moment from 'moment';

const Index = (props) => {

    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [spinner, setSpinner] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [subscriptionList, setSubscriptionList] = useState([]);

    const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() + 1)));
    const [endDate, setEndDate] = useState(new Date(new Date().setDate(new Date().getDate() + 1)));

    useEffect(() => {
        if (endDate < startDate) {
            setEndDate(startDate);
        }
    }, [startDate]);

    const handleStartDatePress = (day) => {
        setStartDate(new Date(day.dateString));
        closeStartDatePicker();
    };

    const handleEndDatePress = (day) => {
        setEndDate(new Date(day.dateString));
        closeEndDatePicker();
    };

    const [isStartDateModalOpen, setIsStartDateModalOpen] = useState(false);
    const openStartDatePicker = () => { setIsStartDateModalOpen(true) };
    const closeStartDatePicker = () => { setIsStartDateModalOpen(false) };
    const [isEndDateModalOpen, setIsEndDateModalOpen] = useState(false);
    const openEndDatePicker = () => { setIsEndDateModalOpen(true) };
    const closeEndDatePicker = () => { setIsEndDateModalOpen(false) };

    const [isPauseModalVisible, setPauseModalVisible] = useState(false);
    const openPauseModal = () => setPauseModalVisible(true);
    const closePauseModal = () => setPauseModalVisible(false);
    const [selectedPackageId, setSelectedPackageId] = useState(null);

    const [isResumeModalVisible, setResumeModalVisible] = useState(false);
    const openResumeModal = () => setResumeModalVisible(true);
    const closeResumeModal = () => setResumeModalVisible(false);
    const [selectedResumePackageId, setSelectedResumePackageId] = useState(null);

    const [isResumeDateModalOpen, setIsResumeDateModalOpen] = useState(false);
    const openResumeDatePicker = () => { setIsResumeDateModalOpen(true) };
    const closeResumeDatePicker = () => { setIsResumeDateModalOpen(false) };
    const [resumeDate, setResumeDate] = useState(null);

    useEffect(() => {
        if (pause_start_date) {
            const today = new Date();
            const pauseStartDate = new Date(pause_start_date);
            setResumeDate(today > pauseStartDate ? new Date(today.setDate(today.getDate() + 1)) : pauseStartDate);
        }
    }, [pause_start_date]);

    const [pause_start_date, setPause_start_date] = useState(null);
    const [pause_end_date, setPause_end_date] = useState(null);

    const handleResumeButton = (item) => {
        setSelectedResumePackageId(item.order_id);
        setPause_start_date(item.subscription.pause_start_date);
        setPause_end_date(item.subscription.pause_end_date);
        openResumeModal();
    };

    const handleResumDatePress = (day) => {
        setResumeDate(new Date(day.dateString));
        closeResumeDatePicker();
    };

    const submitResumeDates = async () => {
        // console.log("object", selectedResumePackageId);
        // return;
        const access_token = await AsyncStorage.getItem('storeAccesstoken');
        try {
            const response = await fetch(`${base_url}api/subscription/resume/${selectedResumePackageId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${access_token}`,
                },
                body: JSON.stringify({
                    resume_date: moment(resumeDate).format('YYYY-MM-DD'),
                }),
            });

            const data = await response.json();
            if (response.status === 200) {
                closeResumeModal();
                getSubscriptionList();
            } else {
                Alert.alert('Error', data.message);
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong');
        }
    };

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
            getSubscriptionList();
            console.log("Refreshing Successful");
        }, 2000);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            getSubscriptionList();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const getSubscriptionList = async () => {
        var access_token = await AsyncStorage.getItem('storeAccesstoken');
        setSpinner(true);

        await fetch(base_url + 'api/product-orders-list', {
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
                    <Text style={{ color: '#000', fontSize: 16, fontWeight: '500', marginBottom: 3, marginLeft: 5 }}>Product History</Text>
                </TouchableOpacity>
            </View>
            {/* <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
                <View style={styles.activeTabBtm}>
                    <Text style={styles.activeTabBtmText}>Monthly Product</Text>
                </View>
                <TouchableOpacity style={styles.tabBtm} onPress={() => navigation.navigate('Flower_req_history')}>
                    <Text style={styles.tabBtmText}>Product Request</Text>
                </TouchableOpacity>
            </View> */}
            {spinner === true ?
                <View style={{ flex: 1, alignSelf: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#ffcb44', fontSize: 17 }}>Loading...</Text>
                </View>
                :
                <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} showsVerticalScrollIndicator={false} style={{ flex: 1, marginBottom: 10 }}>
                    {subscriptionList?.length > 0 ?
                        <View style={{ width: '95%', alignSelf: 'center', marginTop: 10 }}>
                            <FlatList
                                data={subscriptionList}
                                scrollEnabled={false}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate("ProductDetails", item)}
                                        style={{ flexDirection: 'row', backgroundColor: '#fff', padding: 15, marginBottom: 15, borderRadius: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 6, overflow: 'hidden' }}
                                    >
                                        <Image source={{ uri: item.flower_product.product_image_url }} style={{ width: 90, height: 90, borderRadius: 12, borderWidth: 1, borderColor: '#eee' }} />
                                        <View style={{ flex: 1, marginLeft: 15 }}>
                                            <Text style={{ color: '#333', fontSize: 18, fontWeight: 'bold' }}>{item.flower_product.name}</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                                <Text style={{ color: '#ff6347', fontSize: 16, fontWeight: '600' }}>₹{item.flower_product.price}</Text>
                                                <Text style={{ color: '#888', fontSize: 14, marginLeft: 8 }}>({item.flower_product.duration} Month)</Text>
                                            </View>
                                            <Text style={{ color: '#666', fontSize: 14 }}>Order Id: <Text style={{ color: '#000' }}>{item.order_id}</Text></Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                        :
                        <View style={{ flex: 1, alignItems: 'center', paddingTop: 300 }}>
                            <Text style={{ color: '#000', fontSize: 20, fontWeight: 'bold' }}>No Product Package Found</Text>
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
                        <TouchableOpacity onPress={openStartDatePicker}>
                            <TextInput
                                style={styles.input}
                                value={startDate.toLocaleDateString()}
                                editable={false}
                            />
                        </TouchableOpacity>

                        <Text style={styles.label}>Pause End Time</Text>
                        <TouchableOpacity onPress={openEndDatePicker}>
                            <TextInput
                                style={styles.input}
                                value={endDate.toLocaleDateString()}
                                editable={false}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.dateButton} onPress={submitPauseDates}>
                            <Text style={styles.dateText}>Submit</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="slide"
                transparent={true}
                visible={isStartDateModalOpen}
                onRequestClose={closeStartDatePicker}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <View style={{ width: '90%', padding: 20, backgroundColor: 'white', borderRadius: 10, elevation: 5 }}>
                        <Calendar
                            onDayPress={handleStartDatePress}
                            markedDates={{
                                [moment(startDate).format('YYYY-MM-DD')]: {
                                    selected: true,
                                    marked: true,
                                    selectedColor: 'blue'
                                }
                            }}
                            minDate={moment().add(1, 'days').format('YYYY-MM-DD')}
                        />
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="slide"
                transparent={true}
                visible={isEndDateModalOpen}
                onRequestClose={closeEndDatePicker}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <View style={{ width: '90%', padding: 20, backgroundColor: 'white', borderRadius: 10, elevation: 5 }}>
                        <Calendar
                            onDayPress={handleEndDatePress}
                            markedDates={{
                                [moment(endDate).format('YYYY-MM-DD')]: {
                                    selected: true,
                                    marked: true,
                                    selectedColor: 'blue'
                                }
                            }}
                            minDate={moment().add(1, 'days').format('YYYY-MM-DD')}
                        />
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="slide"
                transparent={true}
                visible={isResumeModalVisible}
                onRequestClose={closeResumeModal}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <View style={{ width: '90%', backgroundColor: '#fff', padding: 20, borderRadius: 10 }}>
                        <TouchableOpacity style={{ alignSelf: 'flex-end' }} onPress={closeResumeModal}>
                            <Feather name="x" color={'#000'} size={30} />
                        </TouchableOpacity>
                        <Text style={styles.label}>Resume Date</Text>
                        <TouchableOpacity onPress={openResumeDatePicker}>
                            <TextInput
                                style={styles.input}
                                value={resumeDate ? resumeDate.toLocaleDateString() : 'Select a date'}
                                editable={false}
                            />
                        </TouchableOpacity>
                        {resumeDate === null && <Text style={{ color: 'red' }}>Please select a resume date</Text>}
                        <TouchableOpacity style={styles.dateButton} onPress={submitResumeDates}>
                            <Text style={styles.dateText}>Submit</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="slide"
                transparent={true}
                visible={isResumeDateModalOpen}
                onRequestClose={closeResumeDatePicker}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <View style={{ width: '90%', padding: 20, backgroundColor: 'white', borderRadius: 10, elevation: 5 }}>
                        <Calendar
                            onDayPress={handleResumDatePress}
                            markedDates={{
                                [moment(resumeDate).format('YYYY-MM-DD')]: {
                                    selected: true,
                                    marked: true,
                                    selectedColor: 'blue'
                                }
                            }}
                            minDate={moment(pause_start_date).format('YYYY-MM-DD')}
                            maxDate={moment(pause_end_date).format('YYYY-MM-DD')}
                        />
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