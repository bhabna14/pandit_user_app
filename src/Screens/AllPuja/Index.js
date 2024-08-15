import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, Dimensions, FlatList, Image } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useIsFocused } from '@react-navigation/native'
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const Index = (props) => {

  const content = [
    { id: 1, name: 'xyz', image: 'https://buffer.com/library/content/images/2023/10/free-images.jpg', offer: '70% off', specialization: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.' },
    { id: 2, name: 'xyz', image: 'https://buffer.com/library/content/images/2023/10/free-images.jpg', offer: '70% off', specialization: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.' },
    { id: 3, name: 'xyz', image: 'https://buffer.com/library/content/images/2023/10/free-images.jpg', offer: '70% off', specialization: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.' },
    { id: 4, name: 'xyz', image: 'https://buffer.com/library/content/images/2023/10/free-images.jpg', offer: '70% off', specialization: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.' },
    { id: 5, name: 'xyz', image: 'https://buffer.com/library/content/images/2023/10/free-images.jpg', offer: '70% off', specialization: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.' },
  ]

  const [spinner, setSpinner] = useState(false);
  const navigation = useNavigation();
  const screenWidth = Dimensions.get('window').width;
  const itemWidth = 0.6 * screenWidth;

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
              data={content}
              scrollEnabled={false}
              numColumns={2}
              keyExtractor={(key) => {
                return key.id
              }}
              renderItem={(content) => {
                return (
                  <TouchableOpacity onPress={() => props.navigation.navigate('PujaDetails')} style={styles.mostPPlrItem}>
                    <View style={{ width: '100%', height: 120, borderRadius: 10 }}>
                      <Image source={{ uri: content.item.image }} style={styles.mostPPImage} />
                      <View style={styles.hotBtm}>
                        <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>HOT</Text>
                      </View>
                      <TouchableOpacity style={styles.saveBtm}>
                        <FontAwesome name="bookmark-o" color={'#000'} size={16} />
                      </TouchableOpacity>
                    </View>
                    <View style={{ margin: 10, width: '90%', alignItems: 'flex-start', justifyContent: 'center' }}>
                      <TouchableOpacity style={{ width: '100%' }}>
                        <Text style={{ color: '#000', fontSize: 15, fontWeight: '500' }}>{content.item.name}</Text>
                      </TouchableOpacity>
                      {content.item.specialization &&
                        <Text style={{ color: '#000', fontSize: 13, fontWeight: '300' }}>{content?.item?.specialization?.split(', ').slice(0, 3).join(', ')}</Text>
                      }
                    </View>
                    {content.item.offer &&
                      <View style={{ marginTop: 6, marginBottom: 10, marginHorizontal: 10, alignItems: 'flex-start', flexDirection: 'row' }}>
                        <View style={{ backgroundColor: '#f00062', paddingHorizontal: 3, paddingVertical: 2, borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                          <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>OFFER</Text>
                        </View>
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ color: '#000', fontSize: 13, fontWeight: '400' }}>{content.item.offer}</Text>
                        </View>
                      </View>
                    }
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
    resizeMode: 'center'
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