// client/screens/OrderHistoryScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Alert } from 'react-native';

export default function OrderHistoryScreen() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  // Replace with real fetch to your backend later
  useEffect(() => {
    const load = async () => {
      try {
        // Simulated network delay
        await new Promise((r) => setTimeout(r, 350));
        setOrders([
          { id: 'ORD-1001', status: 'Delivered' },
          { id: 'ORD-1002', status: 'Preparing' },
          { id: 'ORD-1003', status: 'Cancelled' },
          { id: 'ORD-1004', status: 'Delivered' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const onView = (orderId) => {
    // Hook this up to an Order Details screen later
    Alert.alert('View Order', `Open details for ${orderId}`);
  };

  const Header = () => (
    <View style={[styles.row, styles.headerRow]} accessibilityRole="header">
      <Text style={[styles.cellOrder, styles.headerText]}>Order</Text>
      <Text style={[styles.cellStatus, styles.headerText]}>Status</Text>
      <Text style={[styles.cellView, styles.headerText]}>View</Text>
    </View>
  );

  const Row = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.cellOrder} numberOfLines={1}>{item.id}</Text>
      <Text style={[styles.cellStatus, styles.statusText(item.status)]}>{item.status}</Text>
      <View style={styles.cellView}>
        <Pressable style={styles.viewBtn} onPress={() => onView(item.id)} accessibilityRole="button" accessibilityLabel={`View ${item.id}`}>
          <Text style={styles.viewBtnText}>View</Text>
        </Pressable>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Loading orders…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(o) => o.id}
        ListHeaderComponent={Header}
        renderItem={Row}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', paddingVertical: 24 }}>No orders yet.</Text>}
        accessibilityLabel="Order History Table"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  headerRow: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1, borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 12,
  },
  headerText: { fontWeight: '800', color: '#0f172a' },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#e2e8f0',
    borderRadius: 10,
  },

  sep: { height: 10 },

  cellOrder: { flex: 2, fontWeight: '700' },
  cellStatus: { flex: 1 },
  cellView: { flex: 1, alignItems: 'flex-start' },

  statusText: (status) => ({
    fontWeight: '700',
    color:
      status === 'Delivered' ? '#16a34a' :
      status === 'Preparing' ? '#0ea5e9' :
      status === 'Cancelled' ? '#ef4444' :
      '#334155',
  }),

  viewBtn: {
    borderWidth: 1, borderColor: '#0a65a0',
    paddingVertical: 6, paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#0a65a0',
  },
  viewBtnText: { color: '#fff', fontWeight: '800' },
});
