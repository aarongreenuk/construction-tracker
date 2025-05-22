import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Clock, AlertTriangle, CheckCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { PlotSummary } from '@/types/plot';
import { formatDate } from '@/utils/date';

interface PlotCardProps {
  plot: PlotSummary;
}

export default function PlotCard({ plot }: PlotCardProps) {
  const router = useRouter();

  const getStatusColor = () => {
    switch (plot.status) {
      case 'ahead':
        return Colors.ahead;
      case 'behind':
        return Colors.danger;
      case 'on-schedule':
        return Colors.onSchedule;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusIcon = () => {
    switch (plot.status) {
      case 'ahead':
        return <CheckCircle size={16} color={Colors.ahead} />;
      case 'behind':
        return <AlertTriangle size={16} color={Colors.danger} />;
      case 'on-schedule':
        return <Clock size={16} color={Colors.onSchedule} />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (plot.status) {
      case 'ahead':
        return `${plot.daysAheadOrBehind} ${plot.daysAheadOrBehind === 1 ? 'day' : 'days'} ahead`;
      case 'behind':
        return `${plot.daysAheadOrBehind} ${plot.daysAheadOrBehind === 1 ? 'day' : 'days'} behind`;
      case 'on-schedule':
        return 'On schedule';
      default:
        return '';
    }
  };

  const handlePress = () => {
    router.push(`/plot/${plot.id}`);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={styles.header}>
        <Text style={styles.title}>{plot.name}</Text>
        <ChevronRight size={20} color={Colors.textSecondary} />
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBar, { width: `${plot.progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{plot.progress}% Complete</Text>
      </View>
      
      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Current Stage</Text>
          <Text style={styles.infoValue}>{plot.currentStage}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Days Remaining</Text>
          <Text style={styles.infoValue}>{plot.daysRemaining}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <View style={styles.statusContainer}>
            {getStatusIcon()}
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: Colors.progressBarBackground,
    borderRadius: 4,
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.progressBar,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
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
});