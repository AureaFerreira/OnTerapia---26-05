import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function LoginPsicologo() {
  const navigation = useNavigation();
  const [emailOuCrm, setEmailOuCrm] = useState('');
  const [senha, setSenha] = useState('');

  const handleEntrar = () => {
    if (emailOuCrm.trim() !== '' && senha.trim() !== '') {
      navigation.navigate('HomePsicologo');
    } else {
      alert('Preencha os dados corretamente.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Botão de voltar */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#fff" />
      </TouchableOpacity>

      <Image
        source={require('../../assets/logo-onterapia.png')}
        style={styles.logo}
      />
      <Text style={styles.title}>OnTerapia</Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor="#aaa"
        value={emailOuCrm}
        onChangeText={setEmailOuCrm}
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#aaa"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleEntrar}
      >
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => alert('Redirecionar para cadastro')}>
        <Text style={styles.cadastroText}>Cadastrar-se</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f43f5e',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: '#fff',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#fff',
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#be123c',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
  },
  buttonText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
    fontSize: 16,
  },
  cadastroText: {
    fontFamily: 'Poppins-Regular',
    color: '#fff',
    fontSize: 14,
    marginTop: 10,
    textDecorationLine: 'underline',
  },
});