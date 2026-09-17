import React, { useState, useEffect } from "react";
import {View,Text,StyleSheet,FlatList,TouchableOpacity,TextInput,Alert,ScrollView,Keyboard,Image,Platform,Modal,} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {Trash2,Plus,Users,User,Package,LogOut,Edit3,XCircle,CheckCircle,} from "lucide-react-native";
import { useAuth } from "../context/AuthContext";
import { useSQLiteContext } from "expo-sqlite";
import { useDispatch } from "react-redux";
import { removeFavorite, updateFavorite } from "../store/favoritesSlice";
import { removeItem, updateItem } from "../store/cartSlice";
import { useTheme } from "../context/ThemeContext";
import productImages from "../utils/productImages";

export default function AdminScreen() {
  const { setIsLoggedIn, setUser, user } = useAuth();
  const db = useSQLiteContext();
  const dispatch = useDispatch();
  const { colors, isDarkMode } = useTheme();
  const buttonTextColor = isDarkMode ? "#FFF" : "#000";
  const [tab, setTab] = useState("products");
  const [items, setItems] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Modais
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [userDetailModalVisible, setUserDetailModalVisible] = useState(false);

  // Dados Selecionados para Detalhes
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    flavor: "",
    image: "",
    tag: "",
  });

  const tagsDisponiveis = ["NOVIDADE", "PROMO", "ESGOTADO", "TOP 1", "LIMPAR"];

  const mostrarAlerta = (titulo, mensagem, acoes = null) => {
    if (Platform.OS === "web") {
      if (acoes) {
        const confirmar = window.confirm(`${titulo}\n\n${mensagem}`);
        if (confirmar) acoes[1].onPress();
      } else {
        window.alert(`${titulo}: ${mensagem}`);
      }
    } else {
      if (acoes) {
        Alert.alert(titulo, mensagem, acoes);
      } else {
        Alert.alert(titulo, mensagem);
      }
    }
  };

  const handleLogout = () => {
    mostrarAlerta("Sair da Conta", "Deseja realmente sair do Elite Evo?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: () => {
          setUser(null);
          setIsLoggedIn(false);
        },
      },
    ]);
  };

  useEffect(() => {
    fetchData();
  }, [tab]);
