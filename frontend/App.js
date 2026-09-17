import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SQLiteProvider } from 'expo-sqlite';
import { Provider } from 'react-redux';

import { store } from './src/store';
import { initializeDatabase } from './src/database/initializeDatabase';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import RootNavigator from './src/navigation';
import { StatusBar } from 'react-native';

function ThemedStatusBar() {
  const { isDarkMode } = useTheme();

  return <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />;
}

export default function App() {
  return (
    <Provider store={store}>
      <SQLiteProvider databaseName="eliteEvo.db" onInit={initializeDatabase}>
        <ThemeProvider>
          <ThemedStatusBar />
          <AuthProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </AuthProvider>
        </ThemeProvider>
      </SQLiteProvider>
    </Provider>
  );
}
