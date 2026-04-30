import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';

export default function AuthHomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>ELITE EVO</Text>
        <Text style={styles.subtitle}>Sua melhor versão começa aqui.</Text>

        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>FAZER LOGIN</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.registerButton} 
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.registerText}>CRIAR UMA CONTA</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { flex: 1, justifyContent: 'center', padding: 30, alignItems: 'center' },
  logo: { color: '#E67E22', fontSize: 42, fontWeight: 'bold', letterSpacing: 4 },
  subtitle: { color: '#888', fontSize: 16, marginBottom: 50, textAlign: 'center' },
  loginButton: { 
    backgroundColor: '#E67E22', 
    width: '100%', 
    padding: 18, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginBottom: 15 
  },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  registerButton: { 
    borderWidth: 2, 
    borderColor: '#E67E22', 
    width: '100%', 
    padding: 18, 
    borderRadius: 12, 
    alignItems: 'center' 
  },
  registerText: { color: '#E67E22', fontWeight: 'bold', fontSize: 16 },
});