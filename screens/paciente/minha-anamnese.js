import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import Header from '../../components/geral/Header';

export default function ChatAnamnese() {
  const [mensagem, setMensagem] = useState('');
  const [conversa, setConversa] = useState([
    { id: '1', texto: 'Olá! 😊 Vomos começar sua anamnese?', remetente: 'bot' }
  ]);
  const [anamneseIniciada, setAnamneseIniciada] = useState(false);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const flatListRef = useRef(null);

  const iniciarAnamnese = () => {
    const mensagensIniciais = [
      {
        id: Date.now().toString(),
        texto: 'Essa conversa tem fins de acolhimento psicológico, e tudo o que você compartilhar será usado apenas para esse propósito.',
        remetente: 'bot'
      },
      {
        id: (Date.now() + 1).toString(),
        texto: 'Você concorda em compartilhar seus dados?',
        remetente: 'bot',
        tipo: 'pergunta'
      }
    ];
    setConversa(prev => [...prev, ...mensagensIniciais]);
    setAnamneseIniciada(true);
  };

  const handleRespostaInicial = (resposta) => {
    setConversa(prev => [
      ...prev,
      { id: Date.now().toString(), texto: resposta === 'sim' ? 'Sim' : 'Não', remetente: 'usuario' }
    ]);

    if (resposta === 'sim') {
      setAceitouTermos(true);
      fetch('http://localhost:5005/webhooks/rest/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sender: 'usuario', message: 'oi' })
      })
        .then(res => res.json())
        .then(data => {
          const mensagensRasa = data.map((msg, index) => ({
            id: Date.now().toString() + index,
            texto: msg.text,
            remetente: 'bot'
          }));
          setConversa(prev => [...prev, ...mensagensRasa]);
        });
    } else {
      setConversa(prev => [...prev, { id: Date.now().toString(), texto: 'Tudo bem, estaremos aqui quando precisar. 💙', remetente: 'bot' }]);
    }
  };

  const enviarMensagem = () => {
    if (mensagem.trim() === '') return;
    const novaMsg = { id: Date.now().toString(), texto: mensagem, remetente: 'usuario' };
    setConversa(prev => [...prev, novaMsg]);
    setMensagem('');

    fetch('http://localhost:5005/webhooks/rest/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sender: 'usuario', message: mensagem })
    })
      .then(res => res.json())
      .then(data => {
        const mensagensRasa = data.map((msg, index) => ({
          id: Date.now().toString() + index,
          texto: msg.text,
          remetente: 'bot'
        }));
        setConversa(prev => [...prev, ...mensagensRasa]);
      });
  };

  const renderMensagem = ({ item }) => (
    <View
      style={[
        styles.mensagem,
        item.remetente === 'bot' ? styles.mensagemBot : styles.mensagemUsuario,
      ]}
    >
      <Text style={styles.textoMensagem}>{item.texto}</Text>
      {item.tipo === 'pergunta' && !aceitouTermos && (
        <View style={styles.botoesResposta}>
          <TouchableOpacity onPress={() => handleRespostaInicial('sim')} style={styles.botaoResposta}>
            <Text style={styles.botaoTexto}>Sim</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleRespostaInicial('nao')} style={styles.botaoResposta}>
            <Text style={styles.botaoTexto}>Não</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <Header corFundo="#477BDE" />
      <Text style={styles.titulo}>Anamnese Psicológica</Text>

      <FlatList
        ref={flatListRef}
        data={conversa}
        renderItem={renderMensagem}
        keyExtractor={item => item.id}
        style={styles.chat}
        onContentSizeChange={() => {
            setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
            }, 100); // pequena pausa para garantir renderização completa
        }}
        onLayout={() => {
            setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }}
        />

      {aceitouTermos && (
        <View style={styles.footer}>
          <TextInput
            style={styles.input}
            placeholder="Digite sua mensagem..."
            placeholderTextColor="#888"
            value={mensagem}
            onChangeText={setMensagem}
          />
          <TouchableOpacity style={styles.botaoEnviar} onPress={enviarMensagem}>
            <Text style={styles.botaoTexto}>ENVIAR</Text>
          </TouchableOpacity>
        </View>
      )}

      {!anamneseIniciada && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.botaoIniciar} onPress={iniciarAnamnese}>
            <Text style={styles.botaoTexto}>Iniciar Anamnese</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  titulo: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    textAlign: 'center',
    color: '#1F2937',
    marginTop: 10,
    marginBottom: 8,
  },
  chat: {
    flex: 1,
    paddingHorizontal: 16,
  },
  mensagem: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  mensagemBot: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E7EB',
  },
  mensagemUsuario: {
    alignSelf: 'flex-end',
    backgroundColor: '#BFDBFE',
  },
  textoMensagem: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: '#111827',
  },
  footer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  botaoEnviar: {
    backgroundColor: '#477BDE',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  botaoIniciar: {
    backgroundColor: '#477BDE',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  botaoTexto: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#fff',
  },
  botoesResposta: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  botaoResposta: {
    backgroundColor: '#477BDE',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 10,
  },
});
