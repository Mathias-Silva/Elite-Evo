import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Globe, Share2, Users } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";

export const FooterInfo = () => {
  const { colors } = useTheme();

  return (
  <View style={[styles.container, { backgroundColor: colors.surface }]}>
    <Text style={[styles.logo, { color: colors.textPrimary }]}>
      ELITE<Text style={{ color: "#FF6B00" }}>EVO</Text>
    </Text>
    <Text style={[styles.desc, { color: colors.textSecondary }]}>
      A Elite Evo nasceu para redefinir os limites do corpo humano...
    </Text>

    <View style={styles.socialRow}>
      <View style={[styles.socialIcon, { backgroundColor: colors.secondary }]}>
        <Globe color={colors.textPrimary} size={20} />
      </View>
      <View style={[styles.socialIcon, { backgroundColor: colors.secondary }]}>
        <Share2 color={colors.textPrimary} size={20} />
      </View>
      <View style={[styles.socialIcon, { backgroundColor: colors.secondary }]}>
        <Users color={colors.textPrimary} size={20} />
      </View>
    </View>

    <View style={styles.navSection}>
      <Text style={[styles.navTitle, { color: colors.textPrimary }]}>Navegação</Text>
      {["Produtos", "Sobre Nós", "Blog Performance", "Rastrear Pedido"].map(
        (item) => (
          <Text key={item} style={[styles.navItem, { color: colors.textSecondary }]}>
            {item}
          </Text>
        ),
      )}
    </View>

    <View style={[styles.securityBadge, { borderColor: colors.border }]}>
      <Text style={[styles.securityText, { color: colors.textSecondary }]}>
        🔒 Ambiente 100% criptografado e seguro.
      </Text>
    </View>

    <Text style={[styles.copyright, { color: colors.textSecondary }]}>
      © 2024 Elite Evo Suplementos. CNPJ: 00.000.000/0001-00
    </Text>
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 25,
    backgroundColor: "#000",
    alignItems: "flex-start",
  },
  logo: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  desc: {
    color: "#666",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 20,
  },
  socialRow: {
    flexDirection: "row",
    marginBottom: 30,
  },
  socialIcon: {
    backgroundColor: "#1A1A1A",
    padding: 10,
    borderRadius: 20,
    marginRight: 15,
  },
  navSection: {
    marginBottom: 30,
    width: "100%",
  },
  navTitle: {
    color: "#FFF",
    fontWeight: "bold",
    marginBottom: 15,
    fontSize: 16,
  },
  navItem: {
    color: "#666",
    marginBottom: 10,
    fontSize: 14,
  },
  securityBadge: {
    width: "100%",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333",
    alignItems: "center",
    marginBottom: 20,
  },
  securityText: { color: "#444", fontSize: 11 },
  copyright: {
    color: "#333",
    fontSize: 10,
    width: "100%",
    textAlign: "center",
  },
});
