import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FileText, Share2, X } from 'lucide-react-native';
import { usePlotStore } from '@/store/plotStore';
import Colors from '@/constants/colors';
import { getPlotSummary } from '@/utils/plot';
import { formatDate } from '@/utils/date';

export default function ReportsScreen() {
  const router = useRouter();
  const { plots } = usePlotStore();
  const [reportType, setReportType] = useState<'all' | 'individual'>('all');
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);
  
  const handleClose = () => {
    router.back();
  };
  
  const handleShare = () => {
    // In a real app, this would generate a PDF or share the report
    alert('Report sharing would be implemented here');
  };
  
  const renderAllPlotsReport = () => {
    const plotSummaries = plots.map(plot => getPlotSummary(plot));
    
    return (
      <View style={styles.reportContent}>
        <View style={styles.reportHeader}>
          <Text style={styles.reportTitle}>Construction Progress Report</Text>
          <Text style={styles.reportDate}>Generated on {formatDate(new Date().toISOString())}</Text>
        </View>
        
        <View style={styles.reportSection}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.overviewStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{plots.length}</Text>
              <Text style={styles.statLabel}>Total Plots</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {plotSummaries.filter(p => p.status === 'ahead').length}
              </Text>
              <Text style={styles.statLabel}>Ahead</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {plotSummaries.filter(p => p.status === 'on-schedule').length}
              </Text>
              <Text style={styles.statLabel}>On Schedule</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {plotSummaries.filter(p => p.status === 'behind').length}
              </Text>
              <Text style={styles.statLabel}>Behind</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.reportSection}>
          <Text style={styles.sectionTitle}>Current Stages</Text>
          
          {plotSummaries.map(plot => (
            <View key={plot.id} style={styles.plotSummaryItem}>
              <View style={styles.plotSummaryHeader}>
                <Text style={styles.plotName}>{plot.name}</Text>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: plot.status === 'ahead' 
                    ? Colors.ahead 
                    : plot.status === 'behind' 
                      ? Colors.danger 
                      : Colors.onSchedule 
                  }
                ]}>
                  <Text style={styles.statusText}>
                    {plot.status === 'ahead' 
                      ? `${plot.daysAheadOrBehind}d ahead` 
                      : plot.status === 'behind' 
                        ? `${plot.daysAheadOrBehind}d behind` 
                        : 'On schedule'
                    }
                  </Text>
                </View>
              </View>
              
              <View style={styles.plotSummaryDetails}>
                <Text style={styles.plotDetail}>
                  <Text style={styles.plotDetailLabel}>Current Stage: </Text>
                  {plot.currentStage}
                </Text>
                <Text style={styles.plotDetail}>
                  <Text style={styles.plotDetailLabel}>Progress: </Text>
                  {plot.progress}%
                </Text>
                <Text style={styles.plotDetail}>
                  <Text style={styles.plotDetailLabel}>Days Remaining: </Text>
                  {plot.daysRemaining}
                </Text>
              </View>
            </View>
          ))}
        </View>
        
        <View style={styles.reportSection}>
          <Text style={styles.sectionTitle}>Issues Summary</Text>
          
          {plots.some(plot => plot.stages.some(stage => stage.issues.some(issue => !issue.resolved))) ? (
            plots.map(plot => {
              const unresolvedIssues = plot.stages.flatMap(stage => 
                stage.issues
                  .filter(issue => !issue.resolved)
                  .map(issue => ({ ...issue, stageName: stage.name }))
              );
              
              if (unresolvedIssues.length === 0) return null;
              
              return (
                <View key={plot.id} style={styles.issuesSummaryItem}>
                  <Text style={styles.issuesPlotName}>{plot.name}</Text>
                  
                  {unresolvedIssues.map(issue => (
                    <View key={issue.id} style={styles.issueRow}>
                      <Text style={styles.issueStageName}>{issue.stageName}:</Text>
                      <Text style={styles.issueText}>{issue.description}</Text>
                    </View>
                  ))}
                </View>
              );
            })
          ) : (
            <Text style={styles.noDataText}>No unresolved issues</Text>
          )}
        </View>
        
        <View style={styles.reportSection}>
          <Text style={styles.sectionTitle}>Delays Summary</Text>
          
          {plots.some(plot => plot.stages.some(stage => stage.delays.length > 0)) ? (
            plots.map(plot => {
              const delays = plot.stages.flatMap(stage => 
                stage.delays.map(delay => ({ ...delay, stageName: stage.name }))
              );
              
              if (delays.length === 0) return null;
              
              const totalDelayDays = delays.reduce((total, delay) => total + delay.daysAdded, 0);
              
              return (
                <View key={plot.id} style={styles.delaysSummaryItem}>
                  <View style={styles.delaysSummaryHeader}>
                    <Text style={styles.delaysPlotName}>{plot.name}</Text>
                    <Text style={styles.delaysTotalDays}>+{totalDelayDays} days</Text>
                  </View>
                  
                  {delays.map(delay => (
                    <View key={delay.id} style={styles.delayRow}>
                      <Text style={styles.delayStageName}>{delay.stageName}:</Text>
                      <Text style={styles.delayText}>{delay.reason} (+{delay.daysAdded} days)</Text>
                    </View>
                  ))}
                </View>
              );
            })
          ) : (
            <Text style={styles.noDataText}>No delays recorded</Text>
          )}
        </View>
      </View>
    );
  };
  
  const renderIndividualPlotReport = () => {
    if (!selectedPlotId) {
      return (
        <View style={styles.selectPlotContainer}>
          <Text style={styles.selectPlotTitle}>Select a Plot</Text>
          
          {plots.map(plot => (
            <TouchableOpacity
              key={plot.id}
              style={styles.plotSelectButton}
              onPress={() => setSelectedPlotId(plot.id)}
            >
              <Text style={styles.plotSelectButtonText}>{plot.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }
    
    const plot = plots.find(p => p.id === selectedPlotId);
    if (!plot) return null;
    
    const plotSummary = getPlotSummary(plot);
    
    return (
      <View style={styles.reportContent}>
        <View style={styles.reportHeader}>
          <Text style={styles.reportTitle}>{plot.name} - Detailed Report</Text>
          <Text style={styles.reportDate}>Generated on {formatDate(new Date().toISOString())}</Text>
        </View>
        
        <View style={styles.reportSection}>
          <Text style={styles.sectionTitle}>Plot Information</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={styles.infoValue}>{plot.address}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Start Date</Text>
            <Text style={styles.infoValue}>{formatDate(plot.startDate)}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>End Date</Text>
            <Text style={styles.infoValue}>{formatDate(plot.endDate)}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Current Stage</Text>
            <Text style={styles.infoValue}>{plotSummary.currentStage}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Progress</Text>
            <Text style={styles.infoValue}>{plotSummary.progress}%</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={[
              styles.infoValue, 
              { 
                color: plotSummary.status === 'ahead' 
                  ? Colors.ahead 
                  : plotSummary.status === 'behind' 
                    ? Colors.danger 
                    : Colors.onSchedule 
              }
            ]}>
              {plotSummary.status === 'ahead' 
                ? `${plotSummary.daysAheadOrBehind} days ahead of schedule` 
                : plotSummary.status === 'behind' 
                  ? `${plotSummary.daysAheadOrBehind} days behind schedule` 
                  : 'On schedule'
              }
            </Text>
          </View>
        </View>
        
        <View style={styles.reportSection}>
          <Text style={styles.sectionTitle}>Stage Progress</Text>
          
          {plot.stages.map((stage, index) => (
            <View key={stage.id} style={styles.stageItem}>
              <View style={styles.stageHeader}>
                <Text style={styles.stageNumber}>{index + 1}</Text>
                <Text style={styles.stageName}>{stage.name}</Text>
                <Text style={[
                  styles.stageStatus,
                  { 
                    color: stage.status === 'completed' 
                      ? Colors.success 
                      : stage.status === 'in-progress' 
                        ? Colors.primary 
                        : stage.status === 'delayed'
                          ? Colors.danger
                          : Colors.textSecondary 
                  }
                ]}>
                  {stage.status === 'completed' 
                    ? 'Completed' 
                    : stage.status === 'in-progress' 
                      ? 'In Progress' 
                      : stage.status === 'delayed'
                        ? 'Delayed'
                        : 'Not Started'
                  }
                </Text>
              </View>
              
              {(stage.actualStartDate || stage.actualEndDate) && (
                <View style={styles.stageDates}>
                  {stage.actualStartDate && (
                    <Text style={styles.stageDate}>
                      Started: {formatDate(stage.actualStartDate)}
                    </Text>
                  )}
                  
                  {stage.actualEndDate && (
                    <Text style={styles.stageDate}>
                      Completed: {formatDate(stage.actualEndDate)}
                    </Text>
                  )}
                </View>
              )}
              
              {stage.delays.length > 0 && (
                <View style={styles.stageDelays}>
                  <Text style={styles.stageDelaysTitle}>
                    Delays: +{stage.delays.reduce((total, delay) => total + delay.daysAdded, 0)} days
                  </Text>
                  
                  {stage.delays.map(delay => (
                    <Text key={delay.id} style={styles.stageDelayItem}>
                      • {delay.reason} (+{delay.daysAdded} days)
                    </Text>
                  ))}
                </View>
              )}
              
              {stage.issues.length > 0 && (
                <View style={styles.stageIssues}>
                  <Text style={styles.stageIssuesTitle}>
                    Issues: {stage.issues.filter(issue => !issue.resolved).length} open
                  </Text>
                  
                  {stage.issues.map(issue => (
                    <Text key={issue.id} style={styles.stageIssueItem}>
                      • {issue.description} {issue.resolved ? '(Resolved)' : '(Open)'}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
        
        {plot.notes && (
          <View style={styles.reportSection}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{plot.notes}</Text>
          </View>
        )}
      </View>
    );
  };
  
  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Reports',
          headerLeft: () => (
            <TouchableOpacity onPress={handleClose} style={{ marginLeft: 16 }}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleShare} style={{ marginRight: 16 }}>
              <Share2 size={24} color={Colors.primary} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View style={styles.container}>
        <View style={styles.reportTypeSelector}>
          <TouchableOpacity 
            style={[styles.reportTypeButton, reportType === 'all' && styles.selectedReportType]} 
            onPress={() => {
              setReportType('all');
              setSelectedPlotId(null);
            }}
          >
            <Text style={[styles.reportTypeButtonText, reportType === 'all' && styles.selectedReportTypeText]}>
              All Plots
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.reportTypeButton, reportType === 'individual' && styles.selectedReportType]} 
            onPress={() => setReportType('individual')}
          >
            <Text style={[styles.reportTypeButtonText, reportType === 'individual' && styles.selectedReportTypeText]}>
              Individual Plot
            </Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.reportContainer} showsVerticalScrollIndicator={false}>
          {reportType === 'all' ? renderAllPlotsReport() : renderIndividualPlotReport()}
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
  reportTypeSelector: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  reportTypeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: Colors.background,
    marginHorizontal: 4,
  },
  selectedReportType: {
    backgroundColor: Colors.primary,
  },
  reportTypeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  selectedReportTypeText: {
    color: Colors.card,
  },
  reportContainer: {
    flex: 1,
  },
  reportContent: {
    padding: 16,
  },
  reportHeader: {
    marginBottom: 24,
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  reportDate: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  reportSection: {
    marginBottom: 24,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 8,
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  plotSummaryItem: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 16,
  },
  plotSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  plotName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.card,
  },
  plotSummaryDetails: {
    gap: 4,
  },
  plotDetail: {
    fontSize: 14,
    color: Colors.text,
  },
  plotDetailLabel: {
    fontWeight: '500',
  },
  issuesSummaryItem: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 16,
  },
  issuesPlotName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  issueRow: {
    marginBottom: 4,
  },
  issueStageName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  issueText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 8,
  },
  noDataText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    marginTop: 8,
  },
  delaysSummaryItem: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 16,
  },
  delaysSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  delaysPlotName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  delaysTotalDays: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.danger,
  },
  delayRow: {
    marginBottom: 4,
  },
  delayStageName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  delayText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 8,
  },
  selectPlotContainer: {
    padding: 16,
  },
  selectPlotTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  plotSelectButton: {
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  plotSelectButtonText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
  },
  infoItem: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.text,
  },
  stageItem: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 16,
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stageNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    color: Colors.card,
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  stageName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  stageStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  stageDates: {
    marginBottom: 8,
  },
  stageDate: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  stageDelays: {
    marginBottom: 8,
  },
  stageDelaysTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.danger,
    marginBottom: 4,
  },
  stageDelayItem: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 8,
  },
  stageIssues: {
    marginBottom: 8,
  },
  stageIssuesTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  stageIssueItem: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 8,
  },
  notesText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
});