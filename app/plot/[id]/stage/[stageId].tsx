import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { CheckCircle, Clock, AlertTriangle, Plus, X } from 'lucide-react-native';
import { usePlotStore } from '@/store/plotStore';
import Colors from '@/constants/colors';
import { formatDate } from '@/utils/date';

export default function StageDetailScreen() {
  const { id, stageId, tab: initialTab } = useLocalSearchParams<{ id: string; stageId: string; tab?: string }>();
  const router = useRouter();
  const { plots, updateStageStatus, addStageNote, addStageIssue, resolveStageIssue, addStageDelay } = usePlotStore();
  
  const [activeTab, setActiveTab] = useState<'details' | 'notes' | 'issues' | 'delays'>(
    initialTab === 'notes' ? 'notes' : 'details'
  );
  const [note, setNote] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [delayReason, setDelayReason] = useState('');
  const [delayDays, setDelayDays] = useState('');
  
  const plot = plots.find(p => p.id === id);
  const stage = plot?.stages.find(s => s.id === stageId);
  
  if (!plot || !stage) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Stage not found</Text>
      </View>
    );
  }
  
  const handleUpdateStatus = (status: 'not-started' | 'in-progress' | 'completed' | 'delayed') => {
    updateStageStatus(id, stageId, status);
    Alert.alert('Status Updated', `Stage status updated to ${status}`);
  };
  
  const handleAddNote = () => {
    if (!note.trim()) {
      Alert.alert('Error', 'Please enter a note');
      return;
    }
    
    addStageNote(id, stageId, note);
    setNote('');
    Alert.alert('Note Added', 'Your note has been added successfully');
  };
  
  const handleAddIssue = () => {
    if (!issueDescription.trim()) {
      Alert.alert('Error', 'Please enter an issue description');
      return;
    }
    
    addStageIssue(id, stageId, issueDescription);
    setIssueDescription('');
    Alert.alert('Issue Added', 'The issue has been recorded');
  };
  
  const handleResolveIssue = (issueId: string) => {
    resolveStageIssue(id, stageId, issueId);
  };
  
  const handleAddDelay = () => {
    if (!delayReason.trim()) {
      Alert.alert('Error', 'Please enter a reason for the delay');
      return;
    }
    
    const days = parseInt(delayDays);
    if (isNaN(days) || days <= 0) {
      Alert.alert('Error', 'Please enter a valid number of days');
      return;
    }
    
    addStageDelay(id, stageId, delayReason, days);
    setDelayReason('');
    setDelayDays('');
    Alert.alert('Delay Added', `A delay of ${days} days has been recorded`);
  };
  
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
  
  const renderDetailsTab = () => {
    return (
      <View style={styles.tabContent}>
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Duration</Text>
            <Text style={styles.detailValue}>{stage.duration} days</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Planned Start</Text>
            <Text style={styles.detailValue}>
              {stage.plannedStartDate ? formatDate(stage.plannedStartDate) : 'Not set'}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Planned End</Text>
            <Text style={styles.detailValue}>
              {stage.plannedEndDate ? formatDate(stage.plannedEndDate) : 'Not set'}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Actual Start</Text>
            <Text style={styles.detailValue}>
              {stage.actualStartDate ? formatDate(stage.actualStartDate) : 'Not started'}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Actual End</Text>
            <Text style={styles.detailValue}>
              {stage.actualEndDate ? formatDate(stage.actualEndDate) : 'Not completed'}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <View style={styles.statusContainer}>
              {getStatusIcon()}
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {getStatusText()}
              </Text>
            </View>
          </View>
        </View>
        
        <Text style={styles.sectionTitle}>Update Status</Text>
        
        <View style={styles.statusButtons}>
          <TouchableOpacity
            style={[styles.statusButton, { backgroundColor: Colors.textSecondary }]}
            onPress={() => handleUpdateStatus('not-started')}
          >
            <Text style={styles.statusButtonText}>Not Started</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.statusButton, { backgroundColor: Colors.primary }]}
            onPress={() => handleUpdateStatus('in-progress')}
          >
            <Text style={styles.statusButtonText}>In Progress</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.statusButton, { backgroundColor: Colors.success }]}
            onPress={() => handleUpdateStatus('completed')}
          >
            <Text style={styles.statusButtonText}>Completed</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  const renderNotesTab = () => {
    return (
      <View style={styles.tabContent}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={note}
            onChangeText={setNote}
            placeholder="Add a note..."
            placeholderTextColor={Colors.textSecondary}
            multiline
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddNote}>
            <Plus size={20} color={Colors.card} />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.sectionTitle}>Notes</Text>
        
        <View style={styles.notesContainer}>
          {!stage.notes ? (
            <Text style={styles.emptyText}>No notes added yet.</Text>
          ) : (
            <Text style={styles.notesText}>{stage.notes}</Text>
          )}
        </View>
      </View>
    );
  };
  
  const renderIssuesTab = () => {
    return (
      <View style={styles.tabContent}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={issueDescription}
            onChangeText={setIssueDescription}
            placeholder="Describe the issue..."
            placeholderTextColor={Colors.textSecondary}
            multiline
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddIssue}>
            <Plus size={20} color={Colors.card} />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.sectionTitle}>Issues</Text>
        
        {stage.issues.length === 0 ? (
          <Text style={styles.emptyText}>No issues reported.</Text>
        ) : (
          <View style={styles.issuesContainer}>
            {stage.issues.map(issue => (
              <View key={issue.id} style={[styles.issueItem, issue.resolved && styles.resolvedIssue]}>
                <View style={styles.issueContent}>
                  <Text style={styles.issueDescription}>{issue.description}</Text>
                  <Text style={styles.issueDate}>
                    Reported: {formatDate(issue.createdAt)}
                    {issue.resolved && ` • Resolved: ${formatDate(issue.resolvedAt!)}`}
                  </Text>
                </View>
                
                {!issue.resolved && (
                  <TouchableOpacity 
                    style={styles.resolveButton} 
                    onPress={() => handleResolveIssue(issue.id)}
                  >
                    <CheckCircle size={20} color={Colors.success} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };
  
  const renderDelaysTab = () => {
    return (
      <View style={styles.tabContent}>
        <View style={styles.delayInputContainer}>
          <TextInput
            style={styles.textInput}
            value={delayReason}
            onChangeText={setDelayReason}
            placeholder="Reason for delay..."
            placeholderTextColor={Colors.textSecondary}
            multiline
          />
          
          <View style={styles.delayDaysContainer}>
            <TextInput
              style={styles.daysInput}
              value={delayDays}
              onChangeText={setDelayDays}
              placeholder="Days"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="number-pad"
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddDelay}>
              <Plus size={20} color={Colors.card} />
            </TouchableOpacity>
          </View>
        </View>
        
        <Text style={styles.sectionTitle}>Delays</Text>
        
        {stage.delays.length === 0 ? (
          <Text style={styles.emptyText}>No delays recorded.</Text>
        ) : (
          <View style={styles.delaysContainer}>
            {stage.delays.map(delay => (
              <View key={delay.id} style={styles.delayItem}>
                <View style={styles.delayContent}>
                  <Text style={styles.delayReason}>{delay.reason}</Text>
                  <View style={styles.delayFooter}>
                    <Text style={styles.delayDays}>+{delay.daysAdded} days</Text>
                    <Text style={styles.delayDate}>{formatDate(delay.createdAt)}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };
  
  return (
    <>
      <Stack.Screen options={{ title: stage.name }} />
      
      <View style={styles.container}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'details' && styles.activeTab]} 
            onPress={() => setActiveTab('details')}
          >
            <Text style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>Details</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'notes' && styles.activeTab]} 
            onPress={() => setActiveTab('notes')}
          >
            <Text style={[styles.tabText, activeTab === 'notes' && styles.activeTabText]}>Notes</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'issues' && styles.activeTab]} 
            onPress={() => setActiveTab('issues')}
          >
            <Text style={[styles.tabText, activeTab === 'issues' && styles.activeTabText]}>Issues</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'delays' && styles.activeTab]} 
            onPress={() => setActiveTab('delays')}
          >
            <Text style={[styles.tabText, activeTab === 'delays' && styles.activeTabText]}>Delays</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'details' && renderDetailsTab()}
          {activeTab === 'notes' && renderNotesTab()}
          {activeTab === 'issues' && renderIssuesTab()}
          {activeTab === 'delays' && renderDelaysTab()}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.primary,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  detailsContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  detailValue: {
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusButtonText: {
    color: Colors.card,
    fontWeight: '500',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addButton: {
    backgroundColor: Colors.primary,
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  notesContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
  },
  notesText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    marginTop: 20,
  },
  issuesContainer: {
    gap: 12,
  },
  issueItem: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.danger,
  },
  resolvedIssue: {
    borderLeftColor: Colors.success,
    opacity: 0.7,
  },
  issueContent: {
    flex: 1,
  },
  issueDescription: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 8,
  },
  issueDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  resolveButton: {
    marginLeft: 8,
    justifyContent: 'center',
  },
  delayInputContainer: {
    marginBottom: 20,
  },
  delayDaysContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  daysInput: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  delaysContainer: {
    gap: 12,
  },
  delayItem: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  delayContent: {
    flex: 1,
  },
  delayReason: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 8,
  },
  delayFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  delayDays: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.danger,
  },
  delayDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
});