// client/components/OrderDetailModal.js
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Modal } from 'react-native';
import OrderConfirmationModal from './OrderConfirmationModal';



const OrderDetailModal = ({ visible, onClose, orderItems, restaurantId, customerId }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const totalPrice = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const formatCurrency = (amount) => '$' + Number(amount).toFixed(2);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.title}>Order Details</Text>

        <ScrollView style={styles.itemsList}>
          {orderItems.map(item => (
            <View style={styles.itemRow} key={item.id}>
              <Text>{item.quantity} × {item.name}</Text>
              <Text>{formatCurrency(item.price * item.quantity)}</Text>
            </View>
          ))}
        </ScrollView>

        <Text style={styles.total}>Total: {formatCurrency(totalPrice)}</Text>

        <Button title="Confirm Order" onPress={() => setShowConfirmation(true)} />

        <OrderConfirmationModal
          visible={showConfirmation}
          orderItems={orderItems}
          restaurantId={restaurantId}
          customerId={customerId}
          onClose={() => {
            setShowConfirmation(false);
            onClose(); // also close detail modal
          }}
          onOrderCreated={(order) => {
            console.log('Order confirmed:', order);
          }}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 20,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    elevation: 10,
    shadowColor: '#000',
  },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  itemsList: { marginBottom: 10 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  total: { fontSize: 18, fontWeight: 'bold', textAlign: 'right' },
});

export default OrderDetailModal;
