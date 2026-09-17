import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useAuth } from "../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "../components/ScreenHeader";
import { SPACING } from "../theme";
import { useTheme } from "../context/ThemeContext";

export default function ChangePasswordScreen({ navigation }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const db = useSQLiteContext();
  const { user } = useAuth();
  const { colors } = useTheme();

  async function handleChangePassword() {
    Keyboard.dismiss();

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Erro", "A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert("Erro", "As senhas não coincidem. Digite novamente.");
      return;
    }

    setLoading(true);
    try {
      // 1. Verifica se a senha atual está correta
      const userFound = await db.getFirstAsync(
        "SELECT password FROM users WHERE id = ?",
        [user?.id],
      );

      if (!userFound || userFound.password !== currentPassword) {
        Alert.alert("Erro", "A senha atual está incorreta.");
        setLoading(false);
        return;
      }

      // 2. Atualiza a senha no banco de dados
      await db.runAsync(
        "UPDATE users SET password = ? WHERE id = ?",
        [newPassword, user?.id],
      );

      Alert.alert("Sucesso", "Senha alterada com sucesso!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      Alert.alert("Erro", "Falha ao atualizar a senha no banco de dados.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Trocar Senha" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Digite sua senha atual e depois informe a nova senha desejada.
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
              color: colors.textPrimary,
            },
          ]}
          placeholder="Senha Atual"
          placeholderTextColor="#666"
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
              color: colors.textPrimary,
            },
          ]}
          placeholder="Nova Senha (mín. 6 caracteres)"
          placeholderTextColor="#666"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
              color: colors.textPrimary,
            },
          ]}
          placeholder="Confirmar Nova Senha"
          placeholderTextColor="#666"
          secureTextEntry
          value={confirmNewPassword}
          onChangeText={setConfirmNewPassword}
        />

        <TouchableOpacity 
          style={[styles.button, { shadowColor: colors.primary }]} 
          onPress={handleChangePassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>ALTERAR SENHA</Text>
          )}
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
    flex: 1,
    paddingHorizontal: SPACING.screen,
    paddingTop: SPACING.lg,
  },
  subtitle: {
    color: "#A0A0A0",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 30,
  },
  input: {
    backgroundColor: "#1A1A1A",
    color: "#FFF",
    padding: 18,
    borderRadius: 12,
    marginBottom: SPACING.block,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#252525",
  },
  button: {
    backgroundColor: "#FF6B00",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#FF6B00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 1,
  },
});
