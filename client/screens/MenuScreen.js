// client/screens/MenuScreen.js
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, StyleSheet, Pressable, Alert, Modal, ScrollView, Image } from 'react-native';

// TODO: point to your backend host:port
const BASE_URL = 'http://localhost:8080';

// Shared menu image for ALL restaurants (path is from /client/screens to /client/assets)
const MENU_HERO = require('../assets/RestaurantMenu.jpg');

export default function MenuScreen({ route }) {
  const { id, name } = route.params; // restaurant id (+ optional name for header)
  const [menu, setMenu] = useState(null); // null=loading
  const [error, setError] = useState('');

  // Quantities keyed by menu item id; default 0
  const [qty, setQty] = useState({});

  // Order confirmation modal
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Reset quantities & state when switching restaurants
  useEffect(() => {
    setQty({});
    setMenu(null);
    setError('');
    setConfirmOpen(false);
  }, [id]);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/restaurants/${id}/menu`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const items = Array.isArray(data) ? data : [];

        // Normalize
        const normalized = items.map((it, idx) => ({
          id: it.id ?? `m-${id}-${idx + 1}`,
          name: it.name ?? `Item ${idx + 1}`,
          desc: it.desc ?? it.description ?? '',
          price: typeof it.price === 'number' ? it.price : Number(it.price) || 0,
        }));

        setMenu(normalized);

        // Default all quantities to 0
        const zeroQty = {};
        normalized.forEach((it) => (zeroQty[String(it.id)] = 0));
        setQty(zeroQty);
      } catch {
        // Fallback mock data
        const mock = [
          { id: `m-${id}-1`, name: 'Margherita Pizza', desc: 'Tomato, mozzarella, basil', price: 12.99 },
          { id: `m-${id}-2`, name: 'Caesar Salad', desc: 'Romaine, parmesan, croutons', price: 8.5 },
          { id: `m-${id}-3`, name: 'Tiramisu', desc: 'Coffee-soaked ladyfingers, mascarpone', price: 6.75 },
        ];
        setMenu(mock);
        const zeroQty = {};
        mock.forEach((it) => (zeroQty[String(it.id)] = 0));
        setQty(zeroQty);
        setError('Using mock data (API fetch failed).');
      }
    };
    fetchMenu();
  }, [id]);

  const selectedItems = useMemo(() => {
    if (!Array.isArray(menu)) return [];
    return menu
      .map((it) => ({ ...it, qty: qty[String(it.id)] || 0 }))
      .filter((it) => it.qty > 0);
  }, [menu, qty]);

  const subtotal = useMemo(() => {
    return selectedItems.reduce((sum, it) => sum + it.qty * (it.price || 0), 0);
  }, [selectedItems]);

  // Enabled only when at least one quantity > 0
  const hasAnyItems = selectedItems.length > 0;

  const inc = (itemId) => {
    setQty((prev) => {
      const key = String(itemId);
      return { ...prev, [key]: (prev[key] || 0) + 1 };
    });
  };

  const dec = (itemId) => {
    setQty((prev) => {
      const key = String(itemId);
      const current = prev[key] || 0;
      // Never negative
      return { ...prev, [key]: Math.max(0, current - 1) };
    });
  };

  const onCreateOrder = () => {
    if (!hasAnyItems) return; // guard
    setConfirmOpen(true);
  };

  const onConfirmOrder = () => {
    // Replace with API call to create order
    setConfirmOpen(false);
    Alert.alert('Order Created', `Restaurant: ${name || id}\nItems: ${selectedItems.length}\nTotal: $${subtotal.toFixed(2)}`);
  };

  const onCancelOrder = () => setConfirmOpen(false);

  if (menu === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Loading menu…</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => {
    const count = qty[String(item.id)] ?? 0;
    const lineTotal = (count * (item.price || 0)).toFixed(2);

    return (
      <View style={styles.item}>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemName}>{item.name}</Text>
          {item.desc ? <Text style={styles.itemDesc}>{item.desc}</Text> : null}
          <Text style={styles.itemPrice}>${Number(item.price).toFixed(2)}</Text>
        </View>

        {/* Quantity controls (buttons only; no typing) */}
        <View style={styles.qtyBox}>
          <Pressable
            style={[styles.qtyBtn, count === 0 && styles.qtyBtnDisabled]}
            onPress={() => dec(item.id)}
            disabled={count === 0}
            accessibilityRole="button"
            accessibilityLabel={`Decrease ${item.name} quantity`}
          >
            <Text style={[styles.qtyBtnText, count === 0 && styles.qtyBtnTextDisabled]}>−</Text>
          </Pressable>

          <Text style={styles.qtyVal} accessibilityLabel={`Quantity for ${item.name}`}>{count}</Text>

          <Pressable
            style={styles.qtyBtn}
            onPress={() => inc(item.id)}
            accessibilityRole="button"
            accessibilityLabel={`Increase ${item.name} quantity`}
          >
            <Text style={styles.qtyBtnText}>+</Text>
          </Pressable>
        </View>

        <View style={styles.lineTotal}>
          <Text style={styles.lineTotalText}>${lineTotal}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {error ? <Text style={styles.warn}>{error}</Text> : null}

      {/* Shared menu image for ALL restaurants */}
      <Image source={MENU_HERO} style={styles.menuImage} resizeMode="cover" />

      <FlatList
        data={menu}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text>No menu items found.</Text>
          </View>
        }
      />

      {/* Footer summary + Create Order button */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Text style={styles.subtotalLabel}>Subtotal:</Text>
          <Text style={styles.subtotalValue}>${subtotal.toFixed(2)}</Text>
        </View>

        <Pressable
          onPress={onCreateOrder}
          disabled={!hasAnyItems}
          style={[styles.cta, !hasAnyItems && styles.ctaDisabled]}
          accessibilityRole="button"
          accessibilityState={{ disabled: !hasAnyItems }}
          accessibilityLabel="Create Order"
        >
          <Text style={[styles.ctaText, !hasAnyItems && styles.ctaTextDisabled]}>Create Order</Text>
        </Pressable>
      </View>

      {/* Order Confirmation Modal */}
      <Modal visible={confirmOpen} transparent animationType="fade" onRequestClose={onCancelOrder}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirm Your Order</Text>
            <Text style={styles.modalSubtitle}>{name ? `Restaurant: ${name}` : `Restaurant ID: ${id}`}</Text>

            <View style={styles.modalListHeader}>
              <Text style={[styles.colName, styles.bold]}>Item</Text>
              <Text style={[styles.colQty, styles.bold]}>Qty</Text>
              <Text style={[styles.colPrice, styles.bold]}>Price</Text>
              <Text style={[styles.colTotal, styles.bold]}>Total</Text>
            </View>

            <ScrollView style={{ maxHeight: 240 }}>
              {selectedItems.map((it) => (
                <View key={String(it.id)} style={styles.modalRow}>
                  <Text style={styles.colName}>{it.name}</Text>
                  <Text style={styles.colQty}>{it.qty}</Text>
                  <Text style={styles.colPrice}>${Number(it.price).toFixed(2)}</Text>
                  <Text style={styles.colTotal}>${(it.qty * it.price).toFixed(2)}</Text>
                </View>
              ))}
              {selectedItems.length === 0 && (
                <Text style={{ textAlign: 'center', paddingVertical: 12 }}>No items selected.</Text>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Text style={styles.modalSubtotalLabel}>Subtotal</Text>
              <Text style={styles.modalSubtotalValue}>${subtotal.toFixed(2)}</Text>
            </View>

            <View style={styles.modalActions}>
              <Pressable style={[styles.modalBtn, styles.modalCancel]} onPress={onCancelOrder}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, styles.modalConfirm]}
                onPress={onConfirmOrder}
                accessibilityRole="button"
                accessibilityLabel="Confirm Order"
              >
                <Text style={[styles.modalBtnText, styles.modalConfirmText]}>Confirm Order</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  warn: { color: '#8a6d3b', backgroundColor: '#fcf8e3', padding: 8, textAlign: 'center' },

  // Shared menu image styling
  menuImage: { width: '100%', height: 160, backgroundColor: '#f2f2f2' },

  item: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemName: { fontSize: 16, fontWeight: '700' },
  itemDesc: { color: '#555', marginTop: 2 },
  itemPrice: { marginTop: 6, fontWeight: '800' },

  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  qtyBtn: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
  },
  qtyBtnDisabled: { opacity: 0.4 },
  qtyBtnText: { fontSize: 18, fontWeight: '900' },
  qtyBtnTextDisabled: { color: '#94a3b8' },
  qtyVal: { minWidth: 20, textAlign: 'center', fontWeight: '800' },

  lineTotal: { minWidth: 64, alignItems: 'flex-end', marginLeft: 'auto' },
  lineTotalText: { fontWeight: '800' },

  footer: {
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  subtotalLabel: { fontSize: 16, fontWeight: '700' },
  subtotalValue: { fontSize: 16, fontWeight: '800' },

  cta: { backgroundColor: '#0a65a0', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10 },
  ctaDisabled: { backgroundColor: '#9bbbd0' },
  ctaText: { color: '#fff', fontWeight: '800' },
  ctaTextDisabled: { color: '#f1f5f9' },

  // Modal
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
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 4, textAlign: 'center' },
  modalSubtitle: { textAlign: 'center', color: '#475569', marginBottom: 10 },

  modalListHeader: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#eee',
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
  bold: { fontWeight: '800' },

  modalFooter: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10 },
  modalSubtotalLabel: { fontWeight: '700' },
  modalSubtotalValue: { fontWeight: '800' },

  modalActions: { marginTop: 12, flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  modalBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb' },
  modalCancel: { backgroundColor: '#fff' },
  modalConfirm: { backgroundColor: '#0a65a0' },
  modalBtnText: { fontWeight: '800' },
  modalConfirmText: { color: '#fff' },
});
