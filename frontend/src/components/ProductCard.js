import React from 'react';
import { View, Text, Image, TouchableOpacity, ToastAndroid, Platform, Alert } from 'react-native';
import { ShoppingCart, Star } from 'lucide-react-native';
import { useDispatch } from 'react-redux';
import { addItem } from '../store/cartSlice';
import { styles } from '../../../src/screens/HomeStyles';



import productImages from "../utils/productImages";

productImages



export function ProductCard({ data }) {
  const dispatch = useDispatch();

  const handleAdd = () => {
    dispatch(addItem(data));


    if (Platform.OS === 'android') {
      ToastAndroid.show(`${data.name} adicionado ao carrinho!`, ToastAndroid.SHORT);
    } else {
      console.log("Adicionado!");
    }
  };

  return (
    <View style={styles.productCard}>

      {data.tag && (
        <View style={[styles.tag, { backgroundColor: data.tag === 'ESGOTADO' ? '#333' : '#FF6B00' }]}>
          <Text style={styles.tagText}>{data.tag}</Text>
        </View>
      )}


      <View style={styles.imagePlaceholder}>
        <Image
          source={productImages[data.image] || require('../../assets/whey_isolate.png')} // Fallback se a chave falhar
          style={{ width: '100%', height: '100%' }}
          resizeMode="contain"
        />
      </View>

      <View style={{ padding: 12 }}>
        <Text style={styles.productName} numberOfLines={1}>{data.name}</Text>
        <Text style={styles.productFlavor}>{data.flavor}</Text>

        <View style={styles.priceRow}>
          <View>
            {data.oldPrice && (
              <Text style={styles.oldPrice}>R$ {data.oldPrice.toFixed(2)}</Text>
            )}
            <Text style={styles.productPrice}>R$ {data.price.toFixed(2).replace('.', ',')}</Text>
          </View>

          <View style={styles.ratingBadge}>
            <Star color="#FFB800" fill="#FFB800" size={12} />
            <Text style={styles.ratingText}>{data.rating}</Text>
          </View>
        </View>


        <TouchableOpacity
          style={styles.addToCartBtn}
          onPress={handleAdd}
        >
          <ShoppingCart color="#FFF" size={18} />
          <Text style={styles.addToCartText}>Adicionar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}