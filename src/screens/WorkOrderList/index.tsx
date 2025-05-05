import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useNetInfo } from '@react-native-community/netinfo';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { styles } from './styles';
import { getRealm } from '../../db/realm';
import { useWorkOrdersStore } from '../../store/workOrdersStores';
import { normalizeId, syncIfOnline } from '../../sync/syncService';

export const WorkOrdersList = ({ navigation }: any) => {
  const focused = useIsFocused();
  const netInfo = useNetInfo();
  const prevConnected = useRef(netInfo.isConnected ?? false);

  const { workOrders, setOrders } = useWorkOrdersStore();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt'>('createdAt');

  const loadOrders = useCallback(
    async (silent = false) => {
      silent ? setRefreshing(true) : setLoading(true);

      if (netInfo.isConnected) {
        try {
          await syncIfOnline();
        } catch (err) {
          console.warn('[syncIfOnline]', err);
        }
      }

      const realm = await getRealm();
      const all = realm
        .objects('WorkOrder')
        .filtered('deleted == false')
        .sorted(sortBy, true);

      setOrders(
        all.map((o: any) => ({
          ...o,
          id: normalizeId(o.id),
          pendingSync: !!o.pendingSync,
        }))
      );

      silent ? setRefreshing(false) : setLoading(false);
    },
    [netInfo.isConnected, setOrders, sortBy]
  );

  useEffect(() => {
    if (focused) loadOrders();
  }, [focused, loadOrders]);

  useEffect(() => {
    const was = prevConnected.current;
    const now = netInfo.isConnected ?? false;
    if (!was && now) loadOrders();
    prevConnected.current = now;
  }, [netInfo.isConnected, loadOrders]);

  const onRefresh = () => loadOrders(true);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            sortBy === 'createdAt' && styles.filterButtonActive,
          ]}
          onPress={() => setSortBy('createdAt')}
        >
          <Text
            style={
              sortBy === 'createdAt'
                ? styles.filterTextActive
                : styles.filterText
            }
          >
            Data de Criação
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            sortBy === 'updatedAt' && styles.filterButtonActive,
          ]}
          onPress={() => setSortBy('updatedAt')}
        >
          <Text
            style={
              sortBy === 'updatedAt'
                ? styles.filterTextActive
                : styles.filterText
            }
          >
            Última Atualização
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={workOrders}
        keyExtractor={(item) => item.id.toString()}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('EditWorkOrder', { id: item.id })}
          >
            <View style={styles.itemWrapper}>
              <Text style={styles.fieldText}>
                <Text style={styles.fieldLabel}>Título: </Text>
                {item.title}
              </Text>
              <Text style={styles.fieldText}>
                <Text style={styles.fieldLabel}>Descrição: </Text>
                {item.description}
              </Text>
              <Text style={styles.fieldText}>
                <Text style={styles.fieldLabel}>Atribuído a: </Text>
                {item.assignedTo}
              </Text>
              <Text style={styles.fieldText}>
                <Text style={styles.fieldLabel}>Status: </Text>
                {item.status}
              </Text>

              {item.pendingSync && (
                <Ionicons name="cloud-offline-outline" size={20} color="#f00" />
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text>Nenhuma ordem encontrada.</Text>
          </View>
        }
      />

      <TouchableOpacity
        onPress={() => navigation.navigate('AddWorkOrder')}
        style={styles.addButton}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </>
  );
};
