import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';

import HeaderLogo from '../assets/Images/AppLogoV1.png';

export default function AppHeader({ navigation }) {
  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove([
        'auth_token',
        'roles',
        'userId',
        'customerId',
        'courierId',
      ]);
    } catch (e) {}

    if (navigation && navigation.reset) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  };

  return (
    <View style={styles.header}>
      <Image source={HeaderLogo} style={styles.logo} resizeMode="contain" />

      <Pressable style={styles.logoutBtn} onPress={handleLogout}>
        <FontAwesome name="sign-out" size={16} color="#0a65a0" />
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    width: 140,
    height: 40,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#0a65a0',
    backgroundColor: '#ffffff',
  },
  logoutText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
    color: '#0a65a0',
    fontFamily: 'Arial', // requirement: Arial used explicitly
  },
});
