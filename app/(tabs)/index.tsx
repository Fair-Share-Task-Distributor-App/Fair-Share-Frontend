import { GoogleSignin, GoogleSigninButton, isErrorWithCode, isSuccessResponse, statusCodes } from "@react-native-google-signin/google-signin";
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Card, Divider, Text, TextInput, useTheme } from "react-native-paper";

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
  const theme = useTheme();

  const router = useRouter();
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  // Configure Google Sign-In
  React.useEffect(() => {
    GoogleSignin.configure({
      webClientId: "73051991942-te7a0pbmpi0okobhd112pph3pdt488di.apps.googleusercontent.com",
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleSigninInProgress(true);
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        const { idToken } = response.data;
        // Send the ID token to backend and receive JWT token back
        const authResponse = await fetch(`${apiUrl}/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });

        const { token, user: userInfo } = await authResponse.json();

        // Store token securely
        await SecureStore.setItemAsync("JWT_TOKEN", token);

        router.push("../dashboard");
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

    // Validate name/username
    if (!name.trim()) {
      setNameError(isSignUp ? "Username is required" : "Username or email is required");
      isValid = false;
    }

    // Validate email (only for signup)
    if (isSignUp && !email.trim()) {
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

    // console.log(apiUrl + "/home");

    // const response = await fetch(`${apiUrl}/home`, {
    //   method: "GET",
    //   headers: { "Content-Type": "application/json" },
    // })
    // const print = await response.json();
    // console.log("HERE" + print)

    try {
      let authResponse;
      if (isSignUp) {
        // Handle sign up
        authResponse = await fetch(`${apiUrl}/auth/signup`, {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({ name: name, email, password }),
        });
      } else {
        // Handle sign in
        authResponse = await fetch(`${apiUrl}/auth/login`, {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({ name, email: name, password }),
        });
      }
      const { token } = await authResponse.json();
      await SecureStore.setItemAsync("JWT_TOKEN", token);
      router.push("../dashboard");
    } catch (error) {
      console.error("Authentication error:", error);
      Alert.alert("Authentication failed", "Please check your credentials and try again.");
    }
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <MaterialDesignIcons name="account-circle" size={60} color={theme.colors.primary} />
            <Text variant="titleLarge" style={styles.title}>
              Fair Share
            </Text>
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
                  label="Username or Email"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (nameError) setNameError("");
                  }}
                  mode="outlined"
                  autoCapitalize="none"
                  style={[styles.input, nameError ? styles.inputError : null]}
                  left={<TextInput.Icon icon="account" />}
                />
                {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
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

          {Platform.OS === "web" ? (
            <Button mode="outlined" onPress={handleGoogleSignIn} style={styles.googleButton} contentStyle={styles.googleButtonContent} icon="google" disabled={isGoogleSigninInProgress} loading={isGoogleSigninInProgress}>
              {isGoogleSigninInProgress ? "Signing in..." : "Continue with Google"}
            </Button>
          ) : (
            <GoogleSigninButton onPress={handleGoogleSignIn} size={GoogleSigninButton.Size.Wide} color={GoogleSigninButton.Color.Dark} disabled={isGoogleSigninInProgress} />
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    flex: 1,
    elevation: 4,
    borderRadius: 12,
    justifyContent: "center", // vertical centering
    alignItems: "center", // horizontal centering
    paddingTop: 30,
  },
  header: {
    alignItems: "center",
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
    fontSize: 12,
    opacity: 0.7,
    textDecorationLine: "underline",
  },
  googleButton: {
    borderRadius: 8,
    marginBottom: 20,
    borderColor: "#4285f4",
    borderWidth: 1,
  },
  googleButtonContent: {
    height: 48,
  },
});
