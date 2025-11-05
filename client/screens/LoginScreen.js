// client/screens/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';

const API_BASE = process.env.EXPO_PUBLIC_NGROK_URL; // e.g., https://xxxx.ngrok.io

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('erica.ger@gmail.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    setError('');

    if (!API_BASE) {
      setError('Missing API base URL. Set EXPO_PUBLIC_NGROK_URL.');
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

      // Backend performs the verification; client trusts the response.
      if (!response.ok) {
        setError('Invalid email or password.');
        setSubmitting(false);
        return;
      }

      const data = await response.json();
      // const token = data?.token;
      // if (!token) {
      //   setError('Invalid server response.');
      //   setSubmitting(false);
      //   return;
      // }

      // await AsyncStorage.setItem('auth_token', token);

      // Home was removed; enter the main tab navigator.
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch {
      setError('Unable to reach server. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>

      <View style={styles.inputGroup}>
        <FontAwesome name="envelope" size={18} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCorrect={false}
          textContentType="username"
        />
      </View>

      <View style={styles.inputGroup}>
        <FontAwesome name="lock" size={20} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          textContentType="password"
        />
      </View>

      {/* Error message ABOVE the button per requirement */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Pressable
        style={[styles.button, submitting && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={submitting}
        accessibilityRole="button"
        accessibilityLabel="Login"
      >
        <Text style={styles.buttonText}>
          {submitting ? 'Signing in…' : 'Login'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 24, textAlign: 'center' },

  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1, borderColor: '#ddd', borderRadius: 10,
    paddingHorizontal: 12, marginBottom: 14, height: 50,
    backgroundColor: '#fff',
  },
  icon: { marginRight: 8 },
  input: { flex: 1, fontSize: 16 },

  errorText: {
    color: '#b00020',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '600',
  },

  button: {
    backgroundColor: '#0a65a0',
    height: 50, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '700' },
});
