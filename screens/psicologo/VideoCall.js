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
} from 'react-native';
import { WebView } from 'react-native-webview';

export default function VideoCall({ route, navigation }) {
  const { roomName, role } = route.params;
  const webviewRef = useRef(null); 

  const [checking, setChecking] = useState(true);
  const [granted, setGranted] = useState(false); // Permissões do APP (Câmera/Microfone)
  const [acceptedTerms, setAccepted] = useState(false); // Termos de gravação
  const [analyzing, setAnalyzing] = useState(false);
  const [latestExp, setLatestExp] = useState('—');
  const [apiResponse, setApiResponse] = useState(null);

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
              'Precisamos de câmera e microfone para a teleconsulta. Por favor, conceda as permissões nas configurações do aplicativo.',
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
  }, [navigation, granted]); // Adicionado 'granted' para re-executar se o estado mudar

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

  // Restante do seu código (callAnalysisApi, Loader, Denied, TermsScreen)
  const callAnalysisApi = async () => {
    try {
      const response = await fetch('http://192.168.17.1:8000/analyze-webcam');
      const data = await response.json();
      setApiResponse(data);
      console.log('API Response:', data);
      
      if (data.analysis && data.analysis.length > 0) {
        const emotions = data.analysis.map((item) => item.dominant_emotion);
        const mostFrequent = emotions.reduce((a, b) => 
          emotions.filter((v) => v === a).length >= 
          emotions.filter((v) => v === b).length ? a : b
        );
        setLatestExp(mostFrequent);
      }
    } catch (error) {
      console.error('API Error:', error);
      Alert.alert('Erro', 'Não foi possível conectar à API de análise.');
    }
  };

  const Loader = () => (
    <View style={S.loader}>
      <ActivityIndicator size="large" color="#4B7BE5" />
      <Text style={{ marginTop: 10, color: '#666' }}>Verificando permissões...</Text>
    </View>
  );

  const Denied = () => (
    <View style={S.loader}>
      <Text style={{ color:'#666' }}>Permissões negadas. Por favor, habilite nas configurações do app.</Text>
    </View>
  );

  const TermsScreen = ({ onAccept, onDecline }) => (
    <View style={S.terms}>
      <Text style={S.title}>Termos e Condições</Text>
      <Text style={S.text}>
        • Esta sessão será gravada.{'\n\n'}
        • Gravações restritas à equipe.{'\n\n'}
        • Solicite exclusão a qualquer momento.{'\n\n'}
        • Confidencialidade garantida.
      </Text>
      <View style={S.termsBtns}>
        <TouchableOpacity style={[S.btn, { backgroundColor:'#eee' }]} onPress={onDecline}>
          <Text style={S.btnText}>Recusar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[S.btn, { backgroundColor:'#4B7BE5' }]} onPress={onAccept}>
          <Text style={[S.btnText, { color:'#fff' }]}>Aceitar</Text>
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

  const injection = `
    console.log('▶️ face-api: começando injeção');
    if (!window.__faceapi_loaded) {
      window.__faceapi_loaded = true;
      (async () => {
        console.log('⏳ face-api: carregando script externo');
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/face-api.js';
        document.head.appendChild(s);
        await new Promise(r => s.onload = r);
        console.log('✅ face-api: library carregada');

        const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
        console.log('⏳ face-api: carregando modelos');
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        console.log('✅ face-api: modelos carregados');

        console.log('⏳ face-api: aguardando vídeo remoto');
        const remote = await new Promise(r => {
          const iv = setInterval(() => {
            const vids = document.querySelectorAll('video');
            if (vids.length > 1 && vids[1].readyState === 4) {
              clearInterval(iv); r(vids[1]);
            }
          }, 500);
        });
        console.log('✅ face-api: vídeo remoto pronto');

        const canvas = faceapi.createCanvasFromMedia(remote);
        canvas.style.opacity = '0';
        document.body.appendChild(canvas);
        faceapi.matchDimensions(canvas, {
          width: remote.videoWidth,
          height: remote.videoHeight,
        });

        let intervalId = null;
        window.startAnalysis = () => {
          if (intervalId) return;
          console.log('▶️ face-api: análise iniciada');
          intervalId = setInterval(async () => {
            try {
              const det = await faceapi
                .detectSingleFace(remote, new faceapi.TinyFaceDetectorOptions())
                .withFaceExpressions();
              if (det && det.expressions) {
                const top = Object.entries(det.expressions)
                  .sort((a,b)=>b[1]-a[1])[0][0];
                console.log('🎯 face-api: detectou', top);
                window.ReactNativeWebView.postMessage(top);
              }
            } catch (err) {
              console.error('❌ face-api erro:', err);
            }
          }, 2000);
        };
        window.stopAnalysis = () => {
          clearInterval(intervalId);
          intervalId = null;
          console.log('⏹️ face-api: análise parada');
        };
      })();
    } else {
      console.log('ℹ️ face-api: já carregado');
    }
    true;
  `;

  const onLoadEnd = () => {
    console.log("WebView: Carregamento da página finalizado.");
    setTimeout(() => {
      console.log("WebView: Injetando JavaScript.");
      webviewRef.current?.injectJavaScript(injection);
    }, 1000);
  };

  const onMessage = (e) => {
    console.log('[RN] Expressão recebida:', e.nativeEvent.data);
    setLatestExp(e.nativeEvent.data);
  };

  const toggleAnalysis = () => {
    if (!analyzing) {
      webviewRef.current?.injectJavaScript(`window.startAnalysis();`);
    } else {
      webviewRef.current?.injectJavaScript(`window.stopAnalysis();`);
      setLatestExp('—');
    }
    setAnalyzing(!analyzing);
  };

  return (
    <View style={S.container}>
      {role === 'Psicólogo' && (
        <View style={S.bar}>
          <Text style={S.barText}>Expressão: {latestExp}</Text>
          <TouchableOpacity style={S.btn} onPress={toggleAnalysis}>
            <Text style={S.btnText}>
              {analyzing ? 'Parar Análise' : 'Analisar Expressão'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {apiResponse && (
        <View style={S.apiResults}>
          <Text style={S.apiTitle}>Resultado da API:</Text>
          {apiResponse.analysis.map((item, index) => (
            <Text key={index} style={S.apiText}>
              {item.second}s: {item.dominant_emotion}
            </Text>
          ))}
        </View>
      )}
      
      <WebView
        ref={webviewRef}
        source={{ uri: `https://meet.jit.si/${roomName}` }}
        style={S.webview}
        onLoadEnd={onLoadEnd}
        onMessage={onMessage}
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

// Styles
const S = StyleSheet.create({
  container: { flex:1 },
  webview: { flex:1 },
  loader: { flex:1, justifyContent:'center', alignItems:'center' },

  bar: { 
    padding:12, 
    backgroundColor:'#eef4fb', 
    flexDirection:'row', 
    alignItems:'center', 
    justifyContent:'space-between' 
  },
  barText: { fontSize:16, fontWeight:'600' },
  btn: { 
    paddingVertical:8, 
    paddingHorizontal:16, 
    backgroundColor:'#4B7BE5', 
    borderRadius:20 
  },
  btnText: { color:'#fff', fontSize:14, fontWeight:'600' },

  terms: { flex:1, padding:24, justifyContent:'center', backgroundColor:'#fff' },
  title: { fontSize:22, fontWeight:'700', textAlign:'center', marginBottom:16 },
  text: { fontSize:16, lineHeight:24, color:'#333', marginBottom:24 },
  termsBtns: { flexDirection:'row', justifyContent:'space-between' },
  
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
