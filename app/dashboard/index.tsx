import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Appbar, Button, Card, Chip, FAB, SegmentedButtons, Text, useTheme } from "react-native-paper";

export default function TasksScreen() {
  const theme = useTheme();
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});
  const [userRatings, setUserRatings] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState("myTasks");
  const [fabOpen, setFabOpen] = useState(false);

  const postedTasks = [
    {
      id: "p1",
      title: "Design mobile app wireframes",
      description: "Create wireframes for new mobile banking app features",
      assignedDate: "2026-02-26",
      dueDate: "2026-03-08",
      pointsWorth: 20,
      skillsRequired: ["UI/UX Design", "Figma"],
    },
    {
      id: "p2",
      title: "Database optimization",
      description: "Optimize SQL queries and improve database performance",
      assignedDate: "2026-02-27",
      dueDate: "2026-03-12",
      pointsWorth: 15,
      skillsRequired: ["SQL", "Database Management"],
    },
    {
      id: "p3",
      title: "API documentation update",
      description: "Update REST API documentation with new endpoints",
      assignedDate: "2026-02-28",
      dueDate: "2026-03-10",
      pointsWorth: 8,
      skillsRequired: ["Technical Writing", "API Design"],
    },
    {
      id: "p4",
      title: "Frontend performance testing",
      description: "Conduct performance tests and identify bottlenecks",
      assignedDate: "2026-03-01",
      dueDate: "2026-03-15",
      pointsWorth: 12,
      skillsRequired: ["Performance Testing", "JavaScript"],
    },
  ];

  const assignedTasks = [
    {
      id: "1",
      title: "Design new login flow",
      description: "Create wireframes and mockups for the updated authentication process",
      priority: "High",
      status: "In Progress",
      team: "Design Team",
      dueDate: "2026-03-05",
      assignedBy: "Sarah Johnson",
    },
    {
      id: "2",
      title: "Implement user authentication API",
      description: "Build secure login and registration endpoints with JWT tokens",
      priority: "High",
      status: "Done",
      team: "Development Team",
      dueDate: "2026-03-10",
      assignedBy: "Mike Chen",
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "#f44336";
      case "Medium":
        return "#ff9800";
      case "Low":
        return "#4caf50";
      default:
        return theme.colors.primary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Done":
        return "#4caf50";
      case "In Progress":
        return "#2196f3";
      case "Review":
        return "#ff9800";
      case "Todo":
        return "#9e9e9e";
      default:
        return theme.colors.primary;
    }
  };

  const toggleDescription = (taskId: string) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const handleTaskCompletion = (taskId: string) => {
    // Here you would typically update the task status in your backend
    console.log(`Marking task ${taskId} as completed`);
    // For demo purposes, we could update local state
    // In a real app, this would trigger an API call
  };

  // Sort posted tasks by newest first (assignedDate descending)
  const sortedPostedTasks = [...postedTasks].sort((a, b) => new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime());

  const tabOptions = [
    { value: "myTasks", label: "My Tasks" },
    { value: "availableTasks", label: "Available Tasks" },
  ];

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Dashboard" />
        <Appbar.Action icon="account-group" onPress={() => router.push("/dashboard/teams")} />
        <Appbar.Action icon="account-circle" onPress={() => router.push("/dashboard/profile")} />
        <Appbar.Action icon="logout" onPress={() => router.replace("/(tabs)")} />
      </Appbar.Header>

      <View style={styles.content}>
        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <SegmentedButtons value={activeTab} onValueChange={setActiveTab} buttons={tabOptions} style={styles.tabButtons} />
        </View>

        {/* My Tasks Tab */}
        {activeTab === "myTasks" && (
          <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text variant="bodyMedium" style={styles.sectionSubtitle}>
                  {assignedTasks.length} task{assignedTasks.length !== 1 ? "s" : ""} assigned to you
                </Text>
              </View>

              {assignedTasks.map((task) => (
                <Card key={task.id} style={styles.taskCard} mode="outlined">
                  <Card.Content>
                    <View style={styles.taskHeader}>
                      <Text variant="titleMedium" style={styles.taskTitle}>
                        {task.title}
                      </Text>
                      <View style={styles.badgeContainer}>
                        <Chip style={[styles.priorityChip, { backgroundColor: getPriorityColor(task.priority) + "20" }]} textStyle={{ color: getPriorityColor(task.priority), fontSize: 10 }} compact>
                          {task.priority}
                        </Chip>
                      </View>
                    </View>

                    <TouchableOpacity onPress={() => toggleDescription(task.id)}>
                      <Text variant="bodyMedium" style={styles.taskDescription} numberOfLines={expandedDescriptions[task.id] ? undefined : 2}>
                        {task.description}
                      </Text>
                    </TouchableOpacity>

                    <View style={styles.taskMeta}>
                      <View style={styles.metaRow}>
                        <MaterialDesignIcons name="calendar-clock" size={14} color={theme.colors.onSurfaceVariant} />
                        <Text variant="bodySmall" style={styles.metaText}>
                          {task.dueDate}
                        </Text>
                      </View>
                      <View style={styles.metaRow}>
                        <MaterialDesignIcons name="account" size={14} color={theme.colors.onSurfaceVariant} />
                        <Text variant="bodySmall" style={styles.metaText}>
                          {task.assignedBy}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.statusContainer}>
                      {task.status === "Done" ? (
                        <Button 
                          mode="contained" 
                          style={[styles.statusButton, { backgroundColor: getStatusColor(task.status) }]} 
                          contentStyle={{ height: 32 }} 
                          labelStyle={{ color: "white", fontSize: 11 }}
                          disabled
                        >
                          ✓
                        </Button>
                      ) : (
                        <Button 
                          mode="outlined" 
                          style={styles.statusButton} 
                          contentStyle={{ height: 32 }} 
                          labelStyle={{ color: getStatusColor(task.status), fontSize: 11 }}
                          onPress={() => handleTaskCompletion(task.id)}
                        >
                          Change Status
                        </Button>
                      )}
                    </View>
                  </Card.Content>
                </Card>
              ))}
            </View>
          </ScrollView>
        )}

        {/* Available Tasks Tab */}
        {activeTab === "availableTasks" && (
          <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text variant="bodyMedium" style={styles.sectionSubtitle}>
                  {sortedPostedTasks.length} tasks available to join
                </Text>
              </View>

              {sortedPostedTasks.map((task) => (
                <Card key={task.id} style={styles.postedTaskCard} mode="outlined">
                  <Card.Content>
                    <View style={styles.taskHeader}>
                      <Text variant="titleMedium" style={styles.taskTitle}>
                        {task.title}
                      </Text>
                      <View style={styles.taskHeaderRight}>
                        <Text variant="bodySmall" style={styles.pointsWorth}>
                          {task.pointsWorth} points
                        </Text>
                        {!userRatings[task.id] && <MaterialDesignIcons name="star" size={20} color="#ff9800" style={styles.newTaskStar} />}
                      </View>
                    </View>

                    <TouchableOpacity onPress={() => toggleDescription(task.id)}>
                      <Text variant="bodyMedium" style={styles.taskDescription} numberOfLines={expandedDescriptions[task.id] ? undefined : 2}>
                        {task.description}
                      </Text>
                    </TouchableOpacity>

                    <View style={styles.taskDates}>
                      <View style={styles.dateRow}>
                        <MaterialDesignIcons name="calendar-plus" size={14} color={theme.colors.onSurfaceVariant} />
                        <Text variant="bodySmall" style={styles.dateText}>
                          Posted: {task.assignedDate}
                        </Text>
                      </View>
                      <View style={styles.dateRow}>
                        <MaterialDesignIcons name="calendar-clock" size={14} color={theme.colors.onSurfaceVariant} />
                        <Text variant="bodySmall" style={styles.dateText}>
                          Due: {task.dueDate}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.skillsContainer}>
                      {task.skillsRequired.map((skill, index) => (
                        <Chip key={index} style={styles.skillChip} compact>
                          {skill}
                        </Chip>
                      ))}
                    </View>
                  </Card.Content>
                </Card>
              ))}

              <Button mode="outlined" onPress={() => router.push("/dashboard/scoring")} style={styles.scoreButton} contentStyle={styles.scoreButtonContent}>
                Score Task Preferences
              </Button>
            </View>
          </ScrollView>
        )}
      </View>

      {/* Multi-Action FAB */}
      <View style={styles.fabContainer}>
        {fabOpen && (
          <>
            <FAB
              icon="calendar"
              size="small"
              style={[styles.fabOption, styles.fabCalendar]}
              onPress={() => {
                console.log("Open calendar");
                setFabOpen(false);
              }}
            />
            <FAB
              icon="plus"
              size="small"
              style={[styles.fabOption, styles.fabAdd]}
              onPress={() => {
                console.log("Add new task");
                setFabOpen(false);
              }}
            />
          </>
        )}
        <FAB icon={fabOpen ? "close" : "menu"} style={styles.fabMain} onPress={() => setFabOpen(!fabOpen)} />
      </View>
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
  tabContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tabButtons: {
    marginBottom: 0,
  },
  tabContent: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionHeader: {
    padding: 4,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  sectionSubtitle: {
    opacity: 0.7,
  },
  postedTaskCard: {
    marginBottom: 8,
    borderRadius: 12,
  },
  taskDates: {
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  dateText: {
    marginLeft: 6,
    opacity: 0.7,
  },
  pointsWorth: {
    opacity: 0.6,
    fontWeight: "600",
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  skillChip: {
    marginRight: 4,
    marginBottom: 4,
  },
  scoreButton: {
    borderRadius: 12,
    marginVertical: 8,
  },
  scoreButtonContent: {
    height: 48,
  },
  taskCard: {
    marginBottom: 12,
    elevation: 4,
    borderRadius: 12,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  taskHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  newTaskStar: {
    marginLeft: 4,
  },
  taskTitle: {
    flex: 1,
    fontWeight: "600",
    marginRight: 8,
  },
  badgeContainer: {
    flexDirection: "row",
  },
  priorityChip: {
    marginLeft: 4,
  },
  taskDescription: {
    marginBottom: 12,
    opacity: 0.8,
    lineHeight: 20,
  },
  taskMeta: {
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  metaText: {
    marginLeft: 6,
    opacity: 0.7,
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  statusButton: {
    marginRight: 4,
    borderRadius: 16,
  },
  fabContainer: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    alignItems: "center",
  },
  fabMain: {
    backgroundColor: "#6200ee",
  },
  fabOption: {
    marginBottom: 12,
    backgroundColor: "#fff",
    elevation: 4,
  },
  fabAdd: {
    // Additional styling for add button if needed
  },
  fabCalendar: {
    // Additional styling for calendar button if needed
  },
});
