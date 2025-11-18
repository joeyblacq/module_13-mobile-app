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
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const formatCurrency = (amount) => '$' + Number(amount || 0).toFixed(2);

const OrderConfirmationModal = ({
  visible,
  orderItems = [],
  subtotal = 0,
  processing = false,
  errorMessage = '',
  onClose,
  onConfirm,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Confirm Order</Text>

          <ScrollView style={{ maxHeight: 240 }}>
            {orderItems.map((item) => {
              const quantity = item.qty || 0;
              const lineTotal = (item.price || 0) * quantity;

              return (
                <View key={String(item.id)} style={styles.row}>
                  <Text style={styles.itemText}>
                    {item.name} × {quantity}
                  </Text>
                  <Text style={styles.priceText}>{formatCurrency(lineTotal)}</Text>
                </View>
              );
            })}
          </ScrollView>

          <Text style={styles.total}>Total: {formatCurrency(subtotal)}</Text>

          {!!errorMessage && (
            <View style={styles.errorRow}>
              <FontAwesome name="times-circle" size={18} color="#b91c1c" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={processing}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, processing && styles.confirmBtnDisabled]}
              onPress={onConfirm}
              disabled={processing}
            >
              {processing ? (
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
  itemText: {
    fontWeight: '600',
  },
  priceText: {
    fontWeight: '600',
  },
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
  confirmBtnDisabled: {
    opacity: 0.6,
  },
  confirmText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default OrderConfirmationModal;
