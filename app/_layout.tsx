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
    primary: "#1565C0",
    onPrimary: "#FFFFFF",
    primaryContainer: "#D8E6FF",
    onPrimaryContainer: "#001B3D",
    secondary: "#1E88E5",
    onSecondary: "#FFFFFF",
    secondaryContainer: "#D4E7FF",
    onSecondaryContainer: "#041C33",
    tertiary: "#42A5F5",
    onTertiary: "#FFFFFF",
    tertiaryContainer: "#CDE5FF",
    onTertiaryContainer: "#031B30",
  },
};

const darkPaperTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#90CAF9",
    onPrimary: "#003258",
    primaryContainer: "#004881",
    onPrimaryContainer: "#D1E4FF",
    secondary: "#64B5F6",
    onSecondary: "#003354",
    secondaryContainer: "#194A72",
    onSecondaryContainer: "#D1E4FF",
    tertiary: "#4FC3F7",
    onTertiary: "#003546",
    tertiaryContainer: "#1A4C5F",
    onTertiaryContainer: "#D0F0FF",
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const paperTheme = colorScheme === "dark" ? darkPaperTheme : lightPaperTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} /> <Stack.Screen name="dashboard" options={{ headerShown: false }} /> <Stack.Screen name="newUser" options={{ headerShown: false }} /> <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </PaperProvider>
  );
}
