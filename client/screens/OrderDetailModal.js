import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import OrderConfirmationModal from './OrderConfirmationModal';

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  itemsList: { marginBottom: 10 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  total: { fontSize: 18, fontWeight: 'bold', textAlign: 'right' },
});
const OrderDetailModal = ({ visible, onClose, orderItems, restaurantId, customerId }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const totalPrice = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const formatCurrency = (amount) => '$' + Number(amount).toFixed(2);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Details</Text>

      <ScrollView style={styles.itemsList}>
        {orderItems.map((item) => (
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
          onClose(); // optional: close detail modal too
        }}
        onOrderCreated={(order) => {
          console.log('Order confirmed:', order);
        }}
      />
    </View>
  );
};

export default OrderDetailModal;

