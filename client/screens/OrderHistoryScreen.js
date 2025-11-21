// client/screens/OrderHistoryScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'react-native';

const formatMoney = (n) => `$${Number(n || 0).toFixed(2)}`;

export default function OrderHistoryScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        // fake loading to simulate API
        await new Promise((r) => setTimeout(r, 350));
        setOrders([
          {
            id: 'ORD-1001',
            restaurant: 'Sweet Dragon',
            status: 'PENDING',
            date: '2025-10-12 11:45 AM',
            courier: 'Imedi Swift',
            items: [
              { name: 'Margherita Pizza', qty: 1, price: 12.99 },
              { name: 'Garlic Bread', qty: 2, price: 3.49 },
            ],
          },
          {
            id: 'ORD-1002',
            restaurant: 'Spice BBQ',
            status: 'PENDING',
            date: '2025-10-17 03:22 PM',
            courier: 'SpeedyDash Logistics',
            items: [
              { name: 'Pasta Alfredo', qty: 1, price: 14.75 },
              { name: 'Caesar Salad', qty: 1, price: 8.5 },
            ],
          },
          {
            id: 'ORD-1003',
            restaurant: 'Golden Bar & Grill',
            status: 'PENDING',
            date: '2025-10-19 09:10 AM',
            courier: 'N/A',
            items: [{ name: 'Tiramisu', qty: 3, price: 5.99 }],
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('auth_token');
    } catch (e) {
      // ignore storage errors
    }
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const openDetails = (order) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  const closeDetails = () => {
    setDetailOpen(false);
    setSelectedOrder(null);
  };

  const orderSubtotal = (order) =>
    (order?.items || []).reduce(
      (sum, it) => sum + (it.qty || 0) * (it.price || 0),
      0
    );

  const HeaderRow = () => (
    <View style={[styles.row, styles.headerRow]}>
      <Text style={[styles.cellOrder, styles.headerText]}>ORDER</Text>
      <Text style={[styles.cellStatus, styles.headerText]}>STATUS</Text>
      <Text style={[styles.cellView, styles.headerText]}>VIEW</Text>
    </View>
  );

  const Row = ({ item }) => (
    <View style={[styles.row, styles.dataRow]}>
      <Text style={styles.cellOrder}>{item.restaurant}</Text>

      <Text style={[styles.cellStatus, styles.statusText(item.status)]}>
        {item.status}
      </Text>

      <View style={styles.cellView}>
        <Pressable onPress={() => openDetails(item)} style={styles.iconButton}>
          <FontAwesome name="search" size={16} color="#111827" />
        </Pressable>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Header with logo + logout (matches other screens) */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require('../assets/Images/rocket_logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <FontAwesome name="sign-out" size={16} color="#0a65a0" />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.pageTitle}>My Orders</Text>

        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          ListHeaderComponent={HeaderRow}
          renderItem={Row}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          contentContainerStyle={styles.listContent}
        />
      </View>

      {/* Order History Detail Modal (styled like wireframe) */}
      <Modal visible={detailOpen} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          {selectedOrder && (
            <View style={styles.modalCard}>
              {/* Top dark header with restaurant name */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderTitle}>
                  {selectedOrder.restaurant}
                </Text>
                <Pressable onPress={closeDetails}>
                  <FontAwesome name="close" size={20} color="#ffffff" />
                </Pressable>
              </View>

              {/* Body */}
              <View style={styles.modalBody}>
                <Text style={styles.modalMeta}>
                  <Text style={styles.metaLabel}>Order Date: </Text>
                  {selectedOrder.date}
                </Text>

                <Text style={styles.modalMeta}>
                  <Text style={styles.metaLabel}>Status: </Text>
                  <Text style={styles.statusText(selectedOrder.status)}>
                    {selectedOrder.status}
                  </Text>
                </Text>

                <Text style={styles.modalMeta}>
                  <Text style={styles.metaLabel}>Courier: </Text>
                  {selectedOrder.courier}
                </Text>

                {/* Items list */}
                <View style={styles.modalItemsBox}>
                  {selectedOrder.items.map((it, idx) => (
                    <View key={idx} style={styles.modalItemRow}>
                      <Text style={styles.modalItemName}>{it.name}</Text>
                      <Text style={styles.modalItemQty}>x{it.qty}</Text>
                      <Text style={styles.modalItemPrice}>
                        {formatMoney(it.qty * it.price)}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Total row */}
                <View style={styles.modalFooter}>
                  <Text style={styles.modalSubtotalLabel}>TOTAL:</Text>
                  <Text style={styles.modalSubtotalValue}>
                    {formatMoney(orderSubtotal(selectedOrder))}
                  </Text>
                </View>
              </View>
            </View>
          )}
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

  // Header (same pattern as Restaurants/Menu)
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 140,
    height: 40,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#0a65a0',
    backgroundColor: '#ffffff',
  },
  logoutText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
    color: '#0a65a0',
  },

  content: {
    flex: 1,
  },

  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 10,
    marginHorizontal: 16,
    marginBottom: 6,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // table header row
  headerRow: {
    backgroundColor: '#111827',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  headerText: {
    fontWeight: '800',
    color: '#ffffff',
    fontSize: 13,
  },

  // shared row base
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // data rows look like simple white cards
  dataRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  sep: { height: 8 },

  cellOrder: { flex: 2, fontWeight: '700', fontSize: 14 },
  cellStatus: { flex: 1, fontSize: 13 },
  cellView: {
    flex: 0.7,
    alignItems: 'flex-end',
  },

  iconButton: {
    padding: 4,
  },

  statusText: (status) => ({
    fontWeight: '700',
    color:
      status === 'PENDING'
        ? '#f97316' // orange
        : status === 'DELIVERED'
        ? '#16a34a'
        : status === 'CANCELLED'
        ? '#ef4444'
        : '#334155',
  }),

  // modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '88%',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    backgroundColor: '#111827',
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalHeaderTitle: {
    color: '#f97316', // orange restaurant name like wireframe
    fontWeight: '800',
    fontSize: 16,
  },
  modalBody: {
    padding: 16,
  },
  modalMeta: {
    marginBottom: 4,
    fontSize: 13,
    color: '#111827',
  },
  metaLabel: {
    fontWeight: '700',
  },

  modalItemsBox: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
  },
  modalItemRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  modalItemName: {
    flex: 2,
    fontSize: 13,
  },
  modalItemQty: {
    flex: 0.6,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
  },
  modalItemPrice: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '600',
  },

  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  modalSubtotalLabel: {
    fontWeight: '800',
    fontSize: 14,
    marginRight: 4,
  },
  modalSubtotalValue: {
    fontWeight: '800',
    fontSize: 14,
  },
});
