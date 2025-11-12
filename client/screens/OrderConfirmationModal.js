import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

/**
 * OrderConfirmationModal
 * Props:
 * - visible: boolean to control modal visibility
 * - orderItems: array of item objects { id, name, price, quantity }
 * - restaurantId: ID of the restaurant for the order
 * - customerId: ID of the customer placing the order
 * - onClose: function to call when closing the modal
 * - onOrderCreated: (optional) callback when an order is successfully created
 */
const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 20,
    alignItems: 'stretch',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 8,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
    color: '#333',
  },
  itemsList: {
    maxHeight: 200,
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  itemName: {
    fontSize: 16,
    color: '#555',
  },
  itemPrice: {
    fontSize: 16,
    color: '#555',
  },
  totalText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'right',
    marginTop: 8,
    marginBottom: 16,
    color: '#000',
  },
  totalAmount: {
    color: '#000',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    paddingHorizontal: 10,
    textAlign: 'center',
  },
  statusIcon: {
    marginRight: 8,
  },
  statusMessage: {
    flex: 1,
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
  errorMessage: {
    color: '#CC0000',
  },
  confirmButton: {
    flexDirection: 'row',
    backgroundColor: '#FF6D00',
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: '#999999',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
const OrderConfirmationModal = ({ visible, orderItems = [], restaurantId, customerId, onClose, onOrderCreated }) => {
  const [orderStatus, setOrderStatus] = useState('idle');
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

      const response = await fetch('http://localhost:8081/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      setOrderStatus('success');
      onOrderCreated && onOrderCreated(result);
    } catch (error) {
      console.error('Order creation failed:', error);
      setOrderStatus('failure');
    }
  };

  return (
    <Modal isVisible={visible} onBackdropPress={onClose} backdropOpacity={0.5}>
      <View style={styles.modalContainer} accessible accessibilityViewIsModal={true}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose} accessibilityLabel="Close order confirmation dialog" accessibilityRole="button">
          <FontAwesome name="times" size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.modalTitle}>Confirm Order</Text>

        <ScrollView style={styles.itemsList} contentContainerStyle={{ paddingVertical: 5 }}>
          {orderItems.map((item) => (
            <View style={styles.itemRow} key={item.id || item.name}>
              <Text style={styles.itemName}>{item.quantity} × {item.name}</Text>
              <Text style={styles.itemPrice}>{formatCurrency(item.price * item.quantity)}</Text>
            </View>
          ))}
        </ScrollView>

        <Text style={styles.totalText}>Total: <Text style={styles.totalAmount}>{formatCurrency(totalPrice)}</Text></Text>

        {orderStatus === 'success' && (
          <View style={styles.statusContainer}>
            <FontAwesome name="check-circle" size={48} color="#4BB543" style={styles.statusIcon} accessible={false} />
            <Text style={styles.statusMessage}>Thank you! Your order has been received.</Text>
          </View>
        )}
        {orderStatus === 'failure' && (
          <View style={styles.statusContainer}>
            <FontAwesome name="times-circle" size={48} color="#FF4444" style={styles.statusIcon} accessible={false} />
            <Text style={[styles.statusMessage, styles.errorMessage]}>Oops, something went wrong. Please try again.</Text>
          </View>
        )}

        {orderStatus === 'processing' ? (
          <View style={[styles.confirmButton, styles.confirmButtonDisabled]} accessible accessibilityRole="button">
            <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.confirmButtonText}>Processing Order...</Text>
          </View>
        ) : orderStatus === 'success' ? (
          <TouchableOpacity style={styles.confirmButton} onPress={onClose} accessibilityLabel="Close dialog" accessibilityRole="button">
            <Text style={styles.confirmButtonText}>Done</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmOrder} accessibilityLabel="Confirm order" accessibilityRole="button">
            <Text style={styles.confirmButtonText}>Confirm Order</Text>
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
};

export default OrderConfirmationModal;


