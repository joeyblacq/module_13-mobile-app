// client/screens/MenuScreen.js
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, StyleSheet, Pressable } from 'react-native';

// TODO: point to your backend host:port
const BASE_URL = 'http://localhost:8080';

export default function MenuScreen({ route }) {
  const { id } = route.params; // restaurant id
  const [menu, setMenu] = useState(null); // null=loading
  const [error, setError] = useState('');

  // Quantities keyed by menu item id; default 0
  const [qty, setQty] = useState({}); // e.g., { 'm-1': 2, 'm-2': 0 }

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/restaurants/${id}/menu`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const items = Array.isArray(data) ? data : [];

        // Normalize ids and prices, then set default quantities to 0
        const normalized = items.map((it, idx) => ({
          id: it.id ?? `m-${id}-${idx + 1}`,
          name: it.name ?? `Item ${idx + 1}`,
          desc: it.desc ?? it.description ?? '',
          price: typeof it.price === 'number' ? it.price : Number(it.price) || 0,
        }));

        setMenu(normalized);
        // default all quantities to 0
        const zeroQty = {};
        normalized.forEach((it) => (zeroQty[String(it.id)] = 0));
        setQty(zeroQty);
      } catch {
        // Fallback mock data so screen works without API
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

  const subtotal = useMemo(() => {
    if (!Array.isArray(menu)) return 0;
    return menu.reduce((sum, it) => sum + (qty[String(it.id)] || 0) * (it.price || 0), 0);
  }, [menu, qty]);

  const inc = (itemId) => {
    setQty((prev) => {
      const key = String(itemId);
      const next = { ...prev, [key]: (prev[key] || 0) + 1 };
      return next;
    });
  };

  const dec = (itemId) => {
    setQty((prev) => {
      const key = String(itemId);
      const current = prev[key] || 0;
      // CANNOT be negative: clamp at 0
      const nextVal = Math.max(0, current - 1);
      const next = { ...prev, [key]: nextVal };
      return next;
    });
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
    const count = qty[String(item.id)] ?? 0; // default 0
    const lineTotal = (count * (item.price || 0)).toFixed(2);

    return (
      <View style={styles.item}>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemName}>{item.name}</Text>
          {item.desc ? <Text style={styles.itemDesc}>{item.desc}</Text> : null}
          <Text style={styles.itemPrice}>${Number(item.price).toFixed(2)}</Text>
        </View>

        {/* Quantity controls */}
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

          <Text style={styles.qtyVal}>{count}</Text>

          <Pressable
            style={styles.qtyBtn}
            onPress={() => inc(item.id)}
            accessibilityRole="button"
            accessibilityLabel={`Increase ${item.name} quantity`}
          >
            <Text style={styles.qtyBtnText}>+</Text>
          </Pressable>
        </View>

        {/* Line total (optional visual) */}
        <View style={styles.lineTotal}>
          <Text style={styles.lineTotalText}>${lineTotal}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {error ? <Text style={styles.warn}>{error}</Text> : null}

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

      {/* Simple footer summary */}
      <View style={styles.footer}>
        <Text style={styles.subtotalLabel}>Subtotal:</Text>
        <Text style={styles.subtotalValue}>${subtotal.toFixed(2)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  warn: { color: '#8a6d3b', backgroundColor: '#fcf8e3', padding: 8, textAlign: 'center' },

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
  qtyBtnDisabled: {
    opacity: 0.4,
  },
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
    justifyContent: 'space-between',
  },
  subtotalLabel: { fontSize: 16, fontWeight: '700' },
  subtotalValue: { fontSize: 16, fontWeight: '800' },
});
