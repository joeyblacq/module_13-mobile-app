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
          {/* Header bar matches wireframe */}
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
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.divider} />

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

            {/* TOTAL row (right aligned) */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL:</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(subtotal)}
              </Text>
            </View>

            {/* SUCCESS state (wireframe 2) */}
            {isSuccess && (
              <View style={styles.feedbackRow}>
                <View style={styles.iconCircleSuccess}>
                  <FontAwesome name="check" size={14} color="#ffffff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.feedbackTitle}>Thank you!</Text>
                  <Text style={styles.feedbackText}>
                    Your order has been received.
                  </Text>
                </View>
              </View>
            )}

            {/* FAILURE state (wireframe 3) – message under button */}
            {!isSuccess && isFailure && !isProcessing && (
              <View style={styles.failureSpacer} />
            )}

            {/* PRIMARY BUTTON (bottom, wireframe 4 / 1 / 3) */}
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

            {/* Failure message below button (wireframe 3) */}
            {!isSuccess && isFailure && !isProcessing && (
              <View style={styles.failureRow}>
                <View style={styles.iconCircleFailure}>
                  <FontAwesome name="close" size={14} color="#ffffff" />
                </View>
                <Text style={styles.failureText}>
                  {errorMessage ||
                    'Your order was not processed successfully. Please try again.'}
                </Text>
              </View>
            )}

            {/* Close button for success state (optional UX) */}
            {isSuccess && (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={onClose}
              >
                <Text style={styles.secondaryButtonText}>CLOSE</Text>
              </TouchableOpacity>
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

  body: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginBottom: 8,
  },

  itemsScroll: {
    maxHeight: 200,
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
    width: 70,
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

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginRight: 4,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '800',
  },

  // spacing above button for failure state so error message sits nicely below
  failureSpacer: {
    height: 4,
  },

  primaryButton: {
    marginTop: 12,
    backgroundColor: '#D86F52', // orange wireframe button
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

  failureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  iconCircleFailure: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#b91c1c',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  failureText: {
    flex: 1,
    fontSize: 13,
    color: '#b91c1c',
    fontWeight: '600',
  },

  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  iconCircleSuccess: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  feedbackText: {
    fontSize: 13,
    color: '#4b5563',
  },

  secondaryButton: {
    marginTop: 14,
    borderRadius: 6,
    paddingVertical: 10,
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
