import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Appbar, Button, Card, Chip, Text, useTheme } from "react-native-paper";
import {Slider} from '@miblanchard/react-native-slider';

export default function ScoringScreen() {
  const theme = useTheme();

  const availableTasks = [
    {
      id: "p1",
      title: "Design mobile app wireframes",
      description: "Create wireframes for new mobile banking app features",
      assignedDate: "2026-02-26",
      dueDate: "2026-03-08",
      estimatedHours: 20,
      skillsRequired: ["UI/UX Design", "Figma"],
    },
    {
      id: "p2",
      title: "Database optimization",
      description: "Optimize SQL queries and improve database performance",
      assignedDate: "2026-02-27",
      dueDate: "2026-03-12",
      estimatedHours: 15,
      skillsRequired: ["SQL", "Database Management"],
    },
    {
      id: "p3",
      title: "API documentation update",
      description: "Update REST API documentation with new endpoints",
      assignedDate: "2026-02-28",
      dueDate: "2026-03-10",
      estimatedHours: 8,
      skillsRequired: ["Technical Writing", "API Design"],
    },
    {
      id: "p4",
      title: "Frontend performance testing",
      description: "Conduct performance tests and identify bottlenecks",
      assignedDate: "2026-03-01",
      dueDate: "2026-03-15",
      estimatedHours: 12,
      skillsRequired: ["Performance Testing", "JavaScript"],
    },
  ];

  const [scores, setScores] = useState(
    availableTasks.reduce(
      (acc, task) => {
        acc[task.id] = 5; // Default score of 5
        return acc;
      },
      {} as Record<string, number>,
    ),
  );

  const handleScoreChange = (taskId: string, score: number) => {
    setScores((prev) => ({
      ...prev,
      [taskId]: Math.round(score),
    }));
  };

  const handleSubmitScores = () => {
    console.log("Submitted scores:", scores);
    // Here you would send the scores to your backend
    alert("Preferences submitted successfully!");
    router.back();
  };

  const getScoreColor = (score: number) => {
    if (score <= 3) return "#f44336"; // Red for low preference
    if (score <= 6) return "#ff9800"; // Orange for medium
    return "#4caf50"; // Green for high preference
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Score Task Preferences" />
        <Appbar.Action icon="check" onPress={handleSubmitScores} />
      </Appbar.Header>

      <View style={styles.content}>
        <Card style={styles.instructionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.instructionTitle}>
              How to Score Tasks
            </Text>
            <Text variant="bodyMedium" style={styles.instructionText}>
              Rate each task from 1 to 10 based on your preference to work on it:
            </Text>
            <Text variant="bodySmall" style={styles.instructionDetail}>
              • 1-3: Low preference • 4-6: Medium preference • 7-10: High preference
            </Text>
          </Card.Content>
        </Card>

        <ScrollView style={styles.tasksList} showsVerticalScrollIndicator={false}>
          {availableTasks.map((task) => (
            <Card key={task.id} style={styles.taskCard} mode="outlined">
              <Card.Content>
                <View style={styles.taskHeader}>
                  <View style={styles.taskInfo}>
                    <Text variant="titleMedium" style={styles.taskTitle}>
                      {task.title}
                    </Text>
                    <Text variant="bodySmall" style={styles.estimatedHours}>
                      {task.estimatedHours} hours
                    </Text>
                  </View>
                  <View style={styles.scoreDisplay}>
                    <Text variant="headlineMedium" style={[styles.scoreText, { color: getScoreColor(scores[task.id]) }]}>
                      {scores[task.id]}
                    </Text>
                  </View>
                </View>

                <Text variant="bodyMedium" style={styles.taskDescription}>
                  {task.description}
                </Text>

                <View style={styles.taskDetails}>
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

                <View style={styles.sliderContainer}>
                  <Text variant="bodySmall" style={styles.sliderLabel}>
                    Preference Score: 1 (Low) → 10 (High)
                  </Text>
                  <Slider
                    containerStyle={styles.slider}
                    value={scores[task.id]}
                    onValueChange={(value) => handleScoreChange(task.id, value[0])}
                    minimumValue={1}
                    maximumValue={10}
                    step={1}
                    thumbStyle={{ backgroundColor: getScoreColor(scores[task.id]) }}
                    trackStyle={{ backgroundColor: theme.colors.surfaceVariant }}
                  />
                  <View style={styles.sliderLabels}>
                    <Text variant="bodySmall" style={styles.sliderEndLabel}>
                      1
                    </Text>
                    <Text variant="bodySmall" style={styles.sliderEndLabel}>
                      5
                    </Text>
                    <Text variant="bodySmall" style={styles.sliderEndLabel}>
                      10
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>

        <View style={styles.submitContainer}>
          <Button mode="contained" onPress={handleSubmitScores} style={styles.submitButton} contentStyle={styles.submitButtonContent}>
            Submit All Preferences
          </Button>
        </View>
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
    padding: 16,
  },
  instructionCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  instructionTitle: {
    fontWeight: "600",
    marginBottom: 8,
  },
  instructionText: {
    marginBottom: 4,
  },
  instructionDetail: {
    opacity: 0.7,
    fontStyle: "italic",
  },
  tasksList: {
    flex: 1,
  },
  taskCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  taskInfo: {
    flex: 1,
    marginRight: 16,
  },
  taskTitle: {
    fontWeight: "600",
    marginBottom: 4,
  },
  estimatedHours: {
    opacity: 0.6,
    fontWeight: "500",
  },
  scoreDisplay: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 60,
  },
  scoreText: {
    fontWeight: "bold",
  },
  taskDescription: {
    marginBottom: 12,
    opacity: 0.8,
    lineHeight: 20,
  },
  taskDetails: {
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  dateText: {
    marginLeft: 6,
    opacity: 0.7,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
    gap: 4,
  },
  skillChip: {
    marginRight: 4,
    marginBottom: 4,
  },
  sliderContainer: {
    marginTop: 8,
  },
  sliderLabel: {
    opacity: 0.8,
    marginBottom: 8,
    textAlign: "center",
  },
  slider: {
    height: 40,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  sliderEndLabel: {
    opacity: 0.6,
  },
  submitContainer: {
    paddingTop: 16,
  },
  submitButton: {
    borderRadius: 12,
  },
  submitButtonContent: {
    height: 48,
  },
});
