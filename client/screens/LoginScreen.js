// client/screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import RocketLogo from '../assets/Images/AppLogoV1.png';

const API_BASE = process.env.EXPO_PUBLIC_NGROK_URL;

export default function LoginScreen({ navigation }) {
  // const [email, setEmail] = useState('both@gmail.com');
  const [email, setEmail] = useState('customer@gmail.com');
  // const [email, setEmail] = useState('courier@gmail.com');

  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    setError('');

    if (!API_BASE) {
      setError('Missing API base URL.');
      return;
    }

    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!response.ok) {
        setError('Invalid email or password.');
        return;
      }

      const data = await response.json().catch(() => ({}));
      console.log('Login response data:', data);

      // --------------------------
      // Build roles from IDs
      // --------------------------

      /* 
      The response of the fetch is an object like this: 

      both@gmail.com
      {
        "accessToken": null,
        "success": true,
        "user_id": 1,
        "customer_id": 1,
        "courier_id": 1
      }

      customer@gmail.com
      {
        "accessToken": null,
        "success": true,
        "user_id": 2,
        "customer_id": 2,
        "courier_id": 0 (means that user, doesn't have any courier id)
      }

      courier@gmail.com
      {
        "accessToken": null,
        "success": true,
        "user_id": 3,
        "customer_id": 0, (means that user, doesn't have any courier id)
        "courier_id": 2 
      }
      
      
      THIS IS AN EXAMPLE, YOU MAY OR NOT USING IT, SO ADAPT TO YOUR NEEDS OR IGNORE IT COMPLETELY
      --------------- LOGIC EXAMPLE -----------------
      if (data.courier_id != 0 && data.customer != 0) {
          means its a user with both customer and courier id
          could do your AsyncStorage to store some data (role?? + userId + customer id + courier id)
          after you navigate to selection
      } else if (data.customer_id != 0 && data.courier_id == 0) {
          means its a user as customer id
          could do your AsyncStorage to store some data (role + userId + customer id)
          after your navigate to customer app
      } else {
          means its a user as courier id
          could do your AsyncStorage to store some data (role + userId + courier id)
          after your navigate to courier app
       }
      ------------------------------------------------
      */

      
      const roles = [];

      // instead of just an if, use if else if else...
      if (data.customer_id) roles.push('customer'); // careful, its not true because customer_id coulde be 0 and 0 is a considered as a number.
      if (data.courier_id) roles.push('courier'); // careful, its not true because courier_id coulde be 0 and 0 is a considered as a number.

      // --------------------------
      // Store user_id
      // --------------------------
      if (data.user_id) {
        await AsyncStorage.setItem('userId', String(data.user_id));
      }

      // --------------------------
      // Store customer_id & courier_id
      // --------------------------
      if (data.customer_id) {
        // here you want to store both, the role + id associated to that role.
        await AsyncStorage.setItem('customerId', String(data.customer_id));
      }
      if (data.courier_id) {
        // here you want to store both, the role + id associated to that role.
        await AsyncStorage.setItem('courierId', String(data.courier_id));
      }

      // --------------------------
      // Token (optional)
      // --------------------------
      const token = data.token || data.accessToken || null;
      if (token) {
        await AsyncStorage.setItem('auth_token', token);
      }

      // --------------------------
      // Save roles
      // --------------------------
      await AsyncStorage.setItem('roles', JSON.stringify(roles));

      const hascustomer = roles.includes('customer');
      const hascourier = roles.includes('courier');

      // --------------------------
      // Navigation Logic
      // --------------------------

      // customer ONLY → customer Tabs
      if (hascustomer && !hascourier) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }], // MUST match App.js
        });
        return;
      }

      // courier ONLY → courier Tabs
      if (hascourier && !hascustomer) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'courierMain' }],
        });
        return;
      }

      // Both roles → choose account screen
      if (hascustomer && hascourier) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'AccountSelection' }],
        });
        return;
      }

      // None? → invalid login
      setError('No valid customer or courier account found for this user.');

    } catch (err) {
      console.log('Login error:', err);
      setError('Unable to reach server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          {/* Logo */}
          <Image source={RocketLogo} style={styles.logo} resizeMode="contain" />

          {/* White Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome Back</Text>
            <Text style={styles.cardSubtitle}>Login to begin</Text>

            {/* Email */}
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your primary email here"
              placeholderTextColor="#777"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            {/* Password */}
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="************"
              placeholderTextColor="#777"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {/* Inline Error */}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Button */}
            <Pressable
              style={[styles.button, submitting && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={submitting}
            >
              <Text style={styles.buttonText}>
                {submitting ? 'Logging in...' : 'LOG IN'}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 220,
    height: 110,
    marginBottom: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 28,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: '#D3D3D3',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    marginBottom: 14,
  },
  errorText: {
    color: '#b00020',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#D86F52',
    height: 48,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
