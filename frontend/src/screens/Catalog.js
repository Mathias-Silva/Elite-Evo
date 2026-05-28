import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Text,
  View,
  FlatList,
  ActivityIndicator,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  ToastAndroid,
  Alert,        
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSQLiteContext } from "expo-sqlite";
import { Search, ShoppingCart, Heart, Star } from "lucide-react-native";
import { ScreenHeader } from "../components/ScreenHeader";
import { useAuth } from "../context/AuthContext";
import { SPACING } from "../theme";
import { useDispatch, useSelector } from "react-redux";
import { addItem } from "../store/cartSlice";
import { addFavorite, removeFavorite } from "../store/favoritesSlice";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");

import productImages from "../utils/productImages";

productImages;

export default function Catalog() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user, isLoggedIn } = useAuth();
  const dispatch = useDispatch();
  const db = useSQLiteContext();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(route.params?.category ?? null);

  useFocusEffect(
    useCallback(() => {
      setCategoryFilter(route.params?.category ?? null);
    }, [route.params?.category])
  );

  const defaultHomeTab =
    isLoggedIn && user?.email?.toLowerCase() === "admin@eliteevo.com"
      ? "Loja"
      : "Início";

  const cameFromAnotherScreen = Boolean(route.params?.fromScreen);

  const clearCategoryFilter = () => {
    setCategoryFilter(null);
    navigation.setParams({ category: undefined, fromScreen: undefined });
  };

  const handleBack = () => {
    const target = route.params?.fromScreen || defaultHomeTab;
    clearCategoryFilter();
    navigation.navigate(target);
  };

  const cartItems = useSelector((state) => state.cart.items);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const favoriteItems = useSelector((state) => state.favorites.items);
  const favoriteIds = useMemo(
    () => new Set(favoriteItems.map((f) => f.id)),
    [favoriteItems],
  );

  useEffect(() => {
    async function loadProducts() {
      try {
        const result = await db.getAllAsync("SELECT * FROM products");
        setProducts(result);
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = products;

    if (categoryFilter) {
      result = result.filter((p) => p.category === categoryFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.category && p.category.toLowerCase().includes(q))
      );
    }

    return result;
  }, [products, searchQuery, categoryFilter]);

const showToast = (message) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      // Feedback rápido para usuários iOS
      Alert.alert("Sucesso", message, [{ text: "OK", style: "default" }], { cancelable: true });
    }
  };

  const handleAddToCart = (product) => {
    dispatch(addItem(product));
    showToast(`${product.name} adicionado ao carrinho!`);
  };

  const handleToggleFavorite = (product) => {
    if (favoriteIds.has(product.id)) {
      dispatch(removeFavorite(product.id));
      showToast(`${product.name} removido dos favoritos.`);
    } else {
      dispatch(addFavorite(product));
      showToast(`${product.name} adicionado aos favoritos!`);
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
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScreenHeader
        title={categoryFilter ? categoryFilter : "Catálogo"}
        subtitle={
          categoryFilter
            ? `${filteredProducts.length} produto(s) nesta categoria`
            : cameFromAnotherScreen
              ? "Todos os produtos"
              : undefined
        }
        onBack={cameFromAnotherScreen ? handleBack : undefined}
        titleAlign={cameFromAnotherScreen ? "center" : "left"}
        rightElement={
          <TouchableOpacity
            style={styles.cartBadgeContainer}
            onPress={() => navigation.navigate("Cart")}
          >
            <ShoppingCart color="#FFF" size={22} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        }
      />

      <View style={styles.pageBody}>
        {categoryFilter ? (
          <View style={styles.filterSection}>
            <View style={styles.categoryChipRow}>
              <View style={styles.categoryChip}>
                <Text style={styles.categoryChipText}>{categoryFilter}</Text>
              </View>
              <TouchableOpacity onPress={clearCategoryFilter} style={styles.clearCategoryBtn}>
                <Text style={styles.clearCategoryText}>Ver tudo ✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        <View
          style={[
            styles.searchSection,
            categoryFilter
              ? styles.searchSectionAfterFilter
              : styles.searchSectionFirst,
          ]}
        >
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
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Text style={styles.clearBtn}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {filteredProducts.length === 0 ? (
        <View style={styles.emptySearch}>
          <Text style={styles.emptySearchText}>
            {searchQuery.trim()
              ? `Nenhum produto encontrado para "${searchQuery}"`
              : categoryFilter
                ? `Nenhum produto na categoria "${categoryFilter}"`
                : "Nenhum produto encontrado"}
          </Text>
          {categoryFilter ? (
            <TouchableOpacity onPress={clearCategoryFilter} style={styles.emptyClearBtn}>
              <Text style={styles.emptyClearText}>Limpar filtro de categoria</Text>
            </TouchableOpacity>
          ) : null}
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
                {item.tag && item.tag !== "NULL" && (
                  <View
                    style={[
                      styles.tag,
                      {
                        backgroundColor:
                          item.tag === "ESGOTADO" ? "#333" : "#FF6B00",
                      },
                    ]}
                  >
                    <Text style={styles.tagText}>{item.tag}</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.heartBtn}
                  onPress={() => handleToggleFavorite(item)}
                >
                  <Heart
                    color="#FF6B00"
                    fill={isFav ? "#FF6B00" : "transparent"}
                    size={16}
                  />
                </TouchableOpacity>

                <View style={styles.imagePlaceholder}>
                  {productImages[item.image] ? (
                    <Image
                      source={productImages[item.image]}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="contain"
                    />
                  ) : (
                    <ActivityIndicator color="#FF6B00" />
                  )}
                </View>

                <Text style={styles.productName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.productFlavor}>{item.flavor}</Text>

                <View style={styles.priceRow}>
                  <Text style={styles.productPrice}>
                    R$ {item.price.toFixed(2).replace(".", ",")}
                  </Text>
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
  container: { flex: 1, backgroundColor: "#000" },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },

  pageBody: {
    backgroundColor: "#000",
  },
  filterSection: {
    paddingHorizontal: SPACING.screen,
    paddingTop: SPACING.section,
    paddingBottom: SPACING.block,
  },
  searchSection: {
    paddingHorizontal: SPACING.screen,
    paddingBottom: SPACING.lg,
  },
  searchSectionFirst: {
    paddingTop: SPACING.section,
  },
  searchSectionAfterFilter: {
    paddingTop: SPACING.block,
  },
  categoryChipRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryChip: {
    backgroundColor: "rgba(255, 107, 0, 0.15)",
    borderWidth: 1,
    borderColor: "#FF6B00",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryChipText: {
    color: "#FF6B00",
    fontSize: 13,
    fontWeight: "bold",
  },
  clearCategoryBtn: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  clearCategoryText: {
    color: "#888",
    fontSize: 13,
    fontWeight: "600",
  },
  emptyClearBtn: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
  },
  emptyClearText: {
    color: "#FF6B00",
    fontWeight: "bold",
  },
  cartBadgeContainer: {
     position: "relative" 
    },
  cartBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FF6B00",
    borderRadius: 10,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  cartBadgeText: { 
    color: "#FFF", 
    fontSize: 10, 
    fontWeight: "bold" 
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    height: 48,
  },
  searchIcon: { 
    marginRight: 10 

  },
  searchInput: { 
    flex: 1,
     color: "#FFF", 
    fontSize: 14 

  },
  clearBtn: { 
    color: "#666", 
    fontSize: 16, 
    paddingHorizontal: 5 

  },

  emptySearch: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptySearchText: { 
    color: "#666", 
    fontSize: 14, 
    textAlign: "center" 

  },

  listContent: {
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.lg,
  },

  productCard: {
    backgroundColor: "#121212",
    flex: 1,
    margin: SPACING.sm,
    borderRadius: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: "#1A1A1A",
    maxWidth: width / 2 - 16,
  },
  tag: {
    position: "absolute",
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    zIndex: 1,
  },
  tagText: { 
    color: "#FFF", 
    fontSize: 9, 
    fontWeight: "bold" 

  },
  heartBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 2,
    padding: 4,
  },
  imagePlaceholder: {
    width: "100%",
    height: 120,
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    overflow: "hidden",
  },
  productName: { 
    color: "#FFF", 
    fontSize: 14, 
    fontWeight: "bold" 

  },
  productFlavor: { 
    color: "#AAA", 
    fontSize: 11, 
    marginBottom: 8 

  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  productPrice: { 
    color: "#FF6B00", 
    fontSize: 16, 
    fontWeight: "bold" 

  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222",
    padding: 4,
    borderRadius: 6,
  },
  ratingText: {
    color: "#FFB800",
    fontSize: 10,
    marginLeft: 3,
    fontWeight: "bold",
  },
  addToCartBtn: {
    backgroundColor: "#000",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  addToCartText: {
    color: "#FFF",
    marginLeft: 5,
    fontSize: 12,
    fontWeight: "600",
  },
});
