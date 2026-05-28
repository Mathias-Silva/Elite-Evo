import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  Animated,
  Platform,     
  ToastAndroid, 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Trash2, ShoppingBag, Plus, Minus } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import { addItem, removeItem, updateQuantity } from "../store/cartSlice";
import { useIsFocused } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { SPACING } from "../theme";
import productImages from "../utils/productImages";

productImages;

const CartItem = ({ item }) => {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const isFocused = useIsFocused();
  const db = useSQLiteContext();
  const cartItems = useSelector((state) => state.cart.items);

  // Valores da animação
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isFocused && cartItems.length > 0) {
      syncCart();
    }
  }, [isFocused]);

  const syncCart = async () => {
    for (const item of cartItems) {
      const freshData = await db.getFirstAsync(
        "SELECT * FROM products WHERE id = ?",
        [item.id],
      );
      if (!freshData) {
        dispatch(removeItem(item.id));
      } else if (
        freshData.name !== item.name ||
        freshData.price !== item.price
      ) {
       
        const qtyAtual = item.quantity;
        dispatch(removeItem(item.id));
        dispatch(addItem({ ...freshData, quantity: qtyAtual }));
      }
    }
  };

  const handleConfirmRemove = () => {
    Alert.alert(
      "Remover Produto",
      `Tem certeza que deseja remover ${item.name} do carrinho?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: () => startExitAnimation(),
        },
      ],
    );
  };

  const startExitAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.3,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start(() => {
      dispatch(removeItem(item.id));
    });
  };

  return (
    <Animated.View
      style={[
        styles.cartItem,
        { backgroundColor: colors.cardBackground, borderColor: colors.border },
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <View style={[styles.imageContainer, { backgroundColor: colors.secondary }]}>
        <Image
          source={productImages[item.image]}
          style={styles.productImg}
          resizeMode="contain"
        />
      </View>

      <View style={styles.itemDetails}>
        <Text style={[styles.itemName, { color: colors.textPrimary }]}>{item.name}</Text>
        <Text style={[styles.itemFlavor, { color: colors.textSecondary }]}>{item.flavor}</Text>

        <View style={styles.priceQtyRow}>
          <Text style={styles.itemPrice}>
            R$ {item.price.toFixed(2).replace(".", ",")}
          </Text>

          <View style={[styles.qtyControls, { backgroundColor: colors.secondary }]}>
           <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => {
                dispatch(updateQuantity({ id: item.id, amount: -1 }));
                if (Platform.OS === "android") {
                  ToastAndroid.show("Quantidade atualizada", ToastAndroid.SHORT);
                }
              }}
            >
              <Minus color="#FF6B00" size={16} />
            </TouchableOpacity>

            <Text style={[styles.qtyText, { color: colors.textPrimary }]}>{item.quantity}</Text>

            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => {
                dispatch(updateQuantity({ id: item.id, amount: 1 }));
                if (Platform.OS === "android") {
                  ToastAndroid.show("Quantidade atualizada", ToastAndroid.SHORT);
                }
              }}
            >
              <Plus color="#FF6B00" size={16} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.removeBtn} onPress={handleConfirmRemove}>
        <Trash2 color="#666" size={20} />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function Cart() {
  const navigation = useNavigation();
  const { isLoggedIn } = useAuth();
  const { colors } = useTheme();
  const { items, totalAmount } = useSelector((state) => state.cart);

  const handleCheckout = () => {
    if (!isLoggedIn) {
      Alert.alert(
        "Acesso Negado",
        "Você precisa estar logado para finalizar a compra.",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Fazer Login", onPress: () => navigation.navigate("Perfil") },
        ],
      );
      return;
    }
   
    navigation.navigate("CheckoutAddress");
    const validateCart = async () => {
      for (const item of cartItems) {
        const exists = await db.getFirstAsync(
          "SELECT id FROM products WHERE id = ?",
          [item.id],
        );
        if (!exists) {
       
        }
      }
    };
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      <View style={styles.headerCart}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Meu Carrinho</Text>
      </View>

      {items.length > 0 ? (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => <CartItem item={item} />}
          />

          <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total do Pedido:</Text>
              <Text style={[styles.totalValue, { color: colors.textPrimary }]}>
                R$ {totalAmount.toFixed(2).replace(".", ",")}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={handleCheckout}
            >
              <Text style={styles.checkoutText}>Finalizar Compra</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <ShoppingBag color={colors.border} size={100} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Seu carrinho está vazio</Text>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: colors.cardBackground }]}
            onPress={() => navigation.navigate("Catálogo")}
          >
            <Text style={styles.backBtnText}>Voltar às compras</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  headerCart: {
    paddingHorizontal: SPACING.screen,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.block,
  },
  listContent: {
    paddingHorizontal: SPACING.screen,
    paddingBottom: SPACING.md,
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#121212",
    borderRadius: 20,
    padding: 15,
    marginBottom: SPACING.block,
    alignItems: "center",
  },
  imageContainer: {
    width: 80,
    height: 80,
    backgroundColor: "#1A1A1A",
    borderRadius: 15,
    padding: 5,
  },
  productImg: {
    width: "100%",
    height: "100%",
  },
  itemDetails: {
    flex: 1,
    marginLeft: 15,
  },
  itemName: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  itemFlavor: {
    color: "#666",
    fontSize: 12,
    marginVertical: 4,
  },
  priceQtyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  itemPrice: {
    color: "#FF6B00",
    fontSize: 16,
    fontWeight: "bold",
  },
  qtyControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 10,
    padding: 4,
  },
  qtyBtn: {
    padding: 5,
  },
  qtyText: {
    color: "#FFF",
    marginHorizontal: 10,
    fontWeight: "bold",
  },
  removeBtn: {
    padding: 10,
    marginLeft: 5,
  },
  footer: {
    paddingHorizontal: SPACING.screen,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: "#0A0A0A",
    borderTopWidth: 1,
    borderTopColor: "#1A1A1A",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.lg,
  },
  totalLabel: {
    color: "#AAA",
    fontSize: 16,
  },
  totalValue: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  checkoutBtn: {
    backgroundColor: "#FF6B00",
    padding: 20,
    borderRadius: 18,
    alignItems: "center",
    shadowColor: "#FF6B00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  checkoutText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#333",
    fontSize: 18,
    marginTop: 20,
    fontWeight: "bold",
  },
  backBtn: {
    marginTop: 20,
    backgroundColor: "#121212",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
  },
  backBtnText: {
    color: "#FF6B00",
    fontWeight: "bold",
  },
});
