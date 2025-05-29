// src/navigation/index.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Telas já existentes
// CORREÇÃO AQUI: '../../components/geral/TelaInicial'
import TelaInicial from '../../components/geral/TelaInicial'; //
import LoginPaciente from '../screens/paciente/login-paciente';
import HomePaciente from '../screens/paciente/home';
import ChatAnamnese from '../screens/paciente/minha-anamnese';
import LoginPsicologo from '../screens/psicologo/login-psicologo';
import HomePsicologo from '../screens/psicologo/home';
import MinhasSessoes from '../screens/paciente/minhas-sessoes';
import MeusAgendamentos from '../screens/paciente/meus-agendamentos';
import MinhasDeclaracoes from '../screens/paciente/minhas-declaracoes';
import Pacientes from '../screens/psicologo/pacientes';
import Prontuarios from '../screens/psicologo/prontuarios';
import EvolucaoCasos from '../screens/psicologo/evolucao-casos';
import IniciarSessao from '../screens/psicologo/iniciar-sessao';
import PersonalizarAnamnese from '../screens/psicologo/personalizar-anamnese';
import Declaracoes from '../screens/psicologo/declaracoes';
import PreencherDeclaracao from '../screens/psicologo/preencher-declaracao';
import ProntuarioPaciente from '../screens/psicologo/ProntuarioPaciente';
import VisualizarAnamnese from '../screens/psicologo/VisualizarAnamnese';

// Novas telas adicionadas (verifique se elas ainda são necessárias aqui)
import RoleSelect from '../screens/psicologo/RoleSelect';
import LinkScreen from '../screens/psicologo/LinkScreen';
import VideoCall from '../screens/psicologo/VideoCall';

const Stack = createNativeStackNavigator();

export default function RootNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="TelaInicial" screenOptions={{ headerShown: false }}>
        {/* Telas já existentes */}
        <Stack.Screen name="TelaInicial" component={TelaInicial} />
        <Stack.Screen name="LoginPaciente" component={LoginPaciente} />
        <Stack.Screen name="HomePaciente" component={HomePaciente} />
        <Stack.Screen name="ChatAnamnese" component={ChatAnamnese} />
        <Stack.Screen name="LoginPsicologo" component={LoginPsicologo} />
        <Stack.Screen name="HomePsicologo" component={HomePsicologo} />
        <Stack.Screen name="MinhasSessoes" component={MinhasSessoes} />
        <Stack.Screen name="MeusAgendamentos" component={MeusAgendamentos} />
        <Stack.Screen name="MinhasDeclaracoes" component={MinhasDeclaracoes} />
        <Stack.Screen name="Pacientes" component={Pacientes} />
        <Stack.Screen name="Prontuarios" component={Prontuarios} />
        <Stack.Screen name="EvolucaoCasos" component={EvolucaoCasos} />
        <Stack.Screen name="IniciarSessao" component={IniciarSessao} />
        <Stack.Screen name="PersonalizarAnamnese" component={PersonalizarAnamnese} />
        <Stack.Screen name="Declaracoes" component={Declaracoes} />
        <Stack.Screen name="PreencherDeclaracao" component={PreencherDeclaracao} />
        <Stack.Screen name="ProntuarioPaciente" component={ProntuarioPaciente} />
        <Stack.Screen name="VisualizarAnamnese" component={VisualizarAnamnese} />

        {/* Novas telas (Mantenha se forem usadas, remova se não) */}
        <Stack.Screen name="RoleSelect" component={RoleSelect} />
        <Stack.Screen name="LinkScreen" component={LinkScreen} />
        <Stack.Screen name="VideoCall" component={VideoCall} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}