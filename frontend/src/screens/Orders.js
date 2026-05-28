import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";
import { useAuth } from "../context/AuthContext";
import { ScreenHeader } from "../components/ScreenHeader";
import { COLORS, SPACING } from "../theme";
import { Package, ChevronRight, ShoppingBag } from "lucide-react-native";

export default function OrdersScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const db = useSQLiteContext();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id && isFocused) {
      loadOrders();
    }
  }, [user, isFocused]);

  async function loadOrders() {
    setLoading(true);
    try {
      const result = await db.getAllAsync(
        "SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC",
        [user?.id]
      );
      setOrders(result || []);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
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
      });
    } catch (e) {
      return isoString;
    }
  };

  const formatPrice = (price) => {
    return `R$ ${price.toFixed(2).replace(".", ",")}`;
  };

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      activeOpacity={0.8}
      onPress={() => navigation.navigate("OrderDetails", { orderId: item.id })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.orderInfo}>
          <Package color={COLORS.primary} size={20} />
          <Text style={styles.orderNumber}>Pedido #{item.orderNumber}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>APROVADO</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View>
          <Text style={styles.label}>Data</Text>
          <Text style={styles.value}>{formatDate(item.createdAt)}</Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.label}>Total</Text>
          <Text style={styles.priceValue}>{formatPrice(item.totalAmount)}</Text>
        </View>
        <ChevronRight color="#666" size={20} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Meus Pedidos" onBack={() => navigation.goBack()} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      ) : orders.length > 0 ? (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={renderOrderItem}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBg}>
            <ShoppingBag color="#333" size={60} />
          </View>
          <Text style={styles.emptyTitle}>Nenhum pedido feito</Text>
          <Text style={styles.emptySubtitle}>
            Você ainda não realizou nenhuma compra em nossa loja.
          </Text>
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => navigation.navigate("Início")}
          >
            <Text style={styles.shopBtnText}>COMEÇAR A COMPRAR</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: SPACING.screen,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  orderCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#252525",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#252525",
    paddingBottom: 12,
    marginBottom: 12,
  },
  orderInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  orderNumber: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: "bold",
  },
  statusBadge: {
    backgroundColor: "rgba(0, 200, 83, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: COLORS.success,
    fontSize: 11,
    fontWeight: "bold",
  },
  cardBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  value: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "500",
  },
  priceContainer: {
    alignItems: "flex-end",
    flex: 1,
    marginRight: 12,
  },
  priceValue: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#1A1A1A",
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 30,
  },
  shopBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  shopBtnText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
    letterSpacing: 1,
  },
});
