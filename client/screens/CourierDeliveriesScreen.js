// client/screens/CourierDeliveriesScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Pressable,
  Modal,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.EXPO_PUBLIC_NGROK_URL;

const formatStatus = (status) => {
  if (!status) return 'Unknown';
  const s = String(status).toLowerCase();
  if (s === 'pending') return 'Pending';
  if (s === 'in progress') return 'In progress';
  if (s === 'delivered') return 'Delivered';
  return status;
};

export default function CourierDeliveriesScreen() {
  const [loading, setLoading] = useState(true);
  const [deliveries, setDeliveries] = useState([]);
  const [error, setError] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const loadDeliveries = async () => {
      setLoading(true);
      setError('');

      try {
        if (!API_BASE) {
          setError('Missing API base URL.');
          setDeliveries([]);
          return;
        }

        const courierId = await AsyncStorage.getItem('courierId');
        console.log('courierId from storage:', courierId);

        if (!courierId) {
          setError('Missing courier ID.');
          setDeliveries([]);
          return;
        }

        const res = await fetch(
          `${API_BASE}/api/orders?type=courier&id=${courierId}`
        );

        // 204 No Content → no orders, not an error
        if (res.status === 204) {
          setDeliveries([]);
          setError('');
          return;
        }

        if (!res.ok) {
          let msg = 'Failed to load deliveries.';
          try {
            const body = await res.json();
            if (body && body.error) msg = body.error;
          } catch (_) {}
          console.log('Failed to load deliveries. Status:', res.status, msg);
          setError(msg);
          setDeliveries([]);
          return;
        }

        const data = await res.json().catch(() => []);

        // Accept either raw array or { orders: [...] }
        let list = [];
        if (Array.isArray(data)) {
          list = data;
        } else if (data && Array.isArray(data.orders)) {
          list = data.orders;
        }

        console.log('courier orders JSON:', JSON.stringify(list, null, 2));

        setDeliveries(list);
        setError('');
      } catch (e) {
        console.log('Courier deliveries error:', e);
        setError('Failed to load deliveries.');
        setDeliveries([]);
      } finally {
        setLoading(false);
      }
    };

    loadDeliveries();
  }, []);

  const openDetails = (order) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  const renderRow = ({ item }) => {
    // ✅ Use customer_address as the primary delivery address
    const address =
      item.customer_address ||
      item.restaurant_address ||
      item.deliveryAddress ||
      item.address ||
      item.order_address ||
      item.destination ||
      'N/A';

    const status = formatStatus(item.status);

    return (
      <View style={styles.row}>
        <View style={[styles.cell, styles.addressCell]}>
          <Text style={styles.addressText} numberOfLines={2}>
            {address}
          </Text>
        </View>

        <View style={[styles.cell, styles.statusCell]}>
          <Text style={styles.statusText}>{status}</Text>
        </View>

        <Pressable
          style={[styles.cell, styles.viewCell]}
          onPress={() => openDetails(item)}
        >
          <Text style={styles.viewText}>{item.id}</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      {/* Header bar */}
      <View style={styles.headerBar}>
        <Text style={[styles.headerText, styles.headerAddress]}>
          ORDER ADDRESS
        </Text>
        <Text style={[styles.headerText, styles.headerStatus]}>STATUS</Text>
        <Text style={[styles.headerText, styles.headerView]}>VIEW ID</Text>
      </View>

      {/* Body */}
      <View style={styles.body}>
        {loading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" />
          </View>
        )}

        {!loading && (
          <>
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            {deliveries.length === 0 && !error ? (
              <View style={styles.center}>
                <Text style={styles.emptyText}>No deliveries to display.</Text>
              </View>
            ) : null}

            {deliveries.length > 0 && (
              <FlatList
                data={deliveries}
                keyExtractor={(item, index) =>
                  String(item.id ?? index.toString())
                }
                renderItem={renderRow}
                contentContainerStyle={styles.listContainer}
              />
            )}
          </>
        )}
      </View>

      {/* Details modal */}
      <Modal
        visible={detailOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Delivery Details</Text>

            <ScrollView style={styles.modalBody}>
              {selectedOrder ? (
                <>
                  <Text style={styles.modalLabel}>Order ID</Text>
                  <Text style={styles.modalValue}>
                    {selectedOrder.id ?? 'N/A'}
                  </Text>

                  <Text style={styles.modalLabel}>Customer</Text>
                  <Text style={styles.modalValue}>
                    {selectedOrder.customer_name ?? 'N/A'}
                  </Text>

                  <Text style={styles.modalLabel}>Delivery Address</Text>
                  <Text style={styles.modalValue}>
                    {selectedOrder.customer_address ||
                      selectedOrder.restaurant_address ||
                      'N/A'}
                  </Text>

                  <Text style={styles.modalLabel}>Status</Text>
                  <Text style={styles.modalValue}>
                    {formatStatus(selectedOrder.status)}
                  </Text>
                </>
              ) : (
                <Text style={styles.modalValue}>No order selected.</Text>
              )}
            </ScrollView>

            <Pressable
              style={styles.modalButton}
              onPress={() => setDetailOpen(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerBar: {
    flexDirection: 'row',
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  headerText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  headerAddress: { flex: 3 },
  headerStatus: { flex: 1.4, textAlign: 'center' },
  headerView: { flex: 1, textAlign: 'center' },

  body: {
    flex: 1,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#b00020',
    marginBottom: 8,
    fontWeight: '600',
  },
  emptyText: {
    color: '#444',
  },
  listContainer: {
    paddingBottom: 16,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cell: {
    justifyContent: 'center',
  },
  addressCell: { flex: 3 },
  statusCell: { flex: 1.4, alignItems: 'center' },
  viewCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressText: {
    fontSize: 12,
    color: '#111',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  viewText: {
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
    color: '#0a65a0',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  modalBody: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
  },
  modalValue: {
    fontSize: 13,
    color: '#333',
  },
  modalButton: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#D86F52',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
