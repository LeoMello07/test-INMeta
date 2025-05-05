import React, {useEffect, useState} from 'react';
import {View, Text, TextInput, Button, Alert} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import uuid from 'react-native-uuid';
import {Picker} from '@react-native-picker/picker';

import {getRealm} from '../../db/realm';
import {
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
} from '../../modules/api/workOrders';
import {saveWorkOrderLocally} from '../../modules/workOrders/localOps';
import {showOfflineNotice} from '../../utils/offlineNotice';
import {useWorkOrdersStore} from '../../store/workOrdersStores';

import {styles} from './styles';

export const EditWorkOrder = ({route, navigation}: any) => {
  const {id} = route.params ?? {};
  const isNew = !id;

  const [form, setForm] = useState({
    title: '',
    description: '',
    status: '',
    assignedTo: '',
  });

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const realm = await getRealm();
      const wo: any = realm.objectForPrimaryKey('WorkOrder', id);
      if (wo)
        setForm({
          title: wo.title,
          description: wo.description,
          status: wo.status,
          assignedTo: wo.assignedTo,
        });
    })();
  }, [id]);

  const save = async () => {
    const payload = {...form};
    const state = await NetInfo.fetch();

    try {
      if (state.isConnected) {
          // EDIÇÃO (PUT)
          const result = await updateWorkOrder(id, payload);
          await saveWorkOrderLocally(result, false, false);
      } else {
        // OFFLINE: Salva localmente como pendente
        const localWO = {...payload, id: id ?? (uuid.v4() as string)};
        await saveWorkOrderLocally(localWO, isNew, true);
        showOfflineNotice();
      }
    } catch (err) {
      console.warn('[EditWorkOrder] erro no servidor, fallback offline', err);
      const localWO = {...payload, id: id ?? (uuid.v4() as string)};
      await saveWorkOrderLocally(localWO, isNew, true);
      showOfflineNotice();
    }

    navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert(
      'Excluir Ordem de Serviço',
      'Tem certeza que deseja remover esta ordem?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            const realm = await getRealm();
            const {removeOrder} = useWorkOrdersStore.getState();
            const net = await NetInfo.fetch();

            if (net.isConnected) {
              const ok = await deleteWorkOrder(id);
              if (ok === true) {
                realm.write(() => {
                  const wo: any = realm.objectForPrimaryKey('WorkOrder', id);
                  if (wo) realm.delete(wo);
                });
                removeOrder(id);
                return navigation.goBack();
              }
            }

            realm.write(() => {
              realm.create(
                'WorkOrder',
                {
                  id,
                  deleted: true,
                  deletedAt: new Date(),
                  pendingSync: true,
                },
                'modified',
              );
            });
            removeOrder(id);
            showOfflineNotice();
            navigation.goBack();
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Título:</Text>
        <TextInput
          style={styles.input}
          value={form.title}
          onChangeText={v => setForm(s => ({...s, title: v}))}
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Descrição:</Text>
        <TextInput
          style={styles.input}
          value={form.description}
          onChangeText={v => setForm(s => ({...s, description: v}))}
          placeholder="Descrição da ordem de serviço"
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Responsável:</Text>
        <TextInput
          style={styles.input}
          value={form.assignedTo}
          onChangeText={v => setForm(s => ({...s, assignedTo: v}))}
          placeholder="Nome do responsável"
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Status:</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={form.status}
            onValueChange={value =>
              setForm(s => ({...s, status: value as typeof form.status}))
            }
            mode="dropdown">
            <Picker.Item label="Pending" value="Pending" />
            <Picker.Item label="In Progress" value="In Progress" />
            <Picker.Item label="Completed" value="Completed" />
          </Picker>
        </View>
      </View>

      <View style={styles.buttons}>
        <Button title="Salvar" onPress={save} />
        {!isNew && (
          <Button title="Excluir" color="#c00" onPress={handleDelete} />
        )}
      </View>
    </View>
  );
};
