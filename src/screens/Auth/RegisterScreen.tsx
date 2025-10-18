/**
 * Register Screen
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Button, Input, LoadingOverlay, ErrorModal, TermsOfServiceModal } from '../../components';
import { useForm, useAsync } from '../../hooks';
import { AuthStackParamList } from '../../types';
import { Ionicons } from '@expo/vector-icons';

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

interface Props {
  navigation: RegisterScreenNavigationProp;
}

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { signUp } = useAuth();
  const { theme } = useTheme();
  const [errorModalVisible, setErrorModalVisible] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [acceptedTerms, setAcceptedTerms] = React.useState(false);
  const [showTerms, setShowTerms] = React.useState(false);

  // Form validation with custom password match rule
  const { values, errors, touched, handleChange, handleBlur, validateAll } = useForm(
    {
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    {
      displayName: {
        required: true,
      },
      email: {
        required: true,
        pattern: /\S+@\S+\.\S+/,
      },
      password: {
        required: true,
        minLength: 6,
      },
      confirmPassword: {
        required: true,
        custom: (value) => {
          if (value !== values.password) {
            return 'Passwords do not match';
          }
          return undefined;
        },
      },
    }
  );

  // Sign up async operation
  const {
    execute: executeSignUp,
    loading,
    error,
    reset: resetSignUp,
  } = useAsync<void, []>(async () => {
    const isValid = validateAll();
    if (!isValid) {
      throw new Error('Please fix the form errors');
    }
    if (!acceptedTerms) {
      throw new Error('You must accept the Terms of Service to continue');
    }
    await signUp(values.email, values.password, values.displayName);
  });

  // Show error modal
  React.useEffect(() => {
    if (error) {
      const message = error.message || 'An error occurred during registration';
      console.info('Showing error modal:', message);
      setErrorMessage(message);
      setErrorModalVisible(true);
    }
  }, [error]);

  const handleCloseErrorModal = () => {
    setErrorModalVisible(false);
    setErrorMessage('');
    // Reset the async hook error state so it can trigger again
    resetSignUp();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: theme.spacing.lg,
    },
    header: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    title: {
      ...theme.typography.h2,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      ...theme.typography.body1,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    form: {
      marginBottom: theme.spacing.lg,
    },
    button: {
      marginBottom: theme.spacing.md,
    },
    termsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xs,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: theme.colors.border,
      marginRight: theme.spacing.sm,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxChecked: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    termsText: {
      ...theme.typography.body2,
      color: theme.colors.textSecondary,
      flex: 1,
    },
    termsLink: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: theme.spacing.lg,
    },
    footerText: {
      ...theme.typography.body2,
      color: theme.colors.textSecondary,
    },
    link: {
      ...theme.typography.body2,
      color: theme.colors.primary,
      fontWeight: '600',
      marginLeft: 4,
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Full Name"
            placeholder="Enter your name"
            value={values.displayName}
            onChangeText={(text) => handleChange('displayName', text)}
            onBlur={() => handleBlur('displayName')}
            icon="person"
            error={touched.displayName ? errors.displayName : undefined}
          />

          <Input
            label="Email"
            placeholder="Enter your email"
            value={values.email}
            onChangeText={(text) => handleChange('email', text)}
            onBlur={() => handleBlur('email')}
            keyboardType="email-address"
            autoCapitalize="none"
            icon="mail"
            error={touched.email ? errors.email : undefined}
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={values.password}
            onChangeText={(text) => handleChange('password', text)}
            onBlur={() => handleBlur('password')}
            secureTextEntry
            icon="lock-closed"
            error={touched.password ? errors.password : undefined}
          />

          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            value={values.confirmPassword}
            onChangeText={(text) => handleChange('confirmPassword', text)}
            onBlur={() => handleBlur('confirmPassword')}
            secureTextEntry
            icon="lock-closed"
            error={touched.confirmPassword ? errors.confirmPassword : undefined}
          />
        </View>

        <TouchableOpacity
          style={styles.termsContainer}
          onPress={() => setAcceptedTerms(!acceptedTerms)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
            {acceptedTerms && <Ionicons name="checkmark" size={16} color="#ffffff" />}
          </View>
          <Text style={styles.termsText}>
            I agree to the{' '}
            <Text
              style={styles.termsLink}
              onPress={(e) => {
                e.stopPropagation();
                setShowTerms(true);
              }}
            >
              Terms of Service
            </Text>
          </Text>
        </TouchableOpacity>

        <Button
          title="Sign Up"
          onPress={executeSignUp}
          loading={loading}
          disabled={loading}
          fullWidth
          style={styles.button}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
            Sign In
          </Text>
        </View>
      </ScrollView>

      <LoadingOverlay visible={loading} />
      <ErrorModal
        visible={errorModalVisible}
        message={errorMessage}
        onClose={handleCloseErrorModal}
      />
      <TermsOfServiceModal
        visible={showTerms}
        onClose={() => setShowTerms(false)}
        onAccept={() => setAcceptedTerms(true)}
        showAcceptButton={true}
      />
    </KeyboardAvoidingView>
  );
};
