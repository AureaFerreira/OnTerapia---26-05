// src/utils/notifications.js
import * as Notifications from 'expo-notifications';

export async function scheduleSessionNotification(sessionTime, roomName) {
  const now = new Date();
  const notificationTime = new Date(sessionTime.getTime() - 15 * 60 * 1000); // 15 minutos antes da sessão

  if (notificationTime <= now) {
    console.warn("Não é possível agendar notificação para o passado ou muito próximo.");
    return;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Lembrete: Sua Sessão!",
        body: `Sua consulta começa em 15 minutos, às ${sessionTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.`,
        data: { screen: 'VideoCall', roomName: roomName },
      },
      trigger: {
        hour: notificationTime.getHours(),
        minute: notificationTime.getMinutes(),
        repeats: false,
      },
    });
    console.log("Notificação agendada com sucesso para:", notificationTime);
  } catch (error) {
    console.error("Erro ao agendar notificação:", error);
  }
}