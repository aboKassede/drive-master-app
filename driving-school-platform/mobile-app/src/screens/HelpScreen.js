import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const HelpScreen = () => {
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const faqs = [
    {
      question: 'How do I book a lesson?',
      answer: 'Go to the Schedule screen, select an instructor, choose your preferred date and time, then send a booking request. The instructor will approve or decline your request.'
    },
    {
      question: 'How do I join a driving school?',
      answer: 'Navigate to the Schools screen, browse available schools, and tap "Request to Join" on your preferred school. Wait for the school admin to approve your request.'
    },
    {
      question: 'Can I cancel a lesson?',
      answer: 'Yes, you can cancel lessons from the My Lessons screen. Please cancel at least 24 hours in advance to avoid cancellation fees.'
    },
    {
      question: 'How do I track my progress?',
      answer: 'Visit the Progress screen to see your learning statistics, completed lessons, ratings, and instructor feedback.'
    },
    {
      question: 'How do payments work?',
      answer: 'Payments are processed after each completed lesson. You can view your payment history in the Payments screen.'
    },
    {
      question: 'How do I contact my instructor?',
      answer: 'Use the Chat feature to send messages to your instructor. You can access chat from the main menu or lesson details.'
    }
  ];

  const contactOptions = [
    {
      title: 'Email Support',
      subtitle: 'support@drivelink.com',
      action: () => Linking.openURL('mailto:support@drivelink.com')
    },
    {
      title: 'Phone Support',
      subtitle: '+1 (555) 123-4567',
      action: () => Linking.openURL('tel:+15551234567')
    },
    {
      title: 'Live Chat',
      subtitle: 'Chat with our support team',
      action: () => Alert.alert('Coming Soon', 'Live chat will be available soon!')
    }
  ];

  const toggleFAQ = (index) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const renderFAQ = (item, index) => (
    <View key={index} style={styles.faqItem}>
      <TouchableOpacity 
        style={styles.faqQuestion}
        onPress={() => toggleFAQ(index)}
      >
        <Text style={styles.faqQuestionText}>{item.question}</Text>
        <Text style={styles.faqArrow}>
          {expandedFAQ === index ? '−' : '+'}
        </Text>
      </TouchableOpacity>
      {expandedFAQ === index && (
        <View style={styles.faqAnswer}>
          <Text style={styles.faqAnswerText}>{item.answer}</Text>
        </View>
      )}
    </View>
  );

  const renderContactOption = (option, index) => (
    <TouchableOpacity 
      key={index}
      style={styles.contactOption}
      onPress={option.action}
    >
      <View>
        <Text style={styles.contactTitle}>{option.title}</Text>
        <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
      </View>
      <Text style={styles.contactArrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Help & Support</Text>
          <Text style={styles.subtitle}>
            Find answers to common questions or get in touch with our support team
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqs.map(renderFAQ)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          {contactOptions.map(renderContactOption)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('Feature Request', 'Thank you for your feedback! We\'ll consider your suggestion.')}
          >
            <Text style={styles.actionButtonText}>💡 Suggest a Feature</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('Bug Report', 'Please email us at support@drivelink.com with details about the issue.')}
          >
            <Text style={styles.actionButtonText}>🐛 Report a Bug</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('Tutorial', 'App tutorial would start here')}
          >
            <Text style={styles.actionButtonText}>📖 App Tutorial</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Need immediate assistance? Call our 24/7 support line at +1 (555) 123-4567
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    padding: 16,
    paddingBottom: 8,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  faqQuestionText: {
    fontSize: 16,
    color: '#1E293B',
    flex: 1,
    fontWeight: '500',
  },
  faqArrow: {
    fontSize: 20,
    color: '#3B82F6',
    fontWeight: '600',
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#F8FAFC',
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  contactTitle: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 14,
    color: '#3B82F6',
  },
  contactArrow: {
    fontSize: 20,
    color: '#94A3B8',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#1E293B',
  },
  footer: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#1D4ED8',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default HelpScreen;