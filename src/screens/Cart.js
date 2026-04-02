import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trash2, ShoppingBag, Plus, Minus } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';


import { useSelector, useDispatch } from 'react-redux';
import { removeItem, updateQuantity } from '../store/cartSlice';


const productImages = {
 
  'aminoacidos_capsula': require('../assets/aminoacidos_capsula.png'),
  'aminoacidos_glutamina': require('../assets/aminoacidos_glutamina.png'),
  'aminoacidos_po': require('../assets/aminoacidos_po.png'),
  'creatina_monohidratada': require('../assets/creatina_monohidratada.png'),
  'creatina_pure': require('../assets/creatina_pure.png'),
  'creatina': require('../assets/creatina.png'),
  'hipercalorico_choco': require('../assets/hipercalorico_choco.png'),
  'hipercalorico_morango': require('../assets/hipercalorico_morango.png'),
  'multivitaminico80': require('../assets/multivitaminico80.png'),
  'multivitaminico90': require('../assets/multivitaminico90.png'),
  'pre_treino_explosion': require('../assets/pre_treino_explosion.png'),
  'pre_treino': require('../assets/pre_treino.png'),
  'whey_isolate_morango': require('../assets/whey_isolate_morango.png'),
  'whey_isolate': require('../assets/whey_isolate.png'),
  'whey_isolate1': require('../assets/whey_isolate1.png'),
  'vitaminas': require('../assets/vitaminas.png'),

};

export default function Cart() {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const handleRemoveItem = (item)=> {
    Alert.alert(
      "Remover Produto", 
      `Tem certeza que deseja remover ${item.name} do carrinho?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Remover", style: "destructive", onPress: () => dispatch(removeItem(item.id)) }
      ]
    );
  } 
  
  const { items, totalAmount } = useSelector((state) => state.cart);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      
      <View style={styles.headerCart}>
        <Text style={styles.headerTitle}>Meu Carrinho</Text>
      </View>

      {items.length > 0 ? (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ padding: 20 }}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                
                <View style={styles.imageContainer}>
                  <Image 
                    source={productImages[item.image]} 
                    style={styles.productImg}
                    resizeMode="contain"
                  />
                </View>

                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemFlavor}>{item.flavor}</Text>
                  
                  <View style={styles.priceQtyRow}>
                    <Text style={styles.itemPrice}>
                      R$ {item.price.toFixed(2).replace('.', ',')}
                    </Text>

                    
                    <View style={styles.qtyControls}>
                      <TouchableOpacity 
                        style={styles.qtyBtn}
                        onPress={() => dispatch(updateQuantity({ id: item.id, amount: -1 }))}
                      >
                        <Minus color="#FF6B00" size={16} />
                      </TouchableOpacity>
                      
                      <Text style={styles.qtyText}>{item.quantity}</Text>

                      <TouchableOpacity 
                        style={styles.qtyBtn}
                        onPress={() => dispatch(updateQuantity({ id: item.id, amount: 1 }))}
                      >
                        <Plus color="#FF6B00" size={16} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                
                <TouchableOpacity 
                  style={styles.removeBtn}
                  onPress={() => handleRemoveItem(item)}
                >
                  <Trash2 color="#666" size={20} />
                </TouchableOpacity>
              </View>
            )}
          />

          
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total do Pedido:</Text>
              <Text style={styles.totalValue}>
                R$ {totalAmount.toFixed(2).replace('.', ',')}
              </Text>
            </View>
            <TouchableOpacity style={styles.checkoutBtn}>
              <Text style={styles.checkoutText}>Finalizar Compra</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <ShoppingBag color="#1A1A1A" size={100} />
          <Text style={styles.emptyText}>Seu carrinho está vazio</Text>
          <TouchableOpacity 
            style={styles.backBtn}
            onPress={() => navigation.navigate('Catálogo')}
          >
            <Text style={styles.backBtnText}>Voltar às compras</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  headerCart: { padding: 20, paddingTop: 10 },
  headerTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  cartItem: { 
    flexDirection: 'row', 
    backgroundColor: '#121212', 
    borderRadius: 20, 
    padding: 15, 
    marginBottom: 15, 
    alignItems: 'center' 
  },
  imageContainer: { 
    width: 80, 
    height: 80, 
    backgroundColor: '#1A1A1A', 
    borderRadius: 15, 
    padding: 5
  },
  productImg: { width: '100%', height: '100%' },
  itemDetails: { flex: 1, marginLeft: 15 },
  itemName: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
  itemFlavor: { color: '#666', fontSize: 12, marginVertical: 4 },
  priceQtyRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginTop: 5
  },
  itemPrice: { color: '#FF6B00', fontSize: 16, fontWeight: 'bold' },
  qtyControls: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    padding: 4
  },
  qtyBtn: { padding: 5 },
  qtyText: { color: '#FFF', marginHorizontal: 10, fontWeight: 'bold' },
  removeBtn: { padding: 10, marginLeft: 5 },
  footer: { 
    padding: 25, 
    backgroundColor: '#0A0A0A', 
    borderTopWidth: 1, 
    borderTopColor: '#1A1A1A' 
  },
  totalRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 20 
  },
  totalLabel: { color: '#AAA', fontSize: 16 },
  totalValue: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  checkoutBtn: { 
    backgroundColor: '#FF6B00', 
    padding: 20, 
    borderRadius: 18, 
    alignItems: 'center',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5
  },
  checkoutText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#333', fontSize: 18, marginTop: 20, fontWeight: 'bold' },
  backBtn: { marginTop: 20, backgroundColor: '#121212', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 12 },
  backBtnText: { color: '#FF6B00', fontWeight: 'bold' }
});