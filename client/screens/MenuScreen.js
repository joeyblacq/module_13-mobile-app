// client/screens/MenuScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, StyleSheet } from 'react-native';

// TODO: point to your backend host:port
const BASE_URL = 'http://localhost:8080';

export default function MenuScreen({ route }) {
  const { id } = route.params; // restaurant id
  const [menu, setMenu] = useState(null); // null=loading
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/restaurants/${id}/menu`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setMenu(Array.isArray(data) ? data : []);
      } catch {
        // fallback mock menu so screen works even without API
        setMenu([
          { id: `m-${id}-1`, name: 'Margherita Pizza', desc: 'Tomato, mozzarella, basil', price: 12.99 },
          { id: `m-${id}-2`, name: 'Caesar Salad', desc: 'Romaine, parmesan, croutons', price: 8.5 },
          { id: `m-${id}-3`, name: 'Tiramisu', desc: 'Coffee-soaked ladyfingers, mascarpone', price: 6.75 },
        ]);
        setError('Using mock data (API fetch failed).');
      }
    };
    fetchMenu();
  }, [id]);

  if (menu === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Loading menu…</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {error ? <Text style={styles.warn}>{error}</Text> : null}
      <FlatList
        data={menu}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.name}</Text>
              {item.desc ? <Text style={styles.itemDesc}>{item.desc}</Text> : null}
            </View>
            <Text style={styles.itemPrice}>${Number(item.price).toFixed(2)}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text>No menu items found.</Text>
          </View>
        }
      />
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
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemName: { fontSize: 16, fontWeight: '700' },
  itemDesc: { color: '#555', marginTop: 2 },
  itemPrice: { fontWeight: '800' },
});
