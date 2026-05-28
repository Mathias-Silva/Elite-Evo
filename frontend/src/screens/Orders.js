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
import { SPACING } from "../theme";
import { Package, ChevronRight, ShoppingBag } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";

export default function OrdersScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const db = useSQLiteContext();
  const { user } = useAuth();
  const { colors } = useTheme();
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
      style={[
        styles.orderCard,
        { backgroundColor: colors.cardBackground, borderColor: colors.border },
      ]}
      activeOpacity={0.8}
      onPress={() => navigation.navigate("OrderDetails", { orderId: item.id })}
    >
      <View style={[styles.cardHeader, { borderBottomColor: colors.border }]}>
        <View style={styles.orderInfo}>
          <Package color={colors.primary} size={20} />
          <Text style={[styles.orderNumber, { color: colors.textPrimary }]}>Pedido #{item.orderNumber}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>APROVADO</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Data</Text>
          <Text style={[styles.value, { color: colors.textPrimary }]}>{formatDate(item.createdAt)}</Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Total</Text>
          <Text style={[styles.priceValue, { color: colors.primary }]}>{formatPrice(item.totalAmount)}</Text>
        </View>
        <ChevronRight color={colors.textSecondary} size={20} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Meus Pedidos" onBack={() => navigation.goBack()} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} size="large" />
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
          <View
            style={[
              styles.emptyIconBg,
              { backgroundColor: colors.cardBackground, borderColor: colors.border },
            ]}
          >
            <ShoppingBag color={colors.border} size={60} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Nenhum pedido feito</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Você ainda não realizou nenhuma compra em nossa loja.
          </Text>
          <TouchableOpacity
            style={[styles.shopBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
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
    backgroundColor: "#000",
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
    color: "#FFF",
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
    color: "#00C853",
    fontSize: 11,
    fontWeight: "bold",
  },
  cardBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    color: "#A0A0A0",
    fontSize: 12,
    marginBottom: 4,
  },
  value: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
  },
  priceContainer: {
    alignItems: "flex-end",
    flex: 1,
    marginRight: 12,
  },
  priceValue: {
    color: "#FF6B00",
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
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptySubtitle: {
    color: "#A0A0A0",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 30,
  },
  shopBtn: {
    backgroundColor: "#FF6B00",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    shadowColor: "#FF6B00",
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
