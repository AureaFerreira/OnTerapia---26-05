import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList
} from 'react-native';
import Header from '../../../components/geral/Header';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function ProntuarioPaciente() {
  const navigation = useNavigation();

  const registros = [
    {
      id: '1',
      data: '10/05/2025',
      titulo: 'Sessão 1 - Emoções Iniciais',
      descricao: 'Paciente expressou ansiedade diante de mudanças recentes na rotina.',
      emocao: 'Ansiedade',
      conduta: 'Técnicas de respiração e acolhimento foram utilizadas.'
    },
    {
      id: '2',
      data: '17/05/2025',
      titulo: 'Sessão 2 - Conflitos familiares',
      descricao: 'Foram explorados sentimentos de culpa e frustração no ambiente familiar.',
      emocao: 'Culpa',
      conduta: 'Aplicação de escuta ativa e ressignificação.'
    },
    {
      id: '3',
      data: '24/05/2025',
      titulo: 'Sessão 3 - Ansiedade e Medo',
      descricao: 'Paciente relatou episódios de medo intenso durante a noite.',
      emocao: 'Medo',
      conduta: 'Utilização de técnicas cognitivas para enfrentamento.'
    }
  ];

  const abrirRegistro = (item) => {
    navigation.navigate('Prontuario', {
      titulo: item.titulo,
      data: item.data,
      descricao: item.descricao,
      emocao: item.emocao,
      conduta: item.conduta
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.cardRegistro} onPress={() => abrirRegistro(item)}>
      <Ionicons name="document-text-outline" size={22} color="#4B5563" />
      <View style={styles.textoRegistro}>
        <Text style={styles.tituloRegistro}>{item.titulo}</Text>
        <Text style={styles.dataRegistro}>{item.data}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header corFundo="#f43f5e" />
      <Text style={styles.titulo}>Prontuário do Paciente</Text>

      {/* Card de Anamnese */}
      <TouchableOpacity style={styles.cardAnamnese}>
        <Ionicons name="clipboard-outline" size={24} color="#f43f5e" />
        <Text style={styles.textoAnamnese}>Visualizar Anamnese</Text>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      {/* Lista de registros */}
      <Text style={styles.subtitulo}>Registros de Sessões</Text>
      <FlatList
        data={registros}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/* Botão para nova sessão */}
      <TouchableOpacity style={styles.botaoNovaSessao}>
        <Ionicons name="add-circle-outline" size={20} color="#fff" />
        <Text style={styles.botaoTexto}>Nova Sessão</Text>
      </TouchableOpacity>
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
    marginBottom: 8,
  },
  cardAnamnese: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    elevation: 2,
    marginBottom: 12,
  },
  textoAnamnese: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#1F2937',
  },
  subtitulo: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#374151',
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 6,
  },
  cardRegistro: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
    elevation: 1,
  },
  textoRegistro: {
    flex: 1,
  },
  tituloRegistro: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: '#1F2937',
  },
  dataRegistro: {
    fontFamily: 'Poppins-Light',
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  botaoNovaSessao: {
    flexDirection: 'row',
    backgroundColor: '#f43f5e',
    marginHorizontal: 60,
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  botaoTexto: {
    fontFamily: 'Poppins-Bold',
    color: '#fff',
    fontSize: 15,
  },
});
