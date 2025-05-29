import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Header from '../../../components/geral/Header';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function Declaracoes() {
  const navigation = useNavigation();

  const opcoes = [
    {
      tipo: 'atestado',
      titulo: 'Atestado de Comparecimento',
      icone: 'calendar-outline',
    },
    {
      tipo: 'servico',
      titulo: 'Declaração de Prestação de Serviço',
      icone: 'document-text-outline',
    },
    {
      tipo: 'animal',
      titulo: 'Declaração de Animal de Suporte',
      icone: 'paw-outline',
    }
  ];

  return (
    <View style={styles.container}>
      <Header corFundo="#f43f5e" />
      <Text style={styles.titulo}>Escolha o tipo de declaração</Text>

      <View style={styles.lista}>
        {opcoes.map((opcao) => (
          <TouchableOpacity
            key={opcao.tipo}
            style={styles.card}
            onPress={() => navigation.navigate('PreencherDeclaracao', { tipo: opcao.tipo })}
          >
            <Ionicons name={opcao.icone} size={32} color="#f43f5e" style={styles.icone} />
            <Text style={styles.tituloCard}>{opcao.titulo}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  titulo: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    textAlign: 'center',
    color: '#1F2937',
    marginVertical: 20,
  },
  lista: {
    paddingHorizontal: 20,
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff0f3',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  icone: {
    marginRight: 12,
  },
  tituloCard: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#1F2937',
  },
});
