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
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: point to your backend host:port or use EXPO_PUBLIC_NGROK_URL
const BASE_URL = 'http://localhost:8080';

// 🔹 LOCAL IMAGE MAP
// Folder: client/assets/Images/Restaurants/
// Keys are restaurant names without spaces, all lowercase.
const restaurantImages = {
  rocketpizza: require('../assets/Images/Restaurants/cuisinePizza.jpg'),
  galaxyburgers: require('../assets/Images/Restaurants/cuisineGreek.jpg'),
  orbitsushi: require('../assets/Images/Restaurants/cuisineJapanese.jpg'),
  comettacos: require('../assets/Images/Restaurants/cuisineSoutheast.jpg'),
  nebulanoodles: require('../assets/Images/Restaurants/cuisinePasta.jpg'),
  vietkitchen: require('../assets/Images/Restaurants/cuisineViet.jpg'),
  // add more mappings if you add more restaurants
};

// 🔹 DEFAULT FALLBACK IMAGE
const defaultRestaurantImage = require('../assets/Images/RestaurantMenu.jpg');

// 🔹 NORMALIZER FUNCTION
function normalizeRestaurant(r, index) {
  const name = r.name ?? 'Unnamed';
  const nameKey = name.toLowerCase().replace(/\s+/g, ''); // "Rocket Pizza" → "rocketpizza"

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
  const [restaurants, setRestaurants] = useState(null); // null=loading
  const [error, setError] = useState('');

  // filters
  const [ratingFilter, setRatingFilter] = useState(null);
  const [priceFilter, setPriceFilter] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/restaurants`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const normalized = (Array.isArray(data.data) ? data.data : []).map((r, i) =>
          normalizeRestaurant(r, i),
        );
        setRestaurants(normalized);
      } catch {
        // If API fails, use mock data but still normalize it
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
        priceFilter == null ? true : Number(r.price_range) === Number(priceFilter);
      return okRating && okPrice;
    });
  }, [restaurants, ratingFilter, priceFilter]);

  const onOpenMenu = (item) => {
    navigation.navigate('Menu', { id: item.id, name: item.name });
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('auth_token');
    } catch (e) {
      // ignore storage errors for now
    }
    // Try to go back to Login at the root
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  if (restaurants === null) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading restaurants…</Text>
      </View>
    );
  }

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

      <View style={styles.cardBody}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>{item.name}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <FontAwesome name="star" size={12} />
              <Text style={styles.badgeText}>
                {(item.rating ?? 0).toFixed(1)}
              </Text>
            </View>
            <View style={styles.badge}>
              <FontAwesome name="dollar" size={12} />
              <Text style={styles.badgeText}>{item.price_range ?? '-'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.row}>
          <FontAwesome name="envelope" style={styles.icon} size={14} />
          <Text style={styles.mono}>{item.email ?? '—'}</Text>
        </View>
        <View style={styles.row}>
          <FontAwesome name="phone" style={styles.icon} size={14} />
          <Text style={styles.mono}>{item.phone ?? '—'}</Text>
        </View>

        <View
          style={[
            styles.status,
            item.active ? styles.active : styles.inactive,
          ]}
        >
          <FontAwesome name={item.active ? 'check' : 'close'} size={12} />
          <Text style={styles.statusText}>
            {item.active ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      {/* Header with logo + logout */}
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

      <View style={styles.content}>
        <Text style={styles.pageTitle}>Nearby Restaurants</Text>

        {/* Error banner (if any) */}
        {error ? <Text style={styles.warn}>{error}</Text> : null}

        {/* Filters card */}
        <View style={styles.filtersCard}>
          <View style={styles.filterField}>
            <Text style={styles.filterLabel}>Rating</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={ratingFilter}
                onValueChange={(v) => setRatingFilter(v)}
              >
                <Picker.Item label="All ratings" value={null} />
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
                <Picker.Item label="All prices" value={null} />
                <Picker.Item label="$ (1)" value={1} />
                <Picker.Item label="$$ (2)" value={2} />
                <Picker.Item label="$$$ (3)" value={3} />
                <Picker.Item label="$$$$ (4)" value={4} />
              </Picker>
            </View>
          </View>
        </View>

        {/* Restaurant list */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.emptyWrapper}>
              <Text style={styles.emptyText}>
                No restaurants match the selected filters.
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f5f5f5', // light neutral background like wireframe
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
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },

  // Error banner
  warn: {
    color: '#8a6d3b',
    backgroundColor: '#fcf8e3',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 10,
    fontSize: 12,
  },

  // Filters card
  filtersCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  filterField: {
    flex: 1,
  },
  filterLabel: {
    fontWeight: '700',
    marginBottom: 4,
    fontSize: 13,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f9fafb',
  },

  // List + cards
  listContent: {
    paddingBottom: 16,
  },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: '#f3f4f6',
  },
  cardBody: {
    padding: 12,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#f1f5f9',
  },
  badgeText: {
    marginLeft: 4,
    fontWeight: '600',
    fontSize: 12,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  icon: {
    marginRight: 6,
    color: '#4b5563',
  },
  mono: {
    fontFamily: 'System',
    fontSize: 13,
    color: '#111827',
  },

  status: {
    marginTop: 8,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  active: {
    backgroundColor: '#e6f4ea',
  },
  inactive: {
    backgroundColor: '#fdecea',
  },
  statusText: {
    marginLeft: 6,
    fontWeight: '600',
    fontSize: 12,
  },

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

  emptyWrapper: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#4b5563',
  },
});
