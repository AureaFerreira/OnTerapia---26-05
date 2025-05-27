import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function Header({ corFundo }) {
  const navigation = useNavigation();

  return (
    <View style={[styles.capa, { backgroundColor: corFundo }]}>
      <View style={styles.container}>
        <View style={{ flex: 1 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 20, justifyContent: 'center', alignItems: 'center' }}>
          <Image
            source={require('../../assets/logo-onterapia.png')}
            style={styles.imagem}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  capa: {
    width: '100%',
    height: 60,
    justifyContent: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 15,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  backButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagem: {
    width: 35,
    height: 35,
    marginTop: -10,
    resizeMode: 'contain',
  },
});
