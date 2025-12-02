// client/screens/AccountSelectionScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

export default function AccountSelectionScreen({ navigation }) {
  const handleSelectCustomer = () => {
    // ✅ Requirement:
    // Selecting the customer account directs the user to the customer application.
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }], // Customer app root (same as in LoginScreen)
    });
  };

  const handleSelectCourier = () => {
    // This will satisfy the "courier selection" requirement when you get to it
    navigation.reset({
      index: 0,
      routes: [{ name: 'CourierMain' }], // Courier app root
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Select Account</Text>
          <Text style={styles.subtitle}>
            This login has both Customer and Courier accounts.  
            Choose how you want to continue.
          </Text>

          {/* Customer Account Button */}
          <Pressable style={[styles.button, styles.customerButton]} onPress={handleSelectCustomer}>
            <Text style={styles.buttonTitle}>Continue as Customer</Text>
            <Text style={styles.buttonSubtitle}>Browse restaurants and place orders</Text>
          </Pressable>

          {/* Courier Account Button */}
          <Pressable style={[styles.button, styles.courierButton]} onPress={handleSelectCourier}>
            <Text style={styles.buttonTitle}>Continue as Courier</Text>
            <Text style={styles.buttonSubtitle}>View and manage deliveries</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f5f5f5', // match login background
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 28,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  customerButton: {
    backgroundColor: '#0a65a0', // blue for customer
  },
  courierButton: {
    backgroundColor: '#D86F52', // orange for courier
  },
  buttonTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonSubtitle: {
    color: '#f0f0f0',
    fontSize: 13,
    marginTop: 2,
  },
});
