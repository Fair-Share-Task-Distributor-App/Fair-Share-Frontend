import { Slot, router } from "expo-router";
import React, { useState } from "react";
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Divider, IconButton, List, Text, useTheme } from "react-native-paper";

const { width } = Dimensions.get("window");
const isLargeScreen = width > 768;

export default function DashboardLayout() {
  const theme = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const teams = [
    { id: "1", name: "Development Team", members: 8, color: "#6200ee" },
    { id: "2", name: "Design Team", members: 5, color: "#03dac6" },
    { id: "3", name: "Marketing Team", members: 6, color: "#cf6679" },
    { id: "4", name: "Product Team", members: 4, color: "#ff6d00" },
  ];

  const TeamsSidebar = () => (
    <View
      style={[
        styles.sidebar,
        {
          backgroundColor: theme.colors.surface,
          width: isCollapsed ? 60 : 280,
        },
      ]}
    >
      <View style={styles.sidebarHeader}>
        {!isCollapsed && (
          <Text variant="titleMedium" style={styles.sidebarTitle}>
            Your Teams
          </Text>
        )}
        <IconButton icon={isCollapsed ? "chevron-right" : "chevron-left"} size={20} onPress={() => setIsCollapsed(!isCollapsed)} style={styles.collapseButton} />
      </View>

      {!isCollapsed && <Divider style={styles.divider} />}

      <ScrollView>
        {teams.map((team) => (
          <List.Item
            key={team.id}
            title={isCollapsed ? "" : team.name}
            description={isCollapsed ? "" : `${team.members} members`}
            left={(props) => <View {...props} style={[styles.teamColor, { backgroundColor: team.color }, isCollapsed && styles.teamColorCollapsed]} />}
            titleStyle={styles.teamTitle}
            descriptionStyle={styles.teamDescription}
            style={[styles.teamItem, isCollapsed && styles.teamItemCollapsed]}
            onPress={() => router.push("/dashboard/teams")}
          />
        ))}
        {!isCollapsed && (
          <TouchableOpacity style={styles.viewAllButton} onPress={() => router.push("/dashboard/teams")}>
            <Text style={styles.viewAllText}>View All Teams →</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );

  if (isLargeScreen) {
    return (
      <View style={styles.container}>
        <TeamsSidebar />
        <View style={styles.mainContent}>
          <Slot />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Slot />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  sidebar: {
    borderRightWidth: isLargeScreen ? 1 : 0,
    borderRightColor: "#e0e0e0",
    padding: isLargeScreen ? 16 : 0,
    minWidth: 60,
  },
  sidebarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sidebarTitle: {
    fontWeight: "bold",
    flex: 1,
  },
  collapseButton: {
    margin: 0,
    marginLeft: 8,
  },
  divider: {
    marginBottom: 12,
  },
  mainContent: {
    flex: 1,
  },
  teamColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  teamColorCollapsed: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 0,
  },
  teamItem: {
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  teamItemCollapsed: {
    paddingHorizontal: 8,
    justifyContent: "center",
  },
  teamTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  teamDescription: {
    fontSize: 12,
    opacity: 0.7,
  },
  viewAllButton: {
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.8,
  },
});
