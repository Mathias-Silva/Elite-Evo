import React, { useRef, useEffect, useState, useMemo } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  ToastAndroid,
  Platform,
  Animated,
  TouchableWithoutFeedback,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSQLiteContext } from "expo-sqlite";
import { ShoppingCart, Search, Star, Heart, X } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { addItem } from "../store/cartSlice";
import { addFavorite, removeFavorite } from "../store/favoritesSlice";

import { CategoryCard } from "../components/CategoryCard";
import { Newsletter } from "../components/Newsletter";
import { FooterInfo } from "../components/FooterInfo";
import { styles } from "./HomeStyles";
import { useIsFocused } from '@react-navigation/native';
const productImages = {
  aminoacidos_capsula: require("../assets/aminoacidos_capsula.png"),
  aminoacidos_glutamina: require("../assets/aminoacidos_glutamina.png"),
  aminoacidos_po: require("../assets/aminoacidos_po.png"),
  creatina_monohidratada: require("../assets/creatina_monohidratada.png"),
  creatina_pure: require("../assets/creatina_pure.png"),
  creatina: require("../assets/creatina.png"),
  hipercalorico_choco: require("../assets/hipercalorico_choco.png"),
  hipercalorico_morango: require("../assets/hipercalorico_morango.png"),
  multivitaminico80: require("../assets/multivitaminico80.png"),
  multivitaminico90: require("../assets/multivitaminico90.png"),
  pre_treino_explosion: require("../assets/pre_treino_explosion.png"),
  pre_treino: require("../assets/pre_treino.png"),
  whey_isolate_morango: require("../assets/whey_isolate_morango.png"),
  whey_isolate: require("../assets/whey_isolate.png"),
  whey_isolate1: require("../assets/whey_isolate1.png"),
  vitaminas: require("../assets/vitaminas.png"),
};

