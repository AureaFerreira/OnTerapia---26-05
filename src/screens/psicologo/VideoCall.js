// src/screens/VideoCall.js
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Alert,
  ActivityIndicator,
  Linking,
  Text,
  TouchableOpacity,
  ScrollView, // Importar ScrollView
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons'; // Importar Ionicons para o ícone de voltar

export default function VideoCall({ route, navigation }) {
  const { roomName, role } = route.params;
  const webviewRef = useRef(null);

  const [checking, setChecking] = useState(true);
  const [granted, setGranted] = useState(false); // Permissões do APP (Câmera/Microfone)
  const [acceptedTerms, setAccepted] = useState(false); // Termos de gravação

  // 1. Solicitação de Permissões do Android (Câmera e Microfone)
  useEffect(() => {
    (async () => {
      console.log("App: Iniciando verificação de permissões Android...");
      if (Platform.OS === 'android') {
        try {
          const res = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          ]);
          const cameraGranted = res[PermissionsAndroid.PERMISSIONS.CAMERA] === 'granted';
          const audioGranted = res[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === 'granted';

          if (!cameraGranted || !audioGranted) {
            console.log("App: Permissões de câmera/microfone negadas pelo usuário.");
            Alert.alert(
              'Permissões Necessárias',
              'Para a teleconsulta, precisamos acessar sua câmera e microfone. Por favor, conceda as permissões nas configurações do aplicativo.',
              [
                { text: 'Cancelar', onPress: () => navigation.goBack(), style: 'cancel' },
                { text: 'Configurações', onPress: () => Linking.openSettings() },
              ],
              { cancelable: false }
            );
            setGranted(false);
          } else {
            console.log("App: Permissões de câmera/microfone concedidas pelo usuário.");
            setGranted(true);
          }
        } catch (err) {
          console.error("App: Erro ao solicitar permissões Android:", err);
          Alert.alert(
            'Erro de Permissão',
            'Ocorreu um erro ao solicitar as permissões de câmera e microfone.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
          setGranted(false);
        }
      } else {
        // Para iOS ou outras plataformas, assumimos que as permissões são tratadas de outra forma ou já concedidas
        console.log("App: Plataforma não é Android, pulando solicitação de permissões Android.");
        setGranted(true); // Assumimos concedido para outras plataformas para prosseguir
      }
      setChecking(false); // Finaliza a verificação, independente do resultado
      console.log("App: Verificação de permissões concluída. Granted:", granted);
    })();
  }, [navigation]);

  // 2. Manipulação de Solicitações de Permissão da WebView
  const onPermissionRequest = useCallback(event => {
    const { resources, origin, grant, deny } = event.nativeEvent;

    console.log("WebView: Solicitação de permissão recebida.", { resources, origin });

    const needsCamera = resources.includes('CAMERA') || resources.includes('VIDEO_CAPTURE');
    const needsMicrophone = resources.includes('MICROPHONE') || resources.includes('AUDIO_CAPTURE');

    if (needsCamera || needsMicrophone) {
      if (granted) { // Se as permissões do aplicativo já foram concedidas
        console.log("WebView: Concedendo permissões de mídia para a WebView.");
        grant();
      } else {
        console.log("WebView: Negando permissões de mídia para a WebView (app não tem permissão).");
        deny();
        Alert.alert(
          'Permissões Negadas',
          'Para a teleconsulta, a câmera e o microfone são essenciais. Por favor, verifique as permissões do aplicativo nas configurações do seu celular.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } else {
      console.log("WebView: Negando permissão para recurso não esperado:", resources);
      deny();
    }
  }, [granted, navigation]);

  const Loader = () => (
    <View style={S.loader}>
      <ActivityIndicator size="large" color="#4B7BE5" />
      <Text style={{ marginTop: 10, color: '#666' }}>Verificando permissões...</Text>
    </View>
  );

  const Denied = () => (
    <View style={S.loader}>
      <Text style={{ color: '#666', textAlign: 'center', marginHorizontal: 20 }}>
        Permissões de câmera e microfone negadas. Por favor, habilite-as nas configurações do aplicativo para prosseguir.
      </Text>
      <TouchableOpacity style={S.backButton} onPress={() => navigation.goBack()}>
        <Text style={S.backButtonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );

  const TermsScreen = ({ onAccept, onDecline }) => (
    <View style={S.termsContainer}>
      <View style={S.termsHeader}>
        <TouchableOpacity onPress={onDecline} style={S.termsBackButton}>
          <Ionicons name="close" size={28} color="#4B7BE5" />
        </TouchableOpacity>
        <Text style={S.termsTitle}>Termos e Condições da Sessão</Text>
        <View style={S.termsBackButton} /> {/* Espaçador para centralizar o título */}
      </View>
      <ScrollView style={S.termsContent}>
        <Text style={S.termsText}>
          Bem-vindo(a) à sua sessão de teleconsulta na OnTerapia. Para garantir a segurança e a qualidade do atendimento, pedimos que leia e aceite os seguintes termos e condições:
        </Text>
        <Text style={S.termsBullet}>
          <Text style={S.termsBulletPoint}>• Gravação da Sessão:</Text> Esta sessão será gravada para fins de segurança, aprimoramento de nossos serviços e para facilitar futuras consultas, caso necessário.
        </Text>
        <Text style={S.termsBullet}>
          <Text style={S.termsBulletPoint}>• Acesso Restrito:</Text> As gravações são confidenciais e o acesso é restrito à equipe OnTerapia responsável pela sua sessão, e somente quando estritamente necessário.
        </Text>
        <Text style={S.termsBullet}>
          <Text style={S.termsBulletPoint}>• Solicitação de Exclusão:</Text> Você tem o direito de solicitar a exclusão da sua gravação a qualquer momento, entrando em contato com nosso suporte.
        </Text>
        <Text style={S.termsBullet}>
          <Text style={S.termsBulletPoint}>• Confidencialidade:</Text> Garantimos a total confidencialidade de suas informações e do conteúdo da sessão, seguindo as diretrizes de ética profissional e a Lei Geral de Proteção de Dados (LGPD).
        </Text>
        <Text style={S.termsText}>
          Ao clicar em **"Aceitar e Entrar na Sessão"**, você concorda com os termos acima e com o uso da sua câmera e microfone para a teleconsulta. Caso não concorde, clique em **"Recusar"** para retornar.
        </Text>
      </ScrollView>
      <View style={S.termsBtns}>
        <TouchableOpacity style={S.termsBtnDecline} onPress={onDecline}>
          <Text style={S.termsBtnTextDecline}>Recusar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={S.termsBtnAccept} onPress={onAccept}>
          <Text style={S.termsBtnTextAccept}>Aceitar e Entrar na Sessão</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (checking) return <Loader />;
  if (!granted) return <Denied />;
  if (!acceptedTerms) {
    return (
      <TermsScreen
        onAccept={() => setAccepted(true)}
        onDecline={() => navigation.goBack()}
      />
    );
  }

  // A WebView não precisa mais injetar JavaScript para análise no cliente.
  // As props 'onLoadEnd' e 'onMessage' também não são mais necessárias para esta funcionalidade.
  return (
    <View style={S.container}>
      {/* A interface de usuário baseada na função para análise é removida */}
      <WebView
        ref={webviewRef}
        source={{ uri: `https://meet.jit.si/${roomName}` }}
        style={S.webview}
        // Removidos onLoadEnd e onMessage já que face-api.js não é mais injetado
        onPermissionRequest={onPermissionRequest}
        javaScriptEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        startInLoadingState
        renderLoading={() => <Loader />}
        domStorageEnabled={true}
        javaScriptCanOpenWindowsAutomatically={true}
        thirdPartyCookiesEnabled={true}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        allowFileAccessFromFileURLs={true}
      />
    </View>
  );
}

// Estilos
const S = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#4B7BE5',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  bar: {
    padding: 12,
    backgroundColor: '#eef4fb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  barText: { fontSize: 16, fontWeight: '600' },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#4B7BE5',
    borderRadius: 20,
  },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  termsContainer: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  termsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#4B7BE5',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 10,
  },
  termsBackButton: {
    width: 40,
    alignItems: 'center',
  },
  termsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    fontFamily: 'Poppins-Bold', // Certifique-se de que esta fonte está carregada
    flex: 1,
    textAlign: 'center',
  },
  termsContent: {
    padding: 24,
  },
  termsText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 16,
    fontFamily: 'Poppins-Regular', // Certifique-se de que esta fonte está carregada
  },
  termsBullet: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 10,
    fontFamily: 'Poppins-Regular',
  },
  termsBulletPoint: {
    fontWeight: 'bold',
    color: '#2563eb',
  },
  termsBtns: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  termsBtnAccept: {
    flex: 1,
    backgroundColor: '#33b864',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  termsBtnTextAccept: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Poppins-SemiBold',
  },
  termsBtnDecline: {
    flex: 0.6,
    backgroundColor: '#e0e0e0',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  termsBtnTextDecline: {
    color: '#333',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Poppins-SemiBold',
  },

  apiResults: {
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  apiTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  apiText: {
    fontSize: 12,
    color: '#555',
  },
});