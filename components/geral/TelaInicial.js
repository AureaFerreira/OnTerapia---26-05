import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

export default function TelaInicial() {
  const navigation = useNavigation();

  return (
    <LinearGradient
    colors={['#477BDE', '#a5b4fc', '#f43f5e']}
    style={styles.container}
    start={{ x: 0.1, y: 0 }}
    end={{ x: 0.9, y: 1 }}
    locations={[0, 0.5, 1]} // <- este é o segredo!
    >

      <Image
        source={require('../../assets/logo-onterapia.png')}
        style={styles.logo}
      />
      <Text style={styles.nomeApp}>OnTerapia</Text>
      <Text style={styles.title}>Escolha seu perfil</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#477BDE' }]}
          onPress={() => navigation.navigate('LoginPaciente')}
        >
          <Text style={styles.buttonText}>Paciente</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#f43f5e' }]}
          onPress={() => navigation.navigate('LoginPsicologo')}
        >
          <Text style={styles.buttonText}>Psicólogo</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  nomeApp: {
    fontFamily: 'Poppins-Bold',
    fontSize: 26,
    color: '#fff',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    marginBottom: 30,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
    fontSize: 16,
  },
});
