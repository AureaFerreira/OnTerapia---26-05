import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Header from '../../components/geral/Header';

export default function MinhasDeclaracoes() {
  return (
    <View style={styles.container}>
      <Header corFundo="#477BDE" />
      <Text style={styles.titulo}>Minhas Declarações</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  titulo: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    textAlign: 'center',
    color: '#1F2937',
    marginTop: 10,
  },
});
