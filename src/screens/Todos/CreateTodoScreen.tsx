/**
 * Create Todo Screen
 * Form for creating a new todo item
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useGroups, useNotifications } from '../../hooks';
import {
  Header,
  Button,
  Input,
  LoadingOverlay,
  DateTimePickerModal,
  Dropdown,
  type DropdownOption,
} from '../../components';
import { RootStackParamList } from '../../types';
import { dataService } from '../../services';
import { Ionicons } from '@expo/vector-icons';

type CreateTodoScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateTodo'>;
type CreateTodoScreenRouteProp = RouteProp<RootStackParamList, 'CreateTodo'>;

interface Props {
  navigation: CreateTodoScreenNavigationProp;
  route: CreateTodoScreenRouteProp;
}

export const CreateTodoScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { groups } = useGroups(user?.id);
  const { scheduleTodoNotification, notifyGroupTodoCreated } = useNotifications();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(route.params?.groupId);
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Create dropdown options from groups
  const groupOptions = useMemo<DropdownOption[]>(() => {
    const options: DropdownOption[] = [
      {
        label: 'Personal Todo',
        value: 'personal',
        icon: 'person-outline',
      },
    ];

    groups.forEach((group) => {
      options.push({
        label: group.name,
        value: group.id,
        icon: 'people-outline',
      });
    });

    return options;
  }, [groups]);

  const handleCreateTodo = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a todo title');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'You must be logged in to create todos');
      return;
    }

    try {
      setLoading(true);

      // Create todo in app database - don't include undefined fields
      const todoData: any = {
        text: title.trim(),
        description: description.trim(),
        dueDate: new Date(dueDate),
        completed: false,
        createdBy: user.id,
        createdAt: new Date(),
      };

      // Only add groupId if it exists
      if (selectedGroupId) {
        todoData.groupId = selectedGroupId;
      }

      console.info('Creating todo with data:', todoData);

      const createdTodo = await dataService.createTodo(todoData);
      console.info('Todo created successfully:', createdTodo);

      // Schedule notification for 2 hours before due date
      if (dueDate) {
        try {
          await scheduleTodoNotification(
            createdTodo.id,
            title.trim(),
            new Date(dueDate),
            2 // 2 hours before
          );
          console.info('Todo notification scheduled');
        } catch (notifError) {
          console.error('Failed to schedule notification:', notifError);
          // Don't fail todo creation if notification fails
        }
      }

      // Notify all group members if this is a group todo
      if (selectedGroupId) {
        try {
          const group = groups.find((g) => g.id === selectedGroupId);
          if (group) {
            await notifyGroupTodoCreated(
              title.trim(),
              user.displayName || user.email?.split('@')[0] || 'Someone',
              group.name,
              createdTodo.id
            );
            console.info('Group members notified of new todo');
          }
        } catch (notifError) {
          console.error('Failed to notify group members:', notifError);
          // Don't fail todo creation if notification fails
        }
      }

      Alert.alert('Success', 'Todo created successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error creating todo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create todo';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateObj: Date) => {
    return (
      dateObj.toLocaleDateString() +
      ' ' +
      dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.md,
    },
    dateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.md,
    },
    dateLabel: {
      ...theme.typography.body2,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    dateText: {
      ...theme.typography.body1,
      color: theme.colors.text,
      flex: 1,
    },
    buttonContainer: {
      marginTop: theme.spacing.xl,
      gap: theme.spacing.md,
    },
    selectedButton: {
      borderColor: theme.colors.primary,
      borderWidth: 2,
    },
  });

  return (
    <View style={styles.container}>
      <Header title="Create Todo" showBack onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Input
          label="Todo Title"
          placeholder="Enter todo title"
          value={title}
          onChangeText={setTitle}
          icon="checkmark-circle"
        />

        <Input
          label="Description (optional)"
          placeholder="Enter description"
          value={description}
          onChangeText={setDescription}
          icon="document-text"
          multiline
          numberOfLines={3}
        />

        <View>
          <Text style={styles.dateLabel}>Due Date (optional)</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateText}>{formatDate(dueDate)}</Text>
            <Ionicons name="calendar-outline" size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <Dropdown
          label="Todo Type"
          placeholder="Select todo type"
          value={selectedGroupId || 'personal'}
          options={groupOptions}
          onSelect={(value) => {
            setSelectedGroupId(value === 'personal' ? undefined : value);
          }}
        />

        <View style={styles.buttonContainer}>
          <Button
            title="Create Todo"
            onPress={handleCreateTodo}
            loading={loading}
            disabled={loading || !title.trim()}
            fullWidth
          />
          <Button
            title="Cancel"
            onPress={() => navigation.goBack()}
            variant="outline"
            fullWidth
            disabled={loading}
          />
        </View>
      </ScrollView>

      <DateTimePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        value={dueDate}
        onChange={(selectedDate: Date) => {
          setDueDate(selectedDate);
        }}
        mode="datetime"
        title="Select Due Date"
      />

      <LoadingOverlay visible={loading} />
    </View>
  );
};