// Função para carregar produtos ou usuários do banco de dados
  const fetchData = async () => {
    try {
      if (tab === "products") {
        const result = await db.getAllAsync(
          "SELECT * FROM products ORDER BY id DESC",
        );
        setItems(result);
      } else {
        const result = await db.getAllAsync(
          "SELECT id, name, email FROM users ORDER BY id DESC",
        );
        setItems(result);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };
  // Função para salvar um novo produto ou atualizar um existente
  const handleSaveProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      mostrarAlerta("Erro", "Nome e Preço são obrigatórios");
      return;
    }

    try {
      const priceFormatted = parseFloat(
        String(newProduct.price).replace(",", "."),
      );
      const tagValue = newProduct.tag === "LIMPAR" ? null : newProduct.tag;

      if (isEditing) {
        await db.runAsync(
          "UPDATE products SET name = ?, price = ?, flavor = ?, image = ?, tag = ? WHERE id = ?",
          [
            newProduct.name,
            priceFormatted,
            newProduct.flavor,
            newProduct.image,
            tagValue,
            editingId,
          ],
        );
        // Atualiza o produto no Redux para refletir as mudanças imediatamente
        const updatedProduct = {
          id: editingId,
          name: newProduct.name,
          price: priceFormatted,
          flavor: newProduct.flavor,
          image: newProduct.image,
          tag: tagValue,
        };

        dispatch(updateItem(updatedProduct));
        dispatch(updateFavorite(updatedProduct));

        mostrarAlerta("Sucesso", "Produto updated!");
      } else {
        await db.runAsync(
          "INSERT INTO products (name, price, flavor, image, tag) VALUES (?, ?, ?, ?, ?)",
          [
            newProduct.name,
            priceFormatted,
            newProduct.flavor,
            newProduct.image,
            tagValue,
          ],
        );
        mostrarAlerta("Sucesso", "Produto cadastrado!");
      }

      resetForm();
      fetchData();
    } catch (error) {
      mostrarAlerta("Erro", "Não foi possível salvar o produto.");
    }
  };
  // Função para iniciar edição de um produto
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
    setDetailModalVisible(false);
    setModalVisible(true);
  };

  // Gerenciador de cliques na lista
  const handleItemPress = (item) => {
    if (tab === "products") {
      setSelectedProduct(item);
      setDetailModalVisible(true);
    } else {
      setSelectedUser(item);
      setUserDetailModalVisible(true);
    }
  };
  // Função para resetar o formulário de criação/edição
  const resetForm = () => {
    setNewProduct({ name: "", price: "", flavor: "", image: "", tag: "" });
    setIsEditing(false);
    setEditingId(null);
    setModalVisible(false);
    Keyboard.dismiss();
  };
  // Gerenciador de exclusão para produtos e usuários
  const handleDelete = async (targetId, targetEmail) => {
    if (
      tab === "users" &&
      (targetId === user?.id ||
        targetEmail?.toLowerCase() === "admin@eliteevo.com")
    ) {
      mostrarAlerta(
        "Ação Negada",
        "Você não pode excluir a sua própria conta de Administrador.",
      );
      return;
    }

    mostrarAlerta("Confirmar", "Deseja excluir este item?", [
      { text: "Cancelar" },
      {
        text: "Excluir",
        onPress: async () => {
          try {
            if (tab === "products") {
              await db.runAsync("DELETE FROM products WHERE id = ?", [
                targetId,
              ]);
              dispatch(removeItem(targetId));
              dispatch(removeFavorite({ id: targetId }));
              mostrarAlerta("Sucesso", "Produto removido.");
            } else {
              await db.runAsync("DELETE FROM users WHERE id = ?", [targetId]);
              mostrarAlerta("Sucesso", "Usuário removido.");
            }
            setDetailModalVisible(false);
            setUserDetailModalVisible(false);
            fetchData();
          } catch (error) {
            mostrarAlerta("Erro", "Não foi possível excluir.");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Painel Admin</Text>
          <Text style={styles.subtitle}>Elite Evo Gestão</Text>
        </View>
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: colors.cardBackground }]}
          onPress={handleLogout}
        >
          <LogOut color="#FF6B00" size={24} />
        </TouchableOpacity>
      </View>

      {/* TABS */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[
            styles.tab,
            { borderBottomColor: tab === "products" ? colors.primary : colors.border },
          ]}
          onPress={() => setTab("products")}
        >
          <Package
            color={tab === "products" ? colors.primary : colors.textSecondary}
            size={20}
          />
          <Text
            style={[
              styles.tabText,
              { color: tab === "products" ? colors.textPrimary : colors.textSecondary },
            ]}
          >
            Produtos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            { borderBottomColor: tab === "users" ? colors.primary : colors.border },
          ]}
          onPress={() => setTab("users")}
        >
          <Users
            color={tab === "users" ? colors.primary : colors.textSecondary}
            size={20}
          />
          <Text
            style={[
              styles.tabText,
              { color: tab === "users" ? colors.textPrimary : colors.textSecondary },
            ]}
          >
            Usuários
          </Text>
        </TouchableOpacity>
      </View>

      {/* BOTÃO NOVO PRODUTO */}
      {tab === "products" && (
        <TouchableOpacity
          style={styles.openModalBtn}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Plus color={buttonTextColor} size={20} />
          <Text style={[styles.openModalBtnText, { color: buttonTextColor }]}>Novo Produto</Text>
        </TouchableOpacity>
      )}

      {/* LISTAGEM PRINCIPAL */}
      <View style={styles.content}>
        <FlatList
          data={items}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.listItem,
                { backgroundColor: colors.cardBackground, borderColor: colors.border },
              ]}
              onPress={() => handleItemPress(item)}
              activeOpacity={0.7}
            >
              {tab === "products" ? (
                <Image
                  source={
                    item.image && item.image.startsWith("http")
                      ? { uri: item.image }
                      : productImages[item.image] ||
                        require("../assets/creatina.png")
                  }
                  style={[styles.itemImage, { backgroundColor: colors.secondary }]}
                />
              ) : (
                <View
                  style={[
                    styles.userIconContainer,
                    { backgroundColor: colors.secondary, borderColor: colors.border },
                  ]}
                >
                  <User color="#FF6B00" size={24} />
                </View>
              )}

              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.itemName, { color: colors.textPrimary }]}>{item.name || item.email}</Text>
                <View style={styles.itemBadgeRow}>
                  {tab === "products" && item.price && (
                    <Text style={[styles.itemPrice, { color: colors.textSecondary }]}>
                      R$ {parseFloat(item.price).toFixed(2)}
                    </Text>
                  )}
                  {tab === "products" && item.tag && (
                    <View style={styles.tagBadge}>
                      <Text style={styles.tagBadgeText}>{item.tag}</Text>
                    </View>
                  )}
                  {tab === "users" && (
                    <Text style={[styles.itemUserEmail, { color: colors.textSecondary }]}>{item.email}</Text>
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
                  onPress={() => handleDelete(item.id, item.email)}
                >
                  <Trash2 color="#FF4444" size={20} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* 1. MODAL DE CRIAÇÃO / EDIÇÃO DE PRODUTO */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={resetForm}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.addArea,
              { backgroundColor: colors.cardBackground, borderColor: colors.border },
              isEditing && styles.editAreaBorder,
            ]}
          >
            <View style={styles.rowBetween}>
              <Text style={[styles.formTitle, { color: colors.textPrimary }]}>
                {isEditing ? "Editando Produto" : "Novo Produto"}
              </Text>
              <TouchableOpacity onPress={resetForm}>
                <XCircle color="#FF4444" size={24} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary },
              ]}
              placeholder="Nome do Produto"
              placeholderTextColor="#666"
              value={newProduct.name}
              onChangeText={(t) => setNewProduct({ ...newProduct, name: t })}
            />

            <View style={styles.row}>
              <TextInput
                style={[
                  styles.input,
                  {
                    flex: 1,
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
                placeholder="Preço"
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={newProduct.price}
                onChangeText={(t) => setNewProduct({ ...newProduct, price: t })}
              />
              <TextInput
                style={[
                  styles.input,
                  {
                    flex: 1,
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
                placeholder="Sabor/Info"
                placeholderTextColor="#666"
                value={newProduct.flavor}
                onChangeText={(t) =>
                  setNewProduct({ ...newProduct, flavor: t })
                }
              />
            </View>

            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary },
              ]}
              placeholder="URL da Imagem"
              placeholderTextColor="#666"
              value={newProduct.image}
              onChangeText={(t) => setNewProduct({ ...newProduct, image: t })}
            />

            {newProduct.image ? (
              <View style={{ alignItems: "center", marginBottom: 10 }}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Preview:</Text>
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

            <Text style={[styles.label, { color: colors.textSecondary }]}>Status:</Text>
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
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    newProduct.tag === tag && styles.tagSelected,
                  ]}
                  onPress={() => setNewProduct({ ...newProduct, tag: tag })}
                >
                  <Text
                    style={[
                      styles.tagOptionText,
                      { color: colors.textSecondary },
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
        </View>
      </Modal>

      {/* 2. MODAL DE DETALHES DO PRODUTO */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={detailModalVisible}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          {selectedProduct && (
            <View
              style={[
                styles.detailContainer,
                { backgroundColor: colors.cardBackground, borderColor: colors.border },
              ]}
            >
              <View style={styles.rowBetween}>
                <Text style={[styles.detailTitle, { color: colors.textPrimary }]}>Detalhes do Produto</Text>
                <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                  <XCircle color="#666" size={24} />
                </TouchableOpacity>
              </View>

              <View style={[styles.detailInfoBox, { backgroundColor: colors.surface }]}>
                <Image
                  source={
                    selectedProduct.image &&
                    selectedProduct.image.startsWith("http")
                      ? { uri: selectedProduct.image }
                      : productImages[selectedProduct.image] ||
                        require("../assets/creatina.png")
                  }
                  style={[styles.detailImage, { backgroundColor: colors.secondary }]}
                />

                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Nome do Produto:</Text>
                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{selectedProduct.name}</Text>

                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Preço:</Text>
                    <Text style={[styles.detailValue, { color: "#FF6B00" }]}>
                      R$ {parseFloat(selectedProduct.price).toFixed(2)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Status / Tag:</Text>
                    <View
                      style={[
                        styles.tagBadge,
                        {
                          alignSelf: "flex-start",
                          marginTop: 4,
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                        },
                      ]}
                    >
                      <Text style={[styles.tagBadgeText, { fontSize: 11 }]}>
                        {selectedProduct.tag || "NENHUMA"}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Sabor / Informações adicionais:
                </Text>
                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                  {selectedProduct.flavor || "Não informado"}
                </Text>
              </View>

              <View style={[styles.row, { marginTop: 15 }]}>
                <TouchableOpacity
                  style={[
                    styles.detailActionBtn,
                    {
                      backgroundColor: colors.surface,
                      borderWidth: 1,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => startEdit(selectedProduct)}
                >
                  <Edit3 color="#FF6B00" size={18} />
                  <Text style={[styles.detailActionText, { color: colors.textPrimary }]}>
                    Editar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.detailActionBtn,
                    {
                      backgroundColor: "#FF444422",
                      borderWidth: 1,
                      borderColor: "#FF4444",
                    },
                  ]}
                  onPress={() => handleDelete(selectedProduct.id, null)}
                >
                  <Trash2 color="#FF4444" size={18} />
                  <Text style={[styles.detailActionText, { color: "#FF4444" }]}>
                    Excluir
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>

      {/* 3. NOVO MODAL DE DETALHES DO USUÁRIO */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={userDetailModalVisible}
        onRequestClose={() => setUserDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          {selectedUser && (
            <View
              style={[
                styles.detailContainer,
                { backgroundColor: colors.cardBackground, borderColor: colors.border },
              ]}
            >
              <View style={styles.rowBetween}>
                <Text style={[styles.detailTitle, { color: colors.textPrimary }]}>Ficha do Usuário</Text>
                <TouchableOpacity
                  onPress={() => setUserDetailModalVisible(false)}
                >
                  <XCircle color="#666" size={24} />
                </TouchableOpacity>
              </View>

              <View style={[styles.detailInfoBox, { backgroundColor: colors.surface }]}>
                <View
                  style={[
                    styles.userIconContainer,
                    { backgroundColor: colors.secondary, borderColor: colors.border },
                    {
                      alignSelf: "center",
                      width: 70,
                      height: 70,
                      borderRadius: 35,
                      marginBottom: 15,
                    },
                  ]}
                >
                  <User color="#FF6B00" size={36} />
                </View>

                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Nome Completo:</Text>
                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                  {selectedUser.name || "Não cadastrado"}
                </Text>

                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>E-mail de Acesso:</Text>
                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{selectedUser.email}</Text>

                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>ID do Sistema:</Text>
                <Text
                  style={[styles.detailValue, { color: colors.textSecondary, fontSize: 13 }]}
                >
                  #{selectedUser.id}
                </Text>
              </View>

              <View style={[styles.row, { marginTop: 15 }]}>
                <TouchableOpacity
                  style={[
                    styles.detailActionBtn,
                    {
                      backgroundColor: "#FF444422",
                      borderWidth: 1,
                      borderColor: "#FF4444",
                    },
                  ]}
                  onPress={() =>
                    handleDelete(selectedUser.id, selectedUser.email)
                  }
                >
                  <Trash2 color="#FF4444" size={18} />
                  <Text style={[styles.detailActionText, { color: "#FF4444" }]}>
                    Excluir Conta
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>
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

  // Modais gerais
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    padding: 20,
  },
  openModalBtn: {
    flexDirection: "row",
    backgroundColor: "#FF6B00",
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  openModalBtnText: {
    color: "#FFF",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 15,
  },

  // Área de Criação/Edição
  addArea: {
    backgroundColor: "#1A1A1A",
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
  },
  editAreaBorder: { borderWidth: 1, borderColor: "#28a745" },
  formTitle: { color: "#FFF", fontWeight: "bold", fontSize: 18 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
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

  // Container de Detalhes (Produtos e Usuários)
  detailContainer: {
    backgroundColor: "#141414",
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#222",
  },
  detailTitle: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  detailInfoBox: {
    backgroundColor: "#0A0A0A",
    padding: 15,
    borderRadius: 12,
    marginTop: 5,
  },
  detailImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 15,
    backgroundColor: "#000",
  },
  detailLabel: {
    color: "#666",
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 10,
    textTransform: "uppercase",
  },
  detailValue: { color: "#FFF", fontSize: 15, fontWeight: "500", marginTop: 2 },
  detailActionBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    gap: 6,
  },
  detailActionText: { fontWeight: "bold", fontSize: 14 },

  // Itens da Lista
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#000",
  },
  userIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#0A0A0A",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#222",
  },
  itemName: { color: "#FFF", fontWeight: "bold", fontSize: 14 },
  itemUserEmail: { color: "#888", fontSize: 12, marginTop: 2 },
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
