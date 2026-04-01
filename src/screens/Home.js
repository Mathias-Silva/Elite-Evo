import React, { useEffect, useState } from 'react';
import { 
  Text, View, TouchableOpacity, FlatList, ActivityIndicator, Image, ToastAndroid, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';
import { ShoppingCart, Search, Star } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { addItem } from '../store/cartSlice';


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

import { CategoryCard } from '../components/CategoryCard';
import { Newsletter } from '../components/Newsletter';
import { FooterInfo } from '../components/FooterInfo';
import { styles } from './HomeStyles';

export default function Home() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const db = useSQLiteContext();

  const cartItems = useSelector(state => state.cart.items);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  async function loadData() {
    try {
      const result = await db.getAllAsync('SELECT * FROM products');
      setProducts(result);
    } catch (error) {
      console.error("Erro ao carregar banco:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleAddToCart = (product) => {
    dispatch(addItem(product));
    if (Platform.OS === 'android') {
      ToastAndroid.show(`${product.name} adicionado!`, ToastAndroid.SHORT);
    }
  };

  const ListHeader = () => (
    <View>
    <View style={styles.heroSection}>
      <Text style={styles.heroTitle}>
        Performance de Elite para Quem 
        <Text style={{color: '#FF6B00'}}> Treina de Verdade</Text>
      </Text>
      <TouchableOpacity style={styles.buttonPrimary}>
        <Text style={styles.buttonText}>Ver Produtos</Text>
      </TouchableOpacity>
    </View>

    <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
      <Text style={styles.sectionTitle}>Categorias em Destaque</Text>
      
      <View style={styles.categoriesGrid}>
        <CategoryCard 
          title="Whey Protein"           
          image={productImages['whey_isolate']} 
        />
        <CategoryCard 
          title="Creatina"           
          image={productImages['creatina_pure']} 
        />
        <CategoryCard 
          title="Pré-Treino"           
          image={productImages['pre_treino_explosion']} 
        />
        <CategoryCard 
          title="Aminoácidos"           
          image={productImages['aminoacidos_capsula']} 
        />
        <CategoryCard 
          title="Vitaminas" 
          image={productImages['vitaminas']} 
          fullWidth={true}
        />
      </View>
    </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Os Mais Vendidos</Text>
          <Text style={{color: '#666', fontSize: 12}}>Os favoritos dos nossos atletas de elite</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Catálogo')}>
          <Text style={styles.viewAll}>Ver todos {'>'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const ListFooter = () => (
    <View>
      <Newsletter />
      <FooterInfo />
    </View>
  );

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#FF6B00" />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.logo}>ELITE<Text style={{color:'#FF6B00'}}>EVO</Text></Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity>
            <Search color="#FFF" size={22} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cartBadgeContainer}
            onPress={() => navigation.navigate('Cart')}
          >
            <ShoppingCart color="#FFF" size={22} style={{marginLeft: 15}} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            {item.tag && (
              <View style={[styles.tag, {backgroundColor: item.tag === 'ESGOTADO' ? '#333' : '#FF6B00'}]}>
                <Text style={styles.tagText}>{item.tag}</Text>
              </View>
            )}
            
            
            <View style={styles.imagePlaceholder}>
              {item.image && productImages[item.image] ? (
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
              <Text style={styles.productPrice}>R$ {item.price.toFixed(2).replace('.',',')}</Text>
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
        )}
        contentContainerStyle={styles.flatListContent}
      />
    </SafeAreaView>
  );
}