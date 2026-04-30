import React, { useRef, useEffect } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert, Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { removeFavorite, addFavorite } from '../store/favoritesSlice';
import { addItem } from '../store/cartSlice';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';

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

// Componente de Item Otimizado
const FavoriteItem = ({ item, onAddToCart }) => {
  const dispatch = useDispatch();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleConfirmRemove = () => {
    Alert.alert(
      "Remover Favorito",
      `Deseja realmente remover ${item.name}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Remover", style: "destructive", onPress: () => startExitAnimation() }
      ]
    );
  };

  const startExitAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.7, duration: 300, useNativeDriver: true })
    ]).start(() => {
      // IMPORTANTE: Envia apenas o ID conforme o seu slice espera
      dispatch(removeFavorite(item.id));
    });
  };

  return (
    <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.imageContainer}>
        {item.image && productImages[item.image] && (
          <Image source={productImages[item.image]} style={styles.productImg} resizeMode="contain" />
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.productFlavor}>{item.flavor}</Text>
        <Text style={styles.productPrice}>R$ {item.price.toFixed(2).replace('.', ',')}</Text>

        <TouchableOpacity style={styles.addToCartBtn} onPress={() => onAddToCart(item)}>
          <ShoppingCart color="#FFF" size={14} />
          <Text style={styles.addToCartText}>Adicionar</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.removeBtn} onPress={handleConfirmRemove}>
        <Trash2 color="#666" size={20} />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function Favorites() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const db = useSQLiteContext();
  const items = useSelector(state => state.favorites.items);

  // A SINCRONIZAÇÃO DEVE FICAR NA TELA PRINCIPAL (PAI)
  useEffect(() => {
    if (isFocused && items.length > 0) {
      syncFavorites();
    }
  }, [isFocused]);

  const syncFavorites = async () => {
    try {
      for (const fav of items) {
        const freshData = await db.getFirstAsync('SELECT * FROM products WHERE id = ?', [fav.id]);
        
        if (!freshData) {
          // Se sumiu do banco, remove dos favoritos
          dispatch(removeFavorite(fav.id));
        } else if (
          freshData.name !== fav.name || 
          freshData.price !== fav.price || 
          freshData.flavor !== fav.flavor
        ) {
          // Se mudou algo, atualiza o item no Redux
          dispatch(removeFavorite(fav.id));
          dispatch(addFavorite(freshData));
        }
      }
    } catch (error) {
      console.error("Erro ao sincronizar favoritos:", error);
    }
  };

  const handleAddToCart = (product) => {
    dispatch(addItem(product));
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}><Text style={styles.headerTitle}>Favoritos</Text></View>
        <View style={styles.emptyContainer}>
          <Heart color="#1A1A1A" size={90} />
          <Text style={styles.emptyTitle}>Nenhum favorito ainda</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('Catálogo')}>
            <Text style={styles.emptyBtnText}>Ver Produtos</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favoritos</Text>
        <Text style={styles.headerCount}>{items.length} {items.length === 1 ? 'item' : 'itens'}</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <FavoriteItem item={item} onAddToCart={handleAddToCart} />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  headerTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  headerCount: { color: '#666', fontSize: 14 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: { color: '#333', fontSize: 20, fontWeight: 'bold', marginTop: 20 },
  emptyBtn: { marginTop: 25, backgroundColor: '#FF6B00', paddingVertical: 14, paddingHorizontal: 35, borderRadius: 30 },
  emptyBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  card: { flexDirection: 'row', backgroundColor: '#121212', borderRadius: 20, padding: 15, marginBottom: 15, alignItems: 'center', borderWidth: 1, borderColor: '#1A1A1A' },
  imageContainer: { width: 85, height: 85, backgroundColor: '#1A1A1A', borderRadius: 15, padding: 5, overflow: 'hidden' },
  productImg: { width: '100%', height: '100%' },
  info: { flex: 1, marginLeft: 15 },
  productName: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
  productFlavor: { color: '#666', fontSize: 12, marginVertical: 3 },
  productPrice: { color: '#FF6B00', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  addToCartBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#000', borderWidth: 1, borderColor: '#333', borderRadius: 10, paddingVertical: 7, paddingHorizontal: 12, alignSelf: 'flex-start' },
  addToCartText: { color: '#FFF', fontSize: 11, fontWeight: '600', marginLeft: 5 },
  removeBtn: { padding: 10, marginLeft: 5 },
});