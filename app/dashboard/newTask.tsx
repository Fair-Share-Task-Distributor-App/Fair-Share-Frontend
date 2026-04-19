import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useState } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { Appbar, Button, Card, HelperText, Text, TextInput } from "react-native-paper";

type NewTaskForm = {
  title: string;
  description: string;
  dueAt: Date | null;
  autoAssignAt: Date | null;
  points: string;
};

type DateField = "dueAt" | "autoAssignAt";

export default function NewTaskScreen() {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  const [form, setForm] = useState<NewTaskForm>({
    title: "",
    description: "",
    dueAt: null,
    autoAssignAt: null,
    points: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof NewTaskForm, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeDateField, setActiveDateField] = useState<DateField | null>(null);
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");

  const updateField = (field: keyof NewTaskForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const formatDateTime = (value: Date | null) => {
    if (!value) return "Not set";
    return value.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const mergeDateValue = (current: Date | null, picked: Date, mode: "date" | "time") => {
    const base = current ?? new Date();

    if (mode === "date") {
      return new Date(picked.getFullYear(), picked.getMonth(), picked.getDate(), base.getHours(), base.getMinutes(), 0, 0);
    }

    return new Date(base.getFullYear(), base.getMonth(), base.getDate(), picked.getHours(), picked.getMinutes(), 0, 0);
  };

  const toIsoFormatInUTCTime = (value: Date) => {
    return value.toISOString();
  };

  const openPicker = (field: DateField, mode: "date" | "time") => {
    setActiveDateField(field);
    setPickerMode(mode);
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const onDateTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (!activeDateField) return;

    if (Platform.OS === "android") {
      setActiveDateField(null);
    }

    if (event.type === "dismissed" || !selectedDate) return;

    setForm((prev) => ({
      ...prev,
      [activeDateField]: mergeDateValue(prev[activeDateField], selectedDate, pickerMode),
    }));
  };

  const validateForm = () => {
    const nextErrors: Partial<Record<keyof NewTaskForm, string>> = {};

    const trimmedTitle = form.title.trim();
    if (!trimmedTitle) {
      nextErrors.title = "Title is required.";
    } else if (trimmedTitle.length > 200) {
      nextErrors.title = "Title must be 200 characters or fewer.";
    }

    const trimmedDescription = form.description.trim();
    if (trimmedDescription.length > 1000) {
      nextErrors.description = "Description must be 1000 characters or fewer.";
    }

    const dueAtDate = form.dueAt;
    if (!dueAtDate) {
      nextErrors.dueAt = "DueAt is required.";
    }

    const autoAssignDate = form.autoAssignAt;
    if (!autoAssignDate) {
      nextErrors.autoAssignAt = "AutoAssignAt is required.";
    }

    if (dueAtDate && autoAssignDate && autoAssignDate.getTime() > dueAtDate.getTime()) {
      nextErrors.autoAssignAt = "AutoAssignAt should be earlier than or equal to DueAt.";
    }

    const pointsNumber = Number(form.points.trim());
    if (!form.points.trim()) {
      nextErrors.points = "Points is required.";
    } else if (!Number.isInteger(pointsNumber)) {
      nextErrors.points = "Points must be a whole number.";
    } else if (pointsNumber < 1 || pointsNumber > 100) {
      nextErrors.points = "Points must be between 1 and 100.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submitTask = async () => {
    if (!validateForm()) return;

    if (!apiUrl) {
      setErrors((prev) => ({ ...prev, title: "API URL is not configured." }));
      return;
    }

    try {
      setIsSubmitting(true);
      const dueAt = form.dueAt ? toIsoFormatInUTCTime(form.dueAt) : undefined;
      const autoAssignAt = form.autoAssignAt ? toIsoFormatInUTCTime(form.autoAssignAt) : undefined;
      const token = await SecureStore.getItemAsync("JWT_TOKEN");
      const response = await fetch(`${apiUrl}/api/Task`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim() ? form.description.trim() : null,
          dueAt,
          autoAssignAt,
          points: Number(form.points.trim()),
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Unable to create task.");
      }

      router.back();
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        title: error instanceof Error ? error.message : "Unable to create task.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Create Task" titleStyle={styles.teamNameTitle} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.formCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              New Task Details
            </Text>

            <TextInput mode="outlined" label="Title *" value={form.title} onChangeText={(value) => updateField("title", value)} maxLength={200} error={Boolean(errors.title)} style={styles.field} />
            <HelperText type="error" visible={Boolean(errors.title)}>
              {errors.title}
            </HelperText>

            <TextInput mode="outlined" label="Description" value={form.description} onChangeText={(value) => updateField("description", value)} maxLength={1000} multiline numberOfLines={4} error={Boolean(errors.description)} style={styles.field} />
            <HelperText type="error" visible={Boolean(errors.description)}>
              {errors.description}
            </HelperText>

            <View style={styles.pickerField}>
              <Text variant="labelLarge">Due Date *</Text>
              <Text variant="bodyMedium" style={styles.pickerValueText}>
                {formatDateTime(form.dueAt)}
              </Text>
              <View style={styles.pickerActionsRow}>
                <Button mode="outlined" onPress={() => openPicker("dueAt", "date")}>
                  Pick Date
                </Button>
                <Button mode="outlined" onPress={() => openPicker("dueAt", "time")}>
                  Pick Time
                </Button>
              </View>
            </View>
            <HelperText type="error" visible={Boolean(errors.dueAt)}>
              {errors.dueAt}
            </HelperText>

            <View style={styles.pickerField}>
              <Text variant="labelLarge">Auto-Assign Date *</Text>
              <Text variant="bodyMedium" style={styles.pickerValueText}>
                {formatDateTime(form.autoAssignAt)}
              </Text>
              <View style={styles.pickerActionsRow}>
                <Button mode="outlined" onPress={() => openPicker("autoAssignAt", "date")}>
                  Pick Date
                </Button>
                <Button mode="outlined" onPress={() => openPicker("autoAssignAt", "time")}>
                  Pick Time
                </Button>
              </View>
            </View>
            <HelperText type="error" visible={Boolean(errors.autoAssignAt)}>
              {errors.autoAssignAt}
            </HelperText>

            {activeDateField ? (
              <View style={styles.pickerContainer}>
                <DateTimePicker value={form[activeDateField] ?? new Date()} mode={pickerMode} is24Hour display={Platform.OS === "ios" ? "spinner" : "default"} onChange={onDateTimeChange} />
                {Platform.OS === "ios" ? (
                  <Button mode="text" onPress={() => setActiveDateField(null)}>
                    Done
                  </Button>
                ) : null}
              </View>
            ) : null}

            <Text variant="bodySmall" style={styles.pointsExplanation}>
              Points represent the amount of work required for this task and are used to distribute tasks fairly.
            </Text>

            <TextInput mode="outlined" label="Points*" value={form.points} onChangeText={(value) => updateField("points", value)} keyboardType="number-pad" error={Boolean(errors.points)} style={styles.field} />
            <HelperText type="error" visible={Boolean(errors.points)}>
              {errors.points}
            </HelperText>

            <Button mode="contained" onPress={() => void submitTask()} loading={isSubmitting} disabled={isSubmitting} style={styles.submitButton}>
              Create New Task
            </Button>
          </Card.Content>
        </Card>
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
    padding: 16,
    paddingBottom: 28,
  },
  formCard: {
    borderRadius: 12,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: "600",
  },
  field: {
    marginTop: 8,
  },
  pickerField: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0, 0, 0, 0.2)",
  },
  pickerValueText: {
    opacity: 0.8,
    marginTop: 4,
  },
  pickerActionsRow: {
    marginTop: 10,
    flexDirection: "row",
    gap: 8,
  },
  pickerContainer: {
    marginTop: 8,
    borderRadius: 10,
    padding: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0, 0, 0, 0.15)",
  },
  pointsExplanation: {
    marginTop: 12,
    opacity: 0.8,
  },
  submitButton: {
    marginTop: 16,
    borderRadius: 10,
  },
});
