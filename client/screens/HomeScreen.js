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
      <Pressable style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  button: {
    backgroundColor: '#a94545',
    height: 48, borderRadius: 10, paddingHorizontal: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '700' },
});
