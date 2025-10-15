/**
 * Create Event Screen
 * Form for creating a new calendar event
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { Header, Button } from '../../components';
import { RootStackParamList } from '../../types';

type CreateEventScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateEvent'>;
type CreateEventScreenRouteProp = RouteProp<RootStackParamList, 'CreateEvent'>;

interface Props {
  navigation: CreateEventScreenNavigationProp;
  route: CreateEventScreenRouteProp;
}

export const CreateEventScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { groupId, date } = route.params || {};

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      padding: theme.spacing.lg,
    },
    title: {
      ...theme.typography.h4,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    placeholder: {
      ...theme.typography.body1,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: theme.spacing.xl,
    },
    buttonContainer: {
      marginTop: theme.spacing.xl,
    },
  });

  return (
    <View style={styles.container}>
      <Header title="Create Event" showBack onBack={() => navigation.goBack()} />
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Create New Event</Text>
        <Text style={styles.placeholder}>Event creation form will be added here</Text>
        {groupId && <Text style={styles.placeholder}>Group ID: {groupId}</Text>}
        {date && <Text style={styles.placeholder}>Date: {date.toLocaleDateString()}</Text>}
        <View style={styles.buttonContainer}>
          <Button title="Cancel" onPress={() => navigation.goBack()} variant="outline" />
        </View>
      </ScrollView>
    </View>
  );
};
