import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, FlatList, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation, useIsFocused } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FlatListSlider } from 'react-native-flatlist-slider';
import LoginModal from '../../Component/LoginModal';
import { base_url } from '../../../App';

const Index = (props) => {

    const sliderImages = [
        {
            id: '1',
            banner_img_url: 'https://pandit.33crores.com/images/1.png',
        },
        {
            id: '2',
            banner_img_url: 'https://pandit.33crores.com/images/2.png',
        },
        {
            id: '3',
            banner_img_url: 'https://pandit.33crores.com/images/3.png',
        },
        {
            id: '4',
            banner_img_url: 'https://pandit.33crores.com/images/4.png',
        },
    ];

    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [refreshing, setRefreshing] = useState(false);
    const [spinner, setSpinner] = useState(false);
    const [allPackages, setAllPackages] = useState([]);
    const [flowerRequest, setFlowerRequest] = useState([]);
    const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
            getAllPackages();
            console.log("Refreshing Successful");
        }, 2000);
    }, []);

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

    const goToCheckoutPage = async (flower) => {
        var access_token = await AsyncStorage.getItem('storeAccesstoken');
        if (access_token) {
            console.log("flower Details", flower);
            navigation.navigate('FlowerCheckoutPage', flower);
        }
        else {
            // navigation.navigate('Login');
            setIsLoginModalVisible(true);
        }
    }

    useEffect(() => {
        if (isFocused) {
            getAllPackages();
        }
    }, [isFocused]);

    const renderItem = ({ item }) => (
        <View style={styles.mostPPlrItem}>
            <View style={{ width: '100%', height: 170, borderRadius: 10 }}>
                <Image source={{ uri: item.product_image }} style={styles.mostPPImage} />
            </View>
            <View style={{ margin: 10, width: '90%', alignItems: 'flex-start', justifyContent: 'center' }}>
                <View style={{ width: '100%' }}>
                    <Text style={{ color: '#000', fontSize: 15, fontFamily: 'Montserrat-Bold', textTransform: 'capitalize' }}>{item.name}</Text>
                </View>
                {item.category === 'Immediateproduct' ?
                    <Text style={{ color: '#000', fontSize: 14, fontWeight: '400', textTransform: 'capitalize' }}>{item.immediate_price}</Text>
                    :
                    <View style={{ flexDirection: 'row', marginVertical: 5 }}>
                        {/* <Text style={{ color: '#000', fontSize: 14, fontWeight: '400', textTransform: 'capitalize', textDecorationLine: 'line-through', marginRight: 20 }}>Rs. {item.price}</Text> */}
                        <Text style={{ color: '#000', fontSize: 14, fontWeight: 'bold', textTransform: 'capitalize' }}>Rs. {item.price}</Text>
                    </View>
                }
                <Text numberOfLines={4} ellipsizeMode='tail' style={{ color: '#000', fontSize: 13, fontFamily: 'Montserrat-Regular', textTransform: 'capitalize', lineHeight: 20 }}>{item.description}</Text>
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
            <LoginModal visible={isLoginModalVisible} onClose={() => setIsLoginModalVisible(false)} />
            {spinner === true ?
                <View style={{ flex: 1, alignSelf: 'center', top: '30%' }}>
                    {/* <Image style={{ width: 50, height: 50 }} source={require('../../assets/img/loading.gif')} /> */}
                    <Text style={{ color: '#ffcb44', fontSize: 17 }}>Loading...</Text>
                </View>
                :
                <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
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
                    <View style={{ width: '95%', alignSelf: 'center', alignItems: 'center' }}>
                        <View style={styles.flowerRequest}>
                            <TouchableOpacity style={{ width: '47%', height: '100%', borderRadius: 10, borderColor: '#000', borderWidth: 0.5 }}>
                                <Image source={{ uri: flowerRequest?.product_image }} style={{ flex: 1, borderRadius: 10, resizeMode: 'cover' }} />
                            </TouchableOpacity>
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
                            <Text style={{ fontSize: 18, color: '#000', fontFamily: 'Montserrat-SemiBold' }}>FLOWER SUBSCRIPTION :-</Text>
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
        resizeMode: 'contain',
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