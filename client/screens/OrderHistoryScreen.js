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
  ScrollView,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppHeader from '../components/AppHeader';

const formatMoney = (n) => `$${Number(n || 0).toFixed(2)}`;

export default function OrderHistoryScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
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
    } catch (e) {}
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
      0,
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
      <View style={styles.screen}>
        <AppHeader navigation={navigation} />
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <AppHeader navigation={navigation} />

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

      {/* Order History Detail Modal */}
      <Modal visible={detailOpen} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {selectedOrder && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalHeaderTitle}>
                    {selectedOrder.restaurant}
                  </Text>
                  <Pressable onPress={closeDetails}>
                    <FontAwesome name="close" size={20} color="#ffffff" />
                  </Pressable>
                </View>

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

                  <View style={styles.modalListHeader}>
                    <Text style={[styles.colName, styles.bold]}>Item</Text>
                    <Text style={[styles.colQty, styles.bold]}>Qty</Text>
                    <Text style={[styles.colPrice, styles.bold]}>Price</Text>
                    <Text style={[styles.colTotal, styles.bold]}>Total</Text>
                  </View>

                  <ScrollView style={{ maxHeight: 220 }}>
                    {selectedOrder.items.map((it, idx) => (
                      <View key={idx} style={styles.modalRow}>
                        <Text style={styles.colName}>{it.name}</Text>
                        <Text style={styles.colQty}>{it.qty}</Text>
                        <Text style={styles.colPrice}>
                          {formatMoney(it.price)}
                        </Text>
                        <Text style={styles.colTotal}>
                          {formatMoney(it.qty * it.price)}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>

                  <View style={styles.modalFooter}>
                    <Text style={styles.modalSubtotalLabel}>TOTAL:</Text>
                    <Text style={styles.modalSubtotalValue}>
                      {formatMoney(orderSubtotal(selectedOrder))}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 8, fontFamily: 'Arial' },

  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 10,
    marginHorizontal: 16,
    marginBottom: 6,
    fontFamily: 'Arial',
  },

  headerRow: {
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  headerText: {
    fontWeight: '800',
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Arial',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  dataRow: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  sep: { height: 10 },

  cellOrder: { flex: 2, fontWeight: '700', fontSize: 14, fontFamily: 'Arial' },
  cellStatus: { flex: 1, fontSize: 13 },
  cellView: {
    flex: 1,
    alignItems: 'flex-end',
  },

  statusText: (status) => ({
    fontWeight: '700',
    color:
      status === 'PENDING'
        ? '#f97316'
        : status === 'DELIVERED'
        ? '#16a34a'
        : status === 'CANCELLED'
        ? '#ef4444'
        : '#334155',
    fontFamily: 'Arial',
  }),

  iconButton: {
    borderRadius: 999,
    padding: 8,
    backgroundColor: '#e5e7eb',
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
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
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16,
    fontFamily: 'Arial',
  },
  modalBody: {
    padding: 16,
  },
  modalMeta: {
    marginBottom: 4,
    fontSize: 13,
    fontFamily: 'Arial',
  },
  metaLabel: {
    fontWeight: '700',
    fontFamily: 'Arial',
  },
  bold: { fontWeight: '800', fontFamily: 'Arial' },

  modalListHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 6,
    marginTop: 10,
  },
  modalRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#f3f4f6',
  },
  colName: { flex: 2, fontSize: 13, fontFamily: 'Arial' },
  colQty: { flex: 0.6, textAlign: 'center', fontSize: 13, fontFamily: 'Arial' },
  colPrice: {
    flex: 0.9,
    textAlign: 'right',
    fontSize: 13,
    fontFamily: 'Arial',
  },
  colTotal: {
    flex: 0.9,
    textAlign: 'right',
    fontSize: 13,
    fontFamily: 'Arial',
  },

  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  modalSubtotalLabel: {
    fontWeight: '800',
    fontSize: 14,
    fontFamily: 'Arial',
  },
  modalSubtotalValue: {
    fontWeight: '800',
    fontSize: 14,
    fontFamily: 'Arial',
  },
});
