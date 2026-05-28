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
import { useAuth } from "../context/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import { addItem } from "../store/cartSlice";
import { addFavorite, removeFavorite, setFavorites } from "../store/favoritesSlice";
import { useTheme } from "../context/ThemeContext";

import { CategoryCard } from "../components/CategoryCard";
import { Newsletter } from "../components/Newsletter";
import { FooterInfo } from "../components/FooterInfo";
import { styles } from "./HomeStyles";
import { useIsFocused } from '@react-navigation/native';
import productImages from "../utils/productImages";

productImages



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
  const { colors, isDarkMode } = useTheme();
  const addButtonTextColor = isDarkMode ? "#FFF" : "#000";
  const navigation = useNavigation();
  const { user, isLoggedIn } = useAuth();
  const dispatch = useDispatch();

  const homeTab =
    isLoggedIn && user?.email?.toLowerCase() === "admin@eliteevo.com"
      ? "Loja"
      : "Início";

  const goToCatalog = (category) => {
    navigation.navigate("Catálogo", {
      fromScreen: homeTab,
      ...(category ? { category } : {}),
    });
  };

  const goToProductDetail = (product) => {
    navigation.navigate("ProductDetail", {
      product,
      returnTo: homeTab,
    });
  };
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

  const fetchProducts = async () => {
    try {
      const result = await db.getAllAsync('SELECT * FROM products ORDER BY id DESC');
      setProducts(result);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    }
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

  const loadFavorites = async () => {
    if (!user?.id) {
      dispatch(setFavorites([]));
      return;
    }

    try {
      const rows = await db.getAllAsync(
        `SELECT p.*
         FROM favorites f
         INNER JOIN products p ON p.id = f.productId
         WHERE f.userId = ?
         ORDER BY f.id DESC`,
        [user.id],
      );
      dispatch(setFavorites(rows));
    } catch (error) {
      console.error("Erro ao carregar favoritos:", error);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchProducts();
      loadFavorites();
    }
  }, [isFocused, user?.id]);

  const handleAddToCart = (product) => {
    dispatch(addItem(product));
    if (Platform.OS === "android") {
      ToastAndroid.show(`${product.name} adicionado!`, ToastAndroid.SHORT);
    }
  };

  const handleToggleFavorite = async (product) => {
    if (favoriteIds.has(product.id)) {
      dispatch(removeFavorite(product.id));
      if (user?.id) {
        try {
          await db.runAsync(
            "DELETE FROM favorites WHERE userId = ? AND productId = ?",
            [user.id, product.id],
          );
        } catch (error) {
          console.error("Erro ao remover favorito:", error);
        }
      }
    } else {
      dispatch(addFavorite(product));
      if (user?.id) {
        try {
          await db.runAsync(
            "INSERT OR IGNORE INTO favorites (userId, productId) VALUES (?, ?)",
            [user.id, product.id],
          );
        } catch (error) {
          console.error("Erro ao salvar favorito:", error);
        }
      }
    }
  };



  const ListFooter = () => (
    <View>
      <Newsletter />
      <FooterInfo />
    </View>
  );

  if (loading) return (
    <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color="#FF6B00" />
    </View>
  );

  return (
   <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.logo, { color: colors.textPrimary }]}>
          ELITE<Text style={{ color: "#FF6B00" }}>EVO</Text>
        </Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={toggleSearch}>
            <Search color={isSearchVisible ? "#FF6B00" : colors.textPrimary} size={22} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.cartBadgeContainer} onPress={() => navigation.navigate("Cart")}>
            <ShoppingCart color={colors.textPrimary} size={22} style={{ marginLeft: 15 }} />
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
              backgroundColor: colors.surface,
              paddingHorizontal: 20,
              justifyContent: 'center'
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.cardBackground,
                borderRadius: 12,
                paddingHorizontal: 15,
                height: 45,
                borderWidth: 1,
                borderColor: colors.border
              }}>
                <Search color="#666" size={18} />
                <TextInput
                  placeholder="O que você está procurando?"
                  placeholderTextColor="#666"
                  style={{ flex: 1, color: colors.textPrimary, marginLeft: 10, fontSize: 14 }}
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
                onPress={() => goToCatalog()}
              >
                <Text style={styles.buttonText}>Ver Produtos</Text>
              </TouchableOpacity>
            </View>

            <View style={{ paddingHorizontal: 20, marginBottom: 32, marginTop: 8 }}>
              <Text style={[styles.sectionTitle, { marginBottom: 16, color: colors.textPrimary }]}>Categorias em Destaque</Text>
              <View style={styles.categoriesGrid}>
                <CategoryCard
                  title="Whey Protein"
                  image={productImages["whey_isolate"]}
                  onPress={() => goToCatalog("Whey Protein")}
                />
                <CategoryCard
                  title="Creatina"
                  image={productImages["creatina_pure"]}
                  onPress={() => goToCatalog("Creatina")}
                />
                <CategoryCard
                  title="Pré-Treino"
                  image={productImages["pre_treino_explosion"]}
                  onPress={() => goToCatalog("Pré-Treino")}
                />
                <CategoryCard
                  title="Aminoácidos"
                  image={productImages["aminoacidos_capsula"]}
                  onPress={() => goToCatalog("Aminoácidos")}
                />
                <CategoryCard
                  title="Vitaminas"
                  image={productImages["vitaminas"]}
                  fullWidth={true}
                  onPress={() => goToCatalog("Vitaminas")}
                />
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <View>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Os Mais Vendidos</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Os favoritos dos nossos atletas de elite</Text>
              </View>
              <TouchableOpacity onPress={() => goToCatalog()}>
                <Text style={styles.viewAll}>Ver todos {">"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        ListFooterComponent={<View><Newsletter /><FooterInfo /></View>}
        contentContainerStyle={styles.flatListContent}
        ListEmptyComponent={() => (
          <View style={{ padding: 50, alignItems: 'center' }}>
            <Text style={{ color: colors.textSecondary, fontSize: 16 }}>Nenhum produto encontrado.</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const isFav = favoriteIds.has(item.id);
          return (
            <TouchableOpacity
              style={styles.productCard}
              activeOpacity={0.85}
              onPress={() => goToProductDetail(item)}
            >
              {item.tag && item.tag !== "NULL" && (
                <View style={[styles.tag, { backgroundColor: item.tag === "ESGOTADO" ? "#333" : "#FF6B00" }]}>
                  <Text style={styles.tagText}>{item.tag}</Text>
                </View>
              )}
              <AnimatedHeart isFav={isFav} onPress={() => handleToggleFavorite(item)} style={styles.heartBtn} />
              <View style={[styles.imagePlaceholder, { backgroundColor: colors.secondary }]}>
                {item.image && productImages[item.image] ? (
                  <Image source={productImages[item.image]} style={{ width: "100%", height: "100%" }} resizeMode="contain" />
                ) : (
                  <ActivityIndicator color="#FF6B00" />
                )}
              </View>
              <Text style={[styles.productName, { color: colors.textPrimary }]} numberOfLines={1}>{item.name}</Text>
              <Text style={[styles.productFlavor, { color: colors.textSecondary }]}>{item.flavor}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.productPrice}>R$ {item.price.toFixed(2).replace(".", ",")}</Text>
                <View style={[styles.ratingBadge, { backgroundColor: colors.secondary }]}>
                  <Star color="#FFB800" fill="#FFB800" size={12} />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.addToCartBtn,
                  {
                    backgroundColor: isDarkMode ? colors.surface : colors.primary,
                    borderColor: isDarkMode ? colors.border : colors.primary,
                  },
                ]}
                onPress={() => handleAddToCart(item)}
              >
                <ShoppingCart color={addButtonTextColor} size={18} />
                <Text style={[styles.addToCartText, { color: addButtonTextColor }]}>Adicionar</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}
