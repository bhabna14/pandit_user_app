import { StyleSheet, Text, View, TextInput, TouchableOpacity, TouchableHighlight, SafeAreaView, Dimensions, FlatList, Image, ScrollView, Keyboard } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native'
import { base_url } from '../../../App';

const Index = (props) => {

    const navigation = useNavigation()
    const [spinner, setSpinner] = useState(false);
    const textInputRef = useRef(null);
    const [allPuja, setAllPuja] = useState([]);
    const [allPandit, setAllPandit] = useState([]);

    const searchingData = (e) => {
        console.log("calling searchingData", e)
        if (e.length > 0) {
            searchPujaOrPandit(e);
        } else {
            getAllDataForHomePage();
        }
    }

    const getAllDataForHomePage = async () => {
        try {
            setSpinner(true);
            const response = await fetch(base_url + 'api/homepage', {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            });
            const responseData = await response.json();
            if (responseData.status === 200) {
                // console.log("getAllData-------", responseData.data.section_02);
                setSpinner(false);
                setAllPandit(responseData.data.section_04.data);
                setAllPuja(responseData.data.section_02.data);
            }
        } catch (error) {
            console.log(error);
            setSpinner(false);
        }
    }

    const searchPujaOrPandit = async (e) => {
        try {
            setSpinner(true);
            const response = await fetch(`${base_url}api/search?searchTerm=${e}`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            });
            const responseData = await response.json();
            if (responseData.success === true) {
                // console.log("get Search Result-------", responseData);
                setSpinner(false);
                setAllPandit(responseData.date.pandits);
                setAllPuja(responseData.date.poojas);
            }
        } catch (error) {
            console.log(error);
            setSpinner(false);
        }
    }

    useEffect(() => {
        getAllDataForHomePage();
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                // Keyboard is open
                console.log('Keyboard is open');
            }
        );
        // Focus on TextInput when component mounts
        textInputRef.current.focus();
        return () => {
            keyboardDidShowListener.remove();
        };
    }, []);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={styles.searchBox}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', alignSelf: 'center', width: '95%' }}>
                    <TouchableOpacity onPress={() => props.navigation.goBack()} style={{ width: '12%' }}>
                        <Entypo name="chevron-left" color={'#ffcb44'} size={33} />
                    </TouchableOpacity>
                    <TextInput
                        ref={textInputRef}
                        style={styles.inputs}
                        onChangeText={searchingData}
                        type='text'
                        placeholder="Search for pooja or pandit"
                        placeholderTextColor="#888888"
                        underlineColorAndroid='transparent'
                    />
                </View>
            </View>
            {spinner === true ?
                <View style={{ flex: 1, alignSelf: 'center', top: '40%' }}>
                    <Text style={{ color: '#ffcb44', fontSize: 17 }}>Loading...</Text>
                </View>
                :
                <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                    {allPuja.length > 0 &&
                        <View style={{ width: '95%', alignSelf: 'center', marginTop: 13 }}>
                            <Text style={{ color: '#000', fontSize: 18, letterSpacing: 0.3, fontWeight: '600', marginLeft: 6 }}>Pooja</Text>
                            <View style={{ width: '100%', alignSelf: 'center', marginTop: 15 }}>
                                <FlatList
                                    showsVerticalScrollIndicator={false}
                                    data={allPuja}
                                    scrollEnabled={false}
                                    numColumns={2}
                                    keyExtractor={(key) => {
                                        return key.id
                                    }}
                                    renderItem={(content) => {
                                        return (
                                            <TouchableOpacity onPress={() => props.navigation.navigate('PujaDetails', content.item.slug)} style={styles.mostPPlrItem}>
                                                <View style={{ width: '100%', height: 120, borderRadius: 10 }}>
                                                    {content.item.pooja_img_url ?
                                                        <Image source={{ uri: content.item.pooja_img_url }} style={styles.mostPPImage} />
                                                        :
                                                        <Image source={{ uri: 'https://img.freepik.com/premium-vector/default-image-icon-vector-missing-picture-page-website-design-mobile-app-no-photo-available_87543-11093.jpg' }} style={styles.mostPPImage} />
                                                    }
                                                </View>
                                                <View style={{ margin: 10, width: '90%', alignItems: 'flex-start', justifyContent: 'center' }}>
                                                    <TouchableOpacity onPress={() => props.navigation.navigate('PujaDetails', content.item.slug)} style={{ width: '100%' }}>
                                                        <Text style={{ color: '#000', fontSize: 15, fontWeight: '500', textTransform: 'capitalize' }}>{content.item.pooja_name}</Text>
                                                    </TouchableOpacity>
                                                    {content.item.short_description &&
                                                        <Text style={{ color: '#000', fontSize: 13, fontWeight: '300', textTransform: 'capitalize' }}>{content.item.short_description.length > 40 ? `${content.item.short_description.substring(0, 40)}...` : content.item.short_description}</Text>
                                                    }
                                                </View>
                                            </TouchableOpacity>
                                        )
                                    }}
                                />
                            </View>
                        </View>
                    }
                    {allPandit.length > 0 &&
                        <View style={{ width: '95%', alignSelf: 'center', marginTop: 13 }}>
                            <Text style={{ color: '#000', fontSize: 18, letterSpacing: 0.3, fontWeight: '600', marginLeft: 6 }}>Pandit</Text>
                            <View style={{ width: '100%', alignSelf: 'center', marginTop: 15 }}>
                                <FlatList
                                    showsVerticalScrollIndicator={false}
                                    data={allPandit}
                                    scrollEnabled={false}
                                    numColumns={2}
                                    keyExtractor={(key) => {
                                        return key.id
                                    }}
                                    renderItem={(content) => {
                                        return (
                                            <TouchableOpacity onPress={() => props.navigation.navigate('PanditDetails', content.item.slug)} style={styles.mostPPlrItem}>
                                                <View style={{ width: '100%', height: 120, borderRadius: 10 }}>
                                                    <Image source={{ uri: content.item.profile_photo }} style={styles.mostPPImage} />
                                                    <TouchableOpacity style={styles.saveBtm}>
                                                        <FontAwesome name="bookmark-o" color={'#000'} size={16} />
                                                    </TouchableOpacity>
                                                </View>
                                                <View style={{ margin: 10, width: '90%', alignItems: 'flex-start', justifyContent: 'center' }}>
                                                    <TouchableOpacity onPress={() => props.navigation.navigate('PanditDetails', content.item.slug)} style={{ width: '100%' }}>
                                                        <Text style={{ color: '#000', fontSize: 15, fontWeight: '500', textTransform: 'capitalize' }}>{content.item.title} {content.item.name}</Text>
                                                    </TouchableOpacity>
                                                    {content.item.about_pandit &&
                                                        <Text style={{ color: '#000', fontSize: 13, fontWeight: '300', textTransform: 'capitalize' }}>{content.item.about_pandit.length > 40 ? `${content.item.about_pandit.substring(0, 40)}...` : content.item.about_pandit}</Text>
                                                    }
                                                </View>
                                                <View style={{ marginBottom: 10, marginHorizontal: 10, alignItems: 'flex-start', flexDirection: 'row' }}>
                                                    <View style={{ backgroundColor: '#f00062', paddingHorizontal: 3, paddingVertical: 2, borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                                                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>OFFER</Text>
                                                    </View>
                                                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                                        <Text style={{ color: '#000', fontSize: 13, fontWeight: '400' }}>70% off</Text>
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                        )
                                    }}
                                />
                            </View>
                        </View>
                    }
                </ScrollView>
            }
        </SafeAreaView>
    )
}

export default Index

const styles = StyleSheet.create({
    searchBox: {
        backgroundColor: '#fff',
        width: '95%',
        alignSelf: 'center',
        marginVertical: 10,
        // paddingHorizontal: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 13,
        elevation: 5
    },
    inputs: {
        height: 55,
        width: '88%',
        alignSelf: 'center',
        // marginLeft: 10,
        color: '#888888',
        fontSize: 17
    },
    mostPPlrItem: {
        backgroundColor: '#fff',
        width: '48%',
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
    hotBtm: {
        position: 'absolute',
        top: 10,
        left: 6,
        backgroundColor: '#f00062',
        padding: 2,
        borderRadius: 6
    },
    saveBtm: {
        position: 'absolute',
        top: 10,
        right: 6,
        backgroundColor: '#fff',
        width: 26,
        height: 26,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center'
    },
    ratedBtm: {
        position: 'absolute',
        bottom: 10,
        right: 6,
        backgroundColor: '#28a745',
        width: 45,
        height: 23,
        borderRadius: 6,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
})