import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';  // Using react-native-modal for the overlay:contentReference[oaicite:1]{index=1}
import FontAwesome from 'react-native-vector-icons/FontAwesome';  // FontAwesome icons (ensure react-native-vector-icons is installed)

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
const OrderConfirmationModal = ({ visible, orderItems = [], restaurantId, customerId, onClose, onOrderCreated }) => {
  // Track the order submission status: 'idle', 'processing', 'success', 'failure'
  const [orderStatus, setOrderStatus] = useState('idle');

  // Compute total price from order items
  const totalPrice = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Helper function to format numbers as currency (USD in this example).
  const formatCurrency = (amount) => {
    // In a real app, consider Intl.NumberFormat for locale-aware formatting:contentReference[oaicite:2]{index=2}
    return '$' + Number(amount).toFixed(2);
  };

  // Handle confirm order button press
  const handleConfirmOrder = async () => {
    setOrderStatus('processing'); // enter processing state (disable confirm)
    try {
      // Prepare order data payload
      const orderData = {
        restaurantId,
        customerId,
        items: orderItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      };
      // TODO: Replace the URL with your actual order creation API endpoint
      const response = await fetch('https://api.example.com/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      // If successful:
      setOrderStatus('success');
      const result = await response.json();  // assuming the API returns order details
      // Invoke callback to parent (e.g., to refresh order history) if provided
      onOrderCreated && onOrderCreated(result);
    } catch (error) {
      console.error('Order creation failed:', error);
      setOrderStatus('failure'); // show failure state (error message & retry)
    }
  };

  return (
    <Modal 
      isVisible={visible} 
      onBackdropPress={onClose} 
      backdropOpacity={0.5} 
      // Accessibility: mark modal as containing accessible content and trap focus within it
      // (accessibilityViewIsModal is iOS-only and keeps VoiceOver focus inside the modal):contentReference[oaicite:3]{index=3}
      // (accessible declares this view as an accessible element group)
    >
      <View style={styles.modalContainer} accessible accessibilityViewIsModal={true}>
        {/* Close button (X) in top-right corner */}
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={onClose} 
          accessibilityLabel="Close order confirmation dialog"
          accessibilityRole="button"
        >
          <FontAwesome name="times" size={24} color="#333" />
        </TouchableOpacity>

        {/* Modal Title */}
        <Text style={styles.modalTitle}>Confirm Order</Text>

        {/* Order items list */}
        <ScrollView style={styles.itemsList} contentContainerStyle={{paddingVertical: 5}}>
          {orderItems.map((item) => (
            <View style={styles.itemRow} key={item.id || item.name}>
              {/* Item name with quantity */}
              <Text style={styles.itemName}>
                {item.quantity} × {item.name}
              </Text>
              {/* Item subtotal price */}
              <Text style={styles.itemPrice}>
                {formatCurrency(item.price * item.quantity)}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Total price display */}
        <Text style={styles.totalText}>
          Total: <Text style={styles.totalAmount}>{formatCurrency(totalPrice)}</Text>
        </Text>

        {/* Status Messages and Icons */}
        {orderStatus === 'success' && (
          <View style={styles.statusContainer}>
            {/* Success state: green checkmark and message */}
            <FontAwesome 
              name="check-circle" 
              size={48} 
              color="#4BB543"  /* green check icon */
              style={styles.statusIcon}
              accessible={false}  /* decorative icon, screen reader will read the text */
            />
            <Text style={styles.statusMessage}>Thank you! Your order has been received.</Text>
          </View>
        )}
        {orderStatus === 'failure' && (
          <View style={styles.statusContainer}>
            {/* Failure state: red X icon and error message */}
            <FontAwesome 
              name="times-circle" 
              size={48} 
              color="#FF4444"  /* red X icon for error */
              style={styles.statusIcon}
              accessible={false}
            />
            <Text style={[styles.statusMessage, styles.errorMessage]}>
              Oops, something went wrong. Please try again.
            </Text>
          </View>
        )}

        {/* Confirm/Action button section */}
        {orderStatus === 'processing' ? (
          /* Processing state: show disabled button with spinner and text */
          <View style={[styles.confirmButton, styles.confirmButtonDisabled]} accessible accessibilityRole="button">
            <ActivityIndicator size="small" color="#ffffff" style={{marginRight: 8}} />
            <Text style={styles.confirmButtonText}>Processing Order...</Text>
          </View>
        ) : orderStatus === 'success' ? (
          /* Success state: Provide a button to close (or could auto-close after a delay) */
          <TouchableOpacity 
            style={styles.confirmButton} 
            onPress={onClose}
            accessibilityLabel="Close dialog"
            accessibilityRole="button"
          >
            <Text style={styles.confirmButtonText}>Done</Text>
          </TouchableOpacity>
        ) : (
          /* Idle or failure state: show the Confirm Order button (retry on failure) */
          <TouchableOpacity 
            style={styles.confirmButton} 
            onPress={handleConfirmOrder}
            accessibilityLabel="Confirm order"
            accessibilityRole="button"
          >
            <Text style={styles.confirmButtonText}>Confirm Order</Text>
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
};

export default OrderConfirmationModal;

// Styles for the OrderConfirmationModal component
const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#FFFFFF',    // Modal background color (white)
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 20,         // Responsive width (90% of screen approximately)
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
    color: '#333',                // Brand text color (assuming dark text)
  },
  itemsList: {
    maxHeight: 200,               // Limit height so list scrolls if too long (responsive)
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
    color: '#CC0000',  // red text for error message
  },
  confirmButton: {
    flexDirection: 'row',
    backgroundColor: '#FF6D00',   // Brand primary color for the button (example: orange)
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: '#999999',   // Disabled state color (grey)
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
