// client/App.js
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome } from '@expo/vector-icons';

import LoginScreen from './screens/LoginScreen';
import RestaurantsScreen from './screens/RestaurantsScreen';
import MenuScreen from './screens/MenuScreen';
import OrderHistoryScreen from './screens/OrderHistoryScreen';

// Initialize navigators
const RootStack = createNativeStackNavigator();
const RestaurantsStack = createNativeStackNavigator();
const OrdersStack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

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

// Bottom tabs (footer) across the main application after login.
// This now contains only the two essential screens: Restaurants and Orders.
function MainTabs() {
  return (
    // headerShown: false is essential here so that the inner stacks' headers are shown instead.
    <Tabs.Navigator screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="TabRestaurants"
        component={RestaurantsStackScreen}
        options={{
          title: 'Restaurants',
          tabBarIcon: ({ color, size }) => <FontAwesome name="cutlery" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="TabOrders"
        component={OrdersStackScreen}
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size }) => <FontAwesome name="list-alt" color={color} size={size} />,
        }}
      />
    </Tabs.Navigator>
  );
}

export default function App() {
  // State to determine the initial screen based on authentication status.
  const [initialRoute, setInitialRoute] = useState(null); // 'Login' | 'Main'

  useEffect(() => {
    // Check local storage for an existing authentication token.
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        setInitialRoute(token ? 'Main' : 'Login');
      } catch {
        // Default to Login if AsyncStorage fails.
        setInitialRoute('Login');
      }
    };
    checkAuth();
  }, []);

  // Show a loading indicator while checking for the auth token.
  if (!initialRoute) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {/* Root navigator handles the two primary app states: Login or Main content. */}
      <RootStack.Navigator initialRouteName={initialRoute}>
        {/* Login screen: No header, no footer tabs. */}
        <RootStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        {/* Main app: This screen shows the bottom tabs (MainTabs). */}
        <RootStack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}