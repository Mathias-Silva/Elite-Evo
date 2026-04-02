import React, { useEffect, useState, useMemo } from 'react';
import {
  Text, View, FlatList, ActivityIndicator, Image,
  TextInput, TouchableOpacity, StyleSheet, Platform, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';
import { Search, ShoppingCart, Heart, Star } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addItem } from '../store/cartSlice';
import { addFavorite, removeFavorite } from '../store/favoritesSlice';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

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

export default function Catalog() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const db = useSQLiteContext();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const cartItems = useSelector(state => state.cart.items);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const favoriteItems = useSelector(state => state.favorites.items);
  const favoriteIds = useMemo(() => new Set(favoriteItems.map(f => f.id)), [favoriteItems]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const result = await db.getAllAsync('SELECT * FROM products');
        setProducts(result);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(q));
  }, [products, searchQuery]);

  const handleAddToCart = (product) => {
    dispatch(addItem(product));
  };

  const handleToggleFavorite = (product) => {
    if (favoriteIds.has(product.id)) {
      dispatch(removeFavorite(product.id));
    } else {
      dispatch(addFavorite(product));
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Catálogo</Text>
        <TouchableOpacity
          style={styles.cartBadgeContainer}
          onPress={() => navigation.navigate('Cart')}
        >
          <ShoppingCart color="#FFF" size={22} />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search color="#FF6B00" size={18} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar produto..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {filteredProducts.length === 0 ? (
        <View style={styles.emptySearch}>
          <Text style={styles.emptySearchText}>Nenhum produto encontrado para "{searchQuery}"</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isFav = favoriteIds.has(item.id);
            return (
              <View style={styles.productCard}>
                {item.tag && item.tag !== 'NULL' && (
                  <View style={[styles.tag, { backgroundColor: item.tag === 'ESGOTADO' ? '#333' : '#FF6B00' }]}>
                    <Text style={styles.tagText}>{item.tag}</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.heartBtn}
                  onPress={() => handleToggleFavorite(item)}
                >
                  <Heart
                    color="#FF6B00"
                    fill={isFav ? '#FF6B00' : 'transparent'}
                    size={16}
                  />
                </TouchableOpacity>

                <View style={styles.imagePlaceholder}>
                  {productImages[item.image] ? (
                    <Image
                      source={productImages[item.image]}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="contain"
                    />
                  ) : (
                    <ActivityIndicator color="#FF6B00" />
                  )}
                </View>

                <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.productFlavor}>{item.flavor}</Text>

                <View style={styles.priceRow}>
                  <Text style={styles.productPrice}>R$ {item.price.toFixed(2).replace('.', ',')}</Text>
                  <View style={styles.ratingBadge}>
                    <Star color="#FFB800" fill="#FFB800" size={12} />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.addToCartBtn}
                  onPress={() => handleAddToCart(item)}
                >
                  <ShoppingCart color="#FFF" size={18} />
                  <Text style={styles.addToCartText}>Adicionar</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  loadingContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#000',
  },
  headerTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  cartBadgeContainer: { position: 'relative' },
  cartBadge: {
    position: 'absolute',
    top: -5, right: -5,
    backgroundColor: '#FF6B00',
    borderRadius: 10,
    width: 16, height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  cartBadgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 48,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, color: '#FFF', fontSize: 14 },
  clearBtn: { color: '#666', fontSize: 16, paddingHorizontal: 5 },

  emptySearch: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptySearchText: { color: '#666', fontSize: 14, textAlign: 'center' },

  listContent: { paddingHorizontal: 10, paddingBottom: 20 },

  productCard: {
    backgroundColor: '#121212',
    flex: 1,
    margin: 6,
    borderRadius: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1A1A1A',
    maxWidth: (width / 2) - 16,
  },
  tag: {
    position: 'absolute',
    top: 10, left: 10,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8,
    zIndex: 1,
  },
  tagText: { color: '#FFF', fontSize: 9, fontWeight: 'bold' },
  heartBtn: {
    position: 'absolute',
    top: 8, right: 8,
    zIndex: 2,
    padding: 4,
  },
  imagePlaceholder: {
    width: '100%', height: 120,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  productName: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  productFlavor: { color: '#AAA', fontSize: 11, marginBottom: 8 },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  productPrice: { color: '#FF6B00', fontSize: 16, fontWeight: 'bold' },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    padding: 4,
    borderRadius: 6,
  },
  ratingText: { color: '#FFB800', fontSize: 10, marginLeft: 3, fontWeight: 'bold' },
  addToCartBtn: {
    backgroundColor: '#000',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  addToCartText: { color: '#FFF', marginLeft: 5, fontSize: 12, fontWeight: '600' },
});
