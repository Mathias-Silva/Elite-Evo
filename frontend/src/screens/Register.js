import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "../components/ScreenHeader";
import { SPACING } from "../theme";
export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Novo estado

  const db = useSQLiteContext();

  async function handleRegister() {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }   
    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem. Digite novamente.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    try {
      await db.runAsync(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email.trim().toLowerCase(), password],
      );

      Alert.alert("Sucesso", "Conta criada com sucesso!", [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ]);
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Este e-mail já está em uso.");
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Cadastro" onBack={() => navigation.goBack()} />
      <View style={styles.content}>

        <TextInput
          style={styles.input}
          placeholder="Nome Completo"
          placeholderTextColor="#666"
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="#666"
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#666"
          secureTextEntry
          onChangeText={setPassword}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirmar Senha"
          placeholderTextColor="#666"
          secureTextEntry
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>FINALIZAR CADASTRO</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.linkText}>
            Já tem uma conta? <Text style={styles.highlight}>Faça login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#000" 
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: SPACING.screen,
    paddingBottom: SPACING.xl,
    paddingTop: SPACING.md,
  },
  title: { 
    color: "white", 
    fontSize: 28, 
    fontWeight: "bold", 
    marginBottom: 30 
  },
  input: {
    backgroundColor: "#1A1A1A",
    color: "white",
    padding: 18,
    borderRadius: 12,
    marginBottom: SPACING.block,
  },
  button: {
    backgroundColor: "#E67E22",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { 
    color: "white", 
    fontWeight: "bold" 
  },
  linkText: { 
    color: "#888", 
    textAlign: "center", 
    marginTop: 25 
  },
  highlight: { 
    color: "#E67E22", 
    fontWeight: "bold" 
  },
});
