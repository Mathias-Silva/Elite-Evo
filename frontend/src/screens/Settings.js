import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Moon, Sun } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { ScreenHeader } from "../components/ScreenHeader";
import { useTheme } from "../context/ThemeContext";
import { SPACING } from "../theme";

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { colors, isDarkMode, setThemeMode } = useTheme();
  const isLightMode = !isDarkMode;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top", "left", "right"]}
    >
      <ScreenHeader title="Configurações" onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.settingRow,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
            },
          ]}
          onPress={() => setThemeMode(!isDarkMode)}
        >
          <View style={styles.settingLeft}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: isLightMode ? "#FFF4EA" : colors.secondary },
              ]}
            >
              {isLightMode ? (
                <Sun color={colors.primary} size={22} />
              ) : (
                <Moon color={colors.primary} size={22} />
              )}
            </View>
            <View>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
                Modo Claro
              </Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                Ajustar a paleta do app
              </Text>
            </View>
          </View>

          <Switch
            value={isLightMode}
            onValueChange={(value) => setThemeMode(!value)}
            trackColor={{ false: colors.secondary, true: "#FFD6B8" }}
            thumbColor={isLightMode ? colors.primary : "#F4F3F4"}
            ios_backgroundColor={colors.secondary}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.screen,
  },
  settingRow: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: SPACING.md,
  },
  settingLeft: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
  },
  iconCircle: {
    alignItems: "center",
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    marginRight: SPACING.md,
    width: 44,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  settingSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },
});
