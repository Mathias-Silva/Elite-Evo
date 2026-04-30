import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Globe, Share2, Users } from 'lucide-react-native';

export const FooterInfo = () => (
  <View style={styles.container}>
    <Text style={styles.logo}>ELITE<Text style={{color:'#FF6B00'}}>EVO</Text></Text>
    <Text style={styles.desc}>A Elite Evo nasceu para redefinir os limites do corpo humano...</Text>
    
    <View style={styles.socialRow}>
       <View style={styles.socialIcon}><Globe color="#FFF" size={20}/></View>
       <View style={styles.socialIcon}><Share2 color="#FFF" size={20}/></View>
       <View style={styles.socialIcon}><Users color="#FFF" size={20}/></View>
    </View>

    <View style={styles.navSection}>
      <Text style={styles.navTitle}>Navegação</Text>
      {['Produtos', 'Sobre Nós', 'Blog Performance', 'Rastrear Pedido'].map(item => (
        <Text key={item} style={styles.navItem}>{item}</Text>
      ))}
    </View>

    <View style={styles.securityBadge}>
       <Text style={styles.securityText}>🔒 Ambiente 100% criptografado e seguro.</Text>
    </View>
    
    <Text style={styles.copyright}>© 2024 Elite Evo Suplementos. CNPJ: 00.000.000/0001-00</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { padding: 25, backgroundColor: '#000', alignItems: 'flex-start' },
  logo: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  desc: { color: '#666', fontSize: 12, lineHeight: 18, marginBottom: 20 },
  socialRow: { flexDirection: 'row', marginBottom: 30 },
  socialIcon: { backgroundColor: '#1A1A1A', padding: 10, borderRadius: 20, marginRight: 15 },
  navSection: { marginBottom: 30, width: '100%' },
  navTitle: { color: '#FFF', fontWeight: 'bold', marginBottom: 15, fontSize: 16 },
  navItem: { color: '#666', marginBottom: 10, fontSize: 14 },
  securityBadge: { width: '100%', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#333', alignItems: 'center', marginBottom: 20 },
  securityText: { color: '#444', fontSize: 11 },
  copyright: { color: '#333', fontSize: 10, width: '100%', textAlign: 'center' }
});