// client/screens/AccountScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.EXPO_PUBLIC_NGROK_URL;

/**
 * AccountScreen
 *
 * Props:
 *  - route.params.role? : 'CUSTOMER' | 'COURIER' (optional)
 *  - navigation
 */
export default function AccountScreen({ route }) {
  const [primaryEmail, setPrimaryEmail] = useState('');
  const [typeEmail, setTypeEmail] = useState('');
  const [typePhone, setTypePhone] = useState('');

  const [role, setRole] = useState('CUSTOMER'); // 'CUSTOMER' | 'COURIER'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Decide current role (Customer or Courier)
  const resolveRole = useCallback(async () => {
    // 1) If passed explicitly via route params, use that.
    if (route?.params?.role === 'COURIER' || route?.params?.role === 'CUSTOMER') {
      setRole(route.params.role);
      return route.params.role;
    }

    // 2) Else, look at saved roles in AsyncStorage
    const rawRoles = await AsyncStorage.getItem('roles');
    const roles = rawRoles ? JSON.parse(rawRoles) : [];

    if (roles.includes('CUSTOMER') && !roles.includes('COURIER')) {
      setRole('CUSTOMER');
      return 'CUSTOMER';
    }
    if (roles.includes('COURIER') && !roles.includes('CUSTOMER')) {
      setRole('COURIER');
      return 'COURIER';
    }

    // 3) If both or none, default to CUSTOMER for the Customer app.
    setRole('CUSTOMER');
    return 'CUSTOMER';
  }, [route]);

  const loadAccount = useCallback(async () => {
    if (!API_BASE) {
      setError('Missing API base URL.');
      setLoading(false);
      return;
    }

    setError('');
    setInfoMessage('');
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userId = await AsyncStorage.getItem('userId'); // ensure you store this at login
      if (!userId) {
        setError('Missing account id (userId) in storage.');
        setLoading(false);
        return;
      }

      const currentRole = await resolveRole();
      const userType = currentRole === 'COURIER' ? 'courier' : 'customer';

      const response = await fetch(
        `${API_BASE}/api/account/${userId}?type=${userType}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (!response.ok) {
        setError('Failed to load account details.');
        setLoading(false);
        return;
      }

      const data = await response.json();

      // Be flexible with field names from the API:
      const userEmail =
        data.userEmail ||
        data.primaryEmail ||
        data.email ||
        '';

      const userTypeEmail =
        data.userTypeEmail ||
        data.typeEmail ||
        data.customerEmail ||
        data.courierEmail ||
        '';

      const userTypePhone =
        data.userTypePhone ||
        data.typePhone ||
        data.customerPhone ||
        data.courierPhone ||
        '';

      setPrimaryEmail(userEmail);
      setTypeEmail(userTypeEmail);
      setTypePhone(userTypePhone);
    } catch (err) {
      console.log('Error loading account:', err);
      setError('Unable to load account details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [resolveRole]);

  useEffect(() => {
    loadAccount();
  }, [loadAccount]);

  const handleUpdate = async () => {
    if (!API_BASE) {
      Alert.alert('Error', 'Missing API base URL.');
      return;
    }

    if (!typeEmail.trim() || !typePhone.trim()) {
      Alert.alert('Error', 'User-type email and phone are required.');
      return;
    }

    setSaving(true);
    setError('');
    setInfoMessage('');

    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        setError('Missing account id (userId) in storage.');
        setSaving(false);
        return;
      }

      const currentRole = role;
      const userType = currentRole === 'COURIER' ? 'courier' : 'customer';

      const response = await fetch(`${API_BASE}/api/account/${userId}`, {
        method: 'POST', // per spec: POST /api/account/{id}
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          type: userType,        // include type for clarity (if backend expects it)
          email: typeEmail.trim(), // user-type email
          phone: typePhone.trim(), // user-type phone
        }),
      });

      if (!response.ok) {
        setError('Failed to update account. Please try again.');
        setSaving(false);
        return;
      }

      setInfoMessage('Account updated successfully.');
    } catch (err) {
      console.log('Error updating account:', err);
      setError('Unable to update account. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const roleLabel = role === 'COURIER' ? 'Courier' : 'Customer';

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>MY ACCOUNT</Text>
        <Text style={styles.loggedInAs}>Logged In As: {roleLabel}</Text>

        {/* Primary Email (Read Only) */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Primary Email (Read Only)</Text>
          <TextInput
            style={[styles.input, styles.readOnlyInput]}
            value={primaryEmail}
            editable={false}
          />
          <Text style={styles.helperText}>
            Email used to log in to the application.
          </Text>
        </View>

        {/* User-type Email (Customer/Courier) */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            {roleLabel} Email:
          </Text>
          <TextInput
            style={styles.input}
            value={typeEmail}
            onChangeText={setTypeEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder={`Email used for your ${roleLabel.toLowerCase()} account.`}
          />
          <Text style={styles.helperText}>
            Email used for your {roleLabel.toLowerCase()} account.
          </Text>
        </View>

        {/* User-type Phone */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            {roleLabel} Phone:
          </Text>
          <TextInput
            style={styles.input}
            value={typePhone}
            onChangeText={setTypePhone}
            keyboardType="phone-pad"
            placeholder={`Phone number for your ${roleLabel.toLowerCase()} account.`}
          />
          <Text style={styles.helperText}>
            Phone number for your {roleLabel.toLowerCase()} account.
          </Text>
        </View>

        {/* Error / Info */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {infoMessage ? (
          <Text style={styles.infoText}>{infoMessage}</Text>
        ) : null}

        {/* Update Button */}
        <Pressable
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={handleUpdate}
          disabled={saving}
        >
          <Text style={styles.buttonText}>
            {saving ? 'UPDATING…' : 'UPDATE ACCOUNT'}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  loggedInAs: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 20,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
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
    backgroundColor: '#ffffff',
    fontSize: 14,
  },
  readOnlyInput: {
    backgroundColor: '#f3f4f6',
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  errorText: {
    color: '#b00020',
    marginBottom: 12,
    fontSize: 13,
  },
  infoText: {
    color: '#15803d',
    marginBottom: 12,
    fontSize: 13,
  },
  button: {
    backgroundColor: '#D86F52', // orange from wireframe
    height: 48,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
});
