import { disableCalendarSync, isCalendarSyncEnabled as getCalendarSyncStatus, initializeGoogleSignIn, syncGoogleCalendar } from "@/utils/googleCalendarSync";
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons";
import { Slot, router, usePathname } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Dialog, Portal, Switch, Text, useTheme } from "react-native-paper";

export default function DashboardLayout() {
  const theme = useTheme();
  const pathname = usePathname();
  const [isCalendarSyncDialogVisible, setIsCalendarSyncDialogVisible] = useState(false);
  const [isCalendarSyncEnabled, setIsCalendarSyncEnabled] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  // Initialize Google Sign-In on mount
  useEffect(() => {
    initializeGoogleSignIn();
    // Check if calendar sync was previously enabled
    const checkSyncStatus = async () => {
      const enabled = await getCalendarSyncStatus();
      setIsCalendarSyncEnabled(enabled);
    };
    checkSyncStatus();
  }, []);

  const activeSection = useMemo(() => {
    if (pathname === "/dashboard/team") return "team";
    if (pathname === "/dashboard/profile") return "profile";
    return "home";
  }, [pathname]);

  const openCalendarSyncDialog = () => {
    setIsCalendarSyncDialogVisible(true);
  };

  const closeCalendarSyncDialog = () => {
    setIsCalendarSyncDialogVisible(false);
  };

  const handleCalendarSyncToggle = async (newValue: boolean) => {
    if (newValue) {
      // Enable calendar sync
      setIsSyncing(true);
      const success = await syncGoogleCalendar(apiUrl!);
      setIsSyncing(false);

      if (success) {
        setIsCalendarSyncEnabled(true);
        Alert.alert("Success", "Google Calendar sync has been enabled!");
      } else {
        setIsCalendarSyncEnabled(false);
      }
    } else {
      // Disable calendar sync
      try {
        await disableCalendarSync(apiUrl!);
      } catch (err) {
        console.warn("Disconnect call failed:", err);
      }
      setIsCalendarSyncEnabled(false);
      Alert.alert("Success", "Google Calendar sync has been disabled.");
    }
  };

  return (
    <View style={styles.container}>
      <Slot />

      <View style={styles.bottomNavBar}>
        <TouchableOpacity style={styles.bottomNavItem} onPress={() => router.replace("/dashboard")}>
          <MaterialDesignIcons name="home" size={22} color={activeSection === "home" ? theme.colors.primary : theme.colors.onSurfaceVariant} />
          <Text style={[styles.bottomNavLabel, activeSection === "home" && styles.bottomNavLabelActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomNavItem} onPress={() => router.push("/dashboard/team")}>
          <MaterialDesignIcons name="account-group" size={22} color={activeSection === "team" ? theme.colors.primary : theme.colors.onSurfaceVariant} />
          <Text style={[styles.bottomNavLabel, activeSection === "team" && styles.bottomNavLabelActive]}>Team</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomNavItem} onPress={() => router.push("/dashboard/profile")}>
          <MaterialDesignIcons name="account-circle" size={22} color={activeSection === "profile" ? theme.colors.primary : theme.colors.onSurfaceVariant} />
          <Text style={[styles.bottomNavLabel, activeSection === "profile" && styles.bottomNavLabelActive]}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomNavItem} onPress={openCalendarSyncDialog}>
          <MaterialDesignIcons name="calendar" size={22} color={theme.colors.onSurfaceVariant} />
          <Text style={styles.bottomNavLabel}>Calendar</Text>
        </TouchableOpacity>
      </View>

      <Portal>
        <Dialog visible={isCalendarSyncDialogVisible} onDismiss={closeCalendarSyncDialog}>
          <Dialog.Title>Google Calendar Sync</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={styles.calendarSyncDialogCopy}>
              Turn this on to track your assigned tasks in Google Calendar.
            </Text>
            <View style={styles.calendarSyncToggleRow}>
              <View style={styles.calendarSyncToggleCopy}>
                <Text variant="bodyMedium" style={styles.calendarSyncToggleTitle}>
                  Sync is {isCalendarSyncEnabled ? "on" : "off"}
                </Text>
                <Text variant="bodySmall" style={styles.calendarSyncToggleSubtitle}>
                  {isSyncing ? "Connecting to Google Calendar..." : "Use the switch to turn Google Calendar sync on or off."}
                </Text>
              </View>
              <Switch value={isCalendarSyncEnabled} onValueChange={handleCalendarSyncToggle} disabled={isSyncing} />
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeCalendarSyncDialog}>Done</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomNavBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 74,
    paddingHorizontal: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0, 0, 0, 0.18)",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  bottomNavItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingVertical: 6,
  },
  bottomNavLabel: {
    fontSize: 12,
    color: "#5C6470",
  },
  bottomNavLabelActive: {
    color: "#2563EB",
    fontWeight: "700",
  },
  calendarSyncDialogCopy: {
    marginBottom: 16,
    opacity: 0.8,
    lineHeight: 20,
  },
  calendarSyncToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  calendarSyncToggleCopy: {
    flex: 1,
  },
  calendarSyncToggleTitle: {
    fontWeight: "600",
    marginBottom: 2,
  },
  calendarSyncToggleSubtitle: {
    opacity: 0.75,
  },
});
