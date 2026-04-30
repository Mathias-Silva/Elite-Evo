import React from 'react';
import { TouchableOpacity, Text, ImageBackground, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function CategoryCard({ title, image, fullWidth }) {
  return (
    <TouchableOpacity 
      style={[styles.container, fullWidth ? styles.fullWidth : styles.halfWidth]}
      activeOpacity={0.9}
    >
      <ImageBackground 
        source={image} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']} // Gradiente do meio para baixo
          style={styles.gradient}
        >
          <Text style={styles.title}>{title}</Text>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 140, 
    borderRadius: 25,
    marginBottom: 15,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
  },
  halfWidth: {
    width: '48%', 
    height: 150,
  },
  fullWidth: {
    width: '100%',
    height: 220,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',  },

  gradient: {
    padding: 20,
    height: '50%',
    justifyContent: 'flex-end', 
  },
  title: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: 'bold',
    
  },
});