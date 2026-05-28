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
import { COLORS, SPACING } from "../theme";

export default function ChangePasswordScreen({ navigation }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const db = useSQLiteContext();
  const { user } = useAuth();

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
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Trocar Senha" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Digite sua senha atual e depois informe a nova senha desejada.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Senha Atual"
          placeholderTextColor="#666"
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />

        <TextInput
          style={styles.input}
          placeholder="Nova Senha (mín. 6 caracteres)"
          placeholderTextColor="#666"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirmar Nova Senha"
          placeholderTextColor="#666"
          secureTextEntry
          value={confirmNewPassword}
          onChangeText={setConfirmNewPassword}
        />

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleChangePassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
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
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.screen,
    paddingTop: SPACING.lg,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 30,
  },
  input: {
    backgroundColor: COLORS.cardBackground,
    color: "white",
    padding: 18,
    borderRadius: 12,
    marginBottom: SPACING.block,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#252525",
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 1,
  },
});
