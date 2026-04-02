import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, ShoppingCart, DollarSign, LogOut, Package, ChevronRight } from 'lucide-react-native';
import { useSelector } from 'react-redux';

const USER = {
  name: 'João da Silva',
  email: 'joao@eliteevo.com',
  initials: 'JS',
  memberSince: 'Março 2024',
};

export default function Profile() {
  const favoriteCount = useSelector(state => state.favorites.items.length);
  const cartCount = useSelector(state => state.cart.items.length);
  const totalSpent = useSelector(state => state.cart.totalAmount);

  const handleLogout = () => {
    Alert.alert(
      'Sair da Conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: () => {} },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Perfil</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{USER.initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{USER.name}</Text>
            <Text style={styles.profileEmail}>{USER.email}</Text>
            <View style={styles.memberBadge}>
              <Text style={styles.memberBadgeText}>Membro desde {USER.memberSince}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Estatísticas</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: 'rgba(255, 107, 0, 0.15)' }]}>
              <Heart color="#FF6B00" size={20} fill="#FF6B00" />
            </View>
            <Text style={styles.statValue}>{favoriteCount}</Text>
            <Text style={styles.statLabel}>Favoritos</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: 'rgba(255, 107, 0, 0.15)' }]}>
              <ShoppingCart color="#FF6B00" size={20} />
            </View>
            <Text style={styles.statValue}>{cartCount}</Text>
            <Text style={styles.statLabel}>No Carrinho</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: 'rgba(0, 200, 83, 0.15)' }]}>
              <DollarSign color="#00C853" size={20} />
            </View>
            <Text style={[styles.statValue, { fontSize: totalSpent > 999 ? 13 : 16 }]}>
              R${totalSpent.toFixed(0)}
            </Text>
            <Text style={styles.statLabel}>Em Aberto</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Minha Conta</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Package color="#FF6B00" size={20} />
              <Text style={styles.menuText}>Histórico de Pedidos</Text>
            </View>
            <ChevronRight color="#444" size={18} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Heart color="#FF6B00" size={20} />
              <Text style={styles.menuText}>Meus Favoritos</Text>
            </View>
            <ChevronRight color="#444" size={18} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut color="#FF6B00" size={18} />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>EliteEvo v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scrollContent: { paddingBottom: 30 },

  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1A1A1A',
    marginBottom: 25,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF6B00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  profileInfo: { marginLeft: 15, flex: 1 },
  profileName: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  profileEmail: { color: '#666', fontSize: 13, marginTop: 3 },
  memberBadge: {
    marginTop: 8,
    backgroundColor: 'rgba(255,107,0,0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  memberBadgeText: { color: '#FF6B00', fontSize: 11, fontWeight: '600' },

  sectionLabel: {
    color: '#666',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    marginBottom: 12,
  },

  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 25,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#121212',
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  statIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  statLabel: { color: '#666', fontSize: 11, marginTop: 3, textAlign: 'center' },

  menuCard: {
    backgroundColor: '#121212',
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1A1A1A',
    marginBottom: 25,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuText: { color: '#FFF', fontSize: 15, marginLeft: 14 },
  menuDivider: { height: 1, backgroundColor: '#1A1A1A', marginHorizontal: 18 },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#FF6B00',
    marginBottom: 20,
  },
  logoutText: { color: '#FF6B00', fontWeight: 'bold', fontSize: 15, marginLeft: 10 },

  versionText: { color: '#333', fontSize: 12, textAlign: 'center' },
});
