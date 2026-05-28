import React from "react";
import { View, StyleSheet } from "react-native";
import { SPACING } from "../theme";
import { useTheme } from "../context/ThemeContext";

/**
 * Área de conteúdo abaixo do ScreenHeader — garante respiro visual padrão.
 */
export function ScreenBody({ children, style, noTopPadding = false }) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.body,
        { backgroundColor: colors.background },
        noTopPadding && styles.bodyNoTopPadding,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingTop: SPACING.section,
  },
  bodyNoTopPadding: {
    paddingTop: 0,
  },
});
