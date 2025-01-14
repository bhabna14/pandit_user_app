import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, TextInput, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import DatePicker from 'react-native-date-picker';
import { base_url } from '../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

const Index = (props) => {

  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [packageDetails, setPackageDetails] = useState(null);

  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() + 1)));
  const [endDate, setEndDate] = useState(new Date(new Date().setDate(new Date().getDate() + 1)));
  const [openStartDatePicker, setOpenStartDatePicker] = useState(false);
  const [openEndDatePicker, setOpenEndDatePicker] = useState(false);

  const submitPauseDates = async () => {
    const access_token = await AsyncStorage.getItem('storeAccesstoken');
    try {
      const response = await fetch(`${base_url}api/subscription/pause/${packageDetails.order_id}`, {
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
        // Alert.alert('Success', data.message);
        navigation.goBack();
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
    }
  };

  useEffect(() => {
    setPackageDetails(props.route.params);
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerPart}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Feather name="chevron-left" color={'#555454'} size={30} />
          <Text style={styles.topHeaderText}>Flower Details</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        {packageDetails?.flower_product?.product_image_url && (
          <Image source={{ uri: packageDetails?.flower_product?.product_image_url }} style={styles.image} />
        )}
        <Text style={{ color: '#000', fontFamily: 'Montserrat-Bold', fontSize: 17 }}>Name: {packageDetails?.flower_product?.name}</Text>
        {packageDetails?.flower_product?.category === "Subscription" ?
        <Text style={styles.text}>Description : {packageDetails?.flower_product?.description}</Text>
        :
        <Text style={styles.text}>Flower Name : {packageDetails?.description}</Text>
        }
        {packageDetails?.flower_product?.category === "Subscription" ?
          <Text style={styles.price}>Price: <Text style={{ fontSize: 16 }}>₹{packageDetails?.total_price}</Text></Text>
          :
          packageDetails?.order === null ?
            <Text style={styles.price}>Price: <Text style={{ fontSize: 16 }}>{packageDetails?.flower_product?.immediate_price}</Text></Text>
            :
            <Text style={styles.price}>Price: <Text style={{ fontSize: 16 }}>₹{packageDetails?.order?.total_price}</Text></Text>
        }
        {packageDetails?.flower_product?.category === "Subscription" ?
          <Text style={[styles.text, { marginTop: 5 }]}>Date: <Text style={{ color: '#000' }}>{packageDetails?.subscription?.start_date} to {packageDetails?.subscription?.end_date}</Text></Text>
          :
          packageDetails?.date && <Text style={[styles.text, { marginTop: 5 }]}>Date: <Text style={{ color: '#000' }}>{packageDetails?.date}</Text></Text>
        }
      </View>

      <View style={styles.card}>
        <Text style={styles.subtitle}>Address</Text>
        <Text style={styles.text}>{packageDetails?.address?.address_type}</Text>
        <Text style={styles.text}>{packageDetails?.address?.area}</Text>
        <Text style={styles.text}>
          {packageDetails?.address?.city}, {packageDetails?.address?.state}, {packageDetails?.address?.pincode}
        </Text>
        <Text style={styles.text}>{packageDetails?.address?.country}</Text>
      </View>
      {packageDetails?.flower_product.category === "Subscription" &&
        <View style={styles.card}>
          {packageDetails.subscription.status !== "paused" ?
            <View>
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

              <TouchableOpacity style={styles.dateButton} onPress={submitPauseDates}>
                <Text style={styles.dateText}>Submit</Text>
              </TouchableOpacity>
            </View>
            :
            <Text style={{ color: '#c9170a', fontSize: 17, fontFamily: 'Montserrat-ExtraBold' }}>Your subscription is paused from {moment(packageDetails.subscription.pause_start_date).format('DD-MM-YYYY')} to {moment(packageDetails.subscription.pause_end_date).format('DD-MM-YYYY')}</Text>
          }
        </View>
      }
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
    marginTop: 10,
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
});