const AnimatedHeart = ({ isFav, onPress, style }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const handlePressIn = () => {
    Animated.spring(scaleValue, { toValue: 1.5, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleValue, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start();
    onPress();
  };

  return (
    <TouchableWithoutFeedback onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[style, { transform: [{ scale: scaleValue }] }]}>
        <Heart color="#FF6B00" fill={isFav ? "#FF6B00" : "transparent"} size={16} />
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

export default function Home() {
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      fetchProducts(); // Sua função que busca no SQLite
    }

  }, [isFocused]);
  const fetchProducts = async () => {
    try {
      const result = await db.getAllAsync('SELECT * FROM products ORDER BY id DESC');
      setProducts(result);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    }
  };
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const db = useSQLiteContext();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const searchAnim = useRef(new Animated.Value(0)).current;

  const cartItems = useSelector((state) => state.cart.items);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const favoriteItems = useSelector((state) => state.favorites.items);

  const favoriteIds = useMemo(
    () => new Set(favoriteItems.map((f) => f.id)),
    [favoriteItems]
  );

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    return products.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, products]);

  const toggleSearch = () => {
    const toValue = isSearchVisible ? 0 : 1;
    Animated.timing(searchAnim, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    if (isSearchVisible) setSearchQuery("");
    setIsSearchVisible(!isSearchVisible);
  };

  async function loadData() {
    try {
      const result = await db.getAllAsync("SELECT * FROM products");
      setProducts(result);
    } catch (error) {
      console.error("Erro ao carregar banco:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  const handleAddToCart = (product) => {
    dispatch(addItem(product));
    if (Platform.OS === "android") {
      ToastAndroid.show(`${product.name} adicionado!`, ToastAndroid.SHORT);
    }
  };

  const handleToggleFavorite = (product) => {
    if (favoriteIds.has(product.id)) {
      dispatch(removeFavorite(product.id));
    } else {
      dispatch(addFavorite(product));
    }
  };



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
   <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Text style={styles.logo}>
          ELITE<Text style={{ color: "#FF6B00" }}>EVO</Text>
        </Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={toggleSearch}>
            <Search color={isSearchVisible ? "#FF6B00" : "#FFF"} size={22} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.cartBadgeContainer} onPress={() => navigation.navigate("Cart")}>
            <ShoppingCart color="#FFF" size={22} style={{ marginLeft: 15 }} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredProducts}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        // SOLUÇÃO: Renderize o JSX diretamente aqui em vez de chamar uma função/componente interno
        ListHeaderComponent={
          <View>
            {/* Barra de Pesquisa Animada */}
            <Animated.View style={{
              overflow: 'hidden',
              height: searchAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 65] }),
              opacity: searchAnim,
              backgroundColor: '#121212',
              paddingHorizontal: 20,
              justifyContent: 'center'
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#1A1A1A',
                borderRadius: 12,
                paddingHorizontal: 15,
                height: 45,
                borderWidth: 1,
                borderColor: '#333'
              }}>
                <Search color="#666" size={18} />
                <TextInput
                  placeholder="O que você está procurando?"
                  placeholderTextColor="#666"
                  style={{ flex: 1, color: '#FFF', marginLeft: 10, fontSize: 14 }}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus={false} // Evita bugs de foco automático indesejado
                />
                {searchQuery !== "" && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <X color="#666" size={18} />
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>

            <View style={styles.heroSection}>
              <Text style={styles.heroTitle}>
                Performance de Elite para Quem
                <Text style={{ color: "#FF6B00" }}> Treina de Verdade</Text>
              </Text>
              <TouchableOpacity
                style={styles.buttonPrimary}
                onPress={() => navigation.navigate("Catálogo")}
              >
                <Text style={styles.buttonText}>Ver Produtos</Text>
              </TouchableOpacity>
            </View>

            <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
              <Text style={styles.sectionTitle}>Categorias em Destaque</Text>
              <View style={styles.categoriesGrid}>
                <CategoryCard title="Whey Protein" image={productImages["whey_isolate"]} />
                <CategoryCard title="Creatina" image={productImages["creatina_pure"]} />
                <CategoryCard title="Pré-Treino" image={productImages["pre_treino_explosion"]} />
                <CategoryCard title="Aminoácidos" image={productImages["aminoacidos_capsula"]} />
                <CategoryCard title="Vitaminas" image={productImages["vitaminas"]} fullWidth={true} />
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Os Mais Vendidos</Text>
                <Text style={{ color: "#666", fontSize: 12 }}>Os favoritos dos nossos atletas de elite</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate("Catálogo")}>
                <Text style={styles.viewAll}>Ver todos {">"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        ListFooterComponent={<View><Newsletter /><FooterInfo /></View>}
        contentContainerStyle={styles.flatListContent}
        ListEmptyComponent={() => (
          <View style={{ padding: 50, alignItems: 'center' }}>
            <Text style={{ color: '#666', fontSize: 16 }}>Nenhum produto encontrado.</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const isFav = favoriteIds.has(item.id);
          return (
            <View style={styles.productCard}>
              {item.tag && item.tag !== "NULL" && (
                <View style={[styles.tag, { backgroundColor: item.tag === "ESGOTADO" ? "#333" : "#FF6B00" }]}>
                  <Text style={styles.tagText}>{item.tag}</Text>
                </View>
              )}
              <AnimatedHeart isFav={isFav} onPress={() => handleToggleFavorite(item)} style={styles.heartBtn} />
              <View style={styles.imagePlaceholder}>
                {item.image && productImages[item.image] ? (
                  <Image source={productImages[item.image]} style={{ width: "100%", height: "100%" }} resizeMode="contain" />
                ) : (
                  <ActivityIndicator color="#FF6B00" />
                )}
              </View>
              <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.productFlavor}>{item.flavor}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.productPrice}>R$ {item.price.toFixed(2).replace(".", ",")}</Text>
                <View style={styles.ratingBadge}>
                  <Star color="#FFB800" fill="#FFB800" size={12} />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.addToCartBtn} onPress={() => handleAddToCart(item)}>
                <ShoppingCart color="#FFF" size={18} />
                <Text style={styles.addToCartText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}