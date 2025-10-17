/**
 * Terms of Service Modal
 */

import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, Button } from '../';
import { Ionicons } from '@expo/vector-icons';

interface TermsOfServiceModalProps {
  visible: boolean;
  onClose: () => void;
  onAccept?: () => void;
  showAcceptButton?: boolean;
}

export const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({
  visible,
  onClose,
  onAccept,
  showAcceptButton = false,
}) => {
  const { theme } = useTheme();

  const handleAccept = () => {
    if (onAccept) {
      onAccept();
    }
    onClose();
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: '90%',
      maxWidth: 600,
      height: '85%',
      backgroundColor: theme.colors.cardBackground,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.xl,
      ...theme.shadows.large,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    title: {
      ...theme.typography.h4,
      color: theme.colors.text,
      flex: 1,
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    scrollContent: {
      flex: 1,
    },
    section: {
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      ...theme.typography.h6,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
      marginTop: theme.spacing.md,
    },
    text: {
      ...theme.typography.body2,
      color: theme.colors.textSecondary,
      lineHeight: 22,
      marginBottom: theme.spacing.sm,
    },
    emphasis: {
      ...theme.typography.body2,
      color: theme.colors.text,
      fontWeight: '600',
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
    },
    listItem: {
      ...theme.typography.body2,
      color: theme.colors.textSecondary,
      lineHeight: 22,
      marginLeft: theme.spacing.md,
      marginBottom: theme.spacing.xs,
    },
    lastUpdated: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      fontStyle: 'italic',
      marginBottom: theme.spacing.lg,
    },
    footer: {
      marginTop: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    button: {
      flex: 1,
    },
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Card style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Terms of Service</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={true}>
            <Text style={styles.lastUpdated}>Last Updated: October 16, 2025</Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
              <Text style={styles.text}>
                By accessing and using GroupCalendarApp (&quot;the App&quot;), you accept and agree
                to be bound by the terms and provisions of this agreement.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. Description of Service</Text>
              <Text style={styles.text}>
                GroupCalendarApp provides a group calendar and task management platform that allows
                users to:
              </Text>
              <Text style={styles.listItem}>• Create and manage personal and group calendars</Text>
              <Text style={styles.listItem}>• Share events with group members</Text>
              <Text style={styles.listItem}>• Manage tasks and todos</Text>
              <Text style={styles.listItem}>• Sync events with device calendars</Text>
              <Text style={styles.listItem}>• Communicate and collaborate with group members</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. User Accounts</Text>
              <Text style={styles.emphasis}>3.1 Registration</Text>
              <Text style={styles.listItem}>
                • You must provide accurate and complete information when creating an account
              </Text>
              <Text style={styles.listItem}>
                • You are responsible for maintaining the confidentiality of your account
                credentials
              </Text>
              <Text style={styles.listItem}>
                • You are responsible for all activities that occur under your account
              </Text>

              <Text style={styles.emphasis}>3.2 Account Termination</Text>
              <Text style={styles.listItem}>
                • You may delete your account at any time through the app settings
              </Text>
              <Text style={styles.listItem}>
                • We reserve the right to suspend or terminate accounts that violate these terms
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>4. User Conduct</Text>
              <Text style={styles.text}>You agree NOT to:</Text>
              <Text style={styles.listItem}>• Use the App for any illegal purposes</Text>
              <Text style={styles.listItem}>
                • Post or share inappropriate, offensive, or harmful content
              </Text>
              <Text style={styles.listItem}>• Harass, abuse, or harm other users</Text>
              <Text style={styles.listItem}>
                • Attempt to gain unauthorized access to the App or other users&apos; accounts
              </Text>
              <Text style={styles.listItem}>
                • Interfere with or disrupt the App&apos;s functionality
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>5. Privacy and Data</Text>
              <Text style={styles.emphasis}>5.1 Data Collection</Text>
              <Text style={styles.listItem}>
                • We collect and process data as described in our Privacy Policy
              </Text>
              <Text style={styles.listItem}>
                • Your personal information is protected and will not be shared with third parties
                without your consent
              </Text>

              <Text style={styles.emphasis}>5.2 Data Security</Text>
              <Text style={styles.listItem}>
                • We implement reasonable security measures to protect your data
              </Text>
              <Text style={styles.listItem}>
                • However, no method of transmission over the internet is 100% secure
              </Text>

              <Text style={styles.emphasis}>5.3 Data Retention</Text>
              <Text style={styles.listItem}>
                • Your data is stored as long as your account is active
              </Text>
              <Text style={styles.listItem}>
                • When you delete your account, all your data is permanently deleted from our
                servers
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>6. Disclaimers</Text>
              <Text style={styles.text}>
                The App is provided &quot;as is&quot; without warranties of any kind. We do not
                guarantee that the App will be available at all times. We are not liable for any
                indirect, incidental, or consequential damages arising from your use of the App.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>7. Changes to Terms</Text>
              <Text style={styles.text}>
                We reserve the right to modify these terms at any time. Continued use of the App
                after changes constitutes acceptance of the new terms.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.text}>
                By using GroupCalendarApp, you acknowledge that you have read, understood, and agree
                to be bound by these Terms of Service.
              </Text>
            </View>
          </ScrollView>

          {showAcceptButton ? (
            <View style={styles.footer}>
              <View style={styles.buttonContainer}>
                <Button title="Decline" onPress={onClose} variant="outline" style={styles.button} />
                <Button title="Accept" onPress={handleAccept} style={styles.button} />
              </View>
            </View>
          ) : (
            <View style={styles.footer}>
              <Button title="Close" onPress={onClose} />
            </View>
          )}
        </Card>
      </View>
    </Modal>
  );
};
