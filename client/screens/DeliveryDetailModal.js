// client/components/DeliveryDetailModal.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const formatCurrency = (amount) => '$' + Number(amount || 0).toFixed(2);

const DeliveryDetailModal = ({ visible, onClose, delivery }) => {
  if (!delivery) return null;

  const {
    id,
    status,
    address,
    restaurantName,
    restaurant,
    orderDate,
    items = [],
    total,
  } = delivery;

  // Prefer explicit total if present, otherwise compute from items
  const computedTotal = items.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || item.qty || 0),
    0,
  );
  const totalPrice = total != null ? total : computedTotal;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Delivery Details</Text>
            <Pressable onPress={onClose} style={styles.headerIconWrap}>
              <FontAwesome name="close" size={18} color="#ffffff" />
            </Pressable>
          </View>

          {/* Body */}
          <View style={styles.body}>
            {/* Top info block */}
            <Text style={styles.infoLine}>
              <Text style={styles.bold}>Order ID: </Text>
              {id ?? 'N/A'}
            </Text>

            {status ? (
              <Text style={styles.infoLine}>
                <Text style={styles.bold}>Status: </Text>
                {String(status).replace('_', ' ')}
              </Text>
            ) : null}

            {(restaurantName || restaurant) && (
              <Text style={styles.infoLine}>
                <Text style={styles.bold}>Restaurant: </Text>
                {restaurantName || restaurant}
              </Text>
            )}

            {address ? (
              <Text style={styles.infoLine}>
                <Text style={styles.bold}>Delivery Address: </Text>
                {address}
              </Text>
            ) : null}

            {orderDate ? (
              <Text style={styles.infoLine}>
                <Text style={styles.bold}>Order Date: </Text>
                {orderDate}
              </Text>
            ) : null}

            {/* Items header */}
            <View style={styles.listHeader}>
              <Text style={[styles.colName, styles.bold]}>Item</Text>
              <Text style={[styles.colQty, styles.bold]}>Qty</Text>
              <Text style={[styles.colPrice, styles.bold]}>Total</Text>
            </View>

            {/* Items list */}
            <ScrollView style={styles.itemsList}>
              {items.length > 0 ? (
                items.map((item, index) => {
                  const qty = item.quantity ?? item.qty ?? 0;
                  const lineTotal = (item.price || 0) * qty;

                  return (
                    <View
                      style={styles.itemRow}
                      key={item.id ? String(item.id) : `item-${index}`}
                    >
                      <Text style={styles.colName}>{item.name || 'Item'}</Text>
                      <Text style={styles.colQty}>{qty}</Text>
                      <Text style={styles.colPrice}>
                        {formatCurrency(lineTotal)}
                      </Text>
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyItems}>
                  <Text style={styles.emptyItemsText}>
                    No item details available for this delivery.
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Total row */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL:</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(totalPrice)}
              </Text>
            </View>
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
  headerIconWrap: {
    paddingLeft: 12,
    paddingVertical: 4,
  },

  // Body
  body: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoLine: {
    fontSize: 13,
    color: '#111827',
    marginBottom: 4,
  },
  bold: {
    fontWeight: '700',
  },

  listHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 6,
    marginTop: 10,
    marginBottom: 4,
  },
  itemsList: {
    maxHeight: 220,
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

  emptyItems: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  emptyItemsText: {
    fontSize: 12,
    color: '#6b7280',
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
});

export default DeliveryDetailModal;
