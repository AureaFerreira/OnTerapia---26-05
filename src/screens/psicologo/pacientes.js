import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Header from '../../../components/geral/Header';

export default function Pacientes() {
  return (
    <View style={styles.container}>
      <Header corFundo="#f43f5e" />
      <Text style={styles.titulo}>Pacientes</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  titulo: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 12,
  },
});
