import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import Header from '../../../components/geral/Header';
import { useRoute } from '@react-navigation/native';

export default function VisualizarAnamnese() {
  const route = useRoute();
  const { codigo, nome } = route.params;
  const [respostas, setRespostas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const buscarRespostas = async () => {
      try {
        const res = await fetch('http://localhost:5005/webhooks/rest/webhook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender: 'visualizar_resposta_' + Date.now(),
            message: `/ver_resposta_anamnese{"codigo":"${codigo}"}`
          })
        });

        const json = await res.json();
        const respostaBot = json.find(m => m?.custom?.respostas);
        if (respostaBot) {
          setRespostas(respostaBot.custom.respostas);
        }
      } catch (error) {
        console.error('Erro ao buscar anamnese:', error);
      } finally {
        setCarregando(false);
      }
    };

    buscarRespostas();
  }, [codigo]);

  return (
    <View style={styles.container}>
      <Header corFundo="#f43f5e" />
      <Text style={styles.titulo}>Anamnese de {nome}</Text>
      {carregando ? (
        <ActivityIndicator size="large" color="#f43f5e" style={{ marginTop: 20 }} />
      ) : (
        <ScrollView style={styles.conteudo}>
          {respostas.map((r, index) => (
            <View key={index} style={styles.bloco}>
              <Text style={styles.cabecalho}>{r.pergunta}</Text>
              <Text style={styles.texto}>{r.resposta}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7'
  },
  titulo: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  conteudo: {
    padding: 16,
  },
  bloco: {
    backgroundColor: '#fef2f7',
    borderLeftWidth: 5,
    borderLeftColor: '#f43f5e',
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
  },
  cabecalho: {
    color: '#f43f5e',
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    marginBottom: 4,
  },
  texto: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#374151',
  },
});