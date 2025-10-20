// client/screens/RestaurantsScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

// TODO: change this to your backend base URL
const BASE_URL = 'http://localhost:8080';

export default function RestaurantsScreen() {
  const [restaurants, setRestaurants] = useState(null); // null=loading, []=empty list, [...]=data
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/restaurants`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        // Requirement: upon arriving, show ALL restaurants (no filtering)
        setRestaurants(Array.isArray(data) ? data : []);
      } catch (e) {
        // Optional fallback mock so the UI still demonstrates requirement
        setRestaurants([
          { id: 1, name: 'Rocket Pizza', price_range: 2, email: 'pizza@rocket.com', phone: '555-1111', active: true },
          { id: 2, name: 'Galaxy Burgers', price_range: 1, email: 'burgers@rocket.com', phone: '555-2222', active: true },
          { id: 3, name: 'Orbit Sushi', price_range: 3, email: 'sushi@rocket.com', phone: '555-3333', active: false },
        ]);
        setError('Using mock data (API fetch failed).');
      }
    };
    fetchAll();
  }, []);

  if (restaurants === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Loading restaurants…</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {error ? <Text style={styles.warn}>{error}</Text> : null}
      <FlatList
        data={restaurants}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.headerRow}>
              <Text style={styles.name}>{item.name}</Text>
              <View style={styles.badge}>
                <FontAwesome name="dollar" />
                <Text style={styles.badgeText}>{item.price_range ?? '-'}</Text>
              </View>
            </View>

            <View style={styles.row}>
              <FontAwesome name="envelope" style={styles.icon} />
              <Text style={styles.mono}>{item.email ?? '—'}</Text>
            </View>
            <View style={styles.row}>
              <FontAwesome name="phone" style={styles.icon} />
              <Text style={styles.mono}>{item.phone ?? '—'}</Text>
            </View>

            <View style={[styles.status, item.active ? styles.active : styles.inactive]}>
              <FontAwesome name={item.active ? 'check' : 'close'} />
              <Text style={styles.statusText}>{item.active ? 'Active' : 'Inactive'}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text>No restaurants found.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  warn: { color: '#8a6d3b', backgroundColor: '#fcf8e3', padding: 8, textAlign: 'center' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  name: { fontSize: 18, fontWeight: '700' },

  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: '#f1f5f9' },
  badgeText: { marginLeft: 6, fontWeight: '600' },

  row: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  icon: { marginRight: 8 },
  mono: { fontFamily: 'System' },

  status: { marginTop: 10, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  active: { backgroundColor: '#e6f4ea' },
  inactive: { backgroundColor: '#fdecea' },
  statusText: { marginLeft: 6, fontWeight: '600' },
});
