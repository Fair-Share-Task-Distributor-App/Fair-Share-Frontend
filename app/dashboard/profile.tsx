import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Appbar, Avatar, Card, Text } from "react-native-paper";

type ProfileResponse = {
  name: string;
  email: string;
  password: string;
  points: number;
  tasksAssigned: number;
};

export default function ProfileScreen() {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const avatarLabel = useMemo(() => {
    const source = profile?.name?.trim();
    if (!source) return "?";
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }, [profile?.name]);

  const fetchProfile = useCallback(
    async (isPullRefresh = false) => {
      if (!apiUrl) {
        setErrorMessage("API URL is not configured.");
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      try {
        if (isPullRefresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }
        setErrorMessage("");

        const token = await SecureStore.getItemAsync("JWT_TOKEN");
        if (!token) {
          throw new Error("You are not authenticated. Please sign in again.");
        }

        const response = await fetch(`${apiUrl}/api/Account/me`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const message = await response.text().catch(() => "");
          throw new Error(message || "Unable to load profile.");
        }

        const payload = (await response.json()) as ProfileResponse;
        setProfile(payload);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Unable to load profile.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [apiUrl],
  );

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Profile" titleStyle={styles.teamNameTitle} />
      </Appbar.Header>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void fetchProfile(true)} />}>
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <Avatar.Text size={80} label={avatarLabel} style={styles.avatar} />
            <View style={styles.userInfo}>
              <Text variant="headlineSmall" style={styles.userName}>
                {profile?.name ?? "-"}
              </Text>
              <Text variant="bodyLarge" style={styles.userEmail}>
                {profile?.email ?? "-"}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {isLoading ? (
          <Card style={styles.infoCard}>
            <Card.Content>
              <Text variant="bodyMedium">Loading profile...</Text>
            </Card.Content>
          </Card>
        ) : null}

        {!isLoading && errorMessage ? (
          <Card style={styles.infoCard}>
            <Card.Content>
              <Text variant="titleSmall" style={styles.errorTitle}>
                Could not load profile
              </Text>
              <Text variant="bodyMedium">{errorMessage}</Text>
            </Card.Content>
          </Card>
        ) : null}

        {!isLoading && !errorMessage ? (
          <Card style={styles.detailsCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                My Profile
              </Text>

              <View style={styles.detailRow}>
                <Text variant="labelLarge" style={styles.detailLabel}>
                  Name
                </Text>
                <Text variant="bodyLarge">{profile?.name ?? "-"}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text variant="labelLarge" style={styles.detailLabel}>
                  Email
                </Text>
                <Text variant="bodyLarge">{profile?.email ?? "-"}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text variant="labelLarge" style={styles.detailLabel}>
                  Password
                </Text>
                <TouchableOpacity onPress={() => setIsPasswordVisible((prev) => !prev)} activeOpacity={0.8} style={styles.passwordTapArea}>
                  <Text variant="bodyLarge">{isPasswordVisible ? (profile?.password ?? "-") : "••••••••"}</Text>
                  <Text variant="bodySmall" style={styles.passwordHint}>
                    {isPasswordVisible ? "Tap to hide" : "Tap to show"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.detailRow}>
                <Text variant="labelLarge" style={styles.detailLabel}>
                  Points
                </Text>
                <Text variant="bodyLarge">{profile?.points ?? 0}</Text>
              </View>

              <View style={[styles.detailRow, styles.detailRowLast]}>
                <Text variant="labelLarge" style={styles.detailLabel}>
                  Tasks Assigned
                </Text>
                <Text variant="bodyLarge">{profile?.tasksAssigned ?? 0}</Text>
              </View>
            </Card.Content>
          </Card>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  teamNameTitle: {
    fontSize: 25,
    fontWeight: "700",
    letterSpacing: 0.4,
    marginRight: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 28,
  },
  profileCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  profileContent: {
    alignItems: "center",
    paddingVertical: 20,
  },
  avatar: {
    marginBottom: 16,
  },
  userInfo: {
    alignItems: "center",
  },
  userName: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  userEmail: {
    opacity: 0.8,
  },
  detailsCard: {
    borderRadius: 12,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: 12,
  },
  detailRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0, 0, 0, 0.14)",
  },
  detailRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  detailLabel: {
    opacity: 0.7,
    marginBottom: 2,
  },
  passwordTapArea: {
    alignSelf: "flex-start",
  },
  passwordHint: {
    opacity: 0.65,
    marginTop: 2,
  },
  infoCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  errorTitle: {
    color: "#B3261E",
    marginBottom: 6,
  },
});
