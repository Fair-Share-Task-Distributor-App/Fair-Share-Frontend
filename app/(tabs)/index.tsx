import { GoogleSignin, GoogleSigninButton, isErrorWithCode, isSuccessResponse, statusCodes } from "@react-native-google-signin/google-signin";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Card, Divider, Text, TextInput } from "react-native-paper";

import { useUserStore } from "@/stores/user-store";

type AuthResponseData = {
  token: string;
  isNewUser: boolean;
  name: string;
  email: string;
  teamName?: string | null;
  sync_Allowed?: boolean;
};

export default function LoginScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleSigninInProgress, setIsGoogleSigninInProgress] = useState(false);

  // Error states
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const router = useRouter();
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const setUserProfile = useUserStore((state) => state.setUserProfile);

  const routeAfterAuth = (isNewUser?: boolean) => {
    if (isNewUser) {
      router.push("/newUser" as never);
      return;
    }

    router.push("/dashboard");
  };

  // Configure Google Sign-In
  React.useEffect(() => {
    GoogleSignin.configure({
      webClientId: "73051991942-kb15fu3g5baabfk14tsuo1l7cr22gqrr.apps.googleusercontent.com",
      offlineAccess: true,
    });
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleSigninInProgress(true);
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        const { idToken } = response.data;
        console.log("Google ID Token: ", idToken);
        // Send the ID token to backend and receive JWT token back
        const authResponse = await fetch(`${apiUrl}/api/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });

        const authData = (await authResponse.json()) as AuthResponseData;
        console.log("Google auth response from backend: ", authData);

        const { token, isNewUser } = authData;

        // Store token securely
        await SecureStore.setItemAsync("JWT_TOKEN", token);
        setUserProfile({
          name: authData.name,
          email: authData.email,
          teamName: authData.teamName ?? undefined,
          sync_allowed: authData.sync_Allowed,
        });

        routeAfterAuth(isNewUser);
      }
    } catch (error: any) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            Alert.alert("Sign in cancelled");
            break;
          case statusCodes.IN_PROGRESS:
            Alert.alert("Sign in is already in progress");
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Alert.alert("Play services not available");
            break;
          default:
            Alert.alert("Something went wrong", error.toString());
        }
      }
    } finally {
      setIsGoogleSigninInProgress(false);
    }
  };

  const validateForm = () => {
    let isValid = true;

    // Clear previous errors
    setNameError("");
    setEmailError("");
    setPasswordError("");

    // Validate fields by mode
    if (isSignUp && !name.trim()) {
      setNameError("Username is required");
      isValid = false;
    }

    if (!email.trim()) {
      setEmailError("Email is required");
      isValid = false;
    }

    // Validate password
    if (!password.trim()) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length <= 5) {
      setPasswordError("Password must be more than 5 characters");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    try {
      let authResponse;
      if (isSignUp) {
        // Handle sign up
        authResponse = await fetch(`${apiUrl}/api/auth/signup`, {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
      } else {
        // Handle sign in
        authResponse = await fetch(`${apiUrl}/api/auth/login`, {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
      }
      const authData = (await authResponse.json()) as AuthResponseData;
      const { token, isNewUser } = authData;
      await SecureStore.setItemAsync("JWT_TOKEN", token);
      setUserProfile({
        name: authData.name,
        email: authData.email,
        teamName: authData.teamName ?? undefined,
        sync_allowed: authData.sync_Allowed,
      });
      routeAfterAuth(isNewUser);
    } catch (error) {
      console.error("Authentication error:", error);
      Alert.alert("Authentication failed", "Please check your credentials and try again.");
    }
  };
  return (
    <LinearGradient colors={["#b2d7fc", "#9df8ea", "#ffddb0"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={require("../../assets/images/transparent-icon.png")} style={styles.logo} resizeMode="contain" />
        <Card mode="contained" style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <Text variant="titleMedium" style={styles.subtitle}>
                Welcome! Please {isSignUp ? "create your account" : "sign in to continue"}
              </Text>
            </View>

            <View style={styles.inputContainer}>
              {isSignUp ? (
                <>
                  <View>
                    <TextInput
                      label="Username"
                      value={name}
                      onChangeText={(text) => {
                        setName(text);
                        if (nameError) setNameError("");
                      }}
                      mode="outlined"
                      style={[styles.input, nameError ? styles.inputError : null]}
                      left={<TextInput.Icon icon="account" />}
                    />
                    {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
                  </View>
                  <View>
                    <TextInput
                      label="Email"
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        if (emailError) setEmailError("");
                      }}
                      mode="outlined"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={[styles.input, emailError ? styles.inputError : null]}
                      left={<TextInput.Icon icon="email" />}
                    />
                    {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                  </View>
                </>
              ) : (
                <View>
                  <TextInput
                    label="Email"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (emailError) setEmailError("");
                    }}
                    mode="outlined"
                    autoCapitalize="none"
                    style={[styles.input, emailError ? styles.inputError : null]}
                    left={<TextInput.Icon icon="account" />}
                  />
                  {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                </View>
              )}

              <View>
                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) setPasswordError("");
                  }}
                  mode="outlined"
                  secureTextEntry={!showPassword}
                  style={[styles.input, passwordError ? styles.inputError : null]}
                  left={<TextInput.Icon icon="lock" />}
                  right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword(!showPassword)} />}
                />
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
              </View>
            </View>

            <Button mode="contained" onPress={handleSubmit} style={styles.submitButton} contentStyle={styles.buttonContent}>
              {isSignUp ? "Create Account" : "Sign In"}
            </Button>

            <View style={styles.accountSwitchContainer}>
              <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
                <Text style={styles.accountSwitchText}>{isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dividerContainer}>
              <Divider style={styles.divider} />
              <Text variant="titleMedium" style={styles.dividerText}>
                OR
              </Text>
              <Divider style={styles.divider} />
            </View>
            <GoogleSigninButton onPress={handleGoogleSignIn} size={GoogleSigninButton.Size.Wide} color={GoogleSigninButton.Color.Dark} disabled={isGoogleSigninInProgress} />
          </Card.Content>
        </Card>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    alignItems: "center",
  },
  container: {
    marginTop: 150,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    borderRadius: 0,
    justifyContent: "center", // vertical centering
    alignItems: "center", // horizontal centering
    backgroundColor: "transparent",
  },
  header: {
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 200,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 12,
  },
  subtitle: {
    textAlign: "center",
    marginTop: 8,
    opacity: 0.7,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 8,
  },
  inputError: {
    marginBottom: 4,
  },
  errorText: {
    fontSize: 12,
    color: "#d32f2f",
    marginBottom: 12,
    marginLeft: 12,
  },
  submitButton: {
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonContent: {
    height: 48,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  divider: {
    flex: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 12,
    opacity: 0.6,
  },
  accountSwitchContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  accountSwitchText: {
    fontSize: 16,
    opacity: 0.7,
    textDecorationLine: "underline",
  },
});
