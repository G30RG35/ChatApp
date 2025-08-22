import React from "react";
import { View, StyleSheet } from "react-native";
import { SignInForm } from "../components/SignInForm";

export default function LoginScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <SignInForm
        onSwitchToSignUp={() => navigation.navigate("SignUp")}
        onForgotPassword={() => navigation.navigate("ForgotPassword")}
        onLoginSuccess={() => navigation.replace("Home")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#f0f4ff", // similar al diseño que me mostraste
    paddingHorizontal: 20,
    marginTop: 20,
  },
});
