// client/screens/RestaurantsScreen.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Image,
  Pressable,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import AppHeader from '../components/AppHeader';

// You can switch this to EXPO_PUBLIC_NGROK_URL if desired
const BASE_URL = process.env.EXPO_PUBLIC_NGROK_URL || 'http://localhost:8080';

// Local images
import cuisinePizza from '../assets/Images/Restaurants/cuisinePizza.jpg';
import cuisineGreek from '../assets/Images/Restaurants/cuisineGreek.jpg';
import cuisineJapanese from '../assets/Images/Restaurants/cuisineJapanese.jpg';
import cuisineSoutheast from '../assets/Images/Restaurants/cuisineSoutheast.jpg';
import cuisinePasta from '../assets/Images/Restaurants/cuisinePasta.jpg';
import cuisineViet from '../assets/Images/Restaurants/cuisineViet.jpg';
import defaultRestaurantImage from '../assets/Images/RestaurantMenu.jpg';

const restaurantImages = {
  rocketpizza: cuisinePizza,
  galaxyburgers: cuisineGreek,
  orbitsushi: cuisineJapanese,
  comettacos: cuisineSoutheast,
  nebulanoodles: cuisinePasta,
  vietkitchen: cuisineViet,
};

function normalizeRestaurant(r, index) {
  const name = r.name ?? 'Unnamed';
  const nameKey = name.toLowerCase().replace(/\s+/g, '');

  return {
    id: r.id ?? index + 1,
    name,
    email: r.email ?? '—',
    phone: r.phone ?? '—',
    price_range: r.price_range ?? r.priceRange ?? null,
    active: typeof r.active === 'boolean' ? r.active : true,
    rating: r.rating ?? r.stars ?? 0,
    image: restaurantImages[nameKey] || defaultRestaurantImage,
  };
}

export default function RestaurantsScreen({ navigation }) {
  const [restaurants, setRestaurants] = useState(null);
  const [error, setError] = useState('');

  const [ratingFilter, setRatingFilter] = useState(null);
  const [priceFilter, setPriceFilter] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/restaurants`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const normalized = (Array.isArray(data.data) ? data.data : []).map(
          (r, i) => normalizeRestaurant(r, i),
        );
        setRestaurants(normalized);
      } catch {
        const mockData = [
          {
            id: 1,
            name: 'Rocket Pizza',
            price_range: 2,
            email: 'pizza@rocket.com',
            phone: '555-1111',
            active: true,
            rating: 4.5,
          },
          {
            id: 2,
            name: 'Galaxy Burgers',
            price_range: 1,
            email: 'burgers@rocket.com',
            phone: '555-2222',
            active: true,
            rating: 3.2,
          },
          {
            id: 3,
            name: 'Orbit Sushi',
            price_range: 3,
            email: 'sushi@rocket.com',
            phone: '555-3333',
            active: false,
            rating: 4.9,
          },
          {
            id: 4,
            name: 'Comet Tacos',
            price_range: 1,
            email: 'tacos@rocket.com',
            phone: '555-4444',
            active: true,
            rating: 2.8,
          },
          {
            id: 5,
            name: 'Nebula Noodles',
            price_range: 4,
            email: 'noodles@rocket.com',
            phone: '555-5555',
            active: true,
            rating: 5.0,
          },
        ];
        setRestaurants(mockData.map((r, i) => normalizeRestaurant(r, i)));
        setError('Using mock data (API fetch failed).');
      }
    };
    fetchAll();
  }, []);

  const filtered = useMemo(() => {
    if (!Array.isArray(restaurants)) return [];
    return restaurants.filter((r) => {
      const okRating =
        ratingFilter == null ? true : (Number(r.rating) || 0) >= ratingFilter;
      const okPrice =
        priceFilter == null
          ? true
          : Number(r.price_range) === Number(priceFilter);
      return okRating && okPrice;
    });
  }, [restaurants, ratingFilter, priceFilter]);

  if (restaurants === null) {
    return (
      <View style={styles.screen}>
        <AppHeader navigation={navigation} />
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading restaurants…</Text>
        </View>
      </View>
    );
  }

  const onOpenMenu = (item) => {
    navigation.navigate('Menu', { id: item.id, name: item.name });
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Pressable
        onPress={() => onOpenMenu(item)}
        accessible
        accessibilityRole="imagebutton"
        accessibilityLabel={`Open ${item.name} menu`}
      >
        <Image
          source={item.image}
          style={styles.image}
          resizeMode="cover"
        />
      </Pressable>

      <View style={styles.headerRow}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <FontAwesome name="star" />
            <Text style={styles.badgeText}>
              {(item.rating ?? 0).toFixed(1)}
            </Text>
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

      <View
        style={[
          styles.status,
          item.active ? styles.active : styles.inactive,
        ]}
      >
        <FontAwesome name={item.active ? 'check' : 'close'} />
        <Text style={styles.statusText}>
          {item.active ? 'Active' : 'Inactive'}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      <AppHeader navigation={navigation} />

      {error ? <Text style={styles.warn}>{error}</Text> : null}

      <View style={styles.filters}>
        <View style={styles.filterField}>
          <Text style={styles.filterLabel}>Rating</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={ratingFilter}
              onValueChange={(v) => setRatingFilter(v)}
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

        <View style={styles.filterField}>
          <Text style={styles.filterLabel}>Price</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={priceFilter}
              onValueChange={(v) => setPriceFilter(v)}
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

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>
              No restaurants match the selected filters.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 8, fontFamily: 'Arial' },
  warn: {
    color: '#8a6d3b',
    backgroundColor: '#fcf8e3',
    padding: 8,
    textAlign: 'center',
    fontFamily: 'Arial',
  },

  filters: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  filterField: { flex: 1 },
  filterLabel: { fontWeight: '700', marginBottom: 4, fontFamily: 'Arial' },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    overflow: 'hidden',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#f2f2f2',
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  name: { fontSize: 18, fontWeight: '700', fontFamily: 'Arial' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#f1f5f9',
  },
  badgeText: { marginLeft: 6, fontWeight: '600', fontFamily: 'Arial' },

  row: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  icon: { marginRight: 8 },
  mono: { fontFamily: 'Arial' },

  status: {
    marginTop: 8,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  active: { backgroundColor: '#e6f4ea' },
  inactive: { backgroundColor: '#fdecea' },
  statusText: { marginLeft: 6, fontWeight: '600', fontFamily: 'Arial' },
  emptyText: { fontFamily: 'Arial' },
});
