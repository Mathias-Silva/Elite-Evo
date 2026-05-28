import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Keyboard,
  Platform, // <-- Adicionado para compatibilidade Web e Mobile
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "../components/ScreenHeader";
import { SPACING } from "../theme";

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Controle de fluxo: false = digitando e-mail / true = digitando nova senha
  const [isEmailVerified, setIsEmailVerified] = useState(false); 
  const [userId, setUserId] = useState(null);

  const db = useSQLiteContext();

  // Função auxiliar de alerta universal para não quebrar na Web
  const mostrarAlerta = (titulo, mensagem) => {
    if (Platform.OS === "web") {
      window.alert(`${titulo}: ${mensagem}`);
    } else {
      Alert.alert(titulo, mensagem);
    }
  };

  // Verifica se o e-mail existe no banco
  async function handleVerifyEmail() {
    Keyboard.dismiss();

    if (!email) {
      mostrarAlerta("Erro", "Por favor, preencha o seu e-mail.");
      return;
    }

    // 🛑 TRAVA DE SEGURANÇA: Impede a alteração de e-mail do Admin do sistema
    if (email.trim().toLowerCase() === "admin@eliteevo.com") {
      mostrarAlerta("Ação Negada", "A senha da conta de Administrador não pode ser redefinida por este canal.");
      return;
    }

    try {
      const userFound = await db.getFirstAsync(
        "SELECT id FROM users WHERE email = ? COLLATE NOCASE",
        [email.trim()]
      );

      if (userFound) {
        setUserId(userFound.id);
        setIsEmailVerified(true); // Avança para os campos de nova senha
      } else {
        mostrarAlerta("Erro", "Este e-mail não está cadastrado no sistema.");
      }
    } catch (error) {
      console.error("Erro ao verificar e-mail:", error);
      mostrarAlerta("Erro", "Falha ao acessar o banco de dados.");
    }
  }

  // Fase 2: Atualiza a senha no banco de dados local
  async function handleUpdatePassword() {
    Keyboard.dismiss();

    if (!password || !confirmPassword) {
      mostrarAlerta("Erro", "Preencha todos os campos de senha.");
      return;
    }

    if (password.length < 6) {
      mostrarAlerta("Erro", "A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      mostrarAlerta("Erro", "As senhas não coincidem.");
      return;
    }

    try {
      // Executa o UPDATE real no banco de dados SQLite
      await db.runAsync(
        "UPDATE users SET password = ? WHERE id = ?",
        [password, userId]
      );

      mostrarAlerta("Sucesso", "Senha alterada com sucesso! Faça login com suas novas credenciais.");
      navigation.goBack(); // Retorna para a tela de Login
    } catch (error) {
      console.error("Erro ao atualizar senha:", error);
      mostrarAlerta("Erro", "Não foi possível atualizar a senha no banco de dados.");
    }
  }

  const handleBack = () => {
    if (isEmailVerified) {
      setIsEmailVerified(false);
      setPassword("");
      setConfirmPassword("");
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title={!isEmailVerified ? "Recuperar senha" : "Nova senha"}
        onBack={handleBack}
      />
      <View style={styles.content}>
        <Text style={styles.logo}>ELITE EVO</Text>
        <Text style={styles.subtitle}>
          {!isEmailVerified ? "RECUPERAR ACESSO" : "DEFINIR NOVA SENHA"}
        </Text>

        {!isEmailVerified ? (
          /* --- FLUXO 1: VERIFICAÇÃO DE E-MAIL --- */
          <>
            <TextInput
              style={styles.input}
              placeholder="Digite seu E-mail"
              placeholderTextColor="#666"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <TouchableOpacity style={styles.button} onPress={handleVerifyEmail}>
              <Text style={styles.buttonText}>AVANÇAR</Text>
            </TouchableOpacity>
          </>
        ) : (
          /* --- FLUXO 2: ALTERAÇÃO REAL DE SENHA --- */
          <>
            <Text style={styles.infoText}>E-mail confirmado para alteração.</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nova Senha"
              placeholderTextColor="#666"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TextInput
              style={styles.input}
              placeholder="Confirmar Nova Senha"
              placeholderTextColor="#666"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <TouchableOpacity style={styles.button} onPress={handleUpdatePassword}>
              <Text style={styles.buttonText}>ALTERAR E SALVAR</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity 
          onPress={() => {
            if (isEmailVerified) {
              setIsEmailVerified(false); // Permite voltar para o e-mail se quiser
            } else {
              navigation.goBack();
            }
          }}
        >
          <Text style={styles.linkText}>
            {isEmailVerified ? "Voltar etapa anterior " : "Lembrou a senha? "}
            <Text style={styles.highlight}>
              {isEmailVerified ? "" : "Voltar para o Login"}
            </Text>
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
  logo: {
    color: "#E67E22",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 4,
    marginBottom: 10,
  },
  subtitle: {
    color: "#666",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 40,
    letterSpacing: 2,
  },
  infoText: {
    color: "#2ECC71",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "500"
  },
  input: {
    backgroundColor: "#1A1A1A",
    color: "white",
    padding: 18,
    borderRadius: 12,
    marginBottom: 15,
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
    fontSize: 16 
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