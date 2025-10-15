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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
  },
  form: {
    marginVertical: 24,
  },
  button: {
    marginBottom: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});
