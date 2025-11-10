import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

/**
 * OrderDetailModal
 * Props:
 * - visible: boolean to control visibility
 * - order: object containing order details:
 *    { restaurantName, date, status, courierName, items: [{ name, price, quantity }], total }
 * - onClose: function to call when closing the modal
 */
const OrderDetailModal = ({ visible, order, onClose }) => {
  // Helper to format date (assuming order.date is a Date or ISO string)
  const formatDate = (date) => {
    try {
      const d = new Date(date);
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return date;  // Fallback: return as-is if already a formatted string
    }
  };

  // Reuse currency formatting from above (assuming same currency format needed)
  const formatCurrency = (amount) => '$' + Number(amount).toFixed(2);

  return (
    <Modal 
      isVisible={visible} 
      onBackdropPress={onClose} 
      backdropOpacity={0.5}
    >
      <View style={styles.modalContainer} accessible accessibilityViewIsModal={true}>
        {/* Close (X) button */}
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={onClose}
          accessibilityLabel="Close order details dialog"
          accessibilityRole="button"
        >
          <FontAwesome name="times" size={24} color="#333" />
        </TouchableOpacity>

        {/* Restaurant Name */}
        <Text style={styles.restaurantName}>{order?.restaurantName}</Text>
        {/* Order date and status */}
        <Text style={styles.orderMeta}>
          {order ? formatDate(order.date) : ''} — {order?.status}
        </Text>
        {/* Courier name if available */}
        {order?.courierName && (
          <Text style={styles.courierName}>Courier: {order.courierName}</Text>
        )}

        {/* Items list with quantity and price */}
        <ScrollView style={styles.itemsList} contentContainerStyle={{paddingVertical: 5}}>
          {order?.items && order.items.map((item, index) => (
            <View style={styles.itemRow} key={`${item.name}-${index}`}>
              <Text style={styles.itemName}>
                {item.quantity} × {item.name}
              </Text>
              <Text style={styles.itemPrice}>
                {formatCurrency(item.price * item.quantity)}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Total price at bottom */}
        <Text style={styles.totalText}>
          Total: <Text style={styles.totalAmount}>{formatCurrency(order?.total)}</Text>
        </Text>
      </View>
    </Modal>
  );
};

export default OrderDetailModal;

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 20,
    maxHeight: '80%',           // Limit height to 80% of screen (scrollable content if exceeds)
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 8,
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
    color: '#333',
  },
  orderMeta: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 4,
    color: '#666',
  },
  courierName: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
    color: '#666',
  },
  itemsList: {
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  itemName: {
    fontSize: 16,
    color: '#444',
  },
  itemPrice: {
    fontSize: 16,
    color: '#444',
  },
  totalText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'right',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
    color: '#000',
  },
  totalAmount: {
    color: '#000',
  },
});
