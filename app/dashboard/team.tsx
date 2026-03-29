import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Appbar, Button, Card, Text } from "react-native-paper";

import { useUserStore } from "@/stores/user-store";

type TeamMember = {
  accountId: number;
  name: string;
  email: string;
};

type TeamResponse = {
  id: number;
  name: string;
  members: TeamMember[];
};

export default function TeamScreen() {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const setTeamName = useUserStore((state) => state.setTeamName);
  const [team, setTeam] = useState<TeamResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLeavingTeam, setIsLeavingTeam] = useState(false);

  const hasMembers = useMemo(() => (team?.members?.length ?? 0) > 0, [team]);

  const fetchMyTeam = useCallback(
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
        const response = await fetch(`${apiUrl}/api/Team/myteam`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const message = await response.text().catch(() => "");
          throw new Error(message || "Unable to load team details.");
        }

        const payload = (await response.json()) as TeamResponse;
        setTeam(payload);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Unable to load team details.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [apiUrl],
  );

  useEffect(() => {
    void fetchMyTeam();
  }, [fetchMyTeam]);

  const leaveTeam = () => {
    Alert.alert("Leave team?", "You will not be able to join back unless invited again.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: () => {
          const submitLeave = async () => {
            if (!apiUrl) {
              Alert.alert("Leave failed", "API URL is not configured.");
              return;
            }

            try {
              setIsLeavingTeam(true);
              const token = await SecureStore.getItemAsync("JWT_TOKEN");
              const response = await fetch(`${apiUrl}/api/Team/leave`, {
                method: "POST",
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              });

              if (!response.ok) {
                const message = await response.text().catch(() => "");
                throw new Error(message || "Unable to leave team right now.");
              }

              setTeamName("");
              router.replace("/newUser");
            } catch (error) {
              Alert.alert("Leave failed", error instanceof Error ? error.message : "Unable to leave team right now.");
            } finally {
              setIsLeavingTeam(false);
            }
          };

          void submitLeave();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Team" titleStyle={styles.teamNameTitle} />
      </Appbar.Header>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void fetchMyTeam(true)} />}>
        <Card mode="outlined" style={styles.teamCard}>
          <Card.Content>
            <Text variant="labelLarge" style={styles.sectionLabel}>
              Team Name
            </Text>
            <Text variant="headlineSmall" style={styles.teamName}>
              {team?.name ?? "-"}
            </Text>
          </Card.Content>
        </Card>

        {isLoading ? (
          <Card mode="outlined" style={styles.infoCard}>
            <Card.Content>
              <Text variant="bodyMedium">Loading team details...</Text>
            </Card.Content>
          </Card>
        ) : null}

        {!isLoading && errorMessage ? (
          <Card mode="outlined" style={styles.infoCard}>
            <Card.Content>
              <Text variant="titleSmall" style={styles.errorTitle}>
                Could not load team
              </Text>
              <Text variant="bodyMedium">{errorMessage}</Text>
            </Card.Content>
          </Card>
        ) : null}

        {!isLoading && !errorMessage ? (
          <Card mode="outlined" style={styles.membersCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.membersTitle}>
                Team Members ({team?.members?.length ?? 0})
              </Text>

              {hasMembers ? (
                team!.members.map((member) => (
                  <View key={member.accountId} style={styles.memberRow}>
                    <Text variant="titleSmall" style={styles.memberName}>
                      {member.name || "Unnamed"}
                    </Text>
                    <Text variant="bodyMedium" style={styles.memberEmail}>
                      {member.email || "No email"}
                    </Text>
                  </View>
                ))
              ) : (
                <Text variant="bodyMedium" style={styles.noMembersText}>
                  No team members found.
                </Text>
              )}
            </Card.Content>
          </Card>
        ) : null}

        <Button mode="outlined" style={styles.leaveTeamButton} textColor="#B3261E" onPress={leaveTeam} disabled={isLeavingTeam} loading={isLeavingTeam}>
          Leave Team
        </Button>
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
  teamCard: {
    borderRadius: 12,
    marginBottom: 12,
  },
  sectionLabel: {
    opacity: 0.7,
    marginBottom: 6,
  },
  teamName: {
    fontWeight: "700",
  },
  membersCard: {
    borderRadius: 12,
  },
  membersTitle: {
    fontWeight: "600",
    marginBottom: 10,
  },
  memberRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0, 0, 0, 0.12)",
  },
  memberName: {
    fontWeight: "600",
    marginBottom: 2,
  },
  memberEmail: {
    opacity: 0.8,
  },
  noMembersText: {
    opacity: 0.8,
  },
  infoCard: {
    borderRadius: 12,
    marginBottom: 12,
  },
  errorTitle: {
    color: "#B3261E",
    marginBottom: 6,
  },
  leaveTeamButton: {
    marginTop: 16,
    borderColor: "#B3261E",
    alignSelf: "flex-start",
  },
});
