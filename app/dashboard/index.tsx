import { useUserStore } from "@/stores/user-store";
import { Slider } from "@miblanchard/react-native-slider";
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Appbar, Button, Card, Dialog, FAB, Menu, Portal, SegmentedButtons, Text, TextInput, useTheme } from "react-native-paper";

const cardTitleFontFamily = Platform.select({
  ios: "System",
  android: "sans-serif-medium",
  default: "System",
});

const cardBodyFontFamily = Platform.select({
  ios: "System",
  android: "sans-serif",
  default: "System",
});

export default function TasksScreen() {
  const theme = useTheme();
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState("availableTasks");
  const [taskFilter, setTaskFilter] = useState("active");
  const [isFilterMenuVisible, setIsFilterMenuVisible] = useState(false);
  const [assignedTasks, setAssignedTasks] = useState<any[]>([]);
  const [unassignedTasks, setUnassignedTasks] = useState<any[]>([]);
  const [isSubmittingRatings, setIsSubmittingRatings] = useState(false);
  const [ratingDrafts, setRatingDrafts] = useState<Record<string, number>>({});
  const [ratingEditorsOpen, setRatingEditorsOpen] = useState<Record<string, boolean>>({});
  const [isInviteDialogVisible, setIsInviteDialogVisible] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteEmailError, setInviteEmailError] = useState("");
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);
  const teamName = useUserStore((state) => state.teamName);

  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const fetchTasks = async () => {
      const token = await SecureStore.getItemAsync("JWT_TOKEN");
      const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const [myTasksRes, teamTasksRes] = await Promise.all([fetch(`${apiUrl}/api/Task/myTasks`, { method: "GET", headers }), fetch(`${apiUrl}/api/Task/unassignedTasks`, { method: "GET", headers })]);

      if (myTasksRes.ok) {
        setAssignedTasks(await myTasksRes.json());
      }
      if (teamTasksRes.ok) {
        setUnassignedTasks(await teamTasksRes.json());
      }
    };

    void fetchTasks();
  }, [apiUrl]);

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

  const formatDateTime = (value?: string | null) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";

    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatAssignedNames = (assignedAccounts?: { name?: string | null }[]) => {
    if (!Array.isArray(assignedAccounts) || assignedAccounts.length === 0) return "No assignees";

    const names = assignedAccounts.map((account) => account?.name?.trim()).filter((name): name is string => Boolean(name));

    return names.length > 0 ? names.join(", ") : "No assignees";
  };

  const formatPreferenceRating = (value?: number | null) => {
    if (typeof value !== "number" || Number.isNaN(value)) return "Not rated";
    return `${Math.round(value)}/10`;
  };

  const normalizePreferenceRating = (value?: number | null) => {
    if (typeof value !== "number" || Number.isNaN(value)) return null;
    return Math.max(1, Math.min(10, Math.round(value)));
  };

  const getRatingColor = (rating: number) => {
    if (rating <= 3) return "#f44336";
    if (rating <= 6) return "#ff9800";
    return "#4caf50";
  };

  const getReadableRatingTextColor = (rating: number) => {
    if (rating <= 3) return "#B3261E";
    if (rating <= 6) return "#8C4A00";
    return "#1B5E20";
  };

  const getColorWithAlpha = (hexColor: string, alpha: number) => {
    const cleanHex = hexColor.replace("#", "");
    const r = Number.parseInt(cleanHex.slice(0, 2), 16);
    const g = Number.parseInt(cleanHex.slice(2, 4), 16);
    const b = Number.parseInt(cleanHex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const getDisplayedRating = (task: any) => {
    const draftValue = ratingDrafts[task.id];
    if (typeof draftValue === "number") return draftValue;

    const currentValue = normalizePreferenceRating(task.userPreferenceRating);
    return currentValue ?? 5;
  };

  const hasDescription = (value?: string | null) => typeof value === "string" && value.trim().length > 0;

  const handleTaskCompletion = (taskId: string) => {
    Alert.alert("Mark task as done?", "This task will be moved to completed.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Mark Done",
        onPress: () => {
          const updateTask = async () => {
            const token = await SecureStore.getItemAsync("JWT_TOKEN");
            const headers = {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            };

            const response = await fetch(`${apiUrl}/api/Task/${taskId}`, {
              method: "PUT",
              headers,
              body: JSON.stringify({ isCompleted: true }),
            });

            if (!response.ok) {
              Alert.alert("Update failed", "Could not mark task as done. Please try again.");
              return;
            }

            setAssignedTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, isCompleted: true, status: "Done" } : task)));
          };

          void updateTask();
        },
      },
    ]);
  };

  const openInviteDialog = () => {
    setInviteEmail("");
    setInviteEmailError("");
    setIsInviteDialogVisible(true);
  };

  const closeInviteDialog = () => {
    if (isSubmittingInvite) return;
    setIsInviteDialogVisible(false);
    setInviteEmailError("");
  };

  const submitInvite = async () => {
    const trimmedEmail = inviteEmail.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail) {
      setInviteEmailError("Email is required.");
      return;
    }

    if (!emailPattern.test(trimmedEmail)) {
      setInviteEmailError("Enter a valid email address.");
      return;
    }

    try {
      setIsSubmittingInvite(true);

      const token = await SecureStore.getItemAsync("JWT_TOKEN");
      const response = await fetch(`${apiUrl}/api/team/addMembers`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ Emails: [trimmedEmail] }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(errorText || "Unable to add this team member right now.");
      }

      setIsInviteDialogVisible(false);
      setInviteEmail("");
      setInviteEmailError("");
      Alert.alert("Member added", `${trimmedEmail} has been added to ${teamName || "your team"}.`);
    } catch (error) {
      Alert.alert("Add failed", error instanceof Error ? error.message : "Unable to add this team member right now.");
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  // Sort posted tasks by newest first (assignedDate descending)
  const sortedUnassignedTasks = [...unassignedTasks].sort((a, b) => new Date(b.autoAssignAt).getTime() - new Date(a.autoAssignAt).getTime());

  const tabOptions = [
    { value: "availableTasks", label: "Available Tasks" },
    { value: "myTasks", label: "My Tasks" },
  ];

  const taskFilterLabelMap: Record<string, string> = {
    all: "All",
    active: "Active",
    completed: "Completed",
  };

  const selectTaskFilter = (value: string) => {
    setTaskFilter(value);
    setIsFilterMenuVisible(false);
  };

  const filteredAssignedTasks = assignedTasks.filter((task) => {
    if (taskFilter === "active") return task.isCompleted !== true;
    if (taskFilter === "completed") return task.isCompleted === true;
    return true;
  });

  const hasPendingRatingChanges = unassignedTasks.some((task) => {
    const draftValue = ratingDrafts[task.id];
    if (typeof draftValue !== "number") return false;
    return normalizePreferenceRating(task.userPreferenceRating) !== draftValue;
  });

  const toggleRatingEditor = (task: any) => {
    setRatingEditorsOpen((prev) => {
      const willOpen = !prev[task.id];
      if (willOpen && typeof ratingDrafts[task.id] !== "number") {
        const currentRating = normalizePreferenceRating(task.userPreferenceRating) ?? 5;
        setRatingDrafts((draftPrev) => ({ ...draftPrev, [task.id]: currentRating }));
      }
      return { ...prev, [task.id]: willOpen };
    });
  };

  const handleRatingChange = (taskId: string, sliderValue: number) => {
    const nextValue = Math.max(1, Math.min(10, Math.round(sliderValue)));
    setRatingDrafts((prev) => ({
      ...prev,
      [taskId]: nextValue,
    }));
  };

  const submitRatingChanges = async () => {
    const changedTasks = unassignedTasks.filter((task) => {
      const draftValue = ratingDrafts[task.id];
      if (typeof draftValue !== "number") return false;
      return normalizePreferenceRating(task.userPreferenceRating) !== draftValue;
    });

    if (changedTasks.length === 0) {
      Alert.alert("No changes", "Adjust at least one rating before submitting.");
      return;
    }

    try {
      setIsSubmittingRatings(true);

      const token = await SecureStore.getItemAsync("JWT_TOKEN");
      const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      await Promise.all(
        changedTasks.map(async (task) => {
          const response = await fetch(`${apiUrl}/api/TaskPreference/${task.id}`, {
            method: "PUT",
            headers,
            body: JSON.stringify({ score: ratingDrafts[task.id] }),
          });

          if (!response.ok) {
            throw new Error(`Could not update ${task.title ?? "a task"}.`);
          }
        }),
      );

      setUnassignedTasks((prev) =>
        prev.map((task) => {
          const draftValue = ratingDrafts[task.id];
          if (typeof draftValue !== "number") return task;
          if (normalizePreferenceRating(task.userPreferenceRating) === draftValue) return task;
          return {
            ...task,
            userPreferenceRating: draftValue,
          };
        }),
      );

      Alert.alert("Saved", `Updated ${changedTasks.length} rating${changedTasks.length !== 1 ? "s" : ""}.`);
    } catch (error) {
      Alert.alert("Save failed", error instanceof Error ? error.message : "Unable to submit rating changes.");
    } finally {
      setIsSubmittingRatings(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ marginLeft: "auto" }}>
        <Appbar.Content title={teamName} titleStyle={styles.teamNameTitle} />
        <Appbar.Action icon="account-plus" onPress={openInviteDialog} />
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
                  {filteredAssignedTasks.length} task{filteredAssignedTasks.length !== 1 ? "s" : ""} shown
                </Text>
                <Menu
                  visible={isFilterMenuVisible}
                  onDismiss={() => setIsFilterMenuVisible(false)}
                  anchor={
                    <Button mode="outlined" icon="filter-variant" compact onPress={() => setIsFilterMenuVisible(true)}>
                      {taskFilterLabelMap[taskFilter]}
                    </Button>
                  }
                >
                  <Menu.Item title="All" onPress={() => selectTaskFilter("all")} />
                  <Menu.Item title="Active" onPress={() => selectTaskFilter("active")} />
                  <Menu.Item title="Completed" onPress={() => selectTaskFilter("completed")} />
                </Menu>
              </View>

              {filteredAssignedTasks.map((task) => (
                <Card key={task.id} style={styles.taskCard} mode="outlined">
                  <Card.Content>
                    <View style={styles.taskHeader}>
                      <Text variant="titleMedium" style={styles.taskTitle}>
                        {task.title}
                      </Text>
                    </View>

                    {hasDescription(task.description) ? (
                      <TouchableOpacity onPress={() => toggleDescription(task.id)}>
                        <Text variant="bodyMedium" style={styles.taskDescription} numberOfLines={expandedDescriptions[task.id] ? undefined : 2}>
                          {task.description}
                        </Text>
                      </TouchableOpacity>
                    ) : null}

                    <View style={styles.taskMeta}>
                      <View style={styles.metaRow}>
                        <MaterialDesignIcons name="calendar-clock" size={14} color={theme.colors.onSurfaceVariant} />
                        <Text variant="bodySmall" style={styles.metaText}>
                          {formatDateTime(task.dueAt)}
                        </Text>
                      </View>
                      <View style={styles.metaRow}>
                        <MaterialDesignIcons name="account-group" size={14} color={theme.colors.onSurfaceVariant} />
                        <Text variant="bodySmall" style={styles.metaText}>
                          Assigned To: {formatAssignedNames(task.assignedAccounts)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.statusContainer}>
                      {task.isCompleted === true ? (
                        <Button mode="contained" style={[styles.statusButton, { backgroundColor: getStatusColor(task.status) }]} labelStyle={{ color: "white", fontSize: 15 }} disabled>
                          ✓
                        </Button>
                      ) : (
                        <Button mode="outlined" style={[styles.statusButton, styles.ratingToggleButton]} contentStyle={styles.ratingToggleButtonContent} labelStyle={[styles.ratingToggleButtonLabel, { color: getStatusColor(task.status) }]} onPress={() => handleTaskCompletion(task.id)}>
                          Mark Done
                        </Button>
                      )}
                    </View>
                  </Card.Content>
                </Card>
              ))}

              {filteredAssignedTasks.length === 0 ? (
                <Card style={styles.emptyStateCard} mode="outlined">
                  <Card.Content>
                    <Text variant="titleMedium" style={styles.emptyStateTitle}>
                      No tasks yet
                    </Text>
                    <Text variant="bodyMedium" style={styles.emptyStateText}>
                      You do not have tasks assigned currently. Try switching filters or check Available Tasks.
                    </Text>
                    <Button mode="outlined" onPress={() => setTaskFilter("all")} style={styles.emptyStateButton}>
                      Show All
                    </Button>
                  </Card.Content>
                </Card>
              ) : null}
            </View>
          </ScrollView>
        )}

        {/* Available Tasks Tab */}
        {activeTab === "availableTasks" && (
          <ScrollView style={styles.tabContent} contentContainerStyle={styles.availableTasksContent} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text variant="bodyMedium" style={styles.sectionSubtitle}>
                  {sortedUnassignedTasks.length} tasks available to join
                </Text>
              </View>

              {sortedUnassignedTasks.map((task) => (
                <Card key={task.id} style={styles.postedTaskCard} mode="outlined">
                  <Card.Content>
                    {/** Keep the preference pill highlight in the same color family as the current slider value. */}
                    {(() => {
                      const displayedRating = getDisplayedRating(task);
                      const ratingColor = getRatingColor(displayedRating);
                      const ratingTextColor = getReadableRatingTextColor(displayedRating);

                      return (
                        <>
                          <View style={styles.taskHeader}>
                            <Text variant="titleMedium" style={styles.taskTitle}>
                              {task.title}
                            </Text>
                            <View style={styles.taskHeaderRight}>
                              <Text variant="bodyMedium" style={styles.pointsWorth}>
                                {task.points} points
                              </Text>
                            </View>
                          </View>

                          {hasDescription(task.description) ? (
                            <TouchableOpacity onPress={() => toggleDescription(task.id)}>
                              <Text variant="bodyMedium" style={styles.taskDescription} numberOfLines={expandedDescriptions[task.id] ? undefined : 2}>
                                {task.description}
                              </Text>
                            </TouchableOpacity>
                          ) : null}

                          <View style={styles.taskDates}>
                            <View style={styles.dateRow}>
                              <MaterialDesignIcons name="calendar-clock" size={14} color={theme.colors.onSurfaceVariant} />
                              <Text variant="bodySmall" style={styles.dateText}>
                                Due: {formatDateTime(task.dueAt)}
                              </Text>
                            </View>
                            <View style={[styles.metaRow, styles.metaRowTightBottom]}>
                              <MaterialDesignIcons name="clock-outline" size={14} color={theme.colors.onSurfaceVariant} />
                              <Text variant="bodySmall" style={styles.metaText}>
                                Auto-assign: {formatDateTime(task.autoAssignedAt ?? task.autoAssignAt)}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.unassignedActionRow}>
                            <View style={[styles.ratingPill, { backgroundColor: getColorWithAlpha(ratingColor, 0.16), borderColor: ratingColor }]}>
                              <Text variant="bodyMedium" style={[styles.ratingPillText, { color: ratingTextColor }]}>
                                Preference: {formatPreferenceRating(displayedRating)}
                              </Text>
                            </View>
                            <Button mode="outlined" style={[styles.statusButton, styles.ratingToggleButton]} contentStyle={styles.ratingToggleButtonContent} labelStyle={styles.ratingToggleButtonLabel} onPress={() => toggleRatingEditor(task)}>
                              {ratingEditorsOpen[task.id] ? "Hide" : "Rate"}
                            </Button>
                          </View>

                          {ratingEditorsOpen[task.id] ? (
                            <View style={styles.inlineScoringContainer}>
                              <View style={styles.inlineScoringHeader}>
                                <Text variant="bodySmall" style={styles.inlineScoringLabel}>
                                  Adjust Preference
                                </Text>
                              </View>
                              <Slider
                                containerStyle={styles.inlineSlider}
                                value={displayedRating}
                                onValueChange={(value) => handleRatingChange(task.id, value[0])}
                                minimumValue={1}
                                maximumValue={10}
                                step={1}
                                thumbStyle={{ backgroundColor: ratingColor }}
                                trackStyle={{ backgroundColor: theme.colors.surfaceVariant }}
                              />
                              <View style={styles.inlineScoringEnds}>
                                <Text variant="bodySmall" style={styles.inlineScoringEndText}>
                                  1 Low
                                </Text>
                                <Text variant="bodySmall" style={styles.inlineScoringEndText}>
                                  10 High
                                </Text>
                              </View>
                            </View>
                          ) : null}
                        </>
                      );
                    })()}
                  </Card.Content>
                </Card>
              ))}

              {sortedUnassignedTasks.length === 0 ? (
                <Card style={styles.emptyStateCard} mode="outlined">
                  <Card.Content>
                    <Text variant="titleMedium" style={styles.emptyStateTitle}>
                      No available tasks
                    </Text>
                    <Text variant="bodyMedium" style={styles.emptyStateText}>
                      Nothing is going on right now. Create a task and your team can rate it here.
                    </Text>
                    <Button mode="contained" onPress={() => router.push("/dashboard/newTask")} style={styles.emptyStateButton}>
                      Create Task
                    </Button>
                  </Card.Content>
                </Card>
              ) : null}
            </View>
          </ScrollView>
        )}

        {activeTab === "availableTasks" && (
          <View style={styles.submitChangesDock}>
            <Button mode="contained" onPress={() => void submitRatingChanges()} style={styles.submitChangesButton} contentStyle={styles.submitChangesButtonContent} disabled={!hasPendingRatingChanges || isSubmittingRatings} loading={isSubmittingRatings}>
              Submit All Changes
            </Button>
          </View>
        )}
      </View>

      {/* Create new task */}
      <View style={[styles.fabContainer, activeTab === "availableTasks" && styles.fabContainerRaised]}>
        <FAB icon={"plus"} color="#FFFFFF" customSize={64} style={[styles.fabMain, { backgroundColor: theme.colors.primary }]} onPress={() => router.push("/dashboard/newTask")} />
      </View>

      <Portal>
        <Dialog visible={isInviteDialogVisible} onDismiss={closeInviteDialog}>
          <Dialog.Title>Add Team Member</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={styles.inviteDialogCopy}>
              Enter the email address of the person you want to add.
            </Text>
            <TextInput
              mode="outlined"
              label="Email"
              value={inviteEmail}
              onChangeText={(text) => {
                setInviteEmail(text);
                if (inviteEmailError) {
                  setInviteEmailError("");
                }
              }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              error={Boolean(inviteEmailError)}
            />
            {inviteEmailError ? <Text style={styles.inviteDialogError}>{inviteEmailError}</Text> : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeInviteDialog} disabled={isSubmittingInvite}>
              Cancel
            </Button>
            <Button mode="contained" onPress={() => void submitInvite()} loading={isSubmittingInvite} disabled={isSubmittingInvite}>
              Add
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f3f9",
  },
  content: {
    flex: 1,
  },
  teamNameTitle: {
    fontSize: 25,
    fontWeight: "700",
    letterSpacing: 0.4,
    marginRight: 8,
  },
  inviteDialogCopy: {
    marginBottom: 12,
    opacity: 0.8,
  },
  inviteDialogError: {
    marginTop: 8,
    color: "#B3261E",
  },
  tabContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabButtons: {
    marginBottom: 0,
  },
  tabContent: {
    flex: 1,
  },
  availableTasksContent: {
    paddingBottom: 96,
  },
  section: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 16,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  sectionSubtitle: {
    opacity: 0.7,
  },
  postedTaskCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  taskDates: {
    marginBottom: 6,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  dateText: {
    marginLeft: 6,
    opacity: 0.7,
    fontFamily: cardBodyFontFamily,
    letterSpacing: 0.15,
  },
  pointsWorth: {
    opacity: 0.6,
    fontWeight: "600",
    fontFamily: cardBodyFontFamily,
    letterSpacing: 0.2,
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
    marginBottom: 12,
  },
  taskHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  newTaskStar: {
    marginLeft: 4,
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderWidth: 1,
    minHeight: 34,
    paddingHorizontal: 8,
    paddingVertical: 0,
    borderRadius: 999,
  },
  ratingPillText: {
    fontWeight: "600",
    fontFamily: cardBodyFontFamily,
    letterSpacing: 0.2,
  },
  taskTitle: {
    flex: 1,
    fontWeight: "600",
    fontFamily: cardTitleFontFamily,
    letterSpacing: 0.2,
  },
  badgeContainer: {
    flexDirection: "row",
  },
  priorityChip: {
    marginLeft: 4,
  },
  taskDescription: {
    marginBottom: 8,
    opacity: 0.8,
    lineHeight: 20,
    fontFamily: cardBodyFontFamily,
    letterSpacing: 0.15,
  },
  taskMeta: {
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  metaText: {
    marginLeft: 6,
    opacity: 0.7,
    fontFamily: cardBodyFontFamily,
    letterSpacing: 0.15,
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  unassignedActionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  metaRowTightBottom: {
    marginBottom: 2,
  },
  inlineScoringContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0, 0, 0, 0.12)",
  },
  inlineScoringHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  inlineScoringLabel: {
    opacity: 0.75,
  },
  inlineScoringValue: {
    fontWeight: "700",
  },
  currentRatingValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  inlineSlider: {
    height: 38,
  },
  inlineScoringEnds: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  inlineScoringEndText: {
    opacity: 0.65,
  },
  statusButton: {
    marginRight: 4,
    borderRadius: 16,
  },
  ratingToggleButton: {
    minHeight: 34,
  },
  ratingToggleButtonContent: {
    height: 34,
  },
  ratingToggleButtonLabel: {
    fontSize: 12,
    lineHeight: 16,
    marginVertical: 0,
    includeFontPadding: false,
  },
  submitChangesButton: {
    borderRadius: 12,
    marginBottom: 8,
  },
  submitChangesButtonContent: {
    height: 46,
  },
  submitChangesDock: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    zIndex: 20,
  },
  fabContainer: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    alignItems: "center",
  },
  fabContainerRaised: {
    bottom: 74,
  },
  fabMain: {
    // Background color is bound to theme.colors.primary at render time.
  },
  emptyStateCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  emptyStateTitle: {
    fontWeight: "600",
    marginBottom: 6,
  },
  emptyStateText: {
    opacity: 0.8,
    lineHeight: 20,
  },
  emptyStateButton: {
    marginTop: 12,
    alignSelf: "flex-start",
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
