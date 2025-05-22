import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PlusCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface EmptyStateProps {
  title: string;
  message: string;
  buttonText: string;
  onPress: () => void;
}

export default function EmptyState({ title, message, buttonText, onPress }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity style={styles.button} onPress={onPress}>
          <PlusCircle size={20} color={Colors.card} />
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: Colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
});