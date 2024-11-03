import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Image, ScrollView, FlatList } from 'react-native';
import React, { useState, useEffect } from 'react';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { base_url } from '../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginModal from '../../Component/LoginModal';

const PujaDetails = (props) => {

    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [spinner, setSpinner] = useState(false);
    const [activeTab, setActiveTab] = useState('panditList');
    const [pujaDetails, setPujaDetails] = useState({});
    const [panditList, setPanditList] = useState([]);
    const paragraphs = pujaDetails?.description?.split('\n');
    const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);

    const getPujaDetails = async () => {
        try {
            setSpinner(true);
            const response = await fetch(base_url + 'api/pooja/' + props.route.params, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            });
            const responseData = await response.json();
            if (responseData.status === 200) {
                // console.log("getPujaDetails-------", responseData.data);
                setSpinner(false);
                setPujaDetails(responseData.data.pooja);
                setPanditList(responseData.data.pandit_pujas);
            } else {
                console.log("Error -------", responseData);
            }
        } catch (error) {
            console.log(error);
            setSpinner(false);
        }
    }

    const goToCheckoutPage = async (pandit) => {
        var access_token = await AsyncStorage.getItem('storeAccesstoken');
        let puja_details = {
            pujaName: pujaDetails.pooja_name,
            pujaId: pujaDetails.id,
            panditName: pandit.profile.name,
            panditId: pandit.profile.id,
            panditImage: pandit.profile.profile_photo,
            pujaFee: pandit.pooja_fee,
            addvanceFee: (pandit.pooja_fee * 0.2).toFixed(2),
            poojaDate: pujaDetails.pooja_date
        }

        if (access_token) {
            // console.log("pandit Details", puja_details);
            navigation.navigate('Checkout', puja_details);
        }
        else {
            // navigation.navigate('Login');
            setIsLoginModalVisible(true);
        }
    }

    useEffect(() => {
        if (isFocused) {
            // console.log("Get Puja Slug by Props-=-=", props.route.params);
            getPujaDetails();
        }
    }, [isFocused])

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f0f0' }}>
            <LoginModal visible={isLoginModalVisible} onClose={() => setIsLoginModalVisible(false)} />
            <View style={styles.headerPart}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Feather name="chevron-left" color={'#555454'} size={30} />
                    <Text style={styles.topHeaderText}>Pooja Details</Text>
                </TouchableOpacity>
            </View>
            {spinner === true ?
                <View style={{ flex: 1, alignSelf: 'center', top: '30%' }}>
                    <Text style={{ color: '#ffcb44', fontSize: 17 }}>Loading...</Text>
                </View>
                :
                <ScrollView style={{ flex: 1 }}>
                    <View style={styles.topImgContainer}>
                        {pujaDetails?.pooja_photo &&
                            <Image style={{ width: '100%', height: '100%', resizeMode: 'cover' }} source={{ uri: pujaDetails.pooja_photo }} />
                        }
                        <LinearGradient colors={['transparent', '#000']} style={styles.gradient} />
                    </View>
                    <View style={{ width: '90%', alignSelf: 'center' }}>
                        <View style={{ marginTop: 10, width: '100%' }}>
                            <Text style={{ color: '#000', fontSize: 22, fontFamily: 'Montserrat-Bold', marginTop: 5 }}>{pujaDetails.pooja_name}</Text>
                            <Text style={{ color: '#585959', marginTop: 5, fontSize: 15, fontFamily: 'Roboto-Regular' }}>{pujaDetails.short_description}</Text>
                            {pujaDetails.pooja_date &&
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                                    <MaterialIcons name="date-range" color={'#c3272e'} size={25} />
                                    <Text style={{ color: '#c3272e', fontSize: 15, fontFamily: 'Roboto-Bold', marginLeft: 5 }}>{pujaDetails.pooja_date}</Text>
                                </View>
                            }
                        </View>
                    </View>
                    <View style={{ flex: 1, width: '90%', alignSelf: 'center' }}>
                        <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
                            <TouchableOpacity
                                style={activeTab === "panditList" ? styles.activeTabBtm : styles.tabBtm}
                                value="panditList"
                                onPress={() => setActiveTab('panditList')}
                            >
                                <Text style={activeTab === "panditList" ? styles.activeTabBtmText : styles.tabBtmText}>Pandit List</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={activeTab === "about" ? styles.activeTabBtm : styles.tabBtm}
                                value="about"
                                onPress={() => setActiveTab('about')}
                            >
                                <Text style={activeTab === "about" ? styles.activeTabBtmText : styles.tabBtmText}>About Pooja</Text>
                            </TouchableOpacity>
                        </View>
                        {activeTab === 'panditList' &&
                            <View style={{ flex: 1, marginTop: 8 }}>
                                <FlatList
                                    showsHorizontalScrollIndicator={false}
                                    data={panditList}
                                    scrollEnabled={false}
                                    keyExtractor={(key) => {
                                        return key.id
                                    }}
                                    renderItem={(content) => {
                                        return (
                                            <View style={styles.panditCard}>
                                                <TouchableOpacity onPress={() => props.navigation.navigate('PanditDetails', content?.item?.profile?.slug)} style={{ width: '47%', height: '100%', borderRadius: 10 }}>
                                                    <Image source={{ uri: content?.item?.profile?.profile_photo }} style={styles.panditImg} />
                                                    {/* <View style={styles.ratedBtm}>
                                                        <Feather name="star" color={'#fff'} size={13} />
                                                        <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold', marginLeft: 3 }}>3.4</Text>
                                                    </View> */}
                                                </TouchableOpacity>
                                                <View style={{ width: '51%' }}>
                                                    <View style={{ margin: 10, width: '90%', alignItems: 'flex-start', justifyContent: 'center' }}>
                                                        <TouchableOpacity onPress={() => props.navigation.navigate('PanditDetails', content?.item?.profile?.slug)}>
                                                            <Text style={{ color: '#000', fontSize: 16, fontWeight: '500', marginBottom: 5, textTransform: 'capitalize' }}>{content?.item?.profile?.name}</Text>
                                                        </TouchableOpacity>
                                                        <Text style={{ color: '#000', fontSize: 13, fontWeight: '500', marginBottom: 2 }}>Total RS. {content?.item?.pooja_fee}</Text>
                                                        <Text style={{ color: '#000', fontSize: 13, fontWeight: '500', marginBottom: 2 }}>Addvance RS. {(content?.item?.pooja_fee * 0.2).toFixed(2)}</Text>
                                                        <Text style={{ color: '#000', fontSize: 13, fontWeight: '500', marginBottom: 5 }}>Total Time. {content?.item?.pooja_duration}</Text>
                                                        <TouchableOpacity onPress={() => goToCheckoutPage(content?.item)} style={{ backgroundColor: '#c3272e', padding: 10, alignSelf: 'center', alignItems: 'center', width: '100%', borderRadius: 8 }}>
                                                            <Text style={{ color: '#fff' }}>Book Pandit</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            </View>
                                        )
                                    }}
                                />
                            </View>
                        }
                        {activeTab === 'about' &&
                            <View style={{ flex: 1, marginTop: 8 }}>
                                <View style={styles.descriptionContainer}>
                                    {paragraphs?.map((paragraph, index) => (
                                        <Text
                                            key={index}
                                            style={index === 0 ? styles.firstParagraph : styles.paragraph}
                                        >
                                            {paragraph}
                                        </Text>
                                    ))}
                                </View>
                            </View>
                        }
                    </View>
                </ScrollView>
            }
        </SafeAreaView>
    );
};

export default PujaDetails;

const styles = StyleSheet.create({
    headerPart: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 13,
        paddingHorizontal: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 13,
        elevation: 5,
    },
    topHeaderText: {
        color: '#000',
        fontSize: 18,
        fontWeight: '500',
        marginBottom: 3,
        marginLeft: 5,
    },
    topImgContainer: {
        width: '100%',
        height: 270,
        backgroundColor: 'red'
    },
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 100,
        bottom: 0,
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
    panditCard: {
        backgroundColor: '#fff',
        width: '100%',
        // height: 165,
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
        padding: 6
    },
    panditImg: {
        // height: '100%',
        // width: '100%',
        flex: 1,
        borderRadius: 10,
        resizeMode: 'cover'
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
    descriptionContainer: {
        marginVertical: 10,
    },
    firstParagraph: {
        color: '#585959',
        fontSize: 15,
        fontFamily: 'Roboto-Regular',
        letterSpacing: 0.5,
        lineHeight: 18,
    },
    paragraph: {
        color: '#585959',
        fontSize: 15,
        fontFamily: 'Roboto-Regular',
        letterSpacing: 0.5,
        lineHeight: 18,
        marginTop: 0, // Add space above each subsequent paragraph
    }
});
