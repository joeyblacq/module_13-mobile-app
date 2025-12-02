// client/screens/CourierDeliveriesScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Pressable,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import DeliveryDetailModal from '../components/DeliveryDetailModal';

const API_BASE = process.env.EXPO_PUBLIC_NGROK_URL;

// Map API status → label shown in UI
const getStatusLabel = (status) => {
  switch (status) {
    case 'PENDING':
      return 'PENDING';
    case 'IN_PROGRESS':
      return 'IN PROGRESS';
    case 'DELIVERED':
      return 'DELIVERED';
    default:
      return status || 'UNKNOWN';
  }
};

// Map status → button color (wireframe-ish)
const getStatusColor = (status) => {
  switch (status) {
    case 'PENDING':
      return '#8B0000'; // dark red
    case 'IN_PROGRESS':
      return '#D86F52'; // orange
    case 'DELIVERED':
      return '#6BAF7A'; // green
    default:
      return '#888';
  }
};

// Compute next status in the progression
const getNextStatus = (status) => {
  switch (status) {
    case 'PENDING':
      return 'IN_PROGRESS';
    case 'IN_PROGRESS':
      return 'DELIVERED';
    case 'DELIVERED':
    default:
      return null; // no further state
  }
};

export default function CourierDeliveriesScreen() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');

  // Detail modal state
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);

  const loadDeliveries = useCallback(async () => {
    if (!API_BASE) {
      setError('Missing API base URL.');
      setLoading(false);
      return;
    }

    setError('');
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('auth_token');

      const response = await fetch(`${API_BASE}/api/courier/deliveries`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        setError('Failed to load deliveries.');
        setDeliveries([]);
        return;
      }

      const data = await response.json();
      // Expect something like:
      // [{ id, address, status, items, total, restaurantName, orderDate, ... }]
      setDeliveries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log('Error loading deliveries:', err);
      setError('Unable to load deliveries. Please try again.');
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDeliveries();
  }, [loadDeliveries]);

  const handleToggleStatus = async (delivery) => {
    const { id, status } = delivery;
    const nextStatus = getNextStatus(status);

    if (!nextStatus) {
      // DELIVERED or unknown → no further updates
      return;
    }

    if (!API_BASE) {
      Alert.alert('Error', 'Missing API base URL.');
      return;
    }

    setUpdatingId(id);

    try {
      const token = await AsyncStorage.getItem('auth_token');

      const response = await fetch(
        `${API_BASE}/api/courier/deliveries/${id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ status: nextStatus }),
        },
      );

      if (!response.ok) {
        Alert.alert('Error', 'Failed to update status. Please try again.');
        return;
      }

      // Re-fetch from API so DB is source of truth
      await loadDeliveries();
    } catch (err) {
      console.log('Error updating status:', err);
      Alert.alert('Error', 'Unable to update status. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  const renderRow = ({ item }) => {
    const isDelivered = item.status === 'DELIVERED';
    const isUpdating = updatingId === item.id;

    return (
      <View style={styles.row}>
        <View style={[styles.cell, styles.idCell]}>
          <Text style={styles.cellText}>{item.id}</Text>
        </View>
        <View style={[styles.cell, styles.addressCell]}>
          <Text style={styles.cellText}>{item.address}</Text>
        </View>
        <View style={[styles.cell, styles.statusCell]}>
          <Pressable
            style={[
              styles.statusButton,
              { backgroundColor: getStatusColor(item.status) },
              (isDelivered || isUpdating) && styles.statusButtonDisabled,
            ]}
            disabled={isDelivered || isUpdating}
            onPress={() => handleToggleStatus(item)}
          >
            {isUpdating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.statusButtonText}>
                {getStatusLabel(item.status)}
              </Text>
            )}
          </Pressable>
        </View>
        <View style={[styles.cell, styles.viewCell]}>
          <Pressable
            onPress={() => {
              setSelectedDelivery(item);
              setDetailVisible(true);
            }}
          >
            <FontAwesome name="search" size={18} color="#000" />
          </Pressable>
        </View>
      </View>
    );
  };

  if (loading && deliveries.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>MY DELIVERIES</Text>

      <View style={styles.tableHeader}>
        <Text style={[styles.headerText, styles.idCell]}>ORDER ID</Text>
        <Text style={[styles.headerText, styles.addressCell]}>ADDRESS</Text>
        <Text style={[styles.headerText, styles.statusCell]}>STATUS</Text>
        <Text style={[styles.headerText, styles.viewCell]}>VIEW</Text>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <FlatList
        data={deliveries}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderRow}
        contentContainerStyle={
          deliveries.length === 0 ? styles.emptyContainer : null
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No deliveries to display.</Text>
        }
      />

      {/* Delivery Detail Modal */}
      <DeliveryDetailModal
        visible={detailVisible}
        delivery={selectedDelivery}
        onClose={() => setDetailVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    // fontFamily: 'Oswald-Regular', // uncomment if you have this font loaded
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#222',
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  headerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginBottom: 4,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  cell: {
    justifyContent: 'center',
  },
  idCell: {
    width: 60,
  },
  addressCell: {
    flex: 1,
  },
  statusCell: {
    width: 130,
    alignItems: 'center',
  },
  viewCell: {
    width: 50,
    alignItems: 'center',
  },
  cellText: {
    fontSize: 13,
  },
  statusButton: {
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusButtonDisabled: {
    opacity: 0.6,
  },
  statusButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#b00020',
    marginVertical: 8,
  },
  emptyContainer: {
    paddingVertical: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#555',
  },
});

