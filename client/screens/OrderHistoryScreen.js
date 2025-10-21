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

const formatMoney = (n) => `$${Number(n || 0).toFixed(2)}`;

export default function OrderHistoryScreen() {
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
            status: 'Delivered',
            date: '2025-10-12 11:45 AM',
            courier: 'Imedi Swift',
            items: [
              { name: 'Margherita Pizza', qty: 1, price: 12.99 },
              { name: 'Garlic Bread', qty: 2, price: 3.49 },
            ],
          },
          {
            id: 'ORD-1002',
            status: 'Preparing',
            date: '2025-10-17 03:22 PM',
            courier: 'SpeedyDash Logistics',
            items: [
              { name: 'Pasta Alfredo', qty: 1, price: 14.75 },
              { name: 'Caesar Salad', qty: 1, price: 8.5 },
            ],
          },
          {
            id: 'ORD-1003',
            status: 'Cancelled',
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

  const openDetails = (order) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  const closeDetails = () => {
    setDetailOpen(false);
    setSelectedOrder(null);
  };

  const Header = () => (
    <View style={[styles.row, styles.headerRow]}>
      <Text style={[styles.cellOrder, styles.headerText]}>Order</Text>
      <Text style={[styles.cellStatus, styles.headerText]}>Status</Text>
      <Text style={[styles.cellView, styles.headerText]}>View</Text>
    </View>
  );

  const Row = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.cellOrder}>{item.id}</Text>
      <Text style={[styles.cellStatus, styles.statusText(item.status)]}>
        {item.status}
      </Text>
      <View style={styles.cellView}>
        <Pressable style={styles.viewIconBtn} onPress={() => openDetails(item)}>
          <FontAwesome name="eye" size={18} color="#0a65a0" />
          <Text style={styles.viewIconText}>View</Text>
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

  const orderSubtotal = (order) =>
    (order?.items || []).reduce(
      (sum, it) => sum + (it.qty || 0) * (it.price || 0),
      0
    );

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(o) => o.id}
        ListHeaderComponent={Header}
        renderItem={Row}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        contentContainerStyle={{ padding: 16 }}
      />

      {/* ✅ Order History Detail Modal */}
      <Modal visible={detailOpen} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {selectedOrder && (
              <>
                <Text style={styles.modalTitle}>Order Details</Text>
                <Text style={styles.modalSub}>
                  <Text style={styles.bold}>Order ID:</Text> {selectedOrder.id}
                </Text>
                <Text style={styles.modalSub}>
                  <Text style={styles.bold}>Status:</Text> {selectedOrder.status}
                </Text>
                <Text style={styles.modalSub}>
                  <Text style={styles.bold}>Date:</Text> {selectedOrder.date}
                </Text>
                <Text style={styles.modalSub}>
                  <Text style={styles.bold}>Courier:</Text>{' '}
                  {selectedOrder.courier}
                </Text>

                <View style={styles.modalListHeader}>
                  <Text style={[styles.colName, styles.bold]}>Item</Text>
                  <Text style={[styles.colQty, styles.bold]}>Qty</Text>
                  <Text style={[styles.colPrice, styles.bold]}>Price</Text>
                  <Text style={[styles.colTotal, styles.bold]}>Total</Text>
                </View>

                <ScrollView style={{ maxHeight: 240 }}>
                  {selectedOrder.items.map((it, idx) => (
                    <View key={idx} style={styles.modalRow}>
                      <Text style={styles.colName}>{it.name}</Text>
                      <Text style={styles.colQty}>{it.qty}</Text>
                      <Text style={styles.colPrice}>{formatMoney(it.price)}</Text>
                      <Text style={styles.colTotal}>
                        {formatMoney(it.qty * it.price)}
                      </Text>
                    </View>
                  ))}
                </ScrollView>

                <View style={styles.modalFooter}>
                  <Text style={styles.modalSubtotalLabel}>Subtotal</Text>
                  <Text style={styles.modalSubtotalValue}>
                    {formatMoney(orderSubtotal(selectedOrder))}
                  </Text>
                </View>

                <Pressable style={styles.closeBtn} onPress={closeDetails}>
                  <Text style={styles.closeBtnText}>Close</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerRow: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  headerText: { fontWeight: '800', color: '#0f172a' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  sep: { height: 10 },
  cellOrder: { flex: 2, fontWeight: '700' },
  cellStatus: { flex: 1 },
  cellView: { flex: 1 },
  statusText: (status) => ({
    fontWeight: '700',
    color:
      status === 'Delivered'
        ? '#16a34a'
        : status === 'Preparing'
        ? '#0ea5e9'
        : status === 'Cancelled'
        ? '#ef4444'
        : '#334155',
  }),
  viewIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0a65a0',
    backgroundColor: '#e6f2fa',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 6,
  },
  viewIconText: { color: '#0a65a0', fontWeight: '800' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  modalTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
  modalSub: { marginBottom: 4 },
  bold: { fontWeight: '800' },
  modalListHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingVertical: 6,
    marginTop: 8,
  },
  modalRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#f5f5f5',
  },
  colName: { flex: 2 },
  colQty: { flex: 0.6, textAlign: 'center' },
  colPrice: { flex: 0.9, textAlign: 'right' },
  colTotal: { flex: 0.9, textAlign: 'right' },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  modalSubtotalLabel: { fontWeight: '700' },
  modalSubtotalValue: { fontWeight: '800' },
  closeBtn: {
    marginTop: 10,
    alignSelf: 'center',
    backgroundColor: '#0a65a0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  closeBtnText: { color: '#fff', fontWeight: '800' },
});
