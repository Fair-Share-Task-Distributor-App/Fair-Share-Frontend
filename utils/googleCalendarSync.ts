import { GoogleSignin, isErrorWithCode, statusCodes } from "@react-native-google-signin/google-signin";
import * as SecureStore from "expo-secure-store";
import { Alert } from "react-native";

export const initializeGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: "73051991942-kb15fu3g5baabfk14tsuo1l7cr22gqrr.apps.googleusercontent.com",
    offlineAccess: true,
    scopes: ["https://www.googleapis.com/auth/calendar.events"],
  });
};

export const syncGoogleCalendar = async (apiUrl: string): Promise<boolean> => {
  try {
    await GoogleSignin.hasPlayServices();

    // Always show the Google consent flow when the user enables calendar sync.
    const response = await GoogleSignin.signIn();

    if (response && "data" in response && response.data && "serverAuthCode" in response.data) {
      const serverAuthCode = (response.data as any).serverAuthCode;

      if (!serverAuthCode) {
        Alert.alert("Error", "Failed to get authorization code. Please try again.");
        return false;
      }

      console.log("Server Auth Code: ", serverAuthCode);
      const token = await SecureStore.getItemAsync("JWT_TOKEN");

      // Send authCode to backend for calendar sync
      const authResponse = await fetch(`${apiUrl}/api/calendar/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          authCode: serverAuthCode,
        }),
      });

      if (!authResponse.ok) {
        Alert.alert("Error", "Failed to sync with Google Calendar. Please try again.");
        return false;
      }

      const data = await authResponse.json();
      console.log("Calendar sync response: ", data);

      // Optionally store sync status
      await SecureStore.setItemAsync("CALENDAR_SYNC_ENABLED", "true");

      return true;
    }

    return false;
  } catch (error: any) {
    console.error("Calendar sync error:", error);

    if (isErrorWithCode(error)) {
      switch (error.code) {
        case statusCodes.SIGN_IN_CANCELLED:
          // User cancelled - this is not an error, just return false
          return false;
        case statusCodes.IN_PROGRESS:
          Alert.alert("Sign in is already in progress");
          break;
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          Alert.alert("Play services not available");
          break;
        default:
          Alert.alert("Something went wrong", error.toString());
      }
    } else {
      Alert.alert("Error", error.message || "An unexpected error occurred");
    }

    return false;
  }
};

export const disableCalendarSync = async (apiUrl: string) => {
  try {
    const token = await SecureStore.getItemAsync("JWT_TOKEN");

    const response = await fetch(`${apiUrl}/api/calendar/disconnect`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      return false;
    }
    await SecureStore.setItemAsync("CALENDAR_SYNC_ENABLED", "false");
    return true;
  } catch (error) {
    console.error("Error calling calendar disconnect:", error);
    return false;
  }
};

export const isCalendarSyncEnabled = async (): Promise<boolean> => {
  try {
    const status = await SecureStore.getItemAsync("CALENDAR_SYNC_ENABLED");
    return status === "true";
  } catch {
    return false;
  }
};
