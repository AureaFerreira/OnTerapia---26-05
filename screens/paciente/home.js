// src/screens/HomePaciente.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, Linking, Alert } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5, Entypo } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomePaciente() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [isNotificationModalVisible, setNotificationModalVisible] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [nextSession, setNextSession] = useState(null);

  useEffect(() => {
    const loadSession = async () => {
      console.log("HomePaciente: Tela focada. Tentando carregar sessão...");
      try {
        const storedSession = await AsyncStorage.getItem('patientNextSession');
        console.log("HomePaciente: Valor lido do AsyncStorage:", storedSession);

        if (storedSession) {
          const sessionData = JSON.parse(storedSession);
          console.log("HomePaciente: Dados da sessão parseados:", sessionData);
          
          setNextSession(sessionData);
          setNotificationCount(1);
          setNotificationModalVisible(true);
          
          console.log("HomePaciente: Sessão carregada e modal visível. Removendo do AsyncStorage...");
          await AsyncStorage.removeItem('patientNextSession'); 
        } else {
          console.log("HomePaciente: Nenhuma sessão encontrada no AsyncStorage.");
          setNextSession(null);
          setNotificationCount(0);
        }
      } catch (e) {
        console.error('HomePaciente: Erro ao carregar ou parsear sessão do paciente:', e);
      }
    };

    if (isFocused) {
      loadSession();
    }
  }, [isFocused]);

  const toggleNotificationModal = () => {
    setNotificationModalVisible(!isNotificationModalVisible);
    if (notificationCount > 0) {
      setNotificationCount(0); 
    }
  };

  const joinCall = () => {
    if (nextSession && nextSession.teleconsultaLink) {
      Linking.openURL(nextSession.teleconsultaLink).catch(err => 
        Alert.alert('Erro ao abrir link', 'Não foi possível abrir o link da consulta. Verifique sua conexão ou tente novamente.')
      );
    } else {
      Alert.alert('Erro', 'Link da consulta não disponível.');
    }
    toggleNotificationModal();
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#477BDE', '#2563eb']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity><Image source={require('../../assets/logo-onterapia.png')} style={styles.logo} /><TouchableOpacity onPress={toggleNotificationModal} style={styles.notificationIconContainer} activeOpacity={0.7}>
            <Ionicons name="notifications" size={24} color="white" />
            {notificationCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{notificationCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>Olá!</Text>
        <Text style={styles.subtitle}>Pronto para a sessão?</Text>
      </LinearGradient>

      <View style={styles.cardContainer}>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('MinhasSessoes')} activeOpacity={0.7}>
          <FontAwesome5 name="heart" size={28} color="#f43f5e" />
          <Text style={styles.cardText}>Minhas Sessões</Text>
        </TouchableOpacity><TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ChatAnamnese')} activeOpacity={0.7}>
          <MaterialIcons name="psychology" size={28} color="#f43f5e" />
          <Text style={styles.cardText}>Minha Anamnese</Text>
        </TouchableOpacity><TouchableOpacity style={styles.card} onPress={() => navigation.navigate('MeusAgendamentos')} activeOpacity={0.7}>
          <Ionicons name="calendar-outline" size={28} color="#f43f5e" />
          <Text style={styles.cardText}>Meus Agendamentos</Text>
        </TouchableOpacity><TouchableOpacity style={styles.card} onPress={() => navigation.navigate('MinhasDeclaracoes')} activeOpacity={0.7}>
          <Ionicons name="document-text-outline" size={28} color="#f43f5e" />
          <Text style={styles.cardText}>Minhas Declarações</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sessionContainer}>
        <Text style={styles.sessionTitle}>Próxima sessão</Text>
        <TouchableOpacity style={styles.sessionCard} activeOpacity={0.7}>
          <Image source={require('../../assets/logo-onterapia.png')} style={styles.sessionImage} />
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionName}>Dr. Psicólogo</Text>
            <View style={styles.sessionTags}>
              <MaterialIcons name="person" size={14} color="white" />
              <Text style={styles.sessionText}> Terapeuta  •  Online</Text>
            </View>
            <Text style={styles.sessionStars}>⭐ 5.0</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="white" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
      </View>

      {/* Modal de Notificação para Paciente (agora dinâmico) */}
      {nextSession && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={isNotificationModalVisible}
          onRequestClose={toggleNotificationModal}
        >
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPressOut={toggleNotificationModal}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Sua Próxima Sessão</Text>
              <Text style={styles.modalText}>
                <Text style={{ fontFamily: 'Poppins-Bold' }}>Psicólogo:</Text> {nextSession.psychologistName}
              </Text>
              <Text style={styles.modalText}>
                <Text style={{ fontFamily: 'Poppins-Bold' }}>Data:</Text> {nextSession.date}
              </Text>
              <Text style={styles.modalText}>
                <Text style={{ fontFamily: 'Poppins-Bold' }}>Horário:</Text> {nextSession.time}
              </Text>
              <Text 
                style={[styles.modalText, styles.modalLinkText]} 
                onPress={() => Linking.openURL(nextSession.teleconsultaLink)}
              >
                {nextSession.teleconsultaLink}
              </Text>
              <TouchableOpacity style={styles.modalButton} onPress={joinCall} activeOpacity={0.7}>
                <Text style={styles.modalButtonText}>Entrar na Consulta</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalCloseButton]} onPress={toggleNotificationModal} activeOpacity={0.7}>
                <Text style={styles.modalCloseButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTop: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  logo: {
    width: 36,
    height: 36,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: 'white',
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  card: {
    width: '42%',
    height: 120,
    backgroundColor: 'white',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardText: {
    marginTop: 10,
    fontFamily: 'Poppins-Bold',
    color: '#1f2937',
    textAlign: 'center',
    fontSize: 14,
  },
  sessionContainer: {
    marginHorizontal: 20,
  },
  sessionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    marginBottom: 10,
    color: '#111827',
  },
  sessionCard: {
    backgroundColor: '#89CC24',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sessionImage: {
    width: 55,
    height: 55,
    borderRadius: 28,
    marginRight: 15,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionName: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: 'white',
  },
  sessionTags: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  sessionText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: 'white',
    marginLeft: 5,
  },
  sessionStars: {
    fontSize: 14,
    marginTop: 4,
    color: 'white',
    fontFamily: 'Poppins-Regular',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    width: '85%',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    marginBottom: 8,
    textAlign: 'center',
    color: '#555',
  },
  modalLinkText: {
    color: '#477BDE',
    textDecorationLine: 'underline',
    marginTop: 10,
    marginBottom: 15,
  },
  modalButton: {
    backgroundColor: '#477BDE',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 15,
    width: '80%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
  },
  modalCloseButton: {
    backgroundColor: '#eee',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  modalCloseButtonText: {
    color: '#555',
  },
  notificationIconContainer: {
    position: 'relative',
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
  },
});
