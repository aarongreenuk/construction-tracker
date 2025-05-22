import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Calendar, Clock, AlertTriangle, CheckCircle, Plus, Trash2 } from 'lucide-react-native';
import { usePlotStore } from '@/store/plotStore';
import StageItem from '@/components/StageItem';
import Colors from '@/constants/colors';
import { formatDate } from '@/utils/date';
import { calculatePlotProgress, calculatePlotStatus } from '@/utils/plot';

export default function PlotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { plots, deletePlot } = usePlotStore();
  const [showNotes, setShowNotes] = useState(false);
  
  const plot = plots.find(p => p.id === id);
  
  if (!plot) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Plot not found</Text>
      </View>
    );
  }
  
  const progress = calculatePlotProgress(plot);
  const { status, daysAheadOrBehind } = calculatePlotStatus(plot);
  const currentStage = plot.stages.find(stage => stage.id === plot.currentStageId);
  
  const handleStagePress = (stageId: string) => {
    router.push(`/plot/${id}/stage/${stageId}`);
  };
  
  const handleDeletePlot = () => {
    Alert.alert(
      'Delete Plot',
      'Are you sure you want to delete this plot? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deletePlot(id);
            router.replace('/');
          },
        },
      ]
    );
  };
  
  const getStatusColor = () => {
    switch (status) {
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
    switch (status) {
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
    switch (status) {
      case 'ahead':
        return `${daysAheadOrBehind} ${daysAheadOrBehind === 1 ? 'day' : 'days'} ahead of schedule`;
      case 'behind':
        return `${daysAheadOrBehind} ${daysAheadOrBehind === 1 ? 'day' : 'days'} behind schedule`;
      case 'on-schedule':
        return 'On schedule';
      default:
        return '';
    }
  };
  
  return (
    <>
      <Stack.Screen 
        options={{
          title: plot.name,
          headerRight: () => (
            <TouchableOpacity onPress={handleDeletePlot} style={{ marginRight: 16 }}>
              <Trash2 size={20} color={Colors.danger} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{progress}% Complete</Text>
          </View>
          
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Calendar size={16} color={Colors.textSecondary} />
              <Text style={styles.infoText}>
                {formatDate(plot.startDate)} - {formatDate(plot.endDate)}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              {getStatusIcon()}
              <Text style={[styles.infoText, { color: getStatusColor() }]}>
                {getStatusText()}
              </Text>
            </View>
          </View>
          
          {currentStage && (
            <View style={styles.currentStageContainer}>
              <Text style={styles.currentStageLabel}>Current Stage</Text>
              <Text style={styles.currentStageName}>{currentStage.name}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, !showNotes && styles.activeTab]} 
            onPress={() => setShowNotes(false)}
          >
            <Text style={[styles.tabText, !showNotes && styles.activeTabText]}>Stages</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, showNotes && styles.activeTab]} 
            onPress={() => setShowNotes(true)}
          >
            <Text style={[styles.tabText, showNotes && styles.activeTabText]}>Notes</Text>
          </TouchableOpacity>
        </View>
        
        {!showNotes ? (
          <FlatList
            data={plot.stages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <StageItem 
                stage={item} 
                isCurrentStage={item.id === plot.currentStageId}
                onPress={() => handleStagePress(item.id)} 
              />
            )}
            contentContainerStyle={styles.stagesList}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.notesContainer}>
            <Text style={styles.notesText}>
              {plot.notes || 'No notes added yet.'}
            </Text>
            
            <TouchableOpacity 
              style={styles.addNoteButton}
              onPress={() => router.push(`/plot/${id}/stage/${plot.currentStageId}?tab=notes`)}
            >
              <Plus size={20} color={Colors.card} />
              <Text style={styles.addNoteText}>Add Note</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.card,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
    marginBottom: 16,
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  currentStageContainer: {
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  currentStageLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  currentStageName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.primary,
  },
  stagesList: {
    padding: 16,
  },
  notesContainer: {
    flex: 1,
    padding: 16,
  },
  notesText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  addNoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
    marginTop: 16,
    alignSelf: 'center',
  },
  addNoteText: {
    color: Colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
});