import React from "react";
import { View, StyleSheet } from "react-native";
import { SignUpForm } from "../components/SignUpForm";

export default function SignUpScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <SignUpForm
        onSwitchToSignIn={() => navigation.goBack()} onAuthSuccess={function (email: string): void {
          throw new Error("Function not implemented.");
        } }      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#f0f4ff",
    paddingHorizontal: 20,
    marginTop: 20,
  },
});
