import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Appbar, Avatar, Button, Card, List, Text, useTheme } from "react-native-paper";

export default function TeamsScreen() {
  const theme = useTheme();

  const teams = [
    {
      id: "1",
      name: "Development Team",
      description: "Frontend and backend developers building the core application",
      members: [
        { id: "1", name: "John Doe", role: "Frontend Developer", avatar: "JD" },
        { id: "2", name: "Jane Smith", role: "Backend Developer", avatar: "JS" },
        { id: "3", name: "Mike Chen", role: "Full Stack Developer", avatar: "MC" },
        { id: "4", name: "Sarah Johnson", role: "Tech Lead", avatar: "SJ" },
      ],
      color: "#6200ee",
    },
    {
      id: "2",
      name: "Design Team",
      description: "UX/UI designers creating beautiful and intuitive user experiences",
      members: [
        { id: "5", name: "Emma Wilson", role: "UX Designer", avatar: "EW" },
        { id: "6", name: "Alex Rodriguez", role: "UI Designer", avatar: "AR" },
        { id: "7", name: "Lisa Park", role: "Design Lead", avatar: "LP" },
      ],
      color: "#03dac6",
    },
    {
      id: "3",
      name: "Product Team",
      description: "Product managers and analysts defining features and requirements",
      members: [
        { id: "8", name: "David Kim", role: "Product Manager", avatar: "DK" },
        { id: "9", name: "Jessica Lee", role: "Product Analyst", avatar: "JL" },
      ],
      color: "#ff6d00",
    },
  ];

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Teams" />
        <Appbar.Action icon="account-plus" onPress={() => console.log("Invite member")} />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Your Teams
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            You're a member of {teams.length} teams
          </Text>
        </View>

        {teams.map((team) => (
          <Card key={team.id} style={styles.teamCard} mode="outlined">
            <Card.Content>
              <View style={styles.teamHeader}>
                <View style={styles.teamInfo}>
                  <View style={[styles.teamColorIndicator, { backgroundColor: team.color }]} />
                  <View style={styles.teamText}>
                    <Text variant="titleLarge" style={styles.teamName}>
                      {team.name}
                    </Text>
                    <Text variant="bodyMedium" style={styles.teamDescription}>
                      {team.description}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.membersSection}>
                <Text variant="titleMedium" style={styles.membersTitle}>
                  Members ({team.members.length})
                </Text>

                <View style={styles.membersList}>
                  {team.members.map((member) => (
                    <List.Item key={member.id} title={member.name} description={member.role} left={() => <Avatar.Text size={40} label={member.avatar} style={{ backgroundColor: team.color }} />} titleStyle={styles.memberName} descriptionStyle={styles.memberRole} />
                  ))}
                </View>
              </View>

              <View style={styles.teamActions}>
                <Button mode="outlined" onPress={() => console.log("View team details")} style={styles.actionButton}>
                  View Details
                </Button>
                <Button mode="contained" onPress={() => console.log("Join team chat")} style={styles.actionButton}>
                  Team Chat
                </Button>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.7,
  },
  teamCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  teamHeader: {
    marginBottom: 16,
  },
  teamInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  teamColorIndicator: {
    width: 4,
    height: 60,
    borderRadius: 2,
    marginRight: 12,
  },
  teamText: {
    flex: 1,
  },
  teamName: {
    fontWeight: "600",
    marginBottom: 4,
  },
  teamDescription: {
    opacity: 0.8,
    lineHeight: 20,
  },
  membersSection: {
    marginBottom: 20,
  },
  membersTitle: {
    fontWeight: "600",
    marginBottom: 8,
  },
  membersList: {
    borderRadius: 8,
    padding: 8,
  },
  memberName: {
    fontSize: 14,
    fontWeight: "500",
  },
  memberRole: {
    fontSize: 12,
    opacity: 0.7,
  },
  teamActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});
