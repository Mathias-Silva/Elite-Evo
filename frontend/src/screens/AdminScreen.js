import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Keyboard,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Trash2,
  Plus,
  Users,
  Package,
  LogOut,
  Edit3,
  XCircle,
  CheckCircle,
} from "lucide-react-native";
import { useAuth } from "../context/AuthContext";
import { useSQLiteContext } from "expo-sqlite";
import { useDispatch } from 'react-redux';
import { removeFavorite, updateFavorite } from '../store/favoritesSlice'; // ✅ updateFavorite importado
import { removeItem, updateItem } from '../store/cartSlice';              // ✅ updateItem importado


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

export default function AdminScreen() {
  const { logout } = useAuth();
  const db = useSQLiteContext();
  const dispatch = useDispatch();
  const [tab, setTab] = useState("products");
  const [items, setItems] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    flavor: "",
    image: "",
    tag: "",
  });

  const tagsDisponiveis = ["NOVIDADE", "PROMO", "ESGOTADO", "TOP 1", "LIMPAR"];

  useEffect(() => {
    fetchData();
  }, [tab]);

  const fetchData = async () => {
    try {
      if (tab === "products") {
        const result = await db.getAllAsync(
          "SELECT * FROM products ORDER BY id DESC",
        );
        setItems(result);
      } else {
        const result = await db.getAllAsync(
          "SELECT id, name, email FROM users",
        );
        setItems(result);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const handleSaveProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      Alert.alert("Erro", "Nome e Preço são obrigatórios");
      return;
    }

    try {
      const priceFormatted = parseFloat(
        String(newProduct.price).replace(",", ".")
      );
      const tagValue = newProduct.tag === "LIMPAR" ? null : newProduct.tag;

      if (isEditing) {
        // Salva no banco
        await db.runAsync(
          "UPDATE products SET name = ?, price = ?, flavor = ?, image = ?, tag = ? WHERE id = ?",
          [newProduct.name, priceFormatted, newProduct.flavor, newProduct.image, tagValue, editingId]
        );

        // ✅ Monta o objeto atualizado com o id
        const updatedProduct = {
          id: editingId,
          name: newProduct.name,
          price: priceFormatted,
          flavor: newProduct.flavor,
          image: newProduct.image,
          tag: tagValue,
        };

        // ✅ Atualiza no Redux sem remover — carrinho mantém quantidade, favoritos mantêm o item
        dispatch(updateItem(updatedProduct));
        dispatch(updateFavorite(updatedProduct));

        Alert.alert("Sucesso", "Produto atualizado!");
      } else {
        // Cadastro novo
        await db.runAsync(
          "INSERT INTO products (name, price, flavor, image, tag) VALUES (?, ?, ?, ?, ?)",
          [newProduct.name, priceFormatted, newProduct.flavor, newProduct.image, tagValue]
        );
        Alert.alert("Sucesso", "Produto cadastrado!");
      }

      resetForm();
      fetchData();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar o produto.");
    }
  };

  const startEdit = (item) => {
    setNewProduct({
      name: item.name,
      price: String(item.price),
      flavor: item.flavor || "",
      image: item.image || "",
      tag: item.tag || "",
    });
    setEditingId(item.id);
    setIsEditing(true);
  };

  const resetForm = () => {
    setNewProduct({ name: "", price: "", flavor: "", image: "", tag: "" });
    setIsEditing(false);
    setEditingId(null);
    Keyboard.dismiss();
  };

  const handleDelete = async (id) => {
    Alert.alert("Confirmar", "Deseja excluir este item?", [
      { text: "Cancelar" },
      {
        text: "Excluir",
        onPress: async () => {
          try {
            if (tab === 'products') {
              await db.runAsync('DELETE FROM products WHERE id = ?', [id]);
              // ✅ Na exclusão sim, remove do carrinho e favoritos
              dispatch(removeItem(id));
              dispatch(removeFavorite({ id }));
              Alert.alert("Sucesso", "Produto removido do banco e do cache.");
            } else {
              await db.runAsync('DELETE FROM users WHERE id = ?', [id]);
            }
            fetchData();
          } catch (error) {
            Alert.alert("Erro", "Não foi possível excluir.");
          }
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Painel Admin</Text>
          <Text style={styles.subtitle}>Elite Evo Gestão</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <LogOut color="#FF6B00" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, tab === "products" && styles.activeTab]}
          onPress={() => setTab("products")}
        >
          <Package color={tab === "products" ? "#FF6B00" : "#666"} size={20} />
          <Text
            style={[styles.tabText, tab === "products" && styles.activeTabText]}
          >
            Produtos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === "users" && styles.activeTab]}
          onPress={() => setTab("users")}
        >
          <Users color={tab === "users" ? "#FF6B00" : "#666"} size={20} />
          <Text
            style={[styles.tabText, tab === "users" && styles.activeTabText]}
          >
            Usuários
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {tab === "products" && (
          <View style={[styles.addArea, isEditing && styles.editAreaBorder]}>
            <View style={styles.rowBetween}>
              <Text style={styles.formTitle}>
                {isEditing ? "Editando Produto" : "Novo Produto"}
              </Text>
              {isEditing && (
                <TouchableOpacity onPress={resetForm}>
                  <XCircle color="#FF4444" size={20} />
                </TouchableOpacity>
              )}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Nome do Produto"
              placeholderTextColor="#666"
              value={newProduct.name}
              onChangeText={(t) => setNewProduct({ ...newProduct, name: t })}
            />

            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Preço"
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={newProduct.price}
                onChangeText={(t) => setNewProduct({ ...newProduct, price: t })}
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Sabor/Info"
                placeholderTextColor="#666"
                value={newProduct.flavor}
                onChangeText={(t) =>
                  setNewProduct({ ...newProduct, flavor: t })
                }
              />
            </View>

            <TextInput
              style={styles.input}
              placeholder="URL da Imagem"
              placeholderTextColor="#666"
              value={newProduct.image}
              onChangeText={(t) => setNewProduct({ ...newProduct, image: t })}
            />
            {newProduct.image ? (
              <View style={{ alignItems: "center", marginBottom: 10 }}>
                <Text style={styles.label}>Preview:</Text>
                <Image
                  source={
                    newProduct.image.startsWith("http")
                      ? { uri: newProduct.image }
                      : productImages[newProduct.image]
                  }
                  style={{ width: 60, height: 60, borderRadius: 10 }}
                />
              </View>
            ) : null}

            <Text style={styles.label}>Status:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tagScroll}
            >
              {tagsDisponiveis.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.tagOption,
                    newProduct.tag === tag && styles.tagSelected,
                  ]}
                  onPress={() => setNewProduct({ ...newProduct, tag: tag })}
                >
                  <Text
                    style={[
                      styles.tagOptionText,
                      newProduct.tag === tag && { color: "#FFF" },
                    ]}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.addButton,
                isEditing && { backgroundColor: "#28a745" },
              ]}
              onPress={handleSaveProduct}
            >
              {isEditing ? (
                <CheckCircle color="#FFF" size={20} />
              ) : (
                <Plus color="#FFF" size={20} />
              )}
              <Text style={styles.addButtonText}>
                {isEditing ? "SALVAR ALTERAÇÕES" : "CADASTRAR PRODUTO"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <FlatList
          data={items}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              {tab === "products" && (
                <Image
                  source={
                    item.image && item.image.startsWith("http")
                      ? { uri: item.image }
                      : productImages[item.image] ||
                        require("../assets/creatina.png")
                  }
                  style={styles.itemImage}
                />
              )}
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.itemName}>{item.name || item.email}</Text>
                <View style={styles.itemBadgeRow}>
                  {item.price && (
                    <Text style={styles.itemPrice}>
                      R$ {parseFloat(item.price).toFixed(2)}
                    </Text>
                  )}
                  {item.tag && (
                    <View style={styles.tagBadge}>
                      <Text style={styles.tagBadgeText}>{item.tag}</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.actions}>
                {tab === "products" && (
                  <TouchableOpacity
                    style={styles.actionIcon}
                    onPress={() => startEdit(item)}
                  >
                    <Edit3 color="#FF6B00" size={20} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.actionIcon}
                  onPress={() => handleDelete(item.id)}
                >
                  <Trash2 color="#FF4444" size={20} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    alignItems: "center",
  },
  title: { color: "#FFF", fontSize: 24, fontWeight: "bold" },
  subtitle: {
    color: "#FF6B00",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  logoutBtn: { padding: 8, backgroundColor: "#1A1A1A", borderRadius: 10 },
  tabBar: { flexDirection: "row", paddingHorizontal: 20, marginBottom: 15 },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#1A1A1A",
  },
  activeTab: { borderBottomColor: "#FF6B00" },
  tabText: { color: "#666", marginLeft: 8, fontWeight: "bold", fontSize: 13 },
  activeTabText: { color: "#FFF" },
  content: { flex: 1, paddingHorizontal: 20 },
  addArea: {
    marginBottom: 20,
    backgroundColor: "#1A1A1A",
    padding: 15,
    borderRadius: 15,
  },
  editAreaBorder: { borderWidth: 1, borderColor: "#28a745" },
  formTitle: {
    color: "#FFF",
    fontWeight: "bold",
    marginBottom: 10,
    fontSize: 16,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  row: { flexDirection: "row", gap: 10 },
  input: {
    backgroundColor: "#0A0A0A",
    color: "#FFF",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  label: { color: "#888", fontSize: 12, marginBottom: 8, marginLeft: 2 },
  tagScroll: { marginBottom: 15 },
  tagOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#0A0A0A",
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  tagSelected: { backgroundColor: "#FF6B00", borderColor: "#FF6B00" },
  tagOptionText: { color: "#888", fontSize: 10, fontWeight: "bold" },
  addButton: {
    backgroundColor: "#FF6B00",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    marginTop: 5,
  },
  addButtonText: { color: "#FFF", fontWeight: "bold", marginLeft: 8 },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#000",
  },
  itemName: { color: "#FFF", fontWeight: "bold", fontSize: 14 },
  itemBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  itemPrice: { color: "#888", fontSize: 12 },
  tagBadge: {
    backgroundColor: "#FF6B0022",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagBadgeText: { color: "#FF6B00", fontSize: 9, fontWeight: "bold" },
  actions: { flexDirection: "row", gap: 10 },
  actionIcon: { padding: 5 },
});