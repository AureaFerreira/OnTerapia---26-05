// src/screens/psicologo/iniciar-sessao.js
import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native'; // Adicionado Text para um placeholder simples

export default function IniciarSessao({ navigation }) {
  useEffect(() => {
    // Ao montar a tela, navegue para LinkScreen
    // Você pode passar os parâmetros necessários aqui, como 'role'
    navigation.replace('LinkScreen', { role: 'Psicólogo' });
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Você pode colocar um ActivityIndicator ou uma mensagem de carregamento aqui, se desejar */}
      <Text style={styles.loadingText}>Preparando sua sessão...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFF',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
});