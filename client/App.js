// client/App.js
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome } from '@expo/vector-icons';

// ✅ Oswald fonts
import {
  useFonts,
  Oswald_400Regular,
  Oswald_700Bold,
} from '@expo-google-fonts/oswald';

import LoginScreen from './screens/LoginScreen';
import RestaurantsScreen from './screens/RestaurantsScreen';
import MenuScreen from './screens/MenuScreen';
import OrderHistoryScreen from './screens/OrderHistoryScreen';
import AccountSelectionScreen from './screens/AccountSelectionScreen';
import CourierDeliveriesScreen from './screens/CourierDeliveriesScreen';
import AccountScreen from './screens/AccountScreen';

// Initialize navigators
const RootStack = createNativeStackNavigator();
const RestaurantsStack = createNativeStackNavigator();
const OrdersStack = createNativeStackNavigator();
const CourierStack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

// ---------------------- CUSTOMER APP ----------------------

function RestaurantsStackScreen() {
  return (
    <RestaurantsStack.Navigator
      screenOptions={{
        headerTitleStyle: {
          fontFamily: 'Oswald_700Bold',
          fontSize: 18,
        },
      }}
    >
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

function OrdersStackScreen() {
  return (
    <OrdersStack.Navigator
      screenOptions={{
        headerTitleStyle: {
          fontFamily: 'Oswald_700Bold',
          fontSize: 18,
        },
      }}
    >
      <OrdersStack.Screen
        name="OrderHistory"
        component={OrderHistoryScreen}
        options={{ headerTitle: 'Order History' }}
      />
    </OrdersStack.Navigator>
  );
}

// Footer for CUSTOMER app: Restaurants, Order History, Account
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
          title: 'Order History',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="history" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="TabAccount"
        component={AccountScreen}
        options={{
          title: 'Account',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="user" color={color} size={size} />
          ),
        }}
      />
    </Tabs.Navigator>
  );
}

// ---------------------- COURIER APP ----------------------

function CourierStackScreen() {
  return (
    <CourierStack.Navigator
      screenOptions={{
        headerTitleStyle: {
          fontFamily: 'Oswald_700Bold',
          fontSize: 18,
        },
      }}
    >
      <CourierStack.Screen
        name="CourierHome"
        component={CourierDeliveriesScreen}
        options={{ headerTitle: 'My Deliveries' }}
      />
    </CourierStack.Navigator>
  );
}

// Wrapper so AccountScreen shows courier role
function CourierAccountScreenWrapper(props) {
  const injectedRoute = {
    ...(props.route || {}),
    params: { ...(props.route?.params || {}), role: 'COURIER' },
  };

  return <AccountScreen {...props} route={injectedRoute} />;
}

// Footer for COURIER app: Deliveries, Account
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
      <Tabs.Screen
        name="CourierTabAccount"
        component={CourierAccountScreenWrapper}
        options={{
          title: 'Account',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="user" color={color} size={size} />
          ),
        }}
      />
    </Tabs.Navigator>
  );
}

// ---------------------- ROOT APP ----------------------

export default function App() {
  // ✅ Load Oswald fonts
  const [fontsLoaded] = useFonts({
    Oswald_400Regular,
    Oswald_700Bold,
  });

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
          setInitialRoute('Main');
        }
      } catch {
        setInitialRoute('Login');
      }
    };

    checkAuth();
  }, []);

  // ✅ Wait for fonts and initialRoute
  if (!fontsLoaded || !initialRoute) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator initialRouteName={initialRoute}>
        {/* Login screen – no header/footer */}
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

        {/* Account Selection – no header/footer */}
        <RootStack.Screen
          name="AccountSelection"
          component={AccountSelectionScreen}
          options={{ headerShown: false }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
