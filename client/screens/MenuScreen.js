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
  Image,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export default function MenuScreen({ route, navigation }) {
  const { id, name } = route.params;
  const restaurantName = name || 'Restaurant';

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

  // Fetch menu
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
    [selectedItems],
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
    if (!hasAnyItems || processing || orderSuccess) return;
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

      setOrderSuccess(true);
      setConfirmOpen(false);

      Alert.alert(
        'Order Created',
        `Restaurant: ${restaurantName}\nItems: ${items.length}\nTotal: ${formatMoney(
          subtotal,
        )}`,
      );

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

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('auth_token');
    } catch (e) {
      // ignore
    }
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const renderItem = ({ item }) => {
    const count = qty[String(item.id)] ?? 0;
    const lineTotal = count * (item.price || 0);
    return (
      <View style={styles.item}>
        <View style={styles.itemMain}>
          <Text style={styles.itemName}>{item.name}</Text>
          {item.desc ? <Text style={styles.itemDesc}>{item.desc}</Text> : null}
        </View>

        <View style={styles.itemSide}>
          <Text style={styles.itemPrice}>{formatMoney(item.price)}</Text>

          <View style={styles.qtyBox}>
            <Pressable
              style={[
                styles.qtyBtn,
                (count === 0 || processing || orderSuccess) && styles.qtyBtnDisabled,
              ]}
              onPress={() => dec(item.id)}
              disabled={count === 0 || processing || orderSuccess}
            >
              <Text
                style={[
                  styles.qtyBtnText,
                  (count === 0 || processing || orderSuccess) &&
                    styles.qtyBtnTextDisabled,
                ]}
              >
                −
              </Text>
            </Pressable>

            <Text style={styles.qtyVal}>{count}</Text>

            <Pressable
              style={[
                styles.qtyBtn,
                (processing || orderSuccess) && styles.qtyBtnDisabled,
              ]}
              onPress={() => inc(item.id)}
              disabled={processing || orderSuccess}
            >
              <Text
                style={[
                  styles.qtyBtnText,
                  (processing || orderSuccess) && styles.qtyBtnTextDisabled,
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
      </View>
    );
  };

  if (menu === null) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading menu…</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Header: logo + logout */}
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
        {/* Hero image */}
        <Image source={MENU_HERO} style={styles.menuImage} resizeMode="cover" />

        {/* Restaurant info card */}
        <View style={styles.restaurantCard}>
          <Text style={styles.restaurantName}>{restaurantName}</Text>
          <Text style={styles.restaurantSub}>Restaurant menu</Text>
          <View style={styles.restaurantMetaRow}>
            <View style={styles.metaBadge}>
              <FontAwesome name="map-marker" size={12} color="#6b7280" />
              <Text style={styles.metaText}>Nearby</Text>
            </View>
            <View style={styles.metaBadge}>
              <FontAwesome name="clock-o" size={12} color="#16a34a" />
              <Text style={[styles.metaText, { color: '#16a34a' }]}>Open now</Text>
            </View>
          </View>
        </View>

        {/* Error banner */}
        {error ? <Text style={styles.warn}>{error}</Text> : null}

        {/* Menu list */}
        <FlatList
          data={menu}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          ListEmptyComponent={
            <View style={styles.emptyWrapper}>
              <Text style={styles.emptyText}>No menu items found.</Text>
            </View>
          }
        />
      </View>

      {/* Footer: subtotal + CTA */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Text style={styles.subtotalLabel}>Subtotal</Text>
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
              {processing ? 'Processing Order…' : 'CREATE ORDER'}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Confirmation modal (default/processing/success/failure UI will be styled in its own file) */}
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
  screen: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  // Header
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
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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

  // Hero image
  menuImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#f2f2f2',
  },

  // Restaurant card
  restaurantCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: -30,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '700',
  },
  restaurantSub: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  restaurantMetaRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#f3f4f6',
  },
  metaText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#6b7280',
  },

  // Error banner
  warn: {
    marginTop: 10,
    marginHorizontal: 16,
    color: '#8a6d3b',
    backgroundColor: '#fcf8e3',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    fontSize: 12,
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 80,
  },
  emptyWrapper: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#4b5563',
  },

  // Menu item row
  item: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
  },
  itemMain: {
    flex: 1,
    paddingRight: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
  },
  itemDesc: {
    color: '#6b7280',
    marginTop: 2,
    fontSize: 13,
  },

  itemSide: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    minWidth: 120,
  },
  itemPrice: {
    fontWeight: '800',
    fontSize: 14,
    marginBottom: 6,
  },

  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
  },
  qtyBtnDisabled: {
    opacity: 0.4,
  },
  qtyBtnText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  qtyBtnTextDisabled: {
    color: '#94a3b8',
  },
  qtyVal: {
    minWidth: 20,
    textAlign: 'center',
    fontWeight: '800',
  },

  lineTotal: {
    marginTop: 6,
    alignItems: 'flex-end',
  },
  lineTotalText: {
    fontWeight: '800',
    fontSize: 13,
  },

  // Footer
  footer: {
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  footerLeft: {
    flexDirection: 'column',
    flex: 1,
  },
  subtotalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  subtotalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },

  cta: {
    backgroundColor: '#D86F52',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  ctaDisabled: {
    backgroundColor: '#9bbbd0',
  },
  ctaText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  ctaTextDisabled: {
    color: '#f1f5f9',
  },

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
  successText: {
    color: '#065f46',
    fontWeight: '800',
    fontSize: 13,
  },

  // Loading
  loadingWrapper: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#374151',
  },
});
