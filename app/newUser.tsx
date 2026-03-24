import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { Button, Card, Text, TextInput } from "react-native-paper";

export default function NewUserIntroScreen() {
  const router = useRouter();
  const [teamName, setTeamName] = React.useState("");

  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  const handleCreateGroup = async () => {
    const token = await SecureStore.getItemAsync("JWT_TOKEN");
    const response = await fetch(`${apiUrl}/api/Team`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: teamName,
      }),
    });

    if (!response.ok) {
      alert("Something went wrong while creating your group. Please try again.");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>
          Welcome to FairShare
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Pick how you want to join and start using the app.
        </Text>

        <Card style={styles.optionCard} mode="elevated">
          <Card.Content>
            <Text variant="titleLarge" style={styles.optionTitle}>
              Create Your Own Group
            </Text>
            <Text variant="bodyMedium" style={styles.optionDescription}>
              Start a new group and invite friends or family to collaborate.
            </Text>
            <TextInput label="Team name" value={teamName} onChangeText={setTeamName} mode="outlined" style={styles.teamNameInput} />
            <Button mode="contained" onPress={handleCreateGroup} style={styles.optionButton} disabled={!teamName.trim()}>
              Create Group
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.optionCard} mode="elevated">
          <Card.Content>
            <Text variant="titleLarge" style={styles.optionTitle}>
              Be Added by Email
            </Text>
            <Text variant="bodyMedium" style={styles.optionDescription}>
              Share this same email with another user and have them add you to their group.
            </Text>
          </Card.Content>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6f7fb",
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    gap: 16,
  },
  title: {
    textAlign: "center",
    fontWeight: "700",
  },
  subtitle: {
    textAlign: "center",
    opacity: 0.8,
    marginBottom: 8,
  },
  optionCard: {
    borderRadius: 16,
    paddingVertical: 10,
  },
  optionTitle: {
    marginBottom: 8,
    fontWeight: "700",
  },
  optionDescription: {
    marginBottom: 10,
    lineHeight: 20,
  },
  teamNameInput: {
    marginBottom: 14,
  },
  optionButton: {
    minHeight: 48,
    justifyContent: "center",
  },
});
