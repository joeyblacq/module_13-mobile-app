// client/components/OrderConfirmationModal.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, Modal } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import OrderConfirmationModal from '../screens/OrderConfirmationModal';


const OrderConfirmationModal = ({ visible, orderItems = [], restaurantId, customerId, onClose, onOrderCreated }) => {
  const [orderStatus, setOrderStatus] = useState('idle'); // 'idle', 'processing', 'success', 'failure'

  const totalPrice = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const formatCurrency = (amount) => '$' + Number(amount).toFixed(2);

  const handleConfirmOrder = async () => {
    setOrderStatus('processing');
    try {
      const orderData = {
        restaurantId,
        customerId,
        items: orderItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      };

      const response = await fetch(`${process.env.EXPO_PUBLIC_NGROK_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) throw new Error('Order failed');
      const order = await response.json();

      setOrderStatus('success');
      if (onOrderCreated) onOrderCreated(order);
      setTimeout(onClose, 1500);
    } catch (err) {
      setOrderStatus('failure');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Confirm Order</Text>
          <ScrollView style={{ maxHeight: 240 }}>
            {orderItems.map((item) => (
              <View key={item.id} style={styles.row}>
                <Text style={styles.itemText}>{item.name} × {item.quantity}</Text>
                <Text style={styles.priceText}>{formatCurrency(item.price * item.quantity)}</Text>
              </View>
            ))}
          </ScrollView>
          <Text style={styles.total}>Total: {formatCurrency(totalPrice)}</Text>

          {orderStatus === 'failure' && (
            <View style={styles.errorRow}>
              <FontAwesome name="times-circle" size={18} color="#b91c1c" />
              <Text style={styles.errorText}>Order failed. Try again.</Text>
            </View>
          )}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={orderStatus === 'processing'}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={handleConfirmOrder}
              disabled={orderStatus === 'processing'}
            >
              {orderStatus === 'processing' ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.confirmText}>Confirm</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  itemText: { fontWeight: '600' },
  priceText: { fontWeight: '600' },
  total: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 8,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  errorText: {
    color: '#b91c1c',
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 10,
  },
  cancelBtn: {
    padding: 10,
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  cancelText: {
    fontWeight: 'bold',
  },
  confirmBtn: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#0a65a0',
  },
  confirmText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default OrderConfirmationModal;
