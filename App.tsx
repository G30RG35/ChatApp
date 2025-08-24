import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { SignUpForm } from './components/SignUpForm';
import { SignInForm } from './components/SignInForm';
import { ForgotPasswordForm } from './components/ForgotPasswordForm';
import { EmailVerificationScreen } from './components/email-verification-screen';
import { VerificationSuccess } from './components/verification-success';
import { MainApp } from './components/main-app';
import './i18n'; // importa la configuración
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { UserProvider } from "./context/UserContext";

export default function HomePage() {
  const [currentView, setCurrentView] = useState<
    "signUp" | "signIn" | "forgotPassword" | "emailVerification" | "verificationSuccess"
  >("signIn");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const handleSignUpSuccess = (email: string) => {
    setUserEmail(email);
    setCurrentView("emailVerification");
  };

  const handleVerificationSuccess = () => {
    setCurrentView("verificationSuccess");
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView("signIn");
  };

  const getSubtitle = () => {
    switch (currentView) {
      case "signUp":
        return "Únete a nuestra plataforma de mensajería";
      case "signIn":
        return "Accede a tu cuenta";
      case "forgotPassword":
        return "Recupera el acceso a tu cuenta";
      case "emailVerification":
        return "Verifica tu dirección de email";
      case "verificationSuccess":
        return "¡Cuenta verificada exitosamente!";
      default:
        return "ChatApp - Mensajería instantánea";
    }
  };

  return (
    <I18nextProvider i18n={i18n}>
      <UserProvider>
        {isAuthenticated ? (
          <MainApp onLogout={handleLogout} />
        ) : (
          <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                  <Text style={styles.title}>ChatApp</Text>
                  <Text style={styles.subtitle}>{getSubtitle()}</Text>
                </View>

                {/* Forms */}
                <View style={styles.formContainer}>
                  {currentView === "signUp" && (
                    <SignUpForm 
                      onSwitchToSignIn={() => setCurrentView("signIn")} 
                      onAuthSuccess={handleSignUpSuccess} 
                    />
                  )}

                  {currentView === "signIn" && (
                    <SignInForm
                      onSwitchToSignUp={() => setCurrentView("signUp")}
                      onSwitchToForgotPassword={() => setCurrentView("forgotPassword")}
                      onAuthSuccess={(user) => {
                        setIsAuthenticated(true);
                      }}
                    />
                  )}

                  {currentView === "forgotPassword" && (
                    <ForgotPasswordForm onBackToSignIn={() => setCurrentView("signIn")} />
                  )}

                  {currentView === "emailVerification" && (
                    <EmailVerificationScreen
                      email={userEmail}
                      onBackToSignUp={() => setCurrentView("signUp")}
                      onVerificationSuccess={handleVerificationSuccess}
                    />
                  )}

                  {currentView === "verificationSuccess" && (
                    <VerificationSuccess onContinue={handleAuthSuccess} />
                  )}
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </UserProvider>
    </I18nextProvider>
  );
}

const styles = StyleSheet.create({
 container: {marginTop: 20,
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
  },
});