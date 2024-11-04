import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, Dimensions, Image, Modal, Alert, ScrollView, FlatList, RefreshControl } from 'react-native'
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
    const [subscriptionList, setSubscriptionList] = useState([]);
    const [requested_orderList, setRequested_orderList] = useState([]);

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
            {spinner === true ?
                <View style={{ flex: 1, alignSelf: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#ffcb44', fontSize: 17 }}>Loading...</Text>
                </View>
                :
                <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} showsVerticalScrollIndicator={false} style={{ flex: 1, marginBottom: 10 }}>
                    {subscriptionList.length > 0 ?
                        <View style={{ width: '95%', alignSelf: 'center', marginTop: 10 }}>
                            <FlatList
                                data={subscriptionList}
                                scrollEnabled={false}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate('PackageDetails', item)}
                                        style={{ flexDirection: 'row', backgroundColor: '#fff', padding: 15, marginBottom: 15, borderRadius: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 6, overflow: 'hidden' }}
                                    >
                                        <Image source={{ uri: item.flower_product.product_image_url }} style={{ width: 90, height: 90, borderRadius: 12, borderWidth: 1, borderColor: '#eee' }} />
                                        <View style={{ flex: 1, marginLeft: 15 }}>
                                            <Text style={{ color: '#333', fontSize: 18, fontWeight: 'bold' }}>{item.flower_product.name}</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                                <Text style={{ color: '#ff6347', fontSize: 16, fontWeight: '600' }}>₹{item.flower_product.price}</Text>
                                                <Text style={{ color: '#888', fontSize: 14, marginLeft: 8 }}>({item.flower_product.duration} Month)</Text>
                                            </View>
                                            <Text style={{ color: '#666', fontSize: 14, marginTop: 4, lineHeight: 20 }}>
                                                {item.flower_product.category}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>

                        :
                        <View style={{ flex: 1, alignItems: 'center', paddingTop: 300 }}>
                            <Text style={{ color: '#000', fontSize: 20, fontWeight: 'bold' }}>No Package Found</Text>
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
})