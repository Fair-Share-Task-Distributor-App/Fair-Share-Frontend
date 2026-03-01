import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Appbar, Avatar, Button, Card, Divider, List, Text, useTheme } from "react-native-paper";

export default function ProfileScreen() {
  const theme = useTheme();

  const user = {
    name: "John Doe",
    email: "john.doe@fairshare.com",
    role: "Frontend Developer",
    team: "Development Team",
    joinDate: "January 2024",
    avatar: "JD",
  };

  const stats = [
    { label: "Tasks Completed", value: "42", icon: "check-circle" },
    { label: "Teams", value: "3", icon: "account-group" },
    { label: "Projects", value: "8", icon: "folder" },
  ];

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Profile" />
        <Appbar.Action icon="pencil" onPress={() => console.log("Edit profile")} />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <Avatar.Text size={80} label={user.avatar} style={[styles.avatar, { backgroundColor: theme.colors.primary }]} />
            <View style={styles.userInfo}>
              <Text variant="headlineSmall" style={styles.userName}>
                {user.name}
              </Text>
              <Text variant="bodyLarge" style={styles.userRole}>
                {user.role}
              </Text>
              <Text variant="bodyMedium" style={styles.userTeam}>
                {user.team}
              </Text>
              <Text variant="bodySmall" style={styles.joinDate}>
                Member since {user.joinDate}
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.statsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Statistics
            </Text>
            <View style={styles.statsContainer}>
              {stats.map((stat, index) => (
                <View key={index} style={styles.statItem}>
                  <MaterialDesignIcons name={stat.icon as any} size={24} color={theme.colors.primary} />
                  <Text variant="headlineSmall" style={styles.statValue}>
                    {stat.value}
                  </Text>
                  <Text variant="bodySmall" style={styles.statLabel}>
                    {stat.label}
                  </Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.settingsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Settings
            </Text>

            <List.Item
              title="Account Settings"
              description="Email, password, and security"
              left={() => <MaterialDesignIcons name="account-cog" size={24} color={theme.colors.onSurfaceVariant} />}
              right={() => <MaterialDesignIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />}
              onPress={() => console.log("Account settings")}
            />

            <Divider />

            <List.Item
              title="Notifications"
              description="Manage your notification preferences"
              left={() => <MaterialDesignIcons name="bell-outline" size={24} color={theme.colors.onSurfaceVariant} />}
              right={() => <MaterialDesignIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />}
              onPress={() => console.log("Notifications")}
            />

            <Divider />

            <List.Item
              title="Privacy"
              description="Control your privacy settings"
              left={() => <MaterialDesignIcons name="shield-account-outline" size={24} color={theme.colors.onSurfaceVariant} />}
              right={() => <MaterialDesignIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />}
              onPress={() => console.log("Privacy")}
            />

            <Divider />

            <List.Item
              title="Help & Support"
              description="Get help or contact support"
              left={() => <MaterialDesignIcons name="help-circle-outline" size={24} color={theme.colors.onSurfaceVariant} />}
              right={() => <MaterialDesignIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />}
              onPress={() => console.log("Help & Support")}
            />
          </Card.Content>
        </Card>

        <View style={styles.logoutContainer}>
          <Button mode="outlined" onPress={() => router.replace("/(tabs)")} buttonColor={theme.colors.errorContainer} textColor={theme.colors.onErrorContainer} style={styles.logoutButton}>
            Sign Out
          </Button>
        </View>
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
  profileCard: {
    margin: 16,

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
  userRole: {
    marginBottom: 2,
    opacity: 0.8,
  },
  userTeam: {
    marginBottom: 8,
    opacity: 0.7,
  },
  joinDate: {
    opacity: 0.6,
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 16,

  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontWeight: "bold",
    marginVertical: 4,
  },
  statLabel: {
    textAlign: "center",
    opacity: 0.7,
  },
  settingsCard: {
    marginHorizontal: 16,
    marginBottom: 16,

  },
  logoutContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  logoutButton: {
    borderWidth: 1,
  },
});
