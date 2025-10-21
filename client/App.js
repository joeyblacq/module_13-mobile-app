// client/App.js
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome } from '@expo/vector-icons';

import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import RestaurantsScreen from './screens/RestaurantsScreen';
import MenuScreen from './screens/MenuScreen';
import OrderHistoryScreen from './screens/OrderHistoryScreen';

const RootStack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();
const RestaurantsStack = createNativeStackNavigator();
const OrdersStack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

// Home tab stack (top header shown)
function HomeStackScreen() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Home" component={HomeScreen} options={{ headerTitle: 'Home' }} />
    </HomeStack.Navigator>
  );
}

// Restaurants tab stack (top header shown). Menu lives inside this stack.
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

// Orders tab stack (top header shown)
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

// Bottom tabs (footer) across the app (except Login)
function MainTabs() {
  return (
    <Tabs.Navigator screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="TabHome"
        component={HomeStackScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <FontAwesome name="home" color={color} size={size} />,
        }}
      />
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
  const [initialRoute, setInitialRoute] = useState(null); // 'Login' | 'Main'

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        setInitialRoute(token ? 'Main' : 'Login');
      } catch {
        setInitialRoute('Login');
      }
    };
    checkAuth();
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator initialRouteName={initialRoute}>
        {/* Login page: NO header, NO footer */}
        <RootStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        {/* Main app: header from inner stacks, footer = bottom tabs */}
        <RootStack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
