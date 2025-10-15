/**
 * Group Detail Screen
 * Displays details of a group and its members
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { Header } from '../../components';
import { RootStackParamList } from '../../types';

type GroupDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'GroupDetail'>;
type GroupDetailScreenRouteProp = RouteProp<RootStackParamList, 'GroupDetail'>;

interface Props {
  navigation: GroupDetailScreenNavigationProp;
  route: GroupDetailScreenRouteProp;
}

export const GroupDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { groupId } = route.params;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      padding: theme.spacing.lg,
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      ...theme.typography.h6,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    placeholder: {
      ...theme.typography.body1,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: theme.spacing.xl,
    },
  });

  return (
    <View style={styles.container}>
      <Header title="Group Details" showBack onBack={() => navigation.goBack()} />
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Group ID: {groupId}</Text>
          <Text style={styles.placeholder}>Group details will be displayed here</Text>
        </View>
      </ScrollView>
    </View>
  );
};
