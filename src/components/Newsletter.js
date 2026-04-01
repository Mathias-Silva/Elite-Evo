
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export const Newsletter = () => (
  <View style={styles.container}>
    <Text style={styles.title}>JUNTE-SE AO ELITE SQUAD</Text>
    <Text style={styles.subtitle}>
      Receba dicas de treino, dietas e ofertas exclusivas direto no seu e-mail.
    </Text>
    
    <TextInput 
      style={styles.input} 
      placeholder="Seu melhor e-mail" 
      placeholderTextColor="rgba(255,255,255,0.7)"
    />
    
    <TouchableOpacity style={styles.button}>
      <Text style={styles.buttonText}>INSCREVER</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FF6B00',
    margin: 20,
    borderRadius: 25,
    padding: 30,
    alignItems: 'center',
  },
  title: { color: '#FFF', fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 10 },
  subtitle: { color: '#FFF', fontSize: 13, textAlign: 'center', marginBottom: 20, lineHeight: 18 },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    paddingHorizontal: 20,
    color: '#FFF',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFF',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { color: '#FF6B00', fontWeight: 'bold', fontSize: 14 },
});