import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, CreditCard, ShoppingBag, MapPin, ExternalLink } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useAuth } from '../context/AuthContext';
import * as Linking from 'expo-linking';

export default function PaymentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  
  // Endereço selecionado na tela anterior
  const address = route.params?.address;
  const { items, totalAmount } = useSelector(state => state.cart);

  const [loading, setLoading] = useState(false);

  const handleMercadoPagoCheckout = async () => {
    if (!address || items.length === 0) {
      Alert.alert('Erro', 'Dados do carrinho ou endereço inválidos.');
      return;
    }

    setLoading(true);
    try {
      // 1. Prepara o payload para o Backend
      const payload = {
        payer: {
          name: user.name,
          email: user.email,
        },
        items: items.map(item => ({
          id: String(item.id),
          title: item.name,
          description: item.flavor || '',
          picture_url: '', // opcional: poderia hospedar a imagem
          quantity: item.quantity,
          unit_price: item.price
        }))
      };

      // 2. Chama a API do Backend
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/payment/create-preference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.init_point) {
        // 3. Redireciona o usuário para o Checkout Transparente (Web/App Mercado Pago)
        await Linking.openURL(data.init_point);
        // Opcional: Esvaziar carrinho após enviar pro checkout
      } else {
        throw new Error('Link de pagamento não retornado');
      }
    } catch (error) {
      console.error('Erro de Checkout:', error);
      Alert.alert(
        'Falha no Pagamento', 
        'Não foi possível conectar ao Mercado Pago. Verifique se o servidor backend está rodando em '+process.env.EXPO_PUBLIC_API_URL
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color="#FFF" size={28} />
        </TouchableOpacity>
        <Text style={styles.title}>Pagamento</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Resumo do Pedido</Text>
          <View style={styles.row}>
            <ShoppingBag color="#666" size={18} />
            <Text style={styles.rowText}>{items.length} pacote({items.length > 1 ? 's' : ''}) selecionados</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total a Pagar:</Text>
            <Text style={styles.totalValue}>R$ {totalAmount.toFixed(2).replace('.', ',')}</Text>
          </View>
        </View>

        <View style={styles.addressCard}>
          <Text style={styles.sectionTitle}>Será entregue em:</Text>
          <View style={styles.addressInfo}>
            <MapPin color="#FF6B00" size={20} />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.addressStreet}>{address?.street}, {address?.number}</Text>
              <Text style={styles.addressCity}>{address?.neighborhood} - {address?.city}/{address?.state}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.paymentMethodTitle}>Selecione o Meio de Pagamento</Text>

        {/* Única Opção Atual: Mercado Pago */}
        <TouchableOpacity 
          style={styles.mpButton} 
          onPress={handleMercadoPagoCheckout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <View style={styles.mpLeft}>
                <View style={styles.mpIconBg}>
                  <CreditCard color="#009EE3" size={24} />
                </View>
                <Text style={styles.mpText}>Pagar com Mercado Pago</Text>
              </View>
              <ExternalLink color="#AAA" size={20} />
            </>
          )}
        </TouchableOpacity>
        <Text style={styles.mpSubtitle}>Você será redirecionado para um ambiente seguro.</Text>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderColor: '#1A1A1A' },
  backBtn: { padding: 5, marginLeft: -5 },
  title: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  content: { padding: 20, flex: 1 },
  summaryCard: { backgroundColor: '#121212', padding: 20, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#1A1A1A' },
  sectionTitle: { color: '#AAA', fontSize: 13, fontWeight: 'bold', marginBottom: 15, textTransform: 'uppercase' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  rowText: { color: '#FFF', fontSize: 15, marginLeft: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: '#222', paddingTop: 15 },
  totalLabel: { color: '#FFF', fontSize: 16, fontWeight: '500' },
  totalValue: { color: '#FF6B00', fontSize: 24, fontWeight: 'bold' },
  addressCard: { backgroundColor: 'rgba(255, 107, 0, 0.05)', padding: 20, borderRadius: 16, marginBottom: 30, borderWidth: 1, borderColor: 'rgba(255, 107, 0, 0.2)' },
  addressInfo: { flexDirection: 'row', alignItems: 'center' },
  addressStreet: { color: '#FFF', fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  addressCity: { color: '#AAA', fontSize: 13 },
  paymentMethodTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  mpButton: { backgroundColor: '#111', borderWidth: 1, borderColor: '#009EE3', borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mpLeft: { flexDirection: 'row', alignItems: 'center' },
  mpIconBg: { backgroundColor: 'rgba(0, 158, 227, 0.1)', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  mpText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  mpSubtitle: { color: '#666', fontSize: 12, textAlign: 'center', marginTop: 15 },
});
