import React, { useMemo } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  ToastAndroid,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Heart, ShoppingCart, Star } from "lucide-react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation, useRoute } from "@react-navigation/native";
import { addItem } from "../store/cartSlice";
import { addFavorite, removeFavorite } from "../store/favoritesSlice";
import { ScreenHeader } from "../components/ScreenHeader";
import { SPACING } from "../theme";
import { useTheme } from "../context/ThemeContext";
import productImages from "../utils/productImages";

export default function ProductDetail() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { colors, isDarkMode } = useTheme();
  const addButtonTextColor = isDarkMode ? "#FFF" : "#000";
  const product = route.params?.product;

  const favoriteItems = useSelector((state) => state.favorites.items);
  const isFavorite = useMemo(
    () => favoriteItems.some((item) => item.id === product?.id),
    [favoriteItems, product?.id],
  );

  const showToast = (message) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert("Sucesso", message);
    }
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate("MainTabs", {
      screen: route.params?.returnTo || "Catálogo",
    });
  };

  const handleAddToCart = () => {
    if (!product) return;
    dispatch(addItem(product));
    showToast(`${product.name} adicionado ao carrinho!`);
  };

  const handleToggleFavorite = () => {
    if (!product) return;

    if (isFavorite) {
      dispatch(removeFavorite(product.id));
      showToast(`${product.name} removido dos favoritos.`);
    } else {
      dispatch(addFavorite(product));
      showToast(`${product.name} adicionado aos favoritos!`);
    }
  };

  if (!product) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={["top", "left", "right"]}
      >
        <ScreenHeader title="Produto" onBack={handleBack} />
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>Produto não encontrado</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={handleBack}>
            <Text style={styles.emptyBtnText}>Voltar para produtos</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const imageSource =
    product.image && productImages[product.image]
      ? productImages[product.image]
      : productImages.whey_isolate;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top", "left", "right"]}
    >
      <ScreenHeader
        title="Detalhes"
        subtitle={product.category}
        onBack={handleBack}
        rightElement={
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={handleToggleFavorite}
            accessibilityRole="button"
            accessibilityLabel="Favoritar produto"
          >
            <Heart
              color="#FF6B00"
              fill={isFavorite ? "#FF6B00" : "transparent"}
              size={22}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View
          style={[
            styles.imagePanel,
            { backgroundColor: colors.cardBackground, borderColor: colors.border },
          ]}
        >
          {product.tag && product.tag !== "NULL" ? (
            <View
              style={[
                styles.tag,
                { backgroundColor: product.tag === "ESGOTADO" ? "#333" : "#FF6B00" },
              ]}
            >
              <Text style={styles.tagText}>{product.tag}</Text>
            </View>
          ) : null}
          <Image source={imageSource} style={styles.productImage} resizeMode="contain" />
        </View>

        <View style={styles.infoSection}>
          <View style={styles.titleRow}>
            <View style={styles.titleBlock}>
              <Text style={[styles.productName, { color: colors.textPrimary }]}>{product.name}</Text>
              <Text style={[styles.productFlavor, { color: colors.textSecondary }]}>{product.flavor}</Text>
            </View>

            <View style={[styles.ratingBadge, { backgroundColor: colors.secondary }]}>
              <Star color="#FFB800" fill="#FFB800" size={14} />
              <Text style={styles.ratingText}>{product.rating}</Text>
            </View>
          </View>

          <View style={styles.priceBox}>
            {product.oldPrice ? (
              <Text style={[styles.oldPrice, { color: colors.textSecondary }]}>
                R$ {product.oldPrice.toFixed(2).replace(".", ",")}
              </Text>
            ) : null}
            <Text style={styles.productPrice}>
              R$ {product.price.toFixed(2).replace(".", ",")}
            </Text>
          </View>

          <View
            style={[
              styles.detailBlock,
              { backgroundColor: colors.cardBackground, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.blockTitle, { color: colors.textPrimary }]}>Informações</Text>
            <View style={[styles.infoLine, { borderBottomColor: colors.border }]}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Categoria</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{product.category || "Produto"}</Text>
            </View>
            <View style={[styles.infoLine, { borderBottomColor: colors.border }]}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Sabor</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{product.flavor || "Tradicional"}</Text>
            </View>
            <View style={[styles.infoLine, { borderBottomColor: colors.border }]}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Avaliação</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{product.rating} de 5</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.secondaryBtn,
            { backgroundColor: colors.cardBackground, borderColor: colors.border },
          ]}
          onPress={handleBack}
        >
          <Text style={[styles.secondaryBtnText, { color: colors.textPrimary }]}>Voltar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleAddToCart}>
          <ShoppingCart color={addButtonTextColor} size={18} />
          <Text style={[styles.primaryBtnText, { color: addButtonTextColor }]}>Adicionar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  content: {
    paddingHorizontal: SPACING.screen,
    paddingTop: SPACING.section,
    paddingBottom: 110,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  imagePanel: {
    height: 300,
    backgroundColor: "#121212",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1A1A1A",
    padding: SPACING.lg,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  tag: {
    position: "absolute",
    top: 14,
    left: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    zIndex: 1,
  },
  tagText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  infoSection: {
    marginTop: SPACING.section,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  titleBlock: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  productName: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: 30,
  },
  productFlavor: {
    color: "#AAA",
    fontSize: 14,
    marginTop: SPACING.sm,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  ratingText: {
    color: "#FFB800",
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "bold",
  },
  priceBox: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.section,
  },
  oldPrice: {
    color: "#666",
    fontSize: 14,
    textDecorationLine: "line-through",
    marginBottom: 4,
  },
  productPrice: {
    color: "#FF6B00",
    fontSize: 28,
    fontWeight: "bold",
  },
  detailBlock: {
    backgroundColor: "#121212",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1A1A1A",
    padding: SPACING.lg,
  },
  blockTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: SPACING.md,
  },
  infoLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1A1A",
  },
  infoLabel: {
    color: "#666",
    fontSize: 13,
  },
  infoValue: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
    marginLeft: SPACING.md,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    gap: SPACING.md,
    paddingHorizontal: SPACING.screen,
    paddingTop: SPACING.md,
    paddingBottom: Platform.OS === "android" ? SPACING.lg : 34,
    backgroundColor: "#000",
    borderTopWidth: 1,
    borderTopColor: "#1A1A1A",
  },
  primaryBtn: {
    flex: 1,
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: "#FF6B00",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  primaryBtnText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 6,
  },
  secondaryBtn: {
    minHeight: 50,
    paddingHorizontal: SPACING.lg,
    borderRadius: 14,
    backgroundColor: "#121212",
    borderWidth: 1,
    borderColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.screen,
  },
  emptyTitle: {
    color: "#666",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: SPACING.lg,
  },
  emptyBtn: {
    minHeight: 50,
    paddingHorizontal: SPACING.lg,
    borderRadius: 14,
    backgroundColor: "#FF6B00",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyBtnText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
});
