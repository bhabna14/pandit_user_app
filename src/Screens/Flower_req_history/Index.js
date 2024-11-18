import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, FlatList, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useIsFocused } from '@react-navigation/native'
import Feather from 'react-native-vector-icons/Feather';
import { base_url } from '../../../App';

const Index = (props) => {

    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [spinner, setSpinner] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [requested_orderList, setRequested_orderList] = useState([]);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
            getSubscriptionList();
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
                    <Text style={{ color: '#000', fontSize: 16, fontWeight: '500', marginBottom: 3, marginLeft: 5 }}>Flower Request</Text>
                </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
                <TouchableOpacity style={styles.tabBtm} onPress={() => navigation.navigate('PackageHistory')}>
                    <Text style={styles.tabBtmText}>Monthly Subscription</Text>
                </TouchableOpacity>
                <View style={styles.activeTabBtm}>
                    <Text style={styles.activeTabBtmText}>Flower Request</Text>
                </View>
            </View>
            {spinner === true ?
                <View style={{ flex: 1, alignSelf: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#ffcb44', fontSize: 17 }}>Loading...</Text>
                </View>
                :
                <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} showsVerticalScrollIndicator={false} style={{ flex: 1, marginBottom: 10 }}>
                    {requested_orderList?.length > 0 ?
                        <View style={{ width: '95%', alignSelf: 'center', marginTop: 10 }}>
                            <FlatList
                                data={requested_orderList}
                                scrollEnabled={false}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate("FlowerRequestDetails", item)}
                                        style={{ flexDirection: 'row', backgroundColor: '#fff', padding: 15, marginBottom: 15, borderRadius: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 6, overflow: 'hidden' }}
                                    >
                                        <Image source={{ uri: item.flower_product.product_image_url }} style={{ width: 90, height: 90, borderRadius: 12, borderWidth: 1, borderColor: '#eee' }} />
                                        <View style={{ flex: 1, marginLeft: 15, justifyContent: 'center' }}>
                                            <Text style={{ color: '#333', fontSize: 18, fontWeight: 'bold' }}>{item.flower_product.name}</Text>
                                            <Text style={{ color: '#666', fontSize: 14 }}>Request Id: {item.request_id}</Text>
                                            {item?.status === 'pending' ?
                                                <View style={{ backgroundColor: '#fae6e6', alignItems: 'center', justifyContent: 'center', padding: 3, borderRadius: 5, marginTop: 5 }}>
                                                    <Text style={{ color: '#000', fontSize: 14, fontWeight: '600' }}>Order has been placed.</Text>
                                                    <Text style={{ color: '#000', fontSize: 14, fontWeight: '600' }}>Cost will be notified in few minutes.</Text>
                                                </View>
                                                :
                                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginTop: 5 }}>
                                                    <View style={{ backgroundColor: '#fae6e6', alignItems: 'center', justifyContent: 'center', borderRadius: 5, width: 100, height: 30 }}>
                                                        <Text style={{ color: '#000', fontSize: 15, fontWeight: '600' }}>₹{item?.order?.total_price}</Text>
                                                    </View>
                                                    {item?.status === 'approved' &&
                                                        <TouchableOpacity onPress={() => navigation.navigate("FlowerRequestDetails", item)} style={{ backgroundColor: 'green', width: 70, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 5, marginLeft: 10 }}>
                                                            <Text style={{ color: '#fff' }}>Pay</Text>
                                                        </TouchableOpacity>
                                                    }
                                                </View>
                                            }
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
    }
})