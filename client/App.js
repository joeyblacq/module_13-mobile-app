// client/App.js
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome } from '@expo/vector-icons';
import {
  useFonts,
  Oswald_400Regular,
  Oswald_700Bold,
} from '@expo-google-fonts/oswald';

// Screens
import LoginScreen from './screens/LoginScreen';
import AccountSelectionScreen from './screens/AccountSelectionScreen';
import RestaurantsScreen from './screens/RestaurantsScreen';
import MenuScreen from './screens/MenuScreen';
import OrderHistoryScreen from './screens/OrderHistoryScreen';
import CourierDeliveriesScreen from './screens/CourierDeliveriesScreen'; // 👈 FIXED
import AccountScreen from './screens/AccountScreen';

// Navigators
const RootStack = createNativeStackNavigator();
const CustomerTabs = createBottomTabNavigator();
const CourierTabs = createBottomTabNavigator();
const RestaurantsStack = createNativeStackNavigator();

// ---------- Customer: Restaurants stack (Restaurants → Menu) ----------
function RestaurantsStackScreen() {
  return (
    <RestaurantsStack.Navigator screenOptions={{ headerShown: false }}>
      <RestaurantsStack.Screen
        name="RestaurantsList"
        component={RestaurantsScreen}
      />
      <RestaurantsStack.Screen name="Menu" component={MenuScreen} />
    </RestaurantsStack.Navigator>
  );
}

// ---------- Customer bottom tabs ----------
function CustomerTabsScreen() {
  return (
    <CustomerTabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#0a65a0',
        tabBarInactiveTintColor: '#000000',
        tabBarStyle: {
          backgroundColor: '#f6ecff',
          borderTopColor: '#e5e7eb',
          height: 64,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'Oswald_400Regular',
        },
        tabBarIcon: ({ color, size }) => {
          let iconName = 'circle';

          if (route.name === 'Restaurants') iconName = 'cutlery';
          else if (route.name === 'OrderHistory') iconName = 'history';
          else if (route.name === 'Account') iconName = 'user';

          return <FontAwesome name={iconName} size={size} color={color} />;
        },
      })}
    >
      <CustomerTabs.Screen
        name="Restaurants"
        component={RestaurantsStackScreen}
        options={{ title: 'Restaurants' }}
      />
      <CustomerTabs.Screen
        name="OrderHistory"
        component={OrderHistoryScreen}
        options={{ title: 'OrderHistory' }}
      />
      <CustomerTabs.Screen
        name="Account"
        component={AccountScreen}
        options={{ title: 'Account' }}
        initialParams={{ role: 'CUSTOMER' }}
      />
    </CustomerTabs.Navigator>
  );
}

// ---------- Courier bottom tabs ----------
function CourierTabsScreen() {
  return (
    <CourierTabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#0a65a0',
        tabBarInactiveTintColor: '#000000',
        tabBarStyle: {
          backgroundColor: '#f6ecff',
          borderTopColor: '#e5e7eb',
          height: 64,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'Oswald_400Regular',
        },
        tabBarIcon: ({ color, size }) => {
          let iconName = 'circle';

          if (route.name === 'Deliveries') iconName = 'history';
          else if (route.name === 'Account') iconName = 'user';

          return <FontAwesome name={iconName} size={size} color={color} />;
        },
      })}
    >
      <CourierTabs.Screen
        name="Deliveries"
        component={CourierDeliveriesScreen}
        options={{ title: 'Deliveries' }}
      />
      <CourierTabs.Screen
        name="Account"
        component={AccountScreen}
        options={{ title: 'Account' }}
        initialParams={{ role: 'COURIER' }}
      />
    </CourierTabs.Navigator>
  );
}

// ---------- Root app ----------
export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  const [fontsLoaded] = useFonts({
    Oswald_400Regular,
    Oswald_700Bold,
  });

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        const rawRoles = await AsyncStorage.getItem('roles');
        const roles = rawRoles ? JSON.parse(rawRoles) : [];

        if (!token) {
          setInitialRoute('Login');
          return;
        }

        const hasCustomer = roles.includes('CUSTOMER');
        const hasCourier = roles.includes('COURIER');

        if (hasCustomer && !hasCourier) {
          setInitialRoute('Main');
        } else if (hasCourier && !hasCustomer) {
          setInitialRoute('CourierMain');
        } else if (hasCustomer && hasCourier) {
          setInitialRoute('AccountSelection');
        } else {
          setInitialRoute('Login');
        }
      } catch (e) {
        console.log('Error deciding initial route:', e);
        setInitialRoute('Login');
      }
    };

    bootstrap();
  }, []);

  if (!fontsLoaded || !initialRoute) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}
      >
        <RootStack.Screen name="Login" component={LoginScreen} />
        <RootStack.Screen
          name="AccountSelection"
          component={AccountSelectionScreen}
        />
        <RootStack.Screen name="Main" component={CustomerTabsScreen} />
        <RootStack.Screen name="CourierMain" component={CourierTabsScreen} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
