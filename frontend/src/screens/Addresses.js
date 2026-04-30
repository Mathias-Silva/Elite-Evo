import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Plus, Trash2, Edit3, ArrowBack, ChevronLeft } from 'lucide-react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

export default function AddressesScreen() {
  const navigation = useNavigation();
  const db = useSQLiteContext();
  const { user } = useAuth();
  
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAddresses = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const result = await db.getAllAsync(
        'SELECT * FROM addresses WHERE userId = ? ORDER BY id DESC',
        [user.id]
      );
      setAddresses(result);
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

  const handleDelete = (id) => {
    Alert.alert('Excluir', 'Tem certeza que deseja remover este endereço?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await db.runAsync('DELETE FROM addresses WHERE id = ?', [id]);
            fetchAddresses();
          } catch (error) {
            Alert.alert('Erro', 'Falha ao excluir o endereço.');
          }
        }
      }
    ]);
  };

  const renderAddress = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <View style={styles.headerRow}>
          <MapPin color="#FF6B00" size={18} />
          <Text style={styles.street}>{item.street}, {item.number}</Text>
        </View>
        <Text style={styles.details}>
          {item.neighborhood} - {item.city} / {item.state}
        </Text>
        <Text style={styles.zip}>CEP: {item.zipCode}</Text>
        {item.complement ? <Text style={styles.complement}>Comp: {item.complement}</Text> : null}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('AddressForm', { id: item.id })}>
          <Edit3 color="#FFF" size={18} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#330000' }]} onPress={() => handleDelete(item.id)}>
          <Trash2 color="#FF3333" size={18} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color="#FFF" size={28} />
        </TouchableOpacity>
        <Text style={styles.title}>Meus Endereços</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF6B00" />
        </View>
      ) : addresses.length === 0 ? (
        <View style={styles.center}>
          <MapPin color="#333" size={80} style={{ marginBottom: 20 }} />
          <Text style={styles.emptyText}>Nenhum endereço cadastrado</Text>
          <Text style={styles.emptySub}>Adicione um endereço para receber seus suplementos mais rápido.</Text>
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
          />
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => navigation.navigate('AddressForm')}
            >
              <Plus color="#FFF" size={20} />
              <Text style={styles.btnText}>Adicionar Outro Endereço</Text>
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
  primaryButton: { backgroundColor: '#FF6B00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, width: '100%' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },
  footer: { padding: 20, borderTopWidth: 1, borderColor: '#1A1A1A' },
  card: { backgroundColor: '#121212', borderRadius: 16, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#1A1A1A', flexDirection: 'row' },
  cardInfo: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  street: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  details: { color: '#AAA', fontSize: 14, marginBottom: 4 },
  zip: { color: '#666', fontSize: 12, marginBottom: 2 },
  complement: { color: '#666', fontSize: 12 },
  actions: { justifyContent: 'space-between', marginLeft: 10 },
  actionBtn: { padding: 10, backgroundColor: '#1A1A1A', borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 5 }
});
