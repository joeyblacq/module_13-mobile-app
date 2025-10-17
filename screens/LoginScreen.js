// client/screens/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Requirement: show error ABOVE the Login button when creds are wrong
  const [error, setError] = useState('');

  const handleLogin = async () => {
    // Mock auth (replace with your API later)
    const validEmail = 'user@example.com';
    const validPassword = 'password123';

    if (email.trim().toLowerCase() === validEmail && password === validPassword) {
      setError('');
      await AsyncStorage.setItem('auth_token', 'demo-token-123');
      navigation.replace('Home');
    } else {
      setError('Invalid email or password.');
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
        />
      </View>

      {/* Error message ABOVE the button per requirement */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
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
  buttonText: { color: 'white', fontSize: 16, fontWeight: '700' },
});
