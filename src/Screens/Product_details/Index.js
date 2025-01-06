import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import { base_url } from '../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';

const Index = (props) => {

  const navigation = useNavigation();
  const [packageDetails, setPackageDetails] = useState(null);

  useEffect(() => {
    setPackageDetails(props.route.params);
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerPart}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Feather name="chevron-left" color={'#555454'} size={30} />
          <Text style={styles.topHeaderText}>Product Details</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        {packageDetails?.flower_product?.product_image_url && (
          <Image source={{ uri: packageDetails?.flower_product?.product_image_url }} style={styles.image} />
        )}
        <Text style={{ color: '#000', fontFamily: 'Montserrat-Bold', fontSize: 17 }}>Name: {packageDetails?.flower_product?.name}</Text>
        <Text style={styles.text}>Description : {packageDetails?.flower_product?.description}</Text>
      </View>
      <View style={styles.card}>
        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#fae6e6', marginVertical: 2, padding: 5, borderRadius: 5 }}>
          <View style={{ width: '35%' }}>
            <Text style={{ color: '#000', fontSize: 14, fontWeight: 'bold' }}>Order Id:</Text>
          </View>
          <View style={{ width: '65%' }}>
            <Text style={{ color: '#000', fontSize: 14 }}>{packageDetails?.order_id}</Text>
          </View>
        </View>
        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#fae6e6', marginVertical: 2, padding: 5, borderRadius: 5 }}>
          <View style={{ width: '35%' }}>
            <Text style={{ color: '#000', fontSize: 14, fontWeight: 'bold' }}>Order Date:</Text>
          </View>
          <View style={{ width: '65%' }}>
            <Text style={{ color: '#000', fontSize: 14 }}>{moment(packageDetails?.subscription?.start_date).format('DD-MM-YYYY')}</Text>
          </View>
        </View>
        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#fae6e6', marginVertical: 2, padding: 5, borderRadius: 5 }}>
          <View style={{ width: '35%' }}>
            <Text style={{ color: '#000', fontSize: 14, fontWeight: 'bold' }}>Subscription Status:</Text>
          </View>
          <View style={{ width: '65%' }}>
            <Text style={{ color: '#000', fontSize: 14 }}>{packageDetails?.subscription?.status}</Text>
          </View>
        </View>
        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#fae6e6', marginVertical: 2, padding: 5, borderRadius: 5 }}>
          <View style={{ width: '35%' }}>
            <Text style={styles.price}>Price:</Text>
          </View>
          <View style={{ width: '65%' }}>
            <Text style={styles.price}>{packageDetails?.total_price}</Text>
          </View>
        </View>
      </View>
      {packageDetails?.address &&
        <View style={styles.card}>
          <Text style={styles.subtitle}>Address</Text>
          <Text style={styles.text}>{packageDetails?.address?.address_type}, {packageDetails?.address?.place_category}</Text>
          <Text style={styles.text}>{packageDetails?.address?.apartment_flat_plot}, {packageDetails?.address?.landmark}</Text>
          <Text style={styles.text}>{packageDetails?.address?.locality_details?.locality_name}, {packageDetails?.address?.city}</Text>
          <Text style={styles.text}>{packageDetails?.address?.state}, {packageDetails?.address?.pincode}</Text>
          <Text style={styles.text}>{packageDetails?.address?.country}</Text>
        </View>
      }
    </ScrollView>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
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
  card: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
    marginBottom: 5,
    elevation: 3,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#495057',
  },
  text: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 5,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
    // marginTop: 10,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: 'contain',
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
  submitButton: {
    width: '90%',
    alignSelf: 'center',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    elevation: 3,
    marginVertical: 10,
  },
  submitText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
