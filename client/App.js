// client/App.js
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome } from '@expo/vector-icons';

import LoginScreen from './screens/LoginScreen';
import RestaurantsScreen from './screens/RestaurantsScreen';
import MenuScreen from './screens/MenuScreen';
import OrderHistoryScreen from './screens/OrderHistoryScreen';
import AccountSelectionScreen from './screens/AccountSelectionScreen';
import CourierDeliveriesScreen from './screens/CourierDeliveriesScreen';

// Initialize navigators
const RootStack = createNativeStackNavigator();
const RestaurantsStack = createNativeStackNavigator();
const OrdersStack = createNativeStackNavigator();
const CourierStack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

// ---------------------- CUSTOMER APP ----------------------

// Restaurants tab stack: Handles navigation from Restaurants list to the Menu screen.
function RestaurantsStackScreen() {
  return (
    <RestaurantsStack.Navigator>
      <RestaurantsStack.Screen
        name="Restaurants"
        component={RestaurantsScreen}
        options={{ headerTitle: 'Restaurants' }}
      />
      <RestaurantsStack.Screen
        name="Menu"
        component={MenuScreen}
        options={{ headerTitle: 'Menu' }}
      />
    </RestaurantsStack.Navigator>
  );
}

// Orders tab stack: A simple stack for the Order History screen.
function OrdersStackScreen() {
  return (
    <OrdersStack.Navigator>
      <OrdersStack.Screen
        name="OrderHistory"
        component={OrderHistoryScreen}
        options={{ headerTitle: 'Order History' }}
      />
    </OrdersStack.Navigator>
  );
}

// Bottom tabs (footer) across the main CUSTOMER application after login.
function MainTabs() {
  return (
    <Tabs.Navigator screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="TabRestaurants"
        component={RestaurantsStackScreen}
        options={{
          title: 'Restaurants',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="cutlery" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="TabOrders"
        component={OrdersStackScreen}
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="list-alt" color={color} size={size} />
          ),
        }}
      />
    </Tabs.Navigator>
  );
}

// ---------------------- COURIER APP ----------------------

// Courier stack: main "My Deliveries" screen (matches courier wireframe)
function CourierStackScreen() {
  return (
    <CourierStack.Navigator>
      <CourierStack.Screen
        name="CourierHome"
        component={CourierDeliveriesScreen}
        options={{ headerTitle: 'My Deliveries' }}
      />
    </CourierStack.Navigator>
  );
}

// Courier bottom tabs (footer) – for now only Deliveries tab;
// you can add an Account tab later when you implement that requirement.
function CourierMainTabs() {
  return (
    <Tabs.Navigator screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="CourierTabDeliveries"
        component={CourierStackScreen}
        options={{
          title: 'Deliveries',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="history" color={color} size={size} />
          ),
        }}
      />
    </Tabs.Navigator>
  );
}

// ---------------------- ROOT APP ----------------------

export default function App() {
  // 'Login' | 'Main' | 'CourierMain' | 'AccountSelection'
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');

        if (!token) {
          setInitialRoute('Login');
          return;
        }

        const rawRoles = await AsyncStorage.getItem('roles');
        const roles = rawRoles ? JSON.parse(rawRoles) : [];
        const hasCustomer = roles.includes('CUSTOMER');
        const hasCourier = roles.includes('COURIER');

        if (hasCustomer && hasCourier) {
          setInitialRoute('AccountSelection');
        } else if (hasCustomer && !hasCourier) {
          setInitialRoute('Main');
        } else if (hasCourier && !hasCustomer) {
          setInitialRoute('CourierMain');
        } else {
          // Fallback: token but no recognized roles
          setInitialRoute('Main');
        }
      } catch {
        setInitialRoute('Login');
      }
    };

    checkAuth();
  }, []);

  // Show a loading indicator while checking for the auth token & roles.
  if (!initialRoute) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {/* Root navigator handles login, customer app, courier app, and account selection. */}
      <RootStack.Navigator initialRouteName={initialRoute}>
        {/* Login screen */}
        <RootStack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />

        {/* Customer app root */}
        <RootStack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />

        {/* Courier app root */}
        <RootStack.Screen
          name="CourierMain"
          component={CourierMainTabs}
          options={{ headerShown: false }}
        />

        {/* Account Selection page for dual-role users */}
        <RootStack.Screen
          name="AccountSelection"
          component={AccountSelectionScreen}
          options={{ headerShown: false }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
