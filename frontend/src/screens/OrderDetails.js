import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";
import { ScreenHeader } from "../components/ScreenHeader";
import { SPACING } from "../theme";
import productImages from "../utils/productImages";
import { Calendar, MapPin, Package, CreditCard } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";

export default function OrderDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const db = useSQLiteContext();
  const { colors } = useTheme();
  const { orderId } = route.params || {};

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      loadOrderDetail();
    }
  }, [orderId]);

  async function loadOrderDetail() {
    setLoading(true);
    try {
      // 1. Carrega dados do pedido
      const orderData = await db.getFirstAsync(
        "SELECT * FROM orders WHERE id = ?",
        [orderId]
      );
      setOrder(orderData);

      if (orderData) {
        // 2. Carrega itens do pedido
        const itemsData = await db.getAllAsync(
          "SELECT * FROM order_items WHERE orderId = ?",
          [orderId]
        );
        setItems(itemsData || []);
      }
    } catch (error) {
      console.error("Erro ao carregar detalhes do pedido:", error);
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return isoString;
    }
  };

  const formatPrice = (price) => {
    return `R$ ${price.toFixed(2).replace(".", ",")}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenHeader title="Detalhes do Pedido" onBack={() => navigation.goBack()} />
        <View style={styles.centerContainer}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenHeader title="Detalhes do Pedido" onBack={() => navigation.goBack()} />
        <View style={styles.centerContainer}>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>Pedido não encontrado.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Detalhes do Pedido" onBack={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Card Resumo do Pedido */}
        <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={[styles.orderNumber, { color: colors.textPrimary }]}>Pedido #{order.orderNumber}</Text>
              <View style={styles.dateRow}>
                <Calendar color={colors.textSecondary} size={14} />
                <Text style={[styles.dateText, { color: colors.textSecondary }]}>{formatDate(order.createdAt)}</Text>
              </View>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>APROVADO</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Valor Total:</Text>
            <Text style={styles.priceValue}>{formatPrice(order.totalAmount)}</Text>
          </View>
        </View>

        {/* Card Endereço de Entrega */}
        <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <MapPin color={colors.primary} size={18} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Endereço de Entrega</Text>
          </View>
          <Text style={[styles.addressText, { color: colors.textSecondary }]}>
            {order.shippingAddress || "Nenhum endereço cadastrado para este pedido."}
          </Text>
        </View>

        {/* Card Pagamento */}
        <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <CreditCard color={colors.primary} size={18} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Método de Pagamento</Text>
          </View>
          <Text style={[styles.paymentText, { color: colors.textSecondary }]}>Mercado Pago (Cartão / Pix)</Text>
        </View>

        {/* Lista de Produtos */}
        <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Package color={colors.primary} size={18} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Produtos inclusos ({items.length})</Text>
          </View>

          {items.map((item, index) => (
            <View key={item.id.toString()}>
              {index > 0 && <View style={[styles.itemDivider, { backgroundColor: colors.border }]} />}
              <View style={styles.productItem}>
                <View style={[styles.imageContainer, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                  <Image
                    source={productImages[item.image] || productImages['whey_isolate']}
                    style={styles.productImg}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.productDetails}>
                  <Text style={[styles.productName, { color: colors.textPrimary }]}>{item.productName}</Text>
                  {item.flavor ? (
                    <Text style={[styles.productFlavor, { color: colors.textSecondary }]}>Sabor: {item.flavor}</Text>
                  ) : null}
                  <View style={styles.qtyPriceRow}>
                    <Text style={[styles.productQty, { color: colors.textSecondary }]}>Qtd: {item.quantity}</Text>
                    <Text style={[styles.productPrice, { color: colors.textPrimary }]}>
                      {formatPrice(item.price)}
                    </Text>
                  </View>
                  <Text style={[styles.subtotalText, { color: colors.primary }]}>
                    Subtotal: {formatPrice(item.price * item.quantity)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    paddingHorizontal: SPACING.screen,
    paddingTop: SPACING.md,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#252525",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  orderNumber: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateText: {
    color: "#A0A0A0",
    fontSize: 12,
  },
  statusBadge: {
    backgroundColor: "rgba(0, 200, 83, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    color: "#00C853",
    fontSize: 11,
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: "#252525",
    marginVertical: 14,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: {
    color: "#A0A0A0",
    fontSize: 14,
  },
  priceValue: {
    color: "#FF6B00",
    fontSize: 20,
    fontWeight: "bold",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  addressText: {
    color: "#A0A0A0",
    fontSize: 14,
    lineHeight: 20,
  },
  paymentText: {
    color: "#A0A0A0",
    fontSize: 14,
  },
  productItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  itemDivider: {
    height: 1,
    backgroundColor: "#252525",
    marginVertical: 12,
  },
  imageContainer: {
    width: 70,
    height: 70,
    backgroundColor: "#121212",
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: "#252525",
  },
  productImg: {
    width: "100%",
    height: "100%",
  },
  productDetails: {
    flex: 1,
    marginLeft: 15,
  },
  productName: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  productFlavor: {
    color: "#A0A0A0",
    fontSize: 12,
    marginTop: 2,
  },
  qtyPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  productQty: {
    color: "#A0A0A0",
    fontSize: 13,
  },
  productPrice: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "500",
  },
  subtotalText: {
    color: "#FF6B00",
    fontSize: 13,
    fontWeight: "bold",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  errorText: {
    color: "#A0A0A0",
    fontSize: 16,
  },
});
