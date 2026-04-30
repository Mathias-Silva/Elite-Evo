import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SQLiteProvider } from 'expo-sqlite';
import { Provider } from 'react-redux';

import { store } from './src/store';
import { initializeDatabase } from './src/database/initializeDatabase';
import { AuthProvider } from './src/context/AuthContext';
import TabNavigator from './src/navigation';

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
