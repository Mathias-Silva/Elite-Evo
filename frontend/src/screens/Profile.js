import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Ionicons,
  MaterialCommunityIcons
} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import { useAuth } from '../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { cacheDirectory, writeAsStringAsync } from 'expo-file-system/legacy';
import { useSelector } from 'react-redux';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const db = useSQLiteContext();
  const { user, setUser, setIsLoggedIn } = useAuth();
  const [profileImage, setProfileImage] = useState(null);

  // Stats vindas do Redux
  const favoriteCount = useSelector(state => state.favorites?.items?.length || 0);
  const cartCount = useSelector(state => state.cart?.items?.length || 0);

  useEffect(() => {
    if (user?.id) {
      loadProfileImage();
    }
  }, [user]);

  async function loadProfileImage() {
    try {
      const result = await db.getFirstAsync(
        'SELECT profileImage FROM users WHERE id = ?',
        [user?.id]
      );
      if (result?.profileImage) {
        setProfileImage(result.profileImage);
      }
    } catch (error) {
      console.error('Erro ao carregar foto:', error);
    }
  }

  async function saveProfileImage(uri) {
    try {
      await db.runAsync(
        'UPDATE users SET profileImage = ? WHERE id = ?',
        [uri, user?.id]
      );
    } catch (error) {
      console.error('Erro ao salvar foto:', error);
    }
  }

  async function pickImage() {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert("Permissão necessária", "Acesse as configurações para permitir o acesso à galeria.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setProfileImage(uri);
      await saveProfileImage(uri);
    }
  }

  function downloadJsonOnWeb(filename, jsonText) {
    if (typeof document === 'undefined') return false;
    const blob = new Blob([jsonText], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  }

  async function exportDatabaseAsJson() {
    try {
      const products = await db.getAllAsync('SELECT * FROM products');
      const users = await db.getAllAsync(
        'SELECT id, name, email, profileImage FROM users'
      );
      const addresses = await db.getAllAsync('SELECT * FROM addresses');
      const payload = {
        exportedAt: new Date().toISOString(),
        tables: {
          products,
          users,
          addresses,
        },
      };
      const json = JSON.stringify(payload, null, 2);
      const fileName = `eliteevo-db-${Date.now()}.json`;

      if (Platform.OS === 'web') {
        if (!downloadJsonOnWeb(fileName, json)) {
          throw new Error('Download não disponível neste ambiente.');
        }
        return;
      }

      const dir = cacheDirectory;
      if (!dir) {
        Alert.alert(
          'Exportação',
          'Este dispositivo não expõe uma pasta temporária para gerar o arquivo.'
        );
        return;
      }

      const uri = `${dir}${fileName}`;
      await writeAsStringAsync(uri, json);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/json',
          dialogTitle: 'Salvar exportação (.json)',
          UTI: 'public.json',
        });
      } else {
        Alert.alert(
          'Arquivo criado',
          `O arquivo ${fileName} foi gerado, mas não há recurso para exportá‑lo neste ambiente (ex.: simulador sem compartilhamento).`,
        );
      }
    } catch (error) {
      console.error('Erro ao exportar banco:', error);
      Alert.alert(
        'Exportação',
        'Não foi possível gerar o arquivo JSON. Tente novamente.'
      );
    }
  }

  const handleLogout = () => {
    Alert.alert('Sair da Conta', 'Deseja realmente sair do Elite Evo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => {
          setUser(null);
          setIsLoggedIn(false);

        }
      },
    ]);
  };

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=FF6B00&color=fff&size=200`;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Header Superior */}
        <View style={styles.header}>
          <View style={{ width: 24 }} />
          <Text style={styles.brand}>ELITE EVO</Text>
          <TouchableOpacity onPress={() => Alert.alert("Configurações", "Em breve...")}>
            <Ionicons name="settings-outline" size={22} color="white" />
          </TouchableOpacity>
        </View>

        {/* Foto de Perfil Dinâmica */}
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            <Image
              source={profileImage ? { uri: profileImage } : { uri: fallbackAvatar }}
              style={styles.avatar}
            />
            <TouchableOpacity
              style={styles.editBtn}
              onPress={pickImage}
            >
              <Ionicons name="pencil" size={14} color="white" />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>
          <Text style={styles.userSub}>{user?.email || 'Membro Elite'}</Text>
        </View>

        {/* Stats Row Dinâmicas */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>PEDIDOS</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#FF6B00' }]}>100</Text>
            <Text style={styles.statLabel}>PONTOS</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{favoriteCount}</Text>
            <Text style={styles.statLabel}>FAVORITOS</Text>
          </View>
        </View>

        {/* Menu List */}
        <View style={styles.menuContainer}>
          <MenuItem icon="package-variant-closed" label="Meus Pedidos" />
          <MenuItem icon="map-marker-outline" label="Endereços" onPress={() => navigation.navigate('Addresses')} />
          <MenuItem icon="credit-card-outline" label="Pagamentos" />
          <MenuItem icon="bell-outline" label="Notificações" badge={cartCount > 0 ? `${cartCount} NO CARRINHO` : null} />
          <MenuItem
            icon="database-export"
            label="Baixar banco (.json)"
            onPress={exportDatabaseAsJson}
          />

          <TouchableOpacity style={styles.logoutItem} onPress={handleLogout}>
            <View style={styles.menuLeft}>
              <View style={styles.iconCircleLogout}>
                <MaterialCommunityIcons name="logout" size={20} color="#FF6B00" />
              </View>
              <Text style={styles.logoutText}>Sair da Conta</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#444" />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const MenuItem = ({ icon, label, badge, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuLeft}>
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons name={icon} size={20} color="#FF6B00" />
      </View>
      <Text style={styles.menuText}>{label}</Text>
    </View>
    <View style={styles.menuRight}>
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={18} color="#444" />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  brand: { color: '#FF6B00', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  profileSection: { alignItems: 'center', marginTop: 20 },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#FF6B00' },
  editBtn: { position: 'absolute', bottom: 5, right: 5, backgroundColor: '#FF6B00', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#000' },
  userName: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginTop: 15 },
  userSub: { color: '#FF6B00', fontSize: 13, fontWeight: '600', marginTop: 4 },
  statsRow: { flexDirection: 'row', justifyContent: 'center', gap: 15, marginTop: 35, paddingHorizontal: 20 },
  statCard: { backgroundColor: '#0A0A0A', width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#1A1A1A' },
  statValue: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  statLabel: { color: '#666', fontSize: 10, fontWeight: '700', marginTop: 2 },
  menuContainer: { marginTop: 40, paddingHorizontal: 20 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0F0F0F', padding: 15, borderRadius: 40, marginBottom: 12 },
  logoutItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255, 107, 0, 0.05)', padding: 15, borderRadius: 40, marginTop: 10, borderWidth: 1, borderColor: 'rgba(255, 107, 0, 0.1)' },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center' },
  iconCircleLogout: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 107, 0, 0.1)', justifyContent: 'center', alignItems: 'center' },
  menuText: { color: '#FFF', marginLeft: 15, fontSize: 15, fontWeight: '500' },
  logoutText: { color: '#FF6B00', marginLeft: 15, fontSize: 15, fontWeight: 'bold' },
  menuRight: { flexDirection: 'row', alignItems: 'center' },
  badge: { backgroundColor: 'rgba(255, 107, 0, 0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginRight: 8 },
  badgeText: { color: '#FF6B00', fontSize: 10, fontWeight: '900' },
});