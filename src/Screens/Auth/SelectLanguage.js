import { StyleSheet, Text, View, SafeAreaView, ImageBackground, Image, FlatList, TouchableOpacity, TouchableHighlight, Dimensions } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const SelectLanguage = () => {

  const navigation = useNavigation();
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  const LanguageList = [
    { ID: '1', Name: 'English' },
    { ID: '2', Name: 'ଓଡ଼ିଆ' },
  ];

  const handleLanguageSelect = (languageId) => {
    setSelectedLanguage(languageId);
  }

  const pressHandler = () => {
    if (selectedLanguage != null) {
      navigation.navigate('Login');
    }
    else {
      alert('Please Select Your Language')
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ImageBackground
          source={require('../../assets/images/Background.png')}
          style={{
            flex: 1, justifyContent: 'center', alignItems: 'center',
            height: '100%', width: '100%'
          }}>
          <Image
            source={require('../../assets/images/whitelogo.png')}
            style={styles.icon}
          />
          <Text
            style={{
              fontSize: 20,
              color: '#FFFFFF',
              fontFamily: 'okra',
              fontWeight: '500',
            }}>
            Select Your Language
          </Text>
        </ImageBackground>
      </View>

      <FlatList
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flex: 1,
          backgroundColor: '#F3F3F3',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column'
        }}
        numColumns={2}
        data={LanguageList}
        keyExtractor={item => item.ID}
        renderItem={({ item }) => (
          <Card style={[styles.card, selectedLanguage === item.ID && styles.selectedCard]}>
            <TouchableHighlight
              activeOpacity={0.5}
              underlayColor="#c80100"
              onPress={() => handleLanguageSelect(item.ID)}
              style={{
                height: height / 5,
                width: width / 2.5,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 20,
                backgroundColor: selectedLanguage === item.ID ? '#c80100' : '#f5f5f5',
              }}>
              <Text
                style={{
                  color: selectedLanguage === item.ID ? '#FFFFFF' : '#353535',
                  fontSize: 25,
                  fontFamily: 'orka',
                  fontWeight: '500',
                }}>
                {item.Name}
              </Text>
            </TouchableHighlight>
          </Card>
        )}
      />

      <View style={styles.bottom}>
        <TouchableOpacity style={styles.button} onPress={pressHandler}>
          <Text style={styles.buttonText}>SUBMIT</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default SelectLanguage

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F3F3',
    height: height,
    width: width,
  },
  card: {
    justifyContent: 'center',
    alignItems: 'center',
    height: height / 5,
    width: width / 2.5,
    backgroundColor: 'transparent',
    borderRadius: 20,
    marginBottom: 25,
    marginHorizontal: 15,
    marginVertical: 5,
    shadowOffset: { height: 10, width: 10 },
    shadowOpacity: 0.3,
    shadowColor: 'black',
    shadowRadius: 5,
    elevation: 5,
  },
  selectedCard: {
    backgroundColor: '#c80100',
  },
  header: {
    flex: 0.5,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#c80100',
  },
  bottom: {
    flex: 0.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    padding: 10,
    height: 45,
    width: 150,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: '#c80100',
    borderRadius: 100,
    alignItems: 'center',
    shadowOffset: { height: 10, width: 10 },
    shadowOpacity: 0.6,
    shadowColor: 'black',
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#ffffff',
    fontFamily: 'Titillium Web',
  },
  icon: {
    width: 110,
    height: 110,
    resizeMode: 'contain',
    marginTop: 25
  },
})