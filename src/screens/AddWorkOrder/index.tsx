import React, {useState} from 'react';
import {View, Text, TextInput, Button, Alert} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import uuid from 'react-native-uuid';
import {Picker} from '@react-native-picker/picker';

import {createWorkOrder} from '../../modules/api/workOrders';
import {saveWorkOrderLocally} from '../../modules/workOrders/localOps';
import {showOfflineNotice} from '../../utils/offlineNotice';

import {styles} from './styles';

export const AddWorkOrder = ({navigation}: any) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'Pending',
    assignedTo: '',
  });

  const handleCreate = async () => {
    // 1) Validações
    if (!form.title.trim()) {
      Alert.alert('Atenção', 'O campo Título é obrigatório.');
      return;
    }

    const state = await NetInfo.fetch();

    const payload = { ...form };

    if (state.isConnected) {

      try {
        const result = await createWorkOrder(payload);
        await saveWorkOrderLocally(result, true, false); // sucesso remoto, não pendente
        return navigation.goBack();
      } catch (err) {
        console.warn('[AddWorkOrder] erro no servidor, fallback offline', err);
        showOfflineNotice();
        // Criação local após falha remota, gera novo uuid
        const localWO = { ...payload, id: uuid.v4() as string };
        await saveWorkOrderLocally(localWO, true, true);
        return navigation.goBack();
      }
    } else {
      showOfflineNotice();
      const localWO = { ...payload, id: uuid.v4() as string };
      await saveWorkOrderLocally(localWO, true, true); // offline, pendente
      return navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      {/* TÍTULO */}
      <View style={styles.row}>
        <Text style={styles.label}>Título:</Text>
        <TextInput
          style={styles.input}
          value={form.title}
          onChangeText={v => setForm(s => ({...s, title: v}))}
        />
      </View>

      {/* DESCRIÇÃO */}
      <View style={styles.row}>
        <Text style={styles.label}>Descrição:</Text>
        <TextInput
          style={styles.input}
          value={form.description}
          onChangeText={v => setForm(s => ({...s, description: v}))}
        />
      </View>

      {/* RESPONSÁVEL */}
      <View style={styles.row}>
        <Text style={styles.label}>Responsável:</Text>
        <TextInput
          style={styles.input}
          value={form.assignedTo}
          onChangeText={v => setForm(s => ({...s, assignedTo: v}))}
        />
      </View>

      {/* STATUS */}
      <View style={styles.row}>
        <Text style={styles.label}>Status:</Text>
        <TextInput
          style={styles.input}
          value={form.status}
          onChangeText={v =>
            setForm(s => ({
              ...s,
              status: v,
            }))
          }
        />
      </View>

      {/* BOTÃO CRIAR */}
      <View style={styles.buttonWrapper}>
        <Button title="Criar" onPress={handleCreate} />
      </View>
      <Button title="Print" onPress={() => {console.log(form.title, form.description, form.assignedTo, form.status)}} />
    </View>
  );
};
