// client/screens/RestaurantsScreen.js
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

// TODO: change this to your backend base URL
const BASE_URL = 'http://localhost:8080';

export default function RestaurantsScreen() {
  const [restaurants, setRestaurants] = useState(null); // null=loading, []=empty list, [...]=data
  const [error, setError] = useState('');

  // --- Filters (null means "no filter" = placeholder shown) ---
  const [ratingFilter, setRatingFilter] = useState(null);   // values: null | 1 | 2 | 3 | 4 | 5 (interpreted as >=)
  const [priceFilter, setPriceFilter]   = useState(null);   // values: null | 1 | 2 | 3 | 4

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/restaurants`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // Normalize: ensure each item has a rating (fallback 0) + price_range
        const normalized = (Array.isArray(data) ? data : []).map((r, i) => ({
          id: r.id ?? i + 1,
          name: r.name ?? 'Unnamed',
          email: r.email ?? '—',
          phone: r.phone ?? '—',
          price_range: r.price_range ?? r.priceRange ?? null,
          active: typeof r.active === 'boolean' ? r.active : true,
          rating: r.rating ?? r.stars ?? 0, // try common fields, fallback 0
        }));
        setRestaurants(normalized);
      } catch (e) {
        // Fallback mock so the UI still demonstrates BOTH filters
        setRestaurants([
          { id: 1, name: 'Rocket Pizza',   price_range: 2, email: 'pizza@rocket.com',   phone: '555-1111', active: true,  rating: 4.5 },
          { id: 2, name: 'Galaxy Burgers', price_range: 1, email: 'burgers@rocket.com', phone: '555-2222', active: true,  rating: 3.2 },
          { id: 3, name: 'Orbit Sushi',    price_range: 3, email: 'sushi@rocket.com',   phone: '555-3333', active: false, rating: 4.9 },
          { id: 4, name: 'Comet Tacos',    price_range: 1, email: 'tacos@rocket.com',   phone: '555-4444', active: true,  rating: 2.8 },
          { id: 5, name: 'Nebula Noodles', price_range: 4, email: 'noodles@rocket.com', phone: '555-5555', active: true,  rating: 5.0 },
        ]);
        setError('Using mock data (API fetch failed).');
      }
    };
    fetchAll();
  }, []);

  // Apply filtering: show ALL when both filters are null
  const filtered = useMemo(() => {
    if (!Array.isArray(restaurants)) return [];
    return restaurants.filter((r) => {
      const passesRating = ratingFilter == null ? true : (Number(r.rating) || 0) >= ratingFilter;
      const passesPrice  = priceFilter  == null ? true : Number(r.price_range) === Number(priceFilter);
      return passesRating && passesPrice;
    });
  }, [restaurants, ratingFilter, priceFilter]);

  if (restaurants === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Loading restaurants…</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <FontAwesome name="star" />
            <Text style={styles.badgeText}>{(item.rating ?? 0).toFixed(1)}</Text>
          </View>
          <View style={styles.badge}>
            <FontAwesome name="dollar" />
            <Text style={styles.badgeText}>{item.price_range ?? '-'}</Text>
          </View>
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
  );

  return (
    <View style={{ flex: 1 }}>
      {error ? <Text style={styles.warn}>{error}</Text> : null}

      {/* --- Filters row --- */}
      <View style={styles.filters}>
        {/* Rating filter with placeholder when null */}
        <View style={styles.filterField}>
          <Text style={styles.filterLabel}>Rating</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={ratingFilter}
              onValueChange={(val) => setRatingFilter(val)}
            >
              <Picker.Item label="Rating (all)" value={null} />
              <Picker.Item label="≥ 5.0" value={5} />
              <Picker.Item label="≥ 4.5" value={4.5} />
              <Picker.Item label="≥ 4.0" value={4} />
              <Picker.Item label="≥ 3.0" value={3} />
              <Picker.Item label="≥ 2.0" value={2} />
              <Picker.Item label="≥ 1.0" value={1} />
            </Picker>
          </View>
        </View>

        {/* Price filter with placeholder when null */}
        <View style={styles.filterField}>
          <Text style={styles.filterLabel}>Price</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={priceFilter}
              onValueChange={(val) => setPriceFilter(val)}
            >
              <Picker.Item label="Price (all)" value={null} />
              <Picker.Item label="$ (1)" value={1} />
              <Picker.Item label="$$ (2)" value={2} />
              <Picker.Item label="$$$ (3)" value={3} />
              <Picker.Item label="$$$$ (4)" value={4} />
            </Picker>
          </View>
        </View>
      </View>

      {/* List (shows ALL on arrival because both filters are null) */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text>No restaurants match the selected filters.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  warn: { color: '#8a6d3b', backgroundColor: '#fcf8e3', padding: 8, textAlign: 'center' },

  filters: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  filterField: { flex: 1 },
  filterLabel: { fontWeight: '700', marginBottom: 4 },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    overflow: 'hidden',
  },

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
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
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
