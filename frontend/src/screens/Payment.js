import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CreditCard,
  ShoppingBag,
  MapPin,
  ExternalLink,
} from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../context/AuthContext";
import { useSQLiteContext } from "expo-sqlite";
import { clearCart } from "../store/cartSlice";
import * as Linking from "expo-linking";
import { ScreenHeader } from "../components/ScreenHeader";
import { SPACING } from "../theme";
import { useTheme } from "../context/ThemeContext";

export default function PaymentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const db = useSQLiteContext();
  const { user } = useAuth();
  const { colors } = useTheme();
  const address = route.params?.address;
  const { items, totalAmount } = useSelector((state) => state.cart);
  const [loading, setLoading] = useState(false);

  const handleMercadoPagoCheckout = async () => {
    if (!address || items.length === 0) {
      Alert.alert("Erro", "Dados do carrinho ou endereço inválidos.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        payer: {
          name: user.name,
          email: user.email,
        },
        items: items.map((item) => ({
          id: String(item.id),
          title: item.name,
          description: item.flavor || "",
          picture_url: "",
          quantity: item.quantity,
          unit_price: item.price,
        })),
      };

      // Chama a API do Backend
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/payment/create-preference`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (data.init_point) {
        // --- ARMAZENA O PEDIDO NO BANCO LOCAL ---
        const orderNumber = "EVO-" + Math.floor(100000 + Math.random() * 900000);
        const createdAt = new Date().toISOString();
        const shippingAddressStr = address
          ? `${address.street}, ${address.number} - ${address.neighborhood}, ${address.city}/${address.state}`
          : "";

        // 1. Cria o Pedido
        const orderResult = await db.runAsync(
          "INSERT INTO orders (userId, orderNumber, totalAmount, shippingAddress, createdAt) VALUES (?, ?, ?, ?, ?)",
          [user?.id || 1, orderNumber, totalAmount, shippingAddressStr, createdAt]
        );
        const orderId = orderResult.lastInsertRowId;

        // 2. Cria os Itens do Pedido
        for (const item of items) {
          await db.runAsync(
            "INSERT INTO order_items (orderId, productId, productName, flavor, price, quantity, image) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [orderId, item.id, item.name, item.flavor || "", item.price, item.quantity, item.image || ""]
          );
        }

        // 3. Limpa o carrinho no Redux
        dispatch(clearCart());

        // Redireciona o usuário para o Checkout Transparente (Web/App Mercado Pago)
        await Linking.openURL(data.init_point);
      } else {
        throw new Error("Link de pagamento não retornado");
      }
    } catch (error) {
      console.error("Erro de Checkout:", error);
      Alert.alert(
        "Falha no Pagamento",
        "Não foi possível conectar ao Mercado Pago. Verifique se o servidor backend está rodando em " +
          process.env.EXPO_PUBLIC_API_URL,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Pagamento" onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        <View style={[styles.summaryCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Resumo do Pedido</Text>
          <View style={styles.row}>
            <ShoppingBag color={colors.textSecondary} size={18} />
            <Text style={[styles.rowText, { color: colors.textPrimary }]}>
              {items.length} pacote({items.length > 1 ? "s" : ""}) selecionados
            </Text>
          </View>
          <View style={[styles.totalRow, { borderColor: colors.border }]}>
            <Text style={[styles.totalLabel, { color: colors.textPrimary }]}>Total a Pagar:</Text>
            <Text style={styles.totalValue}>
              R$ {totalAmount.toFixed(2).replace(".", ",")}
            </Text>
          </View>
        </View>

        <View style={styles.addressCard}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Será entregue em:</Text>
          <View style={styles.addressInfo}>
            <MapPin color="#FF6B00" size={20} />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={[styles.addressStreet, { color: colors.textPrimary }]}>
                {address?.street}, {address?.number}
              </Text>
              <Text style={[styles.addressCity, { color: colors.textSecondary }]}>
                {address?.neighborhood} - {address?.city}/{address?.state}
              </Text>
            </View>
          </View>
        </View>

        <Text style={[styles.paymentMethodTitle, { color: colors.textPrimary }]}>
          Selecione o Meio de Pagamento
        </Text>

        {/* Única Opção Atual: Mercado Pago */}
        <TouchableOpacity
          style={[styles.mpButton, { backgroundColor: colors.cardBackground }]}
          onPress={handleMercadoPagoCheckout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <View style={styles.mpLeft}>
                <View style={styles.mpIconBg}>
                  <CreditCard color="#009EE3" size={24} />
                </View>
                <Text style={[styles.mpText, { color: colors.textPrimary }]}>Pagar com Mercado Pago</Text>
              </View>
              <ExternalLink color={colors.textSecondary} size={20} />
            </>
          )}
        </TouchableOpacity>
        <Text style={[styles.mpSubtitle, { color: colors.textSecondary }]}>
          Você será redirecionado para um ambiente seguro.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderColor: "#1A1A1A",
  },
  backBtn: {
    padding: 5,
    marginLeft: -5,
  },
  title: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    padding: SPACING.screen,
    paddingTop: SPACING.section,
    flex: 1,
  },
  summaryCard: {
    backgroundColor: "#121212",
    padding: SPACING.lg,
    borderRadius: 16,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: "#1A1A1A",
  },
  sectionTitle: {
    color: "#AAA",
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 15,
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  rowText: {
    color: "#FFF",
    fontSize: 15,
    marginLeft: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#222",
    paddingTop: 15,
  },
  totalLabel: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
  },
  totalValue: {
    color: "#FF6B00",
    fontSize: 24,
    fontWeight: "bold",
  },
  addressCard: {
    backgroundColor: "rgba(255, 107, 0, 0.05)",
    padding: SPACING.lg,
    borderRadius: 16,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 0, 0.2)",
  },
  addressInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  addressStreet: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 4,
  },
  addressCity: {
    color: "#AAA",
    fontSize: 13,
  },
  paymentMethodTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  mpButton: {
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#009EE3",
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  mpLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  mpIconBg: {
    backgroundColor: "rgba(0, 158, 227, 0.1)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  mpText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  mpSubtitle: {
    color: "#666",
    fontSize: 12,
    textAlign: "center",
    marginTop: 15,
  },
});
