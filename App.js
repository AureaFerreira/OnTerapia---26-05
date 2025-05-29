// App.js
import React, { useEffect, useState, useRef } from 'react';
import * as Font from 'expo-font';
import * as Notifications from 'expo-notifications'; // Importado
import * as SplashScreen from 'expo-splash-screen'; // Importado para substituir AppLoading
import RootNavigation from './src/navigation'; //

// Permite que o splash screen fique visível até que as fontes sejam carregadas
SplashScreen.preventAutoHideAsync();

// Configura como as notificações serão tratadas quando o app estiver em foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // Mostra um alerta (pop-up)
    shouldPlaySound: false, // Não reproduz som
    shouldSetBadge: false, // Não altera o contador de badge no ícone do app
  }),
});

const getFonts = () =>
  Font.loadAsync({
    'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('./assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
  });

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    async function prepare() {
      try {
        // Carrega as fontes
        await getFonts();
        // Solicita permissão para notificações
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          console.warn('Falha ao obter token de push para notificação!');
          // Se as permissões não forem concedidas, você pode informar o usuário
          // ou desabilitar funcionalidades que dependem de notificações.
        }

        // Você pode obter o token de push aqui se precisar para enviar de um servidor
        // const token = (await Notifications.getExpoPushTokenAsync()).data;
        // console.log('Expo Push Token:', token);

        // Listener para notificações recebidas enquanto o app está aberto
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
          console.log("Notificação recebida:", notification);
          // Você pode fazer algo com a notificação aqui, como exibir um banner customizado
        });

        // Listener para quando o usuário interage com uma notificação
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
          console.log("Notificação clicada/interagida:", response);
          // Você pode navegar para uma tela específica com base nos dados da notificação
        });

      } catch (e) {
        console.warn(e);
      } finally {
        // Diz ao splash screen para esconder
        setAppIsReady(true);
        SplashScreen.hideAsync();
      }
    }

    prepare();

    // Limpa os listeners ao desmontar o componente
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  if (!appIsReady) {
    return null; // ou um componente de loading se você preferir
  }

  return <RootNavigation />;
}

// --- FUNÇÃO PARA AGENDAR NOTIFICAÇÃO ---
// Coloque esta função em um arquivo separado (ex: utils/notifications.js)
// ou em um componente onde você agendaria a sessão,
// e então importe-a e chame-a quando necessário.
export async function scheduleSessionNotification(sessionTime: Date) {
    const now = new Date();
    const notificationTime = new Date(sessionTime.getTime() - 15 * 60 * 1000); // 15 minutos antes

    // Garante que a notificação não seja agendada para o passado
    if (notificationTime <= now) {
        console.warn("Não é possível agendar notificação para o passado.");
        // Opcional: agendar para "agora" se a sessão for iminente
        // await Notifications.scheduleNotificationAsync({
        //     content: {
        //         title: "Sua sessão começa agora!",
        //         body: `Sua consulta está marcada para ${sessionTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.`,
        //     },
        //     trigger: null, // Dispara imediatamente
        // });
        return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Lembrete: Sua Sessão!",
        body: `Sua consulta começa em 15 minutos, às ${sessionTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.`,
        data: { screen: 'VideoCall', roomName: 'seus dados da sala aqui' }, // Adicione dados para navegação
      },
      trigger: {
        hour: notificationTime.getHours(),
        minute: notificationTime.getMinutes(),
        repeats: false, // A notificação acontece apenas uma vez
      },
    });
    console.log("Notificação agendada para:", notificationTime);
}

// Exemplo de como você chamaria a função (em outro lugar do seu código, não no App.js diretamente)
// No componente onde você agendaria uma sessão:
/*
import { scheduleSessionNotification } from './App'; // Ajuste o caminho conforme onde você colocar a função

// Supondo que você tenha uma data/hora da sessão
const sessionDate = new Date();
sessionDate.setHours(18); // Exemplo: 18:30
sessionDate.setMinutes(30);
sessionDate.setSeconds(0);

// Chame a função para agendar a notificação
scheduleSessionNotification(sessionDate);
*/