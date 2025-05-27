// src/screens/LinkScreen.js

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get('window').width;

export default function LinkScreen({ navigation, route }) {
  const { role } = route.params;

  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hour = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');

  const displayDate = `${day}/${month}/${year}`;
  const displayTime = `${hour}:${min}`;

  const sessionName = `Sessao-${day}${month}${String(year).slice(-2)}_${hour}${min}`;
  const roomName = sessionName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\-_\.]/g, '-')
    .toLowerCase();

  const teleconsultaLink = `https://meet.jit.si/${roomName}`;

  const startCall = () => {
    navigation.navigate('VideoCall', { roomName, role });
  };

  const shareLinkViaWhatsApp = () => {
    const message = `Olá! Sua sessão de teleconsulta OnTerapia está agendada. Entre no link: ${teleconsultaLink}`;
    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;

    Linking.canOpenURL(whatsappUrl)
      .then(supported => {
        if (supported) {
          Linking.openURL(whatsappUrl);
        } else {
          Alert.alert('Erro', 'WhatsApp não está instalado no dispositivo.');
        }
      })
      .catch(err => console.error('Erro ao abrir WhatsApp', err));
  };

  const sendSessionToPatient = async () => {
    const sessionData = {
      psychologistName: 'Seu Nome (Psicólogo)',
      date: displayDate,
      time: displayTime,
      teleconsultaLink,
      roomName,
    };
    try {
      await AsyncStorage.setItem('patientNextSession', JSON.stringify(sessionData));
      Alert.alert('Sucesso', 'Sessão enviada para o paciente! Ele verá a notificação ao abrir o app.');
    } catch (e) {
      console.error('Erro ao salvar sessão para paciente:', e);
      Alert.alert('Erro', 'Não foi possível enviar a sessão para o paciente.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header com degradê, ocupa toda largura */}
      <LinearGradient colors={['#4B7BE5', '#2563eb']} style={styles.headerGradient}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sessão</Text>
          {/* Espaço vazio igual largura do botão voltar para centralizar título */}
          <View style={styles.backButton} />
        </View>
      </LinearGradient>

      <View style={styles.contentArea}>
        <Text style={styles.greetingHeader}>{`Olá, ${role}!`}</Text>

        {role === 'Paciente' && (
          <Text style={styles.sessionInfo}>
            {`Sessão ${displayDate} às ${displayTime}`}
          </Text>
        )}

        <View style={styles.linkContainer}>
          <Text style={styles.linkLabel}>Link da Sessão</Text>
          <Text
            style={styles.linkText}
            selectable
            onPress={() => Linking.openURL(teleconsultaLink)}
          >
            {teleconsultaLink}
          </Text>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, styles.buttonWhatsApp]}
            onPress={shareLinkViaWhatsApp}
            activeOpacity={0.85}
          >
            <Ionicons name="logo-whatsapp" size={24} color="#fff" style={{ marginRight: 10 }} />
            <Text style={[styles.buttonText, styles.whatsappText]}>
              Enviar Link (WhatsApp)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSolid]}
            onPress={startCall}
            activeOpacity={0.85}
          >
            <Ionicons name="videocam" size={24} color="#fff" style={{ marginRight: 10 }} />
            <Text style={[styles.buttonText, styles.solidText]}>
              Iniciar Consulta
            </Text>
          </TouchableOpacity>
        </View>

        {role === 'Psicólogo' && (
          <TouchableOpacity
            style={styles.sendToPatientButton}
            onPress={sendSessionToPatient}
            activeOpacity={0.85}
          >
            <Ionicons name="send" size={24} color="#fff" style={{ marginRight: 12 }} />
            <Text style={styles.sendToPatientText}>Enviar Sessão para Paciente</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
    paddingHorizontal: 20,
  },
  headerGradient: {
     paddingTop: 52,
    paddingBottom: 20,
    paddingHorizontal: 0, // já tem padding no container
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 10,
    alignItems: 'center',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40, // largura fixa para espaço e alinhamento central do título
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 23,
    fontWeight: '700',
    color: 'white',
    fontFamily: 'Poppins-Bold',
    letterSpacing: 1,
    textAlign: 'center',
    flex: 1,
  },
  contentArea: {
    flex: 1,
    paddingTop: 32,
  },
  greetingHeader: {
    fontSize: 31,
    fontWeight: '800',
    textAlign: 'center',
    color: '#1B1B1F',
    marginBottom: 22,
    fontFamily: 'Poppins-Bold',
  },
  sessionInfo: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 38,
    color: '#2563eb',
    fontFamily: 'Poppins-Regular',
  },
  linkContainer: {
    backgroundColor: '#fff',
    paddingVertical: 22,
    paddingHorizontal: 26,
    borderRadius: 18,
    marginBottom: 44,
    elevation: 9,
    shadowColor: '#2b6cb0',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 7 },
    shadowRadius: 14,
    borderWidth: 1,
    borderColor: '#d1d9e6',
  },
  linkLabel: {
    fontSize: 15,
    color: '#7b8bbf',
    marginBottom: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    letterSpacing: 0.5,
  },
  linkText: {
    fontSize: 18,
    color: '#2563eb',
    fontWeight: '700',
    textDecorationLine: 'underline',
    fontFamily: 'Poppins-Bold',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  button: {
    flex: 0.48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 7,
  },
  buttonWhatsApp: {
    backgroundColor: '#25D366',
    paddingHorizontal: 32,
  },
  whatsappText: {
    color: '#fff',
    fontWeight: '700',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
  buttonSolid: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Poppins-SemiBold',
  },
  solidText: {
    color: '#fff',
  },
  sendToPatientButton: {
    flexDirection: 'row',
    backgroundColor: '#33b864',
    paddingVertical: 18,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 7,
    shadowColor: '#2ecc71',
    shadowOpacity: 0.38,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 11,
    paddingHorizontal: 24,
    marginTop: 10,
  },
  sendToPatientText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Poppins-SemiBold',
  },
});
