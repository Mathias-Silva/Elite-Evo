import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Save, Search } from 'lucide-react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

export default function AddressFormScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const db = useSQLiteContext();
  const { user } = useAuth();
  
  const editId = route.params?.id;
  const isEditing = !!editId;

  const [loading, setLoading] = useState(false);
  const [searchingCep, setSearchingCep] = useState(false);

  const [zipCode, setZipCode] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  useEffect(() => {
    if (isEditing) {
      loadAddressData();
    }
  }, [isEditing]);

  const loadAddressData = async () => {
    try {
      setLoading(true);
      const address = await db.getFirstAsync('SELECT * FROM addresses WHERE id = ?', [editId]);
      if (address) {
        setZipCode(address.zipCode);
        setStreet(address.street);
        setNumber(address.number);
        setComplement(address.complement || '');
        setNeighborhood(address.neighborhood);
        setCity(address.city);
        setState(address.state);
      }
    } catch (error) {
      console.error('Erro ao carregar endereço', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do endereço.');
    } finally {
      setLoading(false);
    }
  };

  const handleCepSearch = async () => {
    const cepNumerico = zipCode.replace(/\D/g, '');
    if (cepNumerico.length !== 8) {
      Alert.alert('CEP Inválido', 'Digite um CEP com 8 números para buscar.');
      return;
    }

    setSearchingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepNumerico}/json/`);
      const data = await response.json();

      if (data.erro) {
        Alert.alert('Não encontrado', 'CEP não localizado na base dos Correios.');
      } else {
        setStreet(data.logradouro || '');
        setNeighborhood(data.bairro || '');
        setCity(data.localidade || '');
        setState(data.uf || '');
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao conectar com o serviço de CEP.');
    } finally {
      setSearchingCep(false);
    }
  };

  // Automático se der exatamente 8 caracteres digitados e perder o foco ou terminar de digitar
  useEffect(() => {
    const cepNumerico = zipCode.replace(/\D/g, '');
    if (cepNumerico.length === 8 && !isEditing) {
      handleCepSearch();
    }
  }, [zipCode]);

  const handleSave = async () => {
    if (!zipCode || !street || !number || !neighborhood || !city || !state) {
      Alert.alert('Campos Obrigatórios', 'Preencha todos os campos, exceto o complemento.');
      return;
    }

    try {
      if (isEditing) {
        await db.runAsync(
          `UPDATE addresses SET zipCode = ?, street = ?, number = ?, complement = ?, neighborhood = ?, city = ?, state = ? WHERE id = ?`,
          [zipCode, street, number, complement, neighborhood, city, state, editId]
        );
        Alert.alert('Sucesso', 'Endereço atualizado!');
      } else {
        await db.runAsync(
          `INSERT INTO addresses (userId, zipCode, street, number, complement, neighborhood, city, state) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [user.id, zipCode, street, number, complement, neighborhood, city, state]
        );
        Alert.alert('Sucesso', 'Endereço cadastrado!');
      }
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao salvar endereço', error);
      Alert.alert('Erro', 'Falha ao salvar o endereço. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color="#FFF" size={28} />
        </TouchableOpacity>
        <Text style={styles.title}>{isEditing ? 'Editar Endereço' : 'Novo Endereço'}</Text>
        <View style={{ width: 28 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>CEP</Text>
            <View style={styles.cepContainer}>
              <TextInput
                style={[styles.input, styles.cepInput]}
                placeholder="00000-000"
                placeholderTextColor="#666"
                keyboardType="numeric"
                maxLength={9}
                value={zipCode}
                onChangeText={setZipCode}
              />
              <TouchableOpacity style={styles.searchBtn} onPress={handleCepSearch} disabled={searchingCep}>
                {searchingCep ? <ActivityIndicator color="#FFF" size="small" /> : <Search color="#FFF" size={20} />}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Logradouro (Rua, Avenida, etc)</Text>
            <TextInput style={styles.input} placeholderTextColor="#666" value={street} onChangeText={setStreet} />
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Número</Text>
              <TextInput 
                style={styles.input} 
                placeholderTextColor="#666" 
                keyboardType="numeric" 
                value={number} 
                onChangeText={(text) => setNumber(text.replace(/[^0-9]/g, ''))} 
              />
            </View>
            <View style={[styles.formGroup, { flex: 1.5 }]}>
              <Text style={styles.label}>Complemento (Opcional)</Text>
              <TextInput style={styles.input} placeholderTextColor="#666" value={complement} onChangeText={setComplement} />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Bairro</Text>
            <TextInput 
              style={styles.input} 
              placeholderTextColor="#666" 
              value={neighborhood} 
              onChangeText={(text) => setNeighborhood(text.replace(/[^a-zA-ZÀ-ÿ\s]/g, ''))} 
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 2, marginRight: 10 }]}>
              <Text style={styles.label}>Cidade</Text>
              <TextInput 
                style={styles.input} 
                placeholderTextColor="#666" 
                value={city} 
                onChangeText={(text) => setCity(text.replace(/[^a-zA-ZÀ-ÿ\s]/g, ''))} 
              />
            </View>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>UF</Text>
              <TextInput style={styles.input} placeholderTextColor="#666" maxLength={2} autoCapitalize="characters" value={state} onChangeText={setState} />
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Save color="#FFF" size={20} />
          <Text style={styles.saveText}>Salvar Endereço</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centerContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderColor: '#1A1A1A' },
  backBtn: { padding: 5, marginLeft: -5 },
  title: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  scrollContent: { padding: 20 },
  formGroup: { marginBottom: 18 },
  row: { flexDirection: 'row' },
  label: { color: '#AAA', fontSize: 13, marginBottom: 8, fontWeight: '600' },
  input: { backgroundColor: '#1A1A1A', color: '#FFF', borderRadius: 12, padding: 16, fontSize: 16, borderWidth: 1, borderColor: '#2A2A2A' },
  cepContainer: { flexDirection: 'row' },
  cepInput: { flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRightWidth: 0 },
  searchBtn: { backgroundColor: '#FF6B00', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, borderTopRightRadius: 12, borderBottomRightRadius: 12 },
  footer: { padding: 20, borderTopWidth: 1, borderColor: '#1A1A1A', backgroundColor: '#050505' },
  saveButton: { backgroundColor: '#FF6B00', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 12 },
  saveText: { color: '#FFF', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },
});
