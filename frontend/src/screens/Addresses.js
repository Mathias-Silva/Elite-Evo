import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MapPin, Plus, Trash2, Edit3 } from "lucide-react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { ScreenHeader } from "../components/ScreenHeader";
import { ScreenBody } from "../components/ScreenBody";
import { SPACING } from "../theme";
import { useTheme } from "../context/ThemeContext";

export default function AddressesScreen() {
  const navigation = useNavigation();
  const db = useSQLiteContext();
  const { user } = useAuth();
  const { colors } = useTheme();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAddresses = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const result = await db.getAllAsync(
        "SELECT * FROM addresses WHERE userId = ? ORDER BY id DESC",
        [user.id],
      );
      setAddresses(result);
    } catch (error) {
      console.error("Erro ao buscar endereços:", error);
      Alert.alert("Erro", "Não foi possível carregar os endereços.");
    } finally {
      setLoading(false);
    }
  }, [user, db]);

  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [fetchAddresses]),
  );

  const handleDelete = (id) => {
    Alert.alert("Excluir", "Tem certeza que deseja remover este endereço?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await db.runAsync("DELETE FROM addresses WHERE id = ?", [id]);
            fetchAddresses();
          } catch (error) {
            Alert.alert("Erro", "Falha ao excluir o endereço.");
          }
        },
      },
    ]);
  };

  const renderAddress = ({ item }) => (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.cardBackground, borderColor: colors.border },
      ]}
    >
      <View style={styles.cardInfo}>
        <View style={styles.headerRow}>
          <MapPin color="#FF6B00" size={18} />
          <Text style={[styles.street, { color: colors.textPrimary }]}>
            {item.street}, {item.number}
          </Text>
        </View>
        <Text style={[styles.details, { color: colors.textSecondary }]}>
          {item.neighborhood} - {item.city} / {item.state}
        </Text>
        <Text style={[styles.zip, { color: colors.textSecondary }]}>CEP: {item.zipCode}</Text>
        {item.complement ? (
          <Text style={[styles.complement, { color: colors.textSecondary }]}>Comp: {item.complement}</Text>
        ) : null}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.secondary }]}
          onPress={() => navigation.navigate("AddressForm", { id: item.id })}
        >
          <Edit3 color={colors.textPrimary} size={18} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: "#330000" }]}
          onPress={() => handleDelete(item.id)}
        >
          <Trash2 color="#FF3333" size={18} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title="Meus Endereços"
        onBack={() => navigation.goBack()}
      />

      {loading ? (
        <ScreenBody>
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#FF6B00" />
          </View>
        </ScreenBody>
      ) : addresses.length === 0 ? (
        <ScreenBody>
        <View style={styles.center}>
          <MapPin color={colors.border} size={80} style={{ marginBottom: 20 }} />
          <Text style={[styles.emptyText, { color: colors.textPrimary }]}>Nenhum endereço cadastrado</Text>
          <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
            Adicione um endereço para receber seus suplementos mais rápido.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate("AddressForm")}
          >
            <Plus color="#FFF" size={20} />
            <Text style={styles.btnText}>Cadastrar Novo Endereço</Text>
          </TouchableOpacity>
        </View>
        </ScreenBody>
      ) : (
        <ScreenBody noTopPadding style={{ paddingTop: 0 }}>
          <FlatList
            data={addresses}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            renderItem={renderAddress}
          />
          <View style={[styles.footer, { borderColor: colors.border, backgroundColor: colors.background }]}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate("AddressForm")}
            >
              <Plus color="#FFF" size={20} />
              <Text style={styles.btnText}>Adicionar Outro Endereço</Text>
            </TouchableOpacity>
          </View>
        </ScreenBody>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#000"
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
     marginLeft: -5
     },
  title: { 
    color: "#FFF", 
    fontSize: 20, 
    fontWeight: "bold" 
  },
  listContent: {
    paddingHorizontal: SPACING.screen,
    paddingTop: SPACING.section,
    paddingBottom: SPACING.md,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  emptyText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: SPACING.block,
  },
  emptySub: {
    color: "#666",
    textAlign: "center",
    marginBottom: SPACING.xl,
    fontSize: 14,
    lineHeight: 22,
    paddingHorizontal: SPACING.md,
  },
  primaryButton: {
    backgroundColor: "#FF6B00",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    width: "100%",
  },
  btnText: { 
    color: "#FFF", 
    fontWeight: "bold", 
    fontSize: 16,
     marginLeft: 10 
    },
  footer: { 
    padding: SPACING.screen,
    paddingTop: SPACING.md,
    borderTopWidth: 1, 
    borderColor: "#1A1A1A",
  },
  card: {
    backgroundColor: "#121212",
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.block,
    borderWidth: 1,
    borderColor: "#1A1A1A",
    flexDirection: "row",
  },
  cardInfo: { flex: 1 },
  headerRow: { 
    flexDirection: "row", 
    alignItems: "center",
     marginBottom: 8 
    },
  street: { 
    color: "#FFF", 
    fontSize: 16, 
    fontWeight: "bold", 
    marginLeft: 8 
  },
  details: { 
    color: "#AAA", 
    fontSize: 14, 
    marginBottom: 4 
  },
  zip: { 
    color: "#666", 
    fontSize: 12, 
    marginBottom: 2
   },
  complement: {
    color: "#666", 
    fontSize: 12 
  },
  actions: { 
    justifyContent: "space-between", 
    marginLeft: 10 
  },
  actionBtn: {
    padding: 10,
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },
});
