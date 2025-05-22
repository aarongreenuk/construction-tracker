import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight, CheckCircle, Clock, AlertTriangle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Stage } from '@/types/plot';
import { formatDate } from '@/utils/date';

interface StageItemProps {
  stage: Stage;
  isCurrentStage: boolean;
  onPress: () => void;
}

export default function StageItem({ stage, isCurrentStage, onPress }: StageItemProps) {
  const getStatusColor = () => {
    switch (stage.status) {
      case 'completed':
        return Colors.success;
      case 'in-progress':
        return Colors.primary;
      case 'delayed':
        return Colors.danger;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusIcon = () => {
    switch (stage.status) {
      case 'completed':
        return <CheckCircle size={16} color={Colors.success} />;
      case 'in-progress':
        return <Clock size={16} color={Colors.primary} />;
      case 'delayed':
        return <AlertTriangle size={16} color={Colors.danger} />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (stage.status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      case 'delayed':
        return 'Delayed';
      default:
        return 'Not Started';
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        isCurrentStage && styles.currentStage
      ]} 
      onPress={onPress}
    >
      <View style={styles.content}>
        <View style={styles.mainInfo}>
          <Text style={styles.name}>{stage.name}</Text>
          <View style={styles.statusContainer}>
            {getStatusIcon()}
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </View>
        </View>
        
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Duration</Text>
            <Text style={styles.detailValue}>{stage.duration} days</Text>
          </View>
          
          {stage.plannedStartDate && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Planned</Text>
              <Text style={styles.detailValue}>
                {formatDate(stage.plannedStartDate)}
              </Text>
            </View>
          )}
          
          {stage.actualStartDate && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Started</Text>
              <Text style={styles.detailValue}>
                {formatDate(stage.actualStartDate)}
              </Text>
            </View>
          )}
          
          {stage.issues.length > 0 && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Issues</Text>
              <Text style={styles.detailValue}>{stage.issues.length}</Text>
            </View>
          )}
          
          {stage.delays.length > 0 && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Delays</Text>
              <Text style={styles.detailValue}>
                {stage.delays.reduce((total, delay) => total + delay.daysAdded, 0)} days
              </Text>
            </View>
          )}
        </View>
      </View>
      
      <ChevronRight size={20} color={Colors.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  currentStage: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  content: {
    flex: 1,
  },
  mainInfo: {
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    minWidth: 80,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.text,
  },
});