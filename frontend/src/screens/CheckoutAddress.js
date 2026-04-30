import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Plus, ChevronLeft, CheckCircle2 } from 'lucide-react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

export default function CheckoutAddressScreen() {
  const navigation = useNavigation();
  const db = useSQLiteContext();
  const { user } = useAuth();
  
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  const fetchAddresses = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const result = await db.getAllAsync(
        'SELECT * FROM addresses WHERE userId = ? ORDER BY id DESC',
        [user.id]
      );
      setAddresses(result);
      if (result.length > 0 && !selectedId) {
        setSelectedId(result[0].id); // Auto-select the most recent
      }
    } catch (error) {
      console.error('Erro ao buscar endereços:', error);
      Alert.alert('Erro', 'Não foi possível carregar os endereços.');
    } finally {
      setLoading(false);
    }
  }, [user, db]);

  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [fetchAddresses])
  );

  const handleContinue = () => {
    if (!selectedId) {
      Alert.alert('Atenção', 'Selecione um endereço para continuar com a compra.');
      return;
    }
    const selectedAddress = addresses.find(a => a.id === selectedId);
    // Move para PaymentScreen passnado os dados
    navigation.navigate('Payment', { address: selectedAddress });
  };

  const renderAddress = ({ item }) => {
    const isSelected = item.id === selectedId;
    return (
      <TouchableOpacity 
        style={[styles.card, isSelected && styles.cardSelected]} 
        onPress={() => setSelectedId(item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.cardInfo}>
          <View style={styles.headerRow}>
            <MapPin color={isSelected ? "#FF6B00" : "#666"} size={18} />
            <Text style={[styles.street, isSelected && { color: '#FFF' }]}>{item.street}, {item.number}</Text>
          </View>
          <Text style={styles.details}>
            {item.neighborhood} - {item.city} / {item.state}
          </Text>
          <Text style={styles.zip}>CEP: {item.zipCode}</Text>
          {item.complement ? <Text style={styles.complement}>Comp: {item.complement}</Text> : null}
        </View>
        <View style={styles.checkWrapper}>
          {isSelected ? (
            <CheckCircle2 color="#FF6B00" size={24} />
          ) : (
            <View style={styles.uncheckCircle} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color="#FFF" size={28} />
        </TouchableOpacity>
        <Text style={styles.title}>Onde entregar?</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF6B00" />
        </View>
      ) : addresses.length === 0 ? (
        <View style={styles.center}>
          <MapPin color="#333" size={80} style={{ marginBottom: 20 }} />
          <Text style={styles.emptyText}>Nenhum endereço encontrado</Text>
          <Text style={styles.emptySub}>Cadastre um endereço para enviarmos seu pedido.</Text>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.navigate('AddressForm')}
          >
            <Plus color="#FFF" size={20} />
            <Text style={styles.btnText}>Cadastrar Novo Endereço</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={addresses}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={{ padding: 20 }}
            renderItem={renderAddress}
            ListFooterComponent={
              <TouchableOpacity 
                style={styles.addBtnSmall}
                onPress={() => navigation.navigate('AddressForm')}
              >
                <Plus color="#AAA" size={16} />
                <Text style={styles.addBtnSmallText}>Adicionar outro endereço</Text>
              </TouchableOpacity>
            }
          />
          <View style={styles.footer}>
             <TouchableOpacity style={styles.primaryButton} onPress={handleContinue}>
              <Text style={styles.btnText}>Continuar para Pagamento</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderColor: '#1A1A1A' },
  backBtn: { padding: 5, marginLeft: -5 },
  title: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyText: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  emptySub: { color: '#666', textAlign: 'center', marginBottom: 30, fontSize: 14, lineHeight: 20 },
  primaryButton: { backgroundColor: '#FF6B00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 12, width: '100%' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  footer: { padding: 20, borderTopWidth: 1, borderColor: '#1A1A1A', backgroundColor: '#0A0A0A' },
  card: { backgroundColor: '#0C0C0C', borderRadius: 16, padding: 15, marginBottom: 15, borderWidth: 2, borderColor: '#1A1A1A', flexDirection: 'row', alignItems: 'center' },
  cardSelected: { borderColor: '#FF6B00', backgroundColor: 'rgba(255, 107, 0, 0.05)' },
  cardInfo: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  street: { color: '#AAA', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  details: { color: '#888', fontSize: 14, marginBottom: 4 },
  zip: { color: '#666', fontSize: 12, marginBottom: 2 },
  complement: { color: '#666', fontSize: 12 },
  checkWrapper: { paddingLeft: 15 },
  uncheckCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#333' },
  addBtnSmall: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, marginTop: 5, borderStyle: 'dashed', borderWidth: 1, borderColor: '#333', borderRadius: 12 },
  addBtnSmallText: { color: '#AAA', marginLeft: 8, fontSize: 14, fontWeight: '600' }
});
