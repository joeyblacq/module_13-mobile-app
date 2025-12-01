// client/screens/MenuScreen.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import OrderConfirmationModal from './OrderConfirmationModal';
import OrderDetailModal from './OrderDetailModal';

const BASE_URL = `${process.env.EXPO_PUBLIC_NGROK_URL}`;
import MENU_HERO from '../assets/Images/RestaurantMenu.jpg';

const formatMoney = (n) => `$${Number(n || 0).toFixed(2)}`;
const normalizePrice = (raw) => {
  const num = Number(raw);
  if (!isFinite(num)) return 0;
  if (Number.isInteger(num) && num >= 100) return num / 100;
  return num;
};

export default function MenuScreen({ route }) {
  const { id, name } = route.params;
  const [menu, setMenu] = useState(null);
  const [error, setError] = useState('');
  const [qty, setQty] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState('');

  // Reset state when restaurant changes
  useEffect(() => {
    setQty({});
    setMenu(null);
    setError('');
    setConfirmOpen(false);
    setProcessing(false);
    setOrderSuccess(false);
    setOrderError('');
  }, [id]);

  // Auto-hide the success banner after 2 seconds
  useEffect(() => {
    if (!orderSuccess) return;
    const timer = setTimeout(() => {
      setOrderSuccess(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [orderSuccess]);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/products?restaurant=${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const items = Array.isArray(data) ? data : [];

        const normalized = items.map((it, idx) => ({
          id: it.id ?? `m-${id}-${idx + 1}`,
          name: it.name ?? `Item ${idx + 1}`,
          desc: it.desc ?? it.description ?? '',
          price: normalizePrice(it.cost),
        }));

        setMenu(normalized);
        const zero = {};
        normalized.forEach((it) => (zero[String(it.id)] = 0));
        setQty(zero);
      } catch {
        const mock = [
          {
            id: `m-${id}-1`,
            name: 'Margherita Pizza',
            desc: 'Tomato, mozzarella, basil',
            price: 12.99,
          },
          {
            id: `m-${id}-2`,
            name: 'Caesar Salad',
            desc: 'Romaine, parmesan, croutons',
            price: 8.5,
          },
          {
            id: `m-${id}-3`,
            name: 'Tiramisu',
            desc: 'Coffee-soaked ladyfingers, mascarpone',
            price: 6.75,
          },
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
      return { ...prev, [key]: Math.max(0, current - 1) };
    });
  };

  const onCreateOrder = () => {
    // 👇 only block when no items or processing; don't block on orderSuccess
    if (!hasAnyItems || processing) return;
    setOrderError('');
    setConfirmOpen(true);
  };

  const onConfirmOrder = async () => {
    setProcessing(true);
    setOrderError('');

    try {
      const items = selectedItems.map((it) => ({
        id: it.id,
        quantity: it.qty,
      }));

      const res = await fetch(`${BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_id: id,
          customer_id: 1,
          products: items,
        }),
      });

      if (!res.ok) throw new Error('Order request failed');

      // ✅ show success banner + close modal
      setOrderSuccess(true);
      setConfirmOpen(false);

      Alert.alert(
        'Order Created',
        `Restaurant: ${name || id}\nItems: ${items.length}\nTotal: ${formatMoney(
          subtotal
        )}`
      );

      // reset quantities
      const reset = {};
      Object.keys(qty).forEach((k) => (reset[k] = 0));
      setQty(reset);
    } catch (e) {
      setOrderError('Order failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const onCancelOrder = () => {
    if (!processing) setConfirmOpen(false);
  };

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

        <View style={styles.qtyBox}>
          <Pressable
            style={[
              styles.qtyBtn,
              (count === 0 || processing) && styles.qtyBtnDisabled,
            ]}
            onPress={() => dec(item.id)}
            disabled={count === 0 || processing} // 🔑 removed orderSuccess
          >
            <Text
              style={[
                styles.qtyBtnText,
                (count === 0 || processing) && styles.qtyBtnTextDisabled,
              ]}
            >
              −
            </Text>
          </Pressable>

          <Text style={styles.qtyVal}>{count}</Text>

          <Pressable
            style={[styles.qtyBtn, processing && styles.qtyBtnDisabled]}
            onPress={() => inc(item.id)}
            disabled={processing} // 🔑 removed orderSuccess
          >
            <Text
              style={[
                styles.qtyBtnText,
                processing && styles.qtyBtnTextDisabled,
              ]}
            >
              +
            </Text>
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

      <Image source={MENU_HERO} style={styles.menuImage} resizeMode="cover" />

      {!menu && !error && (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      )}

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

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Text style={styles.subtotalLabel}>Subtotal:</Text>
          <Text style={styles.subtotalValue}>{formatMoney(subtotal)}</Text>
        </View>

        {orderSuccess ? (
          <View style={styles.successWrap}>
            <FontAwesome name="check-circle" size={18} color="#16a34a" />
            <Text style={styles.successText}>Order placed successfully!</Text>
          </View>
        ) : (
          <Pressable
            onPress={onCreateOrder}
            disabled={!hasAnyItems || processing}
            style={[
              styles.cta,
              (!hasAnyItems || processing) && styles.ctaDisabled,
            ]}
          >
            <Text
              style={[
                styles.ctaText,
                (!hasAnyItems || processing) && styles.ctaTextDisabled,
              ]}
            >
              {processing ? 'Processing Order…' : 'Create Order'}
            </Text>
          </Pressable>
        )}
      </View>

      <OrderConfirmationModal
        visible={confirmOpen}
        orderItems={selectedItems}
        restaurantId={id}
        customerId={1}
        subtotal={subtotal}
        processing={processing}
        errorMessage={orderError}
        onClose={onCancelOrder}
        onConfirm={onConfirmOrder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  warn: {
    color: '#8a6d3b',
    backgroundColor: '#fcf8e3',
    padding: 8,
    textAlign: 'center',
  },
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
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
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
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  subtotalLabel: { fontSize: 16, fontWeight: '700' },
  subtotalValue: { fontSize: 16, fontWeight: '800' },
  cta: {
    backgroundColor: '#0a65a0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  ctaDisabled: { backgroundColor: '#9bbbd0' },
  ctaText: { color: '#fff', fontWeight: '800' },
  ctaTextDisabled: { color: '#f1f5f9' },
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
});
