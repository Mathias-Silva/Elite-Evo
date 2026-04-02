import React from 'react';
import { Platform } from 'react-native'; // Importado para detectar o sistema
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SQLiteProvider } from 'expo-sqlite';
import { Home as HomeIcon, Grid, Heart, User, ShoppingCart } from 'lucide-react-native';
import Home from './src/screens/Home';
import Catalog from './src/screens/Catalog';
import Favorites from './src/screens/Favorites';
import Profile from './src/screens/Profile';
import Cart from './src/screens/Cart';
import AuthHomeScreen from './src/screens/AuthHome';
import LoginScreen from './src/screens/Login';
import RegisterScreen from './src/screens/Register';

import { Provider } from 'react-redux'; 
import { store } from './src/store'; 

import { initializeDatabase } from './src/database/initializeDatabase';
import { AuthProvider, useAuth } from './src/context/AuthContext';

const Tab = createBottomTabNavigator();

const AuthStack = createNativeStackNavigator();

function AuthStackNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="AuthHome" component={AuthHomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function PerfilTabScreen() {
  const { isLoggedIn } = useAuth();

  if (isLoggedIn) {
    return <Profile />;
  }
  return <AuthStackNavigator />;
}


function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, 
        tabBarActiveTintColor: '#FF6B00',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#0A0A0A',
          borderTopColor: '#1A1A1A',
          
          height: Platform.OS === 'android' ? 90 : 91, 
          
          paddingBottom: Platform.OS === 'android' ? 25 : 30,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginBottom: Platform.OS === 'android' ? 5 : 0,
        }
      }}
    >
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
        component={Cart} 
        options={{ 
          title: 'Carrinho',
          tabBarIcon: ({ color }) => <ShoppingCart color={color} size={24} />,
          tabBarBadge: undefined, 
          tabBarBadgeStyle: { backgroundColor: '#FF6B00' }
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
        component={PerfilTabScreen} 
        options={{ 
          tabBarIcon: ({ color }) => <User color={color} size={24} /> 
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <Provider store={store}>
    <SQLiteProvider databaseName="eliteEvo.db" onInit={initializeDatabase}>
       <AuthProvider>
          <NavigationContainer>
            <TabNavigator />
          </NavigationContainer>
        </AuthProvider>
    </SQLiteProvider>
    </Provider>
  );
}