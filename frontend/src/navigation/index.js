import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home as HomeIcon, Grid, Heart, User, ShoppingCart, Settings } from 'lucide-react-native';

// Screens
import Home from '../screens/Home';
import Catalog from '../screens/Catalog';
import Favorites from '../screens/Favorites';
import Profile from '../screens/Profile';
import Cart from '../screens/Cart';
import AuthHomeScreen from '../screens/AuthHome';
import LoginScreen from '../screens/Login';
import RegisterScreen from '../screens/Register';
import AddressesScreen from '../screens/Addresses';
import AddressFormScreen from '../screens/AddressForm';
import CheckoutAddressScreen from '../screens/CheckoutAddress';
import PaymentScreen from '../screens/Payment';
import AdminScreen from '../screens/AdminScreen';

// Context
import { useAuth } from '../context/AuthContext';

const Tab = createBottomTabNavigator();
const AuthStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const CartStack = createNativeStackNavigator();

// --- STACKS AUXILIARES ---

function CartStackNavigator() {
  return (
    <CartStack.Navigator screenOptions={{ headerShown: false }}>
      <CartStack.Screen name="CartMain" component={Cart} />
      <CartStack.Screen name="CheckoutAddress" component={CheckoutAddressScreen} />
      <CartStack.Screen name="AddressForm" component={AddressFormScreen} />
      <CartStack.Screen name="Payment" component={PaymentScreen} />
    </CartStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={Profile} />
      <ProfileStack.Screen name="Addresses" component={AddressesScreen} />
      <ProfileStack.Screen name="AddressForm" component={AddressFormScreen} />
    </ProfileStack.Navigator>
  );
}

function AuthStackNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="AuthHome" component={AuthHomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="AdminScreen" component={AdminScreen} />
    </AuthStack.Navigator>
  );
}

// --- COMPONENTE PRINCIPAL ---

export default function TabNavigator() {
  const { isLoggedIn, user } = useAuth();

  const isAdmin = isLoggedIn && user?.email?.toLowerCase() === "admin@eliteevo.com";

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF6B00',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#0A0A0A',
          borderTopColor: '#1A1A1A',
          height: Platform.OS === 'android' ? 85 : 95,
          paddingBottom: Platform.OS === 'android' ? 15 : 30,
          paddingTop: 10,
          elevation: 5,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: -5,
          marginBottom: Platform.OS === 'android' ? 5 : 0,
        }
      }}
    >
      {isAdmin ? (
        /* --- MENU DO ADMINISTRADOR --- */
        <>
          <Tab.Screen
            name="Painel Admin"
            component={AdminScreen}
            options={{
              tabBarIcon: ({ color }) => <Settings color={color} size={24} />
            }}
          />
          <Tab.Screen
            name="Loja"
            component={Home}
            options={{
              title: 'Ver Loja',
              tabBarIcon: ({ color }) => <HomeIcon color={color} size={24} />
            }}
          />
          {/* ✅ Cart adicionado ao menu admin para que navigate('Cart') funcione */}
          <Tab.Screen
            name="Cart"
            component={CartStackNavigator}
            options={{
              title: 'Carrinho',
              tabBarIcon: ({ color }) => <ShoppingCart color={color} size={24} />,
            }}
          />
          <Tab.Screen
            name="Perfil"
            component={ProfileStackNavigator}
            options={{
              tabBarIcon: ({ color }) => <User color={color} size={24} />
            }}
          />
        </>
      ) : (
        /* --- MENU DO CLIENTE / DESLOGADO --- */
        <>
          <Tab.Screen
            name="Início"
            component={Home}
            options={{
              tabBarIcon: ({ color }) => <HomeIcon color={color} size={24} />
            }}
          />
          <Tab.Screen
            name="Catálogo"
            component={Catalog}
            options={{
              tabBarIcon: ({ color }) => <Grid color={color} size={24} />
            }}
          />
          <Tab.Screen
            name="Cart"
            component={CartStackNavigator}
            options={{
              title: 'Carrinho',
              tabBarIcon: ({ color }) => <ShoppingCart color={color} size={24} />,
            }}
          />
          <Tab.Screen
            name="Favoritos"
            component={Favorites}
            options={{
              tabBarIcon: ({ color }) => <Heart color={color} size={24} />
            }}
          />
          <Tab.Screen
            name="Perfil"
            component={isLoggedIn ? ProfileStackNavigator : AuthStackNavigator}
            options={{
              tabBarIcon: ({ color }) => <User color={color} size={24} />
            }}
          />
        </>
      )}
    </Tab.Navigator>
  );
}