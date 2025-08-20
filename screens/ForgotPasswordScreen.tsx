import React from "react";
import { View, StyleSheet } from "react-native";
import { ForgotPasswordForm } from "../components/ForgotPasswordForm";

export default function ForgotPasswordScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <ForgotPasswordForm onBackToSignIn={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#f0f4ff",
    paddingHorizontal: 20,
  },
});
