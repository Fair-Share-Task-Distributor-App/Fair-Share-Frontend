import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

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
    secondary: "#0EA5E9",
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

const darkPaperTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#60A5FA",
    onPrimary: "#0B2248",
    primaryContainer: "#1E3A8A",
    onPrimaryContainer: "#DBEAFE",
    secondary: "#38BDF8",
    onSecondary: "#062C41",
    secondaryContainer: "#0C4A6E",
    onSecondaryContainer: "#E0F2FE",
    tertiary: "#93C5FD",
    onTertiary: "#0E2C63",
    tertiaryContainer: "#1E40AF",
    onTertiaryContainer: "#DBEAFE",
    background: "#020617",
    onBackground: "#E2E8F0",
    surface: "#0B1220",
    onSurface: "#E2E8F0",
    surfaceVariant: "#1E293B",
    onSurfaceVariant: "#94A3B8",
    outline: "#64748B",
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

const darkNavigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: darkPaperTheme.colors.primary,
    background: darkPaperTheme.colors.background,
    card: darkPaperTheme.colors.surface,
    text: darkPaperTheme.colors.onSurface,
    border: darkPaperTheme.colors.outline,
    notification: darkPaperTheme.colors.tertiary,
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const paperTheme = colorScheme === "dark" ? darkPaperTheme : lightPaperTheme;
  const navigationTheme = colorScheme === "dark" ? darkNavigationTheme : lightNavigationTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <ThemeProvider value={navigationTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="dashboard" options={{ headerShown: false }} />
          <Stack.Screen name="newUser" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </PaperProvider>
  );
}
