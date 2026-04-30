import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Home, Grid, Heart, User } from 'lucide-react-native';

export const BottomMenu = () => (
  <View style={styles.container}>
    <TouchableOpacity style={styles.tab}>
      <Home color="#FF6B00" size={24} />
      <Text style={[styles.text, {color: '#FF6B00'}]}>Início</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.tab}>
      <Grid color="#666" size={24} />
      <Text style={styles.text}>Catálogo</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.tab}>
      <Heart color="#666" size={24} />
      <Text style={styles.text}>Favoritos</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.tab}>
      <User color="#666" size={24} />
      <Text style={styles.text}>Perfil</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#0A0A0A',
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
    height: 70,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 10,
  },
  tab: { alignItems: 'center' },
  text: { fontSize: 10, marginTop: 4, color: '#666' }
});