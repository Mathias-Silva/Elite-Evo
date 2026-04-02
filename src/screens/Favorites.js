import React from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { removeFavorite } from '../store/favoritesSlice';
import { addItem } from '../store/cartSlice';
import { useNavigation } from '@react-navigation/native';

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

export default function Favorites() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const items = useSelector(state => state.favorites.items);

  const handleRemove = (id) => {
    dispatch(removeFavorite(id));
  };

  const handleAddToCart = (product) => {
    dispatch(addItem(product));
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Favoritos</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Heart color="#1A1A1A" size={90} />
          <Text style={styles.emptyTitle}>Nenhum favorito ainda</Text>
          <Text style={styles.emptySubtitle}>Adicione produtos que você ama e encontre-os aqui.</Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => navigation.navigate('Catálogo')}
          >
            <Text style={styles.emptyBtnText}>Ver Produtos</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favoritos</Text>
        <Text style={styles.headerCount}>{items.length} {items.length === 1 ? 'item' : 'itens'}</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.imageContainer}>
              {productImages[item.image] ? (
                <Image
                  source={productImages[item.image]}
                  style={styles.productImg}
                  resizeMode="contain"
                />
              ) : null}
            </View>

            <View style={styles.info}>
              <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.productFlavor}>{item.flavor}</Text>
              <Text style={styles.productPrice}>R$ {item.price.toFixed(2).replace('.', ',')}</Text>

              <TouchableOpacity
                style={styles.addToCartBtn}
                onPress={() => handleAddToCart(item)}
              >
                <ShoppingCart color="#FFF" size={14} />
                <Text style={styles.addToCartText}>Adicionar ao Carrinho</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => handleRemove(item.id)}
            >
              <Trash2 color="#666" size={20} />
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  headerCount: { color: '#666', fontSize: 14 },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: { color: '#333', fontSize: 20, fontWeight: 'bold', marginTop: 20 },
  emptySubtitle: { color: '#444', fontSize: 13, textAlign: 'center', marginTop: 10, lineHeight: 20 },
  emptyBtn: {
    marginTop: 25,
    backgroundColor: '#FF6B00',
    paddingVertical: 14,
    paddingHorizontal: 35,
    borderRadius: 30,
  },
  emptyBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },

  listContent: { paddingHorizontal: 20, paddingBottom: 20 },

  card: {
    flexDirection: 'row',
    backgroundColor: '#121212',
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  imageContainer: {
    width: 85,
    height: 85,
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 5,
    overflow: 'hidden',
  },
  productImg: { width: '100%', height: '100%' },
  info: { flex: 1, marginLeft: 15 },
  productName: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
  productFlavor: { color: '#666', fontSize: 12, marginVertical: 3 },
  productPrice: { color: '#FF6B00', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  addToCartText: { color: '#FFF', fontSize: 11, fontWeight: '600', marginLeft: 5 },
  removeBtn: { padding: 10, marginLeft: 5 },
});
