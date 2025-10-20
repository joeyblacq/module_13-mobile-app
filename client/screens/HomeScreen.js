// client/screens/HomeScreen.js
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ navigation }) {
  const logout = async () => {
    await AsyncStorage.removeItem('auth_token');
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Rocket Food Delivery 🚀</Text>

      <Pressable style={[styles.button, styles.primary]} onPress={() => navigation.navigate('Restaurants')}>
        <Text style={styles.buttonText}>View Restaurants</Text>
      </Pressable>

      <Pressable style={[styles.button, styles.danger]} onPress={logout}>
        <Text style={styles.buttonText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center', gap: 12 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  button: { height: 48, borderRadius: 10, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', width: '80%' },
  primary: { backgroundColor: '#0a65a0' },
  danger: { backgroundColor: '#a94545' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '700' },
});
