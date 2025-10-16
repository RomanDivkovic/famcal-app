/**
 * Login Screen
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input } from '../../components';
import { useForm, useAsync } from '../../hooks';
import { AuthStackParamList } from '../../types';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { signIn, signInWithGoogle } = useAuth();

  // Form validation
  const { values, errors, touched, handleChange, handleBlur, validateAll } = useForm(
    {
      email: '',
      password: '',
    },
    {
      email: {
        required: true,
        pattern: /\S+@\S+\.\S+/,
      },
      password: {
        required: true,
        minLength: 6,
      },
    }
  );

  // Sign in async operation
  const {
    execute: executeSignIn,
    loading,
    error,
  } = useAsync<void, []>(async () => {
    const isValid = validateAll();
    if (!isValid) {
      throw new Error('Please fix the form errors');
    }
    await signIn(values.email, values.password);
  });

  // Google sign in async operation
  const { execute: executeGoogleSignIn, loading: googleLoading } = useAsync<void, []>(async () => {
    await signInWithGoogle();
  });

  // Show error alerts
  React.useEffect(() => {
    if (error) {
      Alert.alert('Error', error.message);
    }
  }, [error]);

  const isLoading = loading || googleLoading;

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
      marginBottom: theme.spacing.xxl,
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
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: theme.spacing.lg,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.border,
    },
    dividerText: {
      ...theme.typography.body2,
      color: theme.colors.textSecondary,
      marginHorizontal: theme.spacing.md,
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
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        <View style={styles.form}>
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
        </View>

        <Button
          title="Sign In"
          onPress={executeSignIn}
          loading={loading}
          disabled={isLoading}
          fullWidth
          style={styles.button}
        />

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <Button
          title="Sign in with Google"
          onPress={executeGoogleSignIn}
          variant="outline"
          disabled={isLoading}
          fullWidth
          style={styles.button}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
            Sign Up
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
