/**
 * FAQ Screen - Frequently Asked Questions
 * Features smooth accordion animations with rotating icons
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { Header, Card } from '../../components';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'How do I create a group?',
    answer:
      'To create a group, navigate to the Groups tab and tap the "+" button. Enter a name and description for your group, then tap "Create Group". You\'ll be able to invite members after creation.',
  },
  {
    question: 'How do I invite members to my group?',
    answer:
      'Open the group details page by tapping on the group. Then tap the "Invite Members" button. You can either share the invite code or send direct invitations to email addresses.',
  },
  {
    question: 'How do I sync events to my device calendar?',
    answer:
      'Open an event by tapping on it in the Calendar view. Tap the "..." menu button and select "Sync". You\'ll need to grant calendar permissions if you haven\'t already. The event will be added to your default device calendar.',
  },
  {
    question: 'Can I create personal events not associated with a group?',
    answer:
      'Yes! When creating an event, you can choose to create a personal event by not selecting a group. Personal events are only visible to you.',
  },
  {
    question: 'How do I leave a group?',
    answer:
      'Open the group details page and tap the "..." menu button in the top right. Select "Leave Group" and confirm. Note that you cannot leave a group if you\'re the only admin.',
  },
  {
    question: 'What happens to group events if I leave a group?',
    answer:
      'If you leave a group, you will no longer see group events or todos. However, any events you synced to your device calendar will remain there until manually removed.',
  },
  {
    question: 'How do I delete a group?',
    answer:
      'Only group admins can delete groups. Open the group details page, tap the "..." menu, and select "Delete Group". This will permanently delete the group and all associated events and todos.',
  },
  {
    question: 'Can I edit or delete events created by others?',
    answer:
      "You can only edit or delete events that you created. Other users' events are read-only for you, unless you're a group admin with special permissions.",
  },
  {
    question: 'How do I change my password?',
    answer:
      'Go to the Profile tab, scroll down to the Security section, and tap "Change Password". You\'ll need to enter your current password and then your new password.',
  },
  {
    question: 'How do I enable dark mode?',
    answer:
      'Go to the Profile tab and toggle the "Dark Mode" switch in the Preferences section. The app will immediately switch to your preferred theme.',
  },
  {
    question: 'What are todos and how do I create them?',
    answer:
      'Todos are task items that can be personal or shared with a group. Tap the Todos tab and press the "+" button to create a new todo. You can set a due date, add a description, and assign it to a group if desired.',
  },
  {
    question: 'How do I delete my account?',
    answer:
      'Go to the Profile tab, scroll to the Security section, and tap "Delete Account". You\'ll need to enter your password to confirm. Warning: This action is permanent and will delete all your data.',
  },
];

// Animated Icon component with rotation
const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);

interface AccordionItemProps {
  item: FAQItem;
  isExpanded: boolean;
  onToggle: () => void;
  theme: ReturnType<typeof useTheme>['theme'];
}

const AccordionItem: React.FC<AccordionItemProps> = ({ item, isExpanded, onToggle, theme }) => {
  const rotation = useSharedValue(isExpanded ? 1 : 0);
  const height = useSharedValue(isExpanded ? 1 : 0);
  const opacity = useSharedValue(isExpanded ? 1 : 0);
  const scale = useSharedValue(1);

  React.useEffect(() => {
    rotation.value = withSpring(isExpanded ? 1 : 0, {
      damping: 15,
      stiffness: 120,
    });
    height.value = withTiming(isExpanded ? 1 : 0, {
      duration: 300,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
    opacity.value = withTiming(isExpanded ? 1 : 0, {
      duration: isExpanded ? 400 : 200,
      easing: Easing.ease,
    });
  }, [isExpanded, rotation, height, opacity]);

  const iconAnimatedStyle = useAnimatedStyle(() => {
    const rotateZ = interpolate(rotation.value, [0, 1], [0, 180]);
    return {
      transform: [{ rotateZ: `${rotateZ}deg` }],
    };
  });

  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      maxHeight: interpolate(height.value, [0, 1], [0, 500]),
      overflow: 'hidden' as const,
    };
  });

  const pressableAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const styles = StyleSheet.create({
    faqItem: {
      marginBottom: theme.spacing.md,
      padding: theme.spacing.md,
      overflow: 'hidden',
    },
    questionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    question: {
      ...theme.typography.h6,
      color: theme.colors.text,
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    iconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.primary + '15',
      alignItems: 'center',
      justifyContent: 'center',
    },
    answerContainer: {
      paddingTop: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      marginTop: theme.spacing.md,
    },
    answer: {
      ...theme.typography.body2,
      color: theme.colors.textSecondary,
      lineHeight: 22,
    },
  });

  return (
    <Animated.View style={pressableAnimatedStyle}>
      <Card style={styles.faqItem}>
        <Pressable onPress={onToggle} onPressIn={handlePressIn} onPressOut={handlePressOut}>
          <View style={styles.questionContainer}>
            <Text style={styles.question}>{item.question}</Text>
            <View style={styles.iconContainer}>
              <Animated.View style={iconAnimatedStyle}>
                <Ionicons name="chevron-down" size={20} color={theme.colors.primary} />
              </Animated.View>
            </View>
          </View>
        </Pressable>

        <Animated.View style={contentAnimatedStyle}>
          <View style={styles.answerContainer}>
            <Text style={styles.answer}>{item.answer}</Text>
          </View>
        </Animated.View>
      </Card>
    </Animated.View>
  );
};

export const FAQScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpanded = useCallback((index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  }, []);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
    },
    pageTitle: {
      ...theme.typography.h3,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    intro: {
      ...theme.typography.body1,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.lg,
      lineHeight: 22,
    },
  });

  return (
    <View style={styles.container}>
      <Header showBack onBack={handleBack} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>FAQ</Text>
        <Text style={styles.intro}>
          Find answers to frequently asked questions about using GroupCalendarApp. If you don&apos;t
          find what you&apos;re looking for, please contact support.
        </Text>

        {faqData.map((item, index) => (
          <AccordionItem
            key={index}
            item={item}
            isExpanded={expandedIndex === index}
            onToggle={() => toggleExpanded(index)}
            theme={theme}
          />
        ))}
      </ScrollView>
    </View>
  );
};
