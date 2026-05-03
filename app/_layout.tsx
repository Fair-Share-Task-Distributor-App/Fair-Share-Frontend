import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MD3LightTheme, PaperProvider } from "react-native-paper";
import "react-native-reanimated";

export const unstable_settings = {
  anchor: "(tabs)",
};

const lightPaperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    // Popular online palette: Tailwind Blue/Sky/Slate
    primary: "#2563EB",
    onPrimary: "#FFFFFF",
    primaryContainer: "#DBEAFE",
    onPrimaryContainer: "#1E3A8A",
    secondary: "#f3dc67",
    onSecondary: "#FFFFFF",
    secondaryContainer: "#E0F2FE",
    onSecondaryContainer: "#0C4A6E",
    tertiary: "#3B82F6",
    onTertiary: "#FFFFFF",
    tertiaryContainer: "#DBEAFE",
    onTertiaryContainer: "#1E40AF",
    background: "#F8FAFC",
    onBackground: "#0F172A",
    surface: "#FAFBFC",
    onSurface: "#0F172A",
    surfaceVariant: "#E2E8F0",
    onSurfaceVariant: "#334155",
    outline: "#94A3B8",
  },
};

const lightNavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: lightPaperTheme.colors.primary,
    background: lightPaperTheme.colors.background,
    card: lightPaperTheme.colors.surface,
    text: lightPaperTheme.colors.onSurface,
    border: lightPaperTheme.colors.outline,
    notification: lightPaperTheme.colors.tertiary,
  },
};

export default function RootLayout() {
  return (
    <PaperProvider theme={lightPaperTheme}>
      <ThemeProvider value={lightNavigationTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="dashboard" options={{ headerShown: false }} />
          <Stack.Screen name="newUser" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
        </Stack>
        <StatusBar style="dark" />
      </ThemeProvider>
    </PaperProvider>
  );
}
