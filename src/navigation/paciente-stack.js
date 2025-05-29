import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomePaciente from '../screens/paciente/home';
import ChatAnamnese from '../screens/paciente/minha-anamnese';
import LoginPaciente from '../screens/paciente/login-paciente';
import TelaInicial from '../components/geral/TelaInicial';

const Stack = createNativeStackNavigator();

export default function PacienteStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="TelaInicial" component={TelaInicial} options={{ headerShown: false }} />
      <Stack.Screen name="LoginPaciente" component={LoginPaciente} options={{ headerShown: false }} />
      <Stack.Screen name="HomePaciente" component={HomePaciente} options={{ headerShown: false }} />
      <Stack.Screen name="ChatAnamnese" component={ChatAnamnese} options={{ title: 'Anamnese' }} />
    </Stack.Navigator>
  );
}
