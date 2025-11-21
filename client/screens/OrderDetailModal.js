// client/components/OrderDetailModal.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import OrderConfirmationModal from '../screens/OrderConfirmationModal';

const formatCurrency = (amount) => '$' + Number(amount || 0).toFixed(2);

const OrderDetailModal = ({
  visible,
  onClose,
  orderItems = [],
  restaurantId,
  customerId,
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const totalPrice = orderItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
    0,
  );

  // Map quantity -> qty for OrderConfirmationModal
  const confirmationItems = orderItems.map((item) => ({
    ...item,
    qty: item.quantity || 0,
  }));

  const handleClose = () => {
    setShowConfirmation(false);
    onClose && onClose();
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View className="backdrop" style={styles.backdrop}>
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Order Details</Text>
              <Pressable onPress={onClose} style={styles.headerIconWrap}>
                <FontAwesome name="close" size={18} color="#ffffff" />
              </Pressable>
            </View>

            {/* Body */}
            <View style={styles.body}>
              <Text style={styles.subTitle}>
                Review your items before confirming.
              </Text>

              {/* Items list */}
              <View style={styles.listHeader}>
                <Text style={[styles.colName, styles.bold]}>Item</Text>
                <Text style={[styles.colQty, styles.bold]}>Qty</Text>
                <Text style={[styles.colPrice, styles.bold]}>Total</Text>
              </View>

              <ScrollView style={styles.itemsList}>
                {orderItems.map((item) => (
                  <View style={styles.itemRow} key={item.id}>
                    <Text style={styles.colName}>{item.name}</Text>
                    <Text style={styles.colQty}>{item.quantity}</Text>
                    <Text style={styles.colPrice}>
                      {formatCurrency(
                        (item.price || 0) * (item.quantity || 0),
                      )}
                    </Text>
                  </View>
                ))}
              </ScrollView>

              {/* Total row */}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>TOTAL:</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(totalPrice)}
                </Text>
              </View>

              {/* Buttons */}
              <View style={styles.actionsRow}>
                <Pressable style={styles.secondaryButton} onPress={onClose}>
                  <Text style={styles.secondaryButtonText}>CANCEL</Text>
                </Pressable>

                <Pressable
                  style={styles.primaryButton}
                  onPress={() => setShowConfirmation(true)}
                  disabled={orderItems.length === 0}
                >
                  <Text style={styles.primaryButtonText}>CONFIRM ORDER</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Uses the new styled OrderConfirmationModal */}
      <OrderConfirmationModal
        visible={showConfirmation}
        orderItems={confirmationItems}
        subtotal={totalPrice}
        status="auto"
        onClose={() => setShowConfirmation(false)}
        onConfirm={() => {
          console.log('Order confirmed from OrderDetailModal');
          setShowConfirmation(false);
          onClose && onClose();
        }}
      />
    </>
  );
};

const CARD_WIDTH = '90%';

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },

  // Header
  header: {
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  headerIconWrap: {
    paddingLeft: 12,
    paddingVertical: 4,
  },

  // Body
  body: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  subTitle: {
    fontSize: 13,
    color: '#4b5563',
    marginBottom: 10,
  },

  listHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 6,
    marginBottom: 4,
  },
  bold: {
    fontWeight: '700',
  },
  itemsList: {
    maxHeight: 200,
    marginBottom: 8,
  },

  itemRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  colName: {
    flex: 2,
    fontSize: 13,
    color: '#111827',
  },
  colQty: {
    flex: 0.7,
    textAlign: 'center',
    fontSize: 13,
    color: '#111827',
  },
  colPrice: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 4,
  },
  totalLabel: {
    fontWeight: '800',
    fontSize: 14,
    marginRight: 4,
  },
  totalValue: {
    fontWeight: '800',
    fontSize: 14,
  },

  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 14,
    gap: 8,
  },
  secondaryButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  primaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#D86F52',
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});

export default OrderDetailModal;
