import { useUserStore } from "@/stores/user-store";
import { disableCalendarSync } from "@/utils/googleCalendarSync";
import { Slider } from "@miblanchard/react-native-slider";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Appbar, Button, Card, Dialog, FAB, IconButton, Menu, Portal, SegmentedButtons, Text, TextInput, useTheme } from "react-native-paper";

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
  const [isEditDialogVisible, setIsEditDialogVisible] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPoints, setEditPoints] = useState("");
  const [editFormError, setEditFormError] = useState("");
  const [isSubmittingTaskEdit, setIsSubmittingTaskEdit] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const clearUserProfile = useUserStore((s) => s.clearUserProfile);

  const handleSignOut = async () => {
    try {
      // Disable calendar sync and clear any Google state
      await disableCalendarSync();

      // Try to revoke Google access and sign out (ignore errors)
      try {
        await GoogleSignin.hasPlayServices();
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
      } catch (err) {
        console.warn("Google sign-out/revoke failed:", err);
      }

      // Clear stored JWT and local profile
      await SecureStore.deleteItemAsync("JWT_TOKEN");
      clearUserProfile();

      // Navigate back to auth/login flow
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Sign out failed:", error);
      Alert.alert("Sign out failed", "Please try again.");
    }
  };

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

  const parseUtcDate = (value?: string | null) => {
    if (!value) return null;

    const normalizedValue = /(?:Z|[+-]\d{2}:\d{2})$/i.test(value) ? value : `${value}Z`;
    const parsedDate = new Date(normalizedValue);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  };

  const formatDateTime = (value?: string | null) => {
    const date = parseUtcDate(value);
    if (!date) return "N/A";

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

  const openEditDialog = (task: any) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title ?? "");
    setEditDescription(task.description ?? "");
    setEditPoints(typeof task.points === "number" ? String(task.points) : "");
    setEditFormError("");
    setIsEditDialogVisible(true);
  };

  const closeEditDialog = () => {
    if (isSubmittingTaskEdit) return;
    setIsEditDialogVisible(false);
    setEditingTaskId(null);
    setEditFormError("");
  };

  const submitTaskUpdate = async () => {
    if (!editingTaskId) return;

    const trimmedTitle = editTitle.trim();
    const trimmedDescription = editDescription.trim();
    const parsedPoints = Number(editPoints.trim());

    if (!trimmedTitle) {
      setEditFormError("Title is required.");
      return;
    }

    if (!Number.isInteger(parsedPoints) || parsedPoints < 1 || parsedPoints > 100) {
      setEditFormError("Points must be a whole number between 1 and 100.");
      return;
    }

    try {
      setIsSubmittingTaskEdit(true);
      const token = await SecureStore.getItemAsync("JWT_TOKEN");
      const response = await fetch(`${apiUrl}/api/Task/${editingTaskId}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: trimmedTitle,
          description: trimmedDescription || null,
          points: parsedPoints,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(errorText || "Unable to update task.");
      }

      setAssignedTasks((prev) =>
        prev.map((task) =>
          task.id === editingTaskId
            ? {
                ...task,
                title: trimmedTitle,
                description: trimmedDescription || null,
                points: parsedPoints,
              }
            : task,
        ),
      );

      setUnassignedTasks((prev) =>
        prev.map((task) =>
          task.id === editingTaskId
            ? {
                ...task,
                title: trimmedTitle,
                description: trimmedDescription || null,
                points: parsedPoints,
              }
            : task,
        ),
      );

      setIsEditDialogVisible(false);
      setEditingTaskId(null);
      setEditFormError("");
      Alert.alert("Task updated", "Your changes have been saved.");
    } catch (error) {
      setEditFormError(error instanceof Error ? error.message : "Unable to update task.");
    } finally {
      setIsSubmittingTaskEdit(false);
    }
  };

  const handleTaskDelete = (taskId: string) => {
    if (deletingTaskId) return;

    Alert.alert("Delete task?", "This will permanently remove the task.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          const deleteTask = async () => {
            try {
              setDeletingTaskId(taskId);
              const token = await SecureStore.getItemAsync("JWT_TOKEN");
              const response = await fetch(`${apiUrl}/api/Task/${taskId}`, {
                method: "DELETE",
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              });

              if (!response.ok) {
                const errorText = await response.text().catch(() => "");
                throw new Error(errorText || "Unable to delete task.");
              }

              setAssignedTasks((prev) => prev.filter((task) => task.id !== taskId));
              setUnassignedTasks((prev) => prev.filter((task) => task.id !== taskId));
              Alert.alert("Task deleted", "The task was removed successfully.");
            } catch (error) {
              Alert.alert("Delete failed", error instanceof Error ? error.message : "Unable to delete task.");
            } finally {
              setDeletingTaskId(null);
            }
          };

          void deleteTask();
        },
      },
    ]);
  };

  // Sort posted tasks by newest first (assignedDate descending)
  const sortedUnassignedTasks = [...unassignedTasks].sort((a, b) => {
    const bTime = parseUtcDate(b.autoAssignAt)?.getTime() ?? 0;
    const aTime = parseUtcDate(a.autoAssignAt)?.getTime() ?? 0;
    return bTime - aTime;
  });

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
        <Appbar.Content title="Home" titleStyle={styles.teamNameTitle} />
        <Appbar.Action icon="logout" onPress={handleSignOut} />
      </Appbar.Header>

      <View style={styles.content}>
        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <SegmentedButtons value={activeTab} onValueChange={setActiveTab} buttons={tabOptions} style={styles.tabButtons} />
        </View>

        {/* My Tasks Tab */}
        {activeTab === "myTasks" && (
          <ScrollView style={styles.tabContent} contentContainerStyle={styles.defaultTabContent} showsVerticalScrollIndicator={false}>
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
                      <Text variant="titleLarge" style={styles.taskTitle}>
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
                    <Text variant="titleLarge" style={styles.emptyStateTitle}>
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
                            <Text variant="titleLarge" style={styles.taskTitle}>
                              {task.title}
                            </Text>
                            <View style={styles.taskHeaderRight}>
                              <IconButton icon="pencil" size={18} onPress={() => openEditDialog(task)} disabled={deletingTaskId === task.id} style={styles.taskIconAction} />
                              <IconButton icon="trash-can-outline" size={18} iconColor="#B3261E" onPress={() => handleTaskDelete(task.id)} disabled={deletingTaskId === task.id} style={styles.taskIconAction} />
                            </View>
                          </View>

                          {hasDescription(task.description) ? (
                            <TouchableOpacity onPress={() => toggleDescription(task.id)}>
                              <Text variant="bodyMedium" style={styles.taskDescription} numberOfLines={expandedDescriptions[task.id] ? undefined : 2}>
                                {task.description}
                              </Text>
                            </TouchableOpacity>
                          ) : null}

                          <Text variant="bodyMedium" style={styles.pointsWorth}>
                            {task.points} points
                          </Text>

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
                    <Text variant="titleLarge" style={styles.emptyStateTitle}>
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

        {activeTab === "availableTasks" && hasPendingRatingChanges && (
          <View style={styles.submitChangesDock}>
            <Button mode="contained" onPress={() => void submitRatingChanges()} style={styles.submitChangesButton} contentStyle={styles.submitChangesButtonContent} disabled={isSubmittingRatings} loading={isSubmittingRatings}>
              Submit Ratings
            </Button>
          </View>
        )}
      </View>

      {/* Create new task */}
      <View style={[styles.fabContainer, styles.fabContainerRaised, activeTab === "availableTasks" && hasPendingRatingChanges && styles.fabContainerWithSubmit]}>
        <View style={styles.fabStack}>
          <FAB icon={"plus"} color="#FFFFFF" customSize={64} style={[styles.fabMain, { backgroundColor: theme.colors.primary }]} onPress={() => router.push("/dashboard/newTask")} />
        </View>
      </View>

      <Portal>
        <Dialog visible={isEditDialogVisible} onDismiss={closeEditDialog}>
          <Dialog.Title>Edit Task</Dialog.Title>
          <Dialog.Content>
            <TextInput mode="outlined" label="Title" value={editTitle} onChangeText={setEditTitle} style={styles.editDialogField} disabled={isSubmittingTaskEdit} />
            <TextInput mode="outlined" label="Description" value={editDescription} onChangeText={setEditDescription} multiline numberOfLines={3} style={styles.editDialogField} disabled={isSubmittingTaskEdit} />
            <TextInput mode="outlined" label="Points" value={editPoints} onChangeText={setEditPoints} keyboardType="number-pad" style={styles.editDialogField} disabled={isSubmittingTaskEdit} />
            {editFormError ? <Text style={styles.editDialogError}>{editFormError}</Text> : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeEditDialog} disabled={isSubmittingTaskEdit}>
              Cancel
            </Button>
            <Button mode="contained" onPress={() => void submitTaskUpdate()} loading={isSubmittingTaskEdit} disabled={isSubmittingTaskEdit}>
              Save
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
  fabStack: {
    alignItems: "center",
    gap: 12,
  },
  teamNameTitle: {
    fontSize: 25,
    fontWeight: "700",
    letterSpacing: 0.4,
    marginRight: 8,
  },
  editDialogField: {
    marginTop: 10,
  },
  editDialogError: {
    marginTop: 10,
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
  defaultTabContent: {
    paddingBottom: 128,
  },
  availableTasksContent: {
    paddingBottom: 156,
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
    marginBottom: 8,
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
    gap: 0,
  },
  taskIconAction: {
    margin: 0,
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
  deleteTaskButton: {
    borderColor: "#B3261E",
  },
  deleteTaskButtonLabel: {
    color: "#B3261E",
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
    bottom: 88,
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
    bottom: 78,
  },
  fabContainerWithSubmit: {
    bottom: 142,
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
