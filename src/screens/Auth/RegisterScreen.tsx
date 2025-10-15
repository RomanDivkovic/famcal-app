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
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input } from '../../components';
import { useForm, useAsync } from '../../hooks';
import { AuthStackParamList } from '../../types';

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

interface Props {
  navigation: RegisterScreenNavigationProp;
}

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { signUp } = useAuth();

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
  } = useAsync<void, []>(async () => {
    const isValid = validateAll();
    if (!isValid) {
      throw new Error('Please fix the form errors');
    }
    await signUp(values.email, values.password, values.displayName);
  });

  // Show error alerts
  React.useEffect(() => {
    if (error) {
      Alert.alert('Error', error.message);
    }
  }, [error]);

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
