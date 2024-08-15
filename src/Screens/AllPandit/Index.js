import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, Dimensions, FlatList, Image } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useIsFocused } from '@react-navigation/native'
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { base_url } from '../../../App';

const Index = (props) => {

    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [spinner, setSpinner] = useState(false);
    const screenWidth = Dimensions.get('window').width;
    const itemWidth = 0.6 * screenWidth;
    const [allPandit, setAllPandit] = useState([]);

    const getAllPandit = async () => {
        try {
            setSpinner(true);
            const response = await fetch(base_url + 'api/panditlists', {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            });
            const responseData = await response.json();
            if (responseData.status === 200) {
                // console.log("getAllPodcast-------", responseData.data);
                setSpinner(false);
                setAllPandit(responseData.data);
            }
        } catch (error) {
            console.log(error);
            setSpinner(false);
        }
    }

    useEffect(() => {
        if (isFocused) {
            getAllPandit();
        }
    }, [isFocused])

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => props.navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => props.navigation.goBack()}>
                            <Feather name="chevron-left" color={'#555454'} size={30} />
                        </TouchableOpacity>
                        <Text style={{ color: '#000', fontSize: 17, fontWeight: '500' }}>Back</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {spinner === true ?
                <View style={{ flex: 1, alignSelf: 'center', top: '30%' }}>
                    <Text style={{ color: '#ffcb44', fontSize: 17 }}>Loading...</Text>
                </View>
                :
                <ScrollView style={{ flex: 1 }}>
                    <View style={{ width: '96%', alignSelf: 'center', marginTop: 15 }}>
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            data={allPandit}
                            scrollEnabled={false}
                            numColumns={2}
                            keyExtractor={(key) => {
                                return key.id
                            }}
                            renderItem={(pandit) => {
                                return (
                                    <TouchableOpacity onPress={() => props.navigation.navigate('PanditDetails', pandit.item.slug)} style={{ width: '48%', marginHorizontal: 3, backgroundColor: '#fff', borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 13, elevation: 5, marginBottom: 20 }}>
                                        <View style={{ width: '100%', height: 120 }}>
                                            <Image source={{ uri: pandit.item.pandit_img_url }} style={styles.image1} />
                                            <TouchableOpacity style={{ position: 'absolute', top: 10, right: 12, backgroundColor: '#fff', width: 26, height: 26, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }}>
                                                <FontAwesome name="bookmark" color={'red'} size={16} />
                                            </TouchableOpacity>
                                            {typeof pandit.item.rating === 'number' ?
                                                <View style={{ position: 'absolute', bottom: 10, right: 12, backgroundColor: '#28a745', width: 45, height: 23, borderRadius: 6, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                                    <Feather name="star" color={'#fff'} size={13} />
                                                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold', marginLeft: 3 }}>
                                                        {parseFloat(pandit.item.rating).toFixed(1)}
                                                    </Text>
                                                </View>
                                                : null
                                            }
                                        </View>
                                        <View style={{ padding: 10, width: '96%', alignSelf: 'center', alignItems: 'flex-start' }}>
                                            <TouchableOpacity onPress={() => props.navigation.navigate('PanditDetails', pandit.item.slug)} style={{ width: '100%' }}>
                                                <Text style={{ color: '#000', fontSize: 15, fontWeight: '500', textTransform: 'capitalize' }}>{pandit.item.title} {pandit.item.name}</Text>
                                                <Text style={{ color: '#000', fontSize: 13, fontWeight: '300', textTransform: 'capitalize' }}>
                                                    {pandit.item.about_pandit.length > 40 ? `${pandit.item.about_pandit.slice(0, 40)}...` : pandit.item.about_pandit}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </TouchableOpacity>
                                )
                            }}
                        />
                    </View>
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
    header: {
        width: '100%',
        height: 58,
        backgroundColor: '#fff'
    },
    headerContent: {
        width: '95%',
        height: '100%',
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // backgroundColor:'yellow'
    },
    image1: {
        width: '100%',
        height: '100%',
        // aspectRatio: 1,
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        // marginHorizontal: 10,
    }
})