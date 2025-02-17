import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, FlatList, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation, useIsFocused } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FlatListSlider } from 'react-native-flatlist-slider';
import LoginModal from '../../Component/LoginModal';
import { base_url } from '../../../App';

const Index = (props) => {

    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [refreshing, setRefreshing] = useState(false);
    const [spinner, setSpinner] = useState(false);
    const [allPackages, setAllPackages] = useState([]);
    const [flowerRequest, setFlowerRequest] = useState([]);
    const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
    const [sliderImages, setSliderImages] = useState([]);
    const [currentOrder, setCurrentOrder] = useState(null);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
            getAllPackages();
            getCurrentOrder();
            console.log("Refreshing Successful");
        }, 2000);
    }, []);

    const getFlowerBanner = async () => {
        try {
            setSpinner(true);
            const response = await fetch(base_url + 'api/app-banners', {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            });
            const responseData = await response.json();
            if (responseData.status === 200) {
                setSpinner(false);
                // console.log("Flower Banner: ", responseData.data);
                const flowerBanners = responseData.data.filter(item => item.category === "flower");
                setSliderImages(flowerBanners);
            }
        } catch (error) {
            console.log(error);
            setSpinner(false);
        }
    };

    const getAllPackages = async () => {
        setSpinner(true);
        await fetch(base_url + 'api/products', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        }).then(response => response.json()).then(response => {
            if (response.status === 200) {
                // console.log("object", response.data.find(item => item.category === "Immediateproduct"));
                setFlowerRequest(response.data.find(item => item.category === "Immediateproduct"));
                setAllPackages(response.data);
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

    const getCurrentOrder = async () => {
        var access_token = await AsyncStorage.getItem('storeAccesstoken');
        if (access_token) {
            await fetch(base_url + 'api/current-orders', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + access_token
                },
            }).then(response => response.json()).then(response => {
                if (response.success === true) {
                    console.log("Current Order: ", response.data[0]);
                    setCurrentOrder(response.data[0]);
                } else {
                    console.error('Failed to fetch packages:', response.message);
                }
            }).catch((error) => {
                console.error('Error:', error);
            });
        }
    };

    const [selectedItem, setSelectedItem] = useState(null);

    const goToCheckoutPage = async (flower) => {
        var access_token = await AsyncStorage.getItem('storeAccesstoken');
        if (access_token) {
            // console.log("flower Details", flower);
            navigation.navigate('FlowerCheckoutPage', flower);
        }
        else {
            // navigation.navigate('Login');
            setIsLoginModalVisible(true);
            setSelectedItem(flower);
        }
    }

    const goToCheckoutPageFormRenew = async (flower, orderId) => {
        try {
            const access_token = await AsyncStorage.getItem('storeAccesstoken');
            if (access_token) {
                // Add orderId and renew to the flower object
                const flowerWithExtras = { ...flower, orderId };
                // console.log("flowerWithExtras", flowerWithExtras);
                // return;

                // Pass the updated flower object in navigation
                navigation.navigate('FlowerCheckoutPage', flowerWithExtras);
            } else {
                // Show the login modal and save the selected flower
                const flowerWithExtras = { ...flower, orderId };
                setIsLoginModalVisible(true); // Ensure this state is defined in your component
                setSelectedItem(flowerWithExtras); // Save the flower with extras in state
            }
        } catch (error) {
            console.error("Error navigating to the checkout page:", error);
        }
    };

    useEffect(() => {
        if (isFocused) {
            getAllPackages();
            getFlowerBanner();
            getCurrentOrder();
        }
    }, [isFocused]);

    const renderItem = ({ item }) => (
        <View style={styles.mostPPlrItem}>
            <View style={{ width: '100%', height: 170, borderRadius: 10, padding: 4 }}>
                <Image source={{ uri: item.product_image }} style={styles.mostPPImage} />
            </View>
            <View style={{ margin: 10, width: '90%', alignItems: 'flex-start', justifyContent: 'center' }}>
                <View style={{ width: '100%' }}>
                    <Text style={{ color: '#000', fontSize: 16, fontWeight: '500', textTransform: 'capitalize' }}>{item.name}</Text>
                </View>
                {item.category === 'Immediateproduct' ?
                    <Text style={{ color: '#000', fontSize: 14, fontWeight: '400', textTransform: 'capitalize' }}>{item.immediate_price}</Text>
                    :
                    <View style={{ flexDirection: 'row', marginVertical: 5 }}>
                        <Text style={{ color: '#000', fontWeight: '500' }}>M.R.P -  </Text>
                        {item.mrp && <Text style={{ color: '#c9170a', fontSize: 14, fontWeight: '400', textTransform: 'capitalize', textDecorationLine: 'line-through', marginRight: 10 }}>Rs.{item.mrp}</Text>}
                        <Text style={{ color: '#000', fontSize: 15, fontWeight: 'bold', textTransform: 'capitalize' }}>Rs.{item.price}</Text>
                    </View>
                }
                <Text style={{ color: '#000', fontSize: 13, fontFamily: 'Montserrat-Regular', textTransform: 'capitalize', lineHeight: 20 }}>{item.description}</Text>
            </View>
            <View style={{ width: '96%', alignSelf: 'center', marginBottom: 18 }}>
                <TouchableOpacity onPress={() => goToCheckoutPage(item)} style={{ width: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: '#c9170a', borderRadius: 6, padding: 8 }}>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '500', textTransform: 'capitalize' }}>Order Now</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, flexDirection: 'column' }}>
            <LoginModal visible={isLoginModalVisible} onClose={() => setIsLoginModalVisible(false)} selectedItem={selectedItem} page={'FlowerCheckoutPage'} />
            {spinner === true ?
                <View style={{ flex: 1, alignSelf: 'center', top: '30%' }}>
                    {/* <Image style={{ width: 50, height: 50 }} source={require('../../assets/img/loading.gif')} /> */}
                    <Text style={{ color: '#ffcb44', fontSize: 17 }}>Loading...</Text>
                </View>
                :
                <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                    {sliderImages.length > 0 &&
                        <View style={{ width: '95%', alignSelf: 'center', alignItems: 'center' }}>
                            <View style={{ width: '100%', marginBottom: 5, marginTop: 0, borderRadius: 10, overflow: 'hidden' }}>
                                <FlatListSlider
                                    onPress={item => ""}
                                    indicator={false}
                                    data={sliderImages}
                                    imageKey={'banner_img_url'}
                                    height={195}
                                    timer={8000}
                                    animation
                                    autoscroll={false}
                                />
                            </View>
                        </View>
                    }
                    {currentOrder &&
                        <View style={{ width: '95%', alignSelf: 'center', alignItems: 'center' }}>
                            <View style={{ backgroundColor: '#fff', width: '100%', alignSelf: 'center', borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 13, elevation: 4, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', padding: 6, marginTop: 10 }}>
                                {/* <TouchableOpacity onPress={() => navigation.navigate('PackageHistory')} style={{ width: '47%', height: '100%', borderRadius: 10, borderColor: '#000', borderWidth: 0.5 }}>
                                    <Image source={{ uri: currentOrder?.flower_product?.product_image }} style={{ flex: 1, borderRadius: 10, resizeMode: 'cover' }} />
                                </TouchableOpacity> */}
                                <View style={{ width: '100%', alignItems: 'center' }}>
                                    <View style={{ margin: 10, width: '90%', alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ color: '#000', fontSize: 16, fontWeight: '500', marginBottom: 5, textTransform: 'capitalize' }}>Your Current Subscription</Text>
                                        <Text style={{ color: '#000', fontSize: 14, fontWeight: '400', marginBottom: 2 }}>{currentOrder.flower_product.name}</Text>
                                        {/* <View style={{ flexDirection: 'row' }}>
                                            <Text style={{ color: '#c9170a', fontWeight: '500' }}>M.R.P -  </Text>
                                            <Text style={{ color: '#000', fontSize: 15, fontWeight: 'bold', textTransform: 'capitalize' }}>Rs.{currentOrder.flower_product.price}</Text>
                                        </View> */}
                                        <Text style={{ color: '#4a4a49', fontWeight: 'bold', fontSize: 15 }}>From: <Text style={{ fontWeight: '400' }}>{currentOrder.subscription.start_date}</Text> To: <Text style={{ fontWeight: '400' }}>{currentOrder.subscription.new_date ? currentOrder.subscription.new_date : currentOrder.subscription.end_date}</Text></Text>
                                        {currentOrder.subscription.status === 'active' || 'paused' ?
                                            <View style={{ backgroundColor: '#c3272e', padding: 10, alignSelf: 'center', alignItems: 'center', width: '100%', borderRadius: 8, marginTop: 10 }}>
                                                <Text style={{ color: '#fff' }}>Remaining - {currentOrder?.subscription?.remaining_time?.days}day's {currentOrder?.subscription?.remaining_time?.h}hr</Text>
                                            </View>
                                            :
                                            currentOrder.subscription.status === 'pending' ?
                                                <View style={{ backgroundColor: '#c3272e', padding: 10, alignSelf: 'center', alignItems: 'center', width: '100%', borderRadius: 8, marginTop: 10 }}>
                                                    <Text style={{ color: '#fff' }}>Order Pending</Text>
                                                </View>
                                                :
                                                <TouchableOpacity onPress={() => goToCheckoutPageFormRenew(currentOrder.flower_product, currentOrder.order_id)} style={{ backgroundColor: '#c3272e', padding: 10, alignSelf: 'center', alignItems: 'center', width: '100%', borderRadius: 8, marginTop: 10 }}>
                                                    <Text style={{ color: '#fff' }}>Renew Order</Text>
                                                </TouchableOpacity>
                                        }
                                    </View>
                                </View>
                            </View>
                        </View>
                    }
                    <View style={{ width: '95%', alignSelf: 'center', alignItems: 'center' }}>
                        <View style={styles.flowerRequest}>
                            <View style={{ width: '47%', height: '100%', borderRadius: 10, borderColor: '#000', borderWidth: 0.5 }}>
                                <Image source={{ uri: flowerRequest?.product_image }} style={{ flex: 1, borderRadius: 10, resizeMode: 'cover' }} />
                            </View>
                            <View style={{ width: '51%' }}>
                                <View style={{ margin: 10, width: '90%', alignItems: 'flex-start', justifyContent: 'center' }}>
                                    <Text style={{ color: '#000', fontSize: 16, fontWeight: '500', marginBottom: 5, textTransform: 'capitalize' }}>{flowerRequest?.name}</Text>
                                    <Text style={{ color: '#000', fontSize: 13, fontWeight: '400', marginBottom: 2 }}>{flowerRequest?.immediate_price}</Text>
                                    <TouchableOpacity onPress={() => goToCheckoutPage(flowerRequest)} style={{ backgroundColor: '#c3272e', padding: 10, alignSelf: 'center', alignItems: 'center', width: '100%', borderRadius: 8, marginTop: 10 }}>
                                        <Text style={{ color: '#fff' }}>Order Now</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={{ width: '95%', alignSelf: 'center', alignItems: 'center' }}>
                        <View style={{ width: '100%', marginVertical: 10, borderRadius: 10, overflow: 'hidden' }}>
                            <Text style={{ fontSize: 18, color: '#000', fontWeight: 'bold' }}>FLOWER  SUBSCRIPTION :-</Text>
                        </View>
                        <View style={{ width: '100%', borderRadius: 10, overflow: 'hidden' }}>
                            <FlatList
                                data={allPackages.filter(item => item.category === "Subscription")}
                                renderItem={renderItem}
                                scrollEnabled={false}
                                keyExtractor={item => item.id}
                            // numColumns={2}
                            // contentContainerStyle={styles.listContent}
                            />
                        </View>
                    </View>
                </ScrollView>
            }
        </SafeAreaView>
    )
}

export default Index

const styles = StyleSheet.create({
    mostPPlrItem: {
        backgroundColor: '#fff',
        width: '96%',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 13,
        elevation: 5,
        marginBottom: 10,
        marginHorizontal: '1.3%'
    },
    mostPPImage: {
        height: '100%',
        width: '100%',
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        resizeMode: 'cover'
    },
    flowerRequest: {
        backgroundColor: '#fff',
        width: '100%',
        height: 160,
        alignSelf: 'center',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 13,
        elevation: 4,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 6,
        marginTop: 10
    }
})