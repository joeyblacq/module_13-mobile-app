// client/screens/OrderConfirmationModal.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const formatCurrency = (amount) => '$' + Number(amount || 0).toFixed(2);

/**
 * Props:
 *  - visible: boolean
 *  - orderItems: [{ id, name, price, qty }]
 *  - subtotal: number
 *  - processing: boolean
 *  - errorMessage: string
 *  - status?: 'default' | 'processing' | 'success' | 'failure' | 'auto'
 *  - onClose: () => void
 *  - onConfirm: () => void
 */
const OrderConfirmationModal = ({
  visible,
  orderItems = [],
  subtotal = 0,
  processing = false,
  errorMessage = '',
  status: explicitStatus = 'auto',
  onClose,
  onConfirm,
}) => {
  // derive status if not explicitly passed
  let status = explicitStatus;
  if (status === 'auto') {
    if (processing) status = 'processing';
    else if (errorMessage) status = 'failure';
    else status = 'default';
  }

  const isProcessing = status === 'processing';
  const isSuccess = status === 'success';
  const isFailure = status === 'failure';

  const hasItems = Array.isArray(orderItems) && orderItems.length > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header bar */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Order Confirmation</Text>
            <TouchableOpacity
              onPress={onClose}
              disabled={isProcessing}
              style={styles.closeIconWrap}
            >
              <FontAwesome
                name="close"
                size={18}
                color="#ffffff"
                style={{ opacity: isProcessing ? 0.6 : 1 }}
              />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <View style={styles.body}>
            {/* Section title */}
            <Text style={styles.sectionTitle}>Order Summary</Text>

            {/* Items */}
            {hasItems ? (
              <ScrollView style={styles.itemsScroll}>
                {orderItems.map((item) => {
                  const quantity = item.qty || 0;
                  const lineTotal = (item.price || 0) * quantity;

                  return (
                    <View key={String(item.id)} style={styles.row}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemQty}>x{quantity}</Text>
                      <Text style={styles.itemPrice}>
                        {formatCurrency(lineTotal)}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  No items were selected for this order.
                </Text>
              </View>
            )}

            {/* Thin divider under items (like screenshot) */}
            <View style={styles.itemsDivider} />

            {/* TOTAL row */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL:</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(subtotal)}
              </Text>
            </View>

            {/* Divider between total and button */}
            <View style={styles.buttonDivider} />

            {/* MAIN BUTTON */}
            {!isSuccess && (
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (isProcessing || !hasItems) && styles.primaryButtonDisabled,
                ]}
                onPress={onConfirm}
                disabled={isProcessing || !hasItems}
              >
                {isProcessing ? (
                  <>
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text style={styles.primaryButtonText}>
                      {'  '}PROCESSING ORDER…
                    </Text>
                  </>
                ) : (
                  <Text style={styles.primaryButtonText}>CONFIRM ORDER</Text>
                )}
              </TouchableOpacity>
            )}

            {/* FAILURE MESSAGE (matches screenshot layout) */}
            {!isSuccess && isFailure && !isProcessing && (
              <View style={styles.failureContainer}>
                <View style={styles.iconCircleFailure}>
                  <FontAwesome name="close" size={16} color="#ffffff" />
                </View>
                <Text style={styles.failureText}>
                  {errorMessage ||
                    'Your order was not processed successfully.\nPlease try again.'}
                </Text>
              </View>
            )}

            {/* SUCCESS STATE – optional: center icon + text */}
            {isSuccess && (
              <View style={styles.successContainer}>
                <View style={styles.iconCircleSuccess}>
                  <FontAwesome name="check" size={16} color="#ffffff" />
                </View>
                <Text style={styles.successTitle}>Thank you!</Text>
                <Text style={styles.successText}>
                  Your order has been received.
                </Text>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={onClose}
                >
                  <Text style={styles.secondaryButtonText}>CLOSE</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
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
  closeIconWrap: {
    paddingLeft: 12,
    paddingVertical: 4,
  },

  // Body
  body: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },

  itemsScroll: {
    maxHeight: 220,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
  },
  itemQty: {
    width: 40,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  itemPrice: {
    width: 80,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '600',
  },

  emptyState: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#6b7280',
  },

  itemsDivider: {
    height: 1,
    backgroundColor: '#000000',
    marginTop: 8,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    marginRight: 4,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '800',
  },

  buttonDivider: {
    height: 16,
  },

  primaryButton: {
    backgroundColor: '#D86F52', // orange like the wireframe
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },

  // Failure state – centered circle and text underneath
  failureContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  iconCircleFailure: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#b91c1c',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  failureText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#111827',
  },

  // Success state – centered too (not in the screenshot but nice UX)
  successContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  iconCircleSuccess: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  successText: {
    fontSize: 13,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 12,
  },
  secondaryButton: {
    marginTop: 4,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  secondaryButtonText: {
    fontWeight: '600',
    fontSize: 13,
    color: '#111827',
  },
});

export default OrderConfirmationModal;
