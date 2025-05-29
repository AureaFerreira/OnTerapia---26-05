import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import Header from '../../../components/geral/Header';
import { useRoute } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function PreencherDeclaracao() {
  const route = useRoute();
  const { tipo } = route.params;

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('');

  const gerarHtml = () => {
    if (!nome || !cpf || !data || !horario) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return null;
    }

    const dataFormatada = new Date().toLocaleDateString('pt-BR');

    let corpo = '';
    if (tipo === 'atestado') {
      corpo = `
        <p style="text-align: justify; line-height: 1.6;">
          Declaro, para os devidos fins, que <strong>${nome}</strong>, CPF <strong>${cpf}</strong>,
          compareceu à sessão de atendimento psicológico no dia <strong>${data}</strong>, das <strong>${horario}</strong>.
        </p>
      `;
    } else if (tipo === 'servico') {
      corpo = `
        <p style="text-align: justify; line-height: 1.6;">
          Declaro que prestei atendimento psicológico ao(à) paciente <strong>${nome}</strong>, CPF <strong>${cpf}</strong>,
          no dia <strong>${data}</strong>, das <strong>${horario}</strong>.
        </p>
      `;
    } else if (tipo === 'animal') {
      corpo = `
        <p style="text-align: justify; line-height: 1.6;">
          Declaro que o(a) paciente <strong>${nome}</strong>, CPF <strong>${cpf}</strong>,
          encontra-se em acompanhamento psicológico e se beneficia do convívio com um animal de suporte emocional
          como parte do seu processo terapêutico.
        </p>
      `;
    }

    return `
      <html>
        <head><meta charset="utf-8" /></head>
        <body style="padding: 40px; font-family: Arial, sans-serif;">
          <h2 style="text-align: center; color: #f43f5e;">Declaração</h2>
          ${corpo}
          <br/><br/>
          <p style="text-align: right;">${dataFormatada}</p>
          <br/><br/>
          <p>Psicólogo(a): ______________________________________</p>
          <p>CRP: ____________</p>
        </body>
      </html>
    `;
  };

  const gerarPDF = async () => {
    const html = gerarHtml();
    if (!html) return;

    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#F3F4F6' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header corFundo="#f43f5e" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.titulo}>Gerar Declaração</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome do paciente</Text>
          <TextInput
            placeholder="Digite o nome completo"
            placeholderTextColor="#888"
            value={nome}
            onChangeText={setNome}
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>CPF do paciente</Text>
          <TextInput
            placeholder="Digite o CPF"
            placeholderTextColor="#888"
            value={cpf}
            onChangeText={setCpf}
            style={styles.input}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Data da sessão</Text>
          <TextInput
            placeholder="Ex: 14/05/2025"
            placeholderTextColor="#888"
            value={data}
            onChangeText={setData}
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Horário da sessão</Text>
          <TextInput
            placeholder="Ex: 14h às 15h"
            placeholderTextColor="#888"
            value={horario}
            onChangeText={setHorario}
            style={styles.input}
          />
        </View>

        <TouchableOpacity style={styles.botao} onPress={gerarPDF}>
          <Text style={styles.botaoTexto}>Gerar Declaração</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 14,
    backgroundColor: '#F3F4F6'
  },
  titulo: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    color: '#1F2937',
    marginBottom: 16
  },
  inputGroup: {
    marginBottom: 12
  },
  label: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#374151',
    marginBottom: 4
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    borderWidth: 1,
    borderColor: '#D1D5DB'
  },
  botao: {
    backgroundColor: '#477BDE',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20
  },
  botaoTexto: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: '#fff'
  }
});
