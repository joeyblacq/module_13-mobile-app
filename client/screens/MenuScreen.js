// client/screens/MenuScreen.js
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, StyleSheet, Pressable, Alert, Modal, ScrollView, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

// TODO: point to your backend base URL
const BASE_URL = 'http://localhost:8080';

// Shared menu image for ALL restaurants
const MENU_HERO = require('../assets/RestaurantMenu.jpg');

// Format numbers as $X.YY
const formatMoney = (n) => `$${Number(n || 0).toFixed(2)}`;

// Heuristic cents→dollars normalization (e.g., 2095 -> 20.95)
const normalizePrice = (raw) => {
  const num = Number(raw);
  if (!isFinite(num)) return 0;
  if (Number.isInteger(num) && num >= 100) return num / 100;
  return num;
};

export default function MenuScreen({ route }) {
  const { id, name } = route.params; // restaurant id (+ optional name)
  const [menu, setMenu] = useState(null); // null=loading
  const [error, setError] = useState('');

  // Quantities keyed by menu item id; default 0
  const [qty, setQty] = useState({});

  // Order confirmation modal
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Processing state: disables CTA and shows "Processing Order…"
  const [processing, setProcessing] = useState(false);

  // Success state: after a successful order, hide CTA and show green check + message
  const [orderSuccess, setOrderSuccess] = useState(false);

  // ❗ Failure state/message shown inside the modal with red X
  const [orderError, setOrderError] = useState('');

  // Reset when switching restaurants
  useEffect(() => {
    setQty({});
    setMenu(null);
    setError('');
    setConfirmOpen(false);
    setProcessing(false);
    setOrderSuccess(false);
    setOrderError('');
  }, [id]);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/restaurants/${id}/menu`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const items = Array.isArray(data) ? data : [];

        const normalized = items.map((it, idx) => ({
          id: it.id ?? `m-${id}-${idx + 1}`,
          name: it.name ?? `Item ${idx + 1}`,
          desc: it.desc ?? it.description ?? '',
          price: normalizePrice(it.price),
        }));

        setMenu(normalized);

        const zero = {};
        normalized.forEach((it) => (zero[String(it.id)] = 0));
        setQty(zero);
      } catch {
        const mock = [
          { id: `m-${id}-1`, name: 'Margherita Pizza', desc: 'Tomato, mozzarella, basil', price: 12.99 },
          { id: `m-${id}-2`, name: 'Caesar Salad', desc: 'Romaine, parmesan, croutons', price: 8.5 },
          { id: `m-${id}-3`, name: 'Tiramisu', desc: 'Coffee-soaked ladyfingers, mascarpone', price: 6.75 },
        ];
        setMenu(mock);
        const zero = {};
        mock.forEach((it) => (zero[String(it.id)] = 0));
        setQty(zero);
        setError('Using mock data (API fetch failed).');
      }
    };
    fetchMenu();
  }, [id]);

  // Selected items for modal & totals
  const selectedItems = useMemo(() => {
    if (!Array.isArray(menu)) return [];
    return menu
      .map((it) => ({ ...it, qty: qty[String(it.id)] || 0 }))
      .filter((it) => it.qty > 0);
  }, [menu, qty]);

  const subtotal = useMemo(
    () => selectedItems.reduce((sum, it) => sum + it.qty * (it.price || 0), 0),
    [selectedItems]
  );

  // Enabled only when at least one quantity > 0 (and not processing)
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
      return { ...prev, [key]: Math.max(0, current - 1) }; // never negative
    });
  };

  const onCreateOrder = () => {
    if (!hasAnyItems || processing || orderSuccess) return; // guard
    setOrderError(''); // clear any previous failure message
    setConfirmOpen(true);
  };

  const onConfirmOrder = async () => {
    // Keep modal open during processing so failures can show inside it
    setProcessing(true);
    setOrderError('');
    try {
      // Build payload
      const items = selectedItems.map((it) => ({
        id: it.id,
        name: it.name,
        qty: it.qty,
        price: it.price,
        total: it.qty * (it.price || 0),
      }));

      // Simulated/real API call
      const res = await fetch(`${BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: id,
          restaurantName: name ?? null,
          items,
          subtotal,
        }),
      });

      if (!res.ok) {
        const msg = `HTTP ${res.status}`;
        throw new Error(msg);
      }

      // Success UX
      setOrderSuccess(true); // hide CTA and show success banner in footer
      setConfirmOpen(false); // close modal on success
      Alert.alert('Order Created', `Restaurant: ${name || id}\nItems: ${items.length}\nTotal: ${formatMoney(subtotal)}`);

      // (Optional) reset quantities after successful order:
      const zero = {};
      Object.keys(qty).forEach((k) => (zero[k] = 0));
      setQty(zero);
    } catch (e) {
      // ❌ Failure: show red X + message, re-enable "Confirm Order" button
      setOrderError(e?.message ? `Order failed: ${e.message}` : 'Order failed. Please try again.');
    } finally {
      setProcessing(false); // allow trying again (if failed)
    }
  };

  const onCancelOrder = () => {
    if (processing) return; // don't allow closing while processing
    setConfirmOpen(false);
  };

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
    const lineTotal = count * (item.price || 0);

    return (
      <View style={styles.item}>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemName}>{item.name}</Text>
          {item.desc ? <Text style={styles.itemDesc}>{item.desc}</Text> : null}
          <Text style={styles.itemPrice}>{formatMoney(item.price)}</Text>
        </View>

        {/* Quantity controls (buttons only; no typing) */}
        <View style={styles.qtyBox}>
          <Pressable
            style={[styles.qtyBtn, (count === 0 || processing || orderSuccess) && styles.qtyBtnDisabled]}
            onPress={() => dec(item.id)}
            disabled={count === 0 || processing || orderSuccess}
            accessibilityRole="button"
            accessibilityLabel={`Decrease ${item.name} quantity`}
          >
            <Text style={[styles.qtyBtnText, (count === 0 || processing || orderSuccess) && styles.qtyBtnTextDisabled]}>−</Text>
          </Pressable>

          <Text style={styles.qtyVal} accessibilityLabel={`Quantity for ${item.name}`}>{count}</Text>

          <Pressable
            style={[styles.qtyBtn, (processing || orderSuccess) && styles.qtyBtnDisabled]}
            onPress={() => inc(item.id)}
            disabled={processing || orderSuccess}
            accessibilityRole="button"
            accessibilityLabel={`Increase ${item.name} quantity`}
          >
            <Text style={[styles.qtyBtnText, (processing || orderSuccess) && styles.qtyBtnTextDisabled]}>+</Text>
          </Pressable>
        </View>

        <View style={styles.lineTotal}>
          <Text style={styles.lineTotalText}>{formatMoney(lineTotal)}</Text>
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

      {/* Footer summary + CTA or Success Banner */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Text style={styles.subtotalLabel}>Subtotal:</Text>
          <Text style={styles.subtotalValue}>{formatMoney(subtotal)}</Text>
        </View>

        {orderSuccess ? (
          <View style={styles.successWrap} accessibilityRole="status" accessibilityLabel="Order successfully placed">
            <FontAwesome name="check-circle" size={18} color="#16a34a" />
            <Text style={styles.successText}>Order placed successfully!</Text>
          </View>
        ) : (
          <Pressable
            onPress={onCreateOrder}
            disabled={!hasAnyItems || processing}
            style={[styles.cta, (!hasAnyItems || processing) && styles.ctaDisabled]}
            accessibilityRole="button"
            accessibilityState={{ disabled: !hasAnyItems || processing }}
            accessibilityLabel="Create Order"
          >
            <Text style={[styles.ctaText, (!hasAnyItems || processing) && styles.ctaTextDisabled]}>
              {processing ? 'Processing Order…' : 'Create Order'}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Order Confirmation Modal */}
      <Modal visible={confirmOpen} transparent animationType="fade" onRequestClose={onCancelOrder}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirm Your Order</Text>
            <Text style={styles.modalSubtitle}>{name ? `Restaurant: ${name}` : `Restaurant ID: ${id}`}</Text>

            {/* ❌ Failure banner shows when an API error occurs */}
            {!!orderError && (
              <View style={styles.errorWrap} accessibilityRole="alert" accessibilityLabel="Order failed">
                <FontAwesome name="times-circle" size={18} color="#b91c1c" />
                <Text style={styles.errorText}>{orderError}</Text>
              </View>
            )}

            <View style={styles.modalListHeader}>
              <Text style={[styles.colName, styles.bold]}>Item</Text>
              <Text style={[styles.colQty, styles.bold]}>Qty</Text>
              <Text style={[styles.colPrice, styles.bold]}>Price</Text>
              <Text style={[styles.colTotal, styles.bold]}>Total</Text>
            </View>

            <ScrollView style={{ maxHeight: 240 }}>
              {selectedItems.map((it) => {
                const rowTotal = it.qty * (it.price || 0);
                return (
                  <View key={String(it.id)} style={styles.modalRow}>
                    <Text style={styles.colName}>{it.name}</Text>
                    <Text style={styles.colQty}>{it.qty}</Text>
                    <Text style={styles.colPrice}>{formatMoney(it.price)}</Text>
                    <Text style={styles.colTotal}>{formatMoney(rowTotal)}</Text>
                  </View>
                );
              })}
              {selectedItems.length === 0 && (
                <Text style={{ textAlign: 'center', paddingVertical: 12 }}>No items selected.</Text>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Text style={styles.modalSubtotalLabel}>Subtotal</Text>
              <Text style={styles.modalSubtotalValue}>{formatMoney(subtotal)}</Text>
            </View>

            <View style={styles.modalActions}>
              <Pressable style={[styles.modalBtn, styles.modalCancel]} onPress={onCancelOrder} disabled={processing}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, styles.modalConfirm, processing && styles.modalConfirmDisabled]}
                onPress={onConfirmOrder}
                disabled={processing}
                accessibilityRole="button"
                accessibilityLabel="Confirm Order"
              >
                <Text style={[styles.modalBtnText, styles.modalConfirmText]}>
                  {processing ? 'Processing…' : 'Confirm Order'}
                </Text>
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

  // Success banner styles
  successWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  successText: { color: '#065f46', fontWeight: '800' },

  // Failure banner in modal
  errorWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 8,
    marginBottom: 6,
  },
  errorText: { color: '#7f1d1d', fontWeight: '800', flexShrink: 1 },

  // Modal
  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%', backgroundColor: '#fff', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 4, textAlign: 'center' },
  modalSubtitle: { textAlign: 'center', color: '#475569', marginBottom: 10 },

  modalListHeader: {
    flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1, borderColor: '#eee',
  },
  modalRow: {
    flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1, borderColor: '#f5f5f5',
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
  modalConfirmDisabled: { backgroundColor: '#9bbbd0', borderColor: '#9bbbd0' },
});
