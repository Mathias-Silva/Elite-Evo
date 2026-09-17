import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { SPACING } from "../theme";
import { useTheme } from "../context/ThemeContext";

/**
 * Cabeçalho padrão com botão voltar para telas acessadas após uma ação do usuário.
 */
export function ScreenHeader({ title, subtitle, onBack, rightElement, titleAlign = "center" }) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.header,
        { backgroundColor: colors.surface, borderBottomColor: colors.border },
      ]}
    >
      {onBack ? (
        <TouchableOpacity
          onPress={onBack}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <ChevronLeft color={colors.textPrimary} size={28} />
        </TouchableOpacity>
      ) : (
        <View style={styles.sideSpacer} />
      )}

      <View style={[styles.titleBlock, titleAlign === "left" && styles.titleBlockLeft]}>
        <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[
              styles.subtitle,
              titleAlign === "left" && styles.subtitleLeft,
              { color: colors.textSecondary },
            ]}
            numberOfLines={2}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {rightElement ?? <View style={styles.sideSpacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.screen,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1A1A",
    backgroundColor: "#000",
  },
  backBtn: {
    padding: SPACING.sm,
    marginLeft: -SPACING.sm,
  },
  sideSpacer: {
    width: 36,
    minWidth: 36,
  },
  titleBlock: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: SPACING.sm,
  },
  titleBlockLeft: {
    alignItems: "flex-start",
  },
  title: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#666",
    fontSize: 12,
    marginTop: SPACING.sm,
    textAlign: "center",
    lineHeight: 18,
  },
  subtitleLeft: {
    textAlign: "left",
  },
});
