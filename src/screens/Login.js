import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Alert, Keyboard } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const db = useSQLiteContext();
  const { setIsLoggedIn, setUser } = useAuth();

  async function handleLogin() {
    Keyboard.dismiss();

    if (!email || !password) {
      Alert.alert("Erro", "Preencha e-mail e senha");
      return;
    }

    try {
      // Busca case-insensitive com COLLATE NOCASE
      const userFound = await db.getFirstAsync(
        'SELECT id, name, email FROM users WHERE email = ? COLLATE NOCASE AND password = ?',
        [email.trim(), password]
      );

      if (userFound) {
        Alert.alert("Sucesso", `Bem-vindo, ${userFound.name}!`);
        setUser(userFound);
        setIsLoggedIn(true);
      } else {
        Alert.alert("Erro", "E-mail ou senha incorretos");
      }

    } catch (error) {
      console.error("Erro no login:", error);
      Alert.alert("Erro", "Falha no banco de dados: " + error.message);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>ELITE EVO</Text>

        <TextInput 
          style={styles.input} 
          placeholder="E-mail" 
          placeholderTextColor="#666"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput 
          style={styles.input} 
          placeholder="Senha" 
          placeholderTextColor="#666"
          secureTextEntry 
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>ENTRAR</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.linkText}>
            Novo por aqui? <Text style={styles.highlight}>Crie uma conta</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { flex: 1, justifyContent: 'center', padding: 30 },
  logo: { color: '#E67E22', fontSize: 32, fontWeight: 'bold', textAlign: 'center', letterSpacing: 4, marginBottom: 50 },
  input: { backgroundColor: '#1A1A1A', color: 'white', padding: 18, borderRadius: 12, marginBottom: 15, fontSize: 16 },
  button: { backgroundColor: '#E67E22', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  linkText: { color: '#888', textAlign: 'center', marginTop: 25 },
  highlight: { color: '#E67E22', fontWeight: 'bold' }
});