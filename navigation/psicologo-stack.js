import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomePsicologo from '../screens/psicologo/home';

const Stack = createNativeStackNavigator();

export default function PsicologoStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomePsicologo" component={HomePsicologo} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
