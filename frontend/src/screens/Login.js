import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Keyboard,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useAuth } from "../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "../components/ScreenHeader";
import { SPACING } from "../theme";
import { useTheme } from "../context/ThemeContext";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const db = useSQLiteContext();
  const { setIsLoggedIn, setUser } = useAuth();
  const { colors } = useTheme();

  async function handleLogin() {
    Keyboard.dismiss();

    if (!email || !password) {
      Alert.alert("Erro", "Preencha e-mail e senha");
      return;
    }

    try {
      const userFound = await db.getFirstAsync(
        "SELECT id, name, email FROM users WHERE email = ? COLLATE NOCASE AND password = ?",
        [email.trim(), password],
      );

      if (userFound) {
        setUser(userFound);
        setIsLoggedIn(true);

        if (userFound.email.toLowerCase() === "admin@eliteevo.com") {
          Alert.alert("Sucesso", "Acessando Painel Administrativo");
          navigation.replace("AdminScreen");
        } else {
          navigation.replace("AuthHome");
        }
      } else {
        Alert.alert("Erro", "E-mail ou senha incorretos");
      }
    } catch (error) {
      console.error("Erro no login:", error);
      Alert.alert("Erro", "Falha ao conectar com o banco de dados.");
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Entrar" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <Text style={styles.logo}>ELITE EVO</Text>

        <TextInput
          style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.textPrimary }]}
          placeholder="E-mail"
          placeholderTextColor="#666"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.textPrimary }]}
          placeholder="Senha"
          placeholderTextColor="#666"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          onPress={() => navigation.navigate("ForgotPassword")}
          style={{ alignSelf: "flex-end", marginBottom: 20, marginRight: 5 }}
        >
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
            Esqueci minha senha
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>ENTRAR</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={[styles.linkText, { color: colors.textSecondary }]}>
            Novo por aqui? <Text style={styles.highlight}>Crie uma conta</Text>
          </Text>
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
    justifyContent: "center",
    paddingHorizontal: SPACING.screen,
    paddingBottom: SPACING.xl,
    paddingTop: SPACING.md,
  },
  logo: {
    color: "#E67E22",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 4,
    marginBottom: 50,
  },
  input: {
    backgroundColor: "#1A1A1A",
    color: "white",
    padding: 18,
    borderRadius: 12,
    marginBottom: SPACING.block,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#E67E22",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  linkText: {
    color: "#888",
    textAlign: "center",
    marginTop: 25,
  },
  highlight: {
    color: "#E67E22",
    fontWeight: "bold",
  },
});
