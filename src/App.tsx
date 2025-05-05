import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {WorkOrdersList} from './screens/WorkOrderList/index';
import {EditWorkOrder} from './screens/EditWorkOrder/index';
import {useSync} from './hooks/useSync';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import { AddWorkOrder } from './screens/AddWorkOrder/index';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Stack = createNativeStackNavigator();

export default function App() {
  useSync();
  Ionicons.loadFont(); 
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="WorkOrdersList"
            component={WorkOrdersList}
            options={{title: 'Ordens de Serviço'}}
          />
          <Stack.Screen
            name="EditWorkOrder"
            component={EditWorkOrder}
            options={{title: 'Editar Ordem'}}
          />
          <Stack.Screen
            name="AddWorkOrder"
            component={AddWorkOrder}
            options={{title: 'Nova Ordem de Serviço'}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
