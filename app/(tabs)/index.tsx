import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons";
import React, { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Card, Divider, Text, TextInput, useTheme } from "react-native-paper";

export default function LoginScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();
  
  // const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  const handleGoogleSignIn = async () => {
    try {
      // Configure Google Sign-In (you'll need to add your configuration)
      // GoogleSignin.configure({
      //   webClientId: 'YOUR_WEB_CLIENT_ID',
      // });

      // await GoogleSignin.hasPlayServices();
      // const userInfo = await GoogleSignin.signIn();
      // console.log('User info:', userInfo);

      // For now, show an alert
      alert("Google Sign-In would be implemented here");
    } catch (error) {
      console.error("Google Sign-In error:", error);
    }
  };

  const handleSubmit = () => {
    if (isSignUp) {
      // Handle sign up
      console.log("Sign up:", { username, email, password });
      alert("Sign up functionality would be implemented here");
    } else {
      // Handle sign in
      console.log("Sign in:", { username, email, password });
      alert("Sign in functionality would be implemented here");
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
                <TextInput label="Username" value={username} onChangeText={setUsername} mode="outlined" style={styles.input} left={<TextInput.Icon icon="account" />} />
                <TextInput label="Email" value={email} onChangeText={setEmail} mode="outlined" keyboardType="email-address" autoCapitalize="none" style={styles.input} left={<TextInput.Icon icon="email" />} />
              </>
            ) : (
              <TextInput label="Username or Email" value={username} onChangeText={setUsername} mode="outlined" autoCapitalize="none" style={styles.input} left={<TextInput.Icon icon="account" />} />
            )}

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry={!showPassword}
              style={styles.input}
              left={<TextInput.Icon icon="lock" />}
              right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword(!showPassword)} />}
            />
          </View>

          <Button mode="contained" onPress={handleSubmit} style={styles.submitButton} contentStyle={styles.buttonContent}>
            {isSignUp ? "Create Account" : "Sign In"}
          </Button>

          <View style={styles.dividerContainer}>
            <Divider style={styles.divider} />
            <Text variant="titleMedium" style={styles.dividerText}>
              OR
            </Text>
            <Divider style={styles.divider} />
          </View>

          <Button mode="outlined" onPress={handleGoogleSignIn} style={styles.googleButton} contentStyle={styles.buttonContent} icon={() => <MaterialDesignIcons name="google" size={20} color={theme.colors.primary} />}>
            Continue with Google
          </Button>

          <View style={styles.accountSwitchContainer}>
            <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
              <Text style={styles.accountSwitchText}>{isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}</Text>
            </TouchableOpacity>
          </View>
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
    backgroundColor: "#62616118",
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
    marginBottom: 24,
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
    marginBottom: 16,
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
  googleButton: {
    borderRadius: 8,
  },
  accountSwitchContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  accountSwitchText: {
    fontSize: 12,
    opacity: 0.7,
    textDecorationLine: "underline",
  },
});
