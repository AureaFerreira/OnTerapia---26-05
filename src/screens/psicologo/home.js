// src/screens/psicologo/HomePsicologo.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, Entypo } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

// Importe o cliente Supabase do seu arquivo dedicado
import { supabase } from '../../supabaseClient'; // AJUSTE O CAMINHO CONFORME ONDE VOCÊ SALVOU supabaseClient.js

export default function HomePsicologo() {
  const navigation = useNavigation();

  const [isNotificationModalVisible, setNotificationModalVisible] = useState(false);
  const [notificationCount, setNotificationCount] = useState(2);
  const [userName, setUserName] = useState('...'); // Estado para o nome do usuário
  const [nextSession, setNextSession] = useState({
    patientName: 'Paciente Teste', // Pode ser buscado do Supabase também
    date: '27 de Maio',
    time: '21:00',
  });

  // Função para buscar o nome do usuário logado
  const fetchUserName = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error('Erro ao obter usuário:', userError.message);
        setUserName('Usuário'); // Fallback em caso de erro
        return;
      }

      if (user) {
        // Tenta buscar o nome da tabela 'Psicologo' primeiro
        const { data: psicologoData, error: psicologoError } = await supabase
          .from('Psicologo')
          .select('nome')
          .eq('id', user.id)
          .single();

        if (!psicologoError && psicologoData?.nome) {
          setUserName(psicologoData.nome.split(' ')[0]); // Pega apenas o primeiro nome
          return;
        }

        // Fallback para user_metadata (se o nome estiver lá)
        if (user.user_metadata?.name) {
          setUserName(user.user_metadata.name.split(' ')[0]);
          return;
        }

        // Último fallback para o email (antes do @)
        if (user.email) {
          setUserName(user.email.split('@')[0]);
          return;
        }
      }

      setUserName('Usuário'); // Fallback final se nenhuma opção encontrar
    } catch (error) {
      console.error('Erro ao buscar nome:', error.message);
      setUserName('Usuário');
    }
  };

  // useEffect para buscar o nome do usuário ao carregar e monitorar mudanças de autenticação
  useEffect(() => {
    fetchUserName(); // Busca o nome na montagem inicial

    // Listener para mudanças de autenticação (login, logout, etc.)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        fetchUserName(); // Busca o nome novamente se o usuário entrar ou na sessão inicial
      }
    });

    // Limpa o listener ao desmontar o componente
    return () => authListener?.subscription?.unsubscribe();
  }, []); // Array de dependências vazio para rodar apenas uma vez na montagem (e via listener)

  const toggleNotificationModal = () => {
    setNotificationModalVisible(!isNotificationModalVisible);
    if (notificationCount > 0) {
      setNotificationCount(0); // Zera as notificações quando o modal é aberto
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#f43f5e', '#dc2626']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
          {/* Logo no cabeçalho - CAMINHO CORRIGIDO */}
          <Image
            source={require('../../../assets/logo-onterapia.png')}
            style={styles.logo}
          />
          <TouchableOpacity onPress={toggleNotificationModal} style={styles.notificationIconContainer} activeOpacity={0.7}>
            <Ionicons name="notifications" size={24} color="white" />
            {notificationCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{notificationCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        {/* Usando o userName buscado do Supabase */}
        <Text style={styles.title}>Olá, {userName}!</Text>
        <Text style={styles.subtitle}>Pronto para a sessão?</Text>
      </LinearGradient>

      {/* Cards principais */}
      <View style={styles.cardContainer}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Pacientes')}
          activeOpacity={0.7}
        >
          <Ionicons name="people-circle-outline" size={28} color="#477BDE" />
          <Text style={styles.cardText}>Pacientes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Prontuarios')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="notebook-outline" size={28} color="#477BDE" />
          <Text style={styles.cardText}>Prontuários</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('EvolucaoCasos')}
          activeOpacity={0.7}
        >
          <FontAwesome5 name="chart-line" size={28} color="#477BDE" />
          <Text style={styles.cardText}>Evolução de Casos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('IniciarSessao')}
          activeOpacity={0.7}
        >
          <Ionicons name="videocam-outline" size={28} color="#477BDE" />
          <Text style={styles.cardText}>Iniciar Sessão</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('PersonalizarAnamnese')} // Mudei para cadastrar paciente
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={28} color="#477BDE" /> {/* Ícone de criar/editar */}
          <Text style={styles.cardText}>Cadastrar Paciente</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Declaracoes')}
          activeOpacity={0.7}
        >
          <Ionicons name="document-text-outline" size={28} color="#477BDE" />
          <Text style={styles.cardText}>Declarações</Text>
        </TouchableOpacity>
      </View>

      {/* Próxima sessão */}
      <View style={styles.sessionContainer}>
        <Text style={styles.sessionTitle}>Próxima sessão</Text>
        <TouchableOpacity style={styles.sessionCard} activeOpacity={0.7}>
          {/* Imagem do paciente na sessão - CAMINHO CORRIGIDO */}
          <Image
            source={require('../../../assets/logo-onterapia.png')} // Usando logo como placeholder
            style={styles.sessionImage}
          />
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionName}>{nextSession.patientName}</Text>
            <View style={styles.sessionTags}>
              <Entypo name="calendar" size={14} color="white" />
              <Text style={styles.sessionText}> {nextSession.date} • {nextSession.time}</Text>
            </View>
            <Text style={styles.sessionStars}>⭐ 5.0</Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={24}
            color="white"
            style={{ marginLeft: 'auto' }}
          />
        </TouchableOpacity>
      </View>

      {/* Modal de Notificação */}
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
            <Text style={styles.modalTitle}>Detalhes da Próxima Sessão</Text>
            <Text style={styles.modalText}>
              <Text style={{ fontFamily: 'Poppins-Bold' }}>Paciente:</Text> {nextSession.patientName}
            </Text>
            <Text style={styles.modalText}>
              <Text style={{ fontFamily: 'Poppins-Bold' }}>Data:</Text> {nextSession.date}
            </Text>
            <Text style={styles.modalText}>
              <Text style={{ fontFamily: 'Poppins-Bold' }}>Horário:</Text> {nextSession.time}
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={toggleNotificationModal} activeOpacity={0.7}>
              <Text style={styles.modalButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

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
    marginTop: 10,
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
    width: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    marginBottom: 15,
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    marginBottom: 8,
    textAlign: 'center',
    color: '#555',
  },
  modalButton: {
    backgroundColor: '#f43f5e',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 20,
  },
  modalButtonText: {
    color: 'white',
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
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
    backgroundColor: '#477BDE',
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