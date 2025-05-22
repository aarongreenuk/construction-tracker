import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { FileText, ChevronRight } from 'lucide-react-native';
import { usePlotStore } from '@/store/plotStore';
import { getPlotSummary } from '@/utils/plot';
import Colors from '@/constants/colors';
import EmptyState from '@/components/EmptyState';

export default function SummaryScreen() {
  const router = useRouter();
  const { plots } = usePlotStore();
  const [selectedReport, setSelectedReport] = useState<'current-stage' | 'progress' | 'issues' | 'delays'>('current-stage');
  
  const handleGenerateReport = () => {
    router.push('/reports');
  };
  
  if (plots.length === 0) {
    return (
      <EmptyState
        title="No Data Available"
        message="Add plots to generate summary reports and track your construction progress."
        buttonText="Add Your First Plot"
        onPress={() => router.push('/plot/new')}
      />
    );
  }
  
  const plotSummaries = plots.map(plot => getPlotSummary(plot));
  
  const renderCurrentStageReport = () => {
    return (
      <View style={styles.reportContent}>
        <Text style={styles.reportDescription}>
          Overview of current stages across all plots
        </Text>
        
        {plotSummaries.map(plot => (
          <View key={plot.id} style={styles.summaryItem}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>{plot.name}</Text>
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
            
            <View style={styles.summaryDetails}>
              <View style={styles.summaryDetail}>
                <Text style={styles.detailLabel}>Current Stage</Text>
                <Text style={styles.detailValue}>{plot.currentStage}</Text>
              </View>
              
              <View style={styles.summaryDetail}>
                <Text style={styles.detailLabel}>Progress</Text>
                <Text style={styles.detailValue}>{plot.progress}%</Text>
              </View>
              
              <View style={styles.summaryDetail}>
                <Text style={styles.detailLabel}>Days Remaining</Text>
                <Text style={styles.detailValue}>{plot.daysRemaining}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };
  
  const renderProgressReport = () => {
    // Sort plots by progress
    const sortedPlots = [...plotSummaries].sort((a, b) => b.progress - a.progress);
    
    return (
      <View style={styles.reportContent}>
        <Text style={styles.reportDescription}>
          Overall progress of all plots
        </Text>
        
        {sortedPlots.map(plot => (
          <View key={plot.id} style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>{plot.name}</Text>
              <Text style={styles.progressPercentage}>{plot.progress}%</Text>
            </View>
            
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${plot.progress}%` }]} />
            </View>
            
            <Text style={styles.progressStage}>
              Current: {plot.currentStage}
            </Text>
          </View>
        ))}
      </View>
    );
  };
  
  const renderIssuesReport = () => {
    const issuesByPlot = plots.map(plot => {
      const issues = plot.stages.flatMap(stage => 
        stage.issues.map(issue => ({
          ...issue,
          stageName: stage.name,
          plotName: plot.name,
          plotId: plot.id,
        }))
      );
      
      return {
        plotName: plot.name,
        plotId: plot.id,
        issues,
      };
    }).filter(plot => plot.issues.length > 0);
    
    return (
      <View style={styles.reportContent}>
        <Text style={styles.reportDescription}>
          Outstanding issues across all plots
        </Text>
        
        {issuesByPlot.length === 0 ? (
          <Text style={styles.noDataText}>No issues reported</Text>
        ) : (
          issuesByPlot.map(plot => (
            <View key={plot.plotId} style={styles.issuesContainer}>
              <Text style={styles.issuesTitle}>{plot.plotName}</Text>
              
              {plot.issues.filter(issue => !issue.resolved).map((issue, index) => (
                <View key={issue.id} style={styles.issueItem}>
                  <View style={styles.issueDot} />
                  <View style={styles.issueContent}>
                    <Text style={styles.issueStage}>{issue.stageName}</Text>
                    <Text style={styles.issueDescription}>{issue.description}</Text>
                    <Text style={styles.issueDate}>Reported: {new Date(issue.createdAt).toLocaleDateString()}</Text>
                  </View>
                </View>
              ))}
            </View>
          ))
        )}
      </View>
    );
  };
  
  const renderDelaysReport = () => {
    const delaysByPlot = plots.map(plot => {
      const delays = plot.stages.flatMap(stage => 
        stage.delays.map(delay => ({
          ...delay,
          stageName: stage.name,
          plotName: plot.name,
          plotId: plot.id,
        }))
      );
      
      return {
        plotName: plot.name,
        plotId: plot.id,
        delays,
        totalDays: delays.reduce((total, delay) => total + delay.daysAdded, 0),
      };
    }).filter(plot => plot.delays.length > 0);
    
    return (
      <View style={styles.reportContent}>
        <Text style={styles.reportDescription}>
          Delays and their impact across all plots
        </Text>
        
        {delaysByPlot.length === 0 ? (
          <Text style={styles.noDataText}>No delays reported</Text>
        ) : (
          delaysByPlot.map(plot => (
            <View key={plot.plotId} style={styles.delaysContainer}>
              <View style={styles.delaysHeader}>
                <Text style={styles.delaysTitle}>{plot.plotName}</Text>
                <Text style={styles.delaysTotalDays}>+{plot.totalDays} days</Text>
              </View>
              
              {plot.delays.map((delay, index) => (
                <View key={delay.id} style={styles.delayItem}>
                  <View style={styles.delayDot} />
                  <View style={styles.delayContent}>
                    <Text style={styles.delayStage}>{delay.stageName}</Text>
                    <Text style={styles.delayReason}>{delay.reason}</Text>
                    <View style={styles.delayFooter}>
                      <Text style={styles.delayDays}>+{delay.daysAdded} days</Text>
                      <Text style={styles.delayDate}>{new Date(delay.createdAt).toLocaleDateString()}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ))
        )}
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.reportTypesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.reportTypes}>
          <TouchableOpacity
            style={[styles.reportTypeButton, selectedReport === 'current-stage' && styles.selectedReportType]}
            onPress={() => setSelectedReport('current-stage')}
          >
            <Text style={[styles.reportTypeText, selectedReport === 'current-stage' && styles.selectedReportTypeText]}>
              Current Stage
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.reportTypeButton, selectedReport === 'progress' && styles.selectedReportType]}
            onPress={() => setSelectedReport('progress')}
          >
            <Text style={[styles.reportTypeText, selectedReport === 'progress' && styles.selectedReportTypeText]}>
              Progress
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.reportTypeButton, selectedReport === 'issues' && styles.selectedReportType]}
            onPress={() => setSelectedReport('issues')}
          >
            <Text style={[styles.reportTypeText, selectedReport === 'issues' && styles.selectedReportTypeText]}>
              Issues
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.reportTypeButton, selectedReport === 'delays' && styles.selectedReportType]}
            onPress={() => setSelectedReport('delays')}
          >
            <Text style={[styles.reportTypeText, selectedReport === 'delays' && styles.selectedReportTypeText]}>
              Delays
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      <ScrollView style={styles.reportContainer} showsVerticalScrollIndicator={false}>
        {selectedReport === 'current-stage' && renderCurrentStageReport()}
        {selectedReport === 'progress' && renderProgressReport()}
        {selectedReport === 'issues' && renderIssuesReport()}
        {selectedReport === 'delays' && renderDelaysReport()}
      </ScrollView>
      
      <TouchableOpacity style={styles.generateReportButton} onPress={handleGenerateReport}>
        <FileText size={20} color={Colors.card} />
        <Text style={styles.generateReportText}>Generate Detailed Report</Text>
        <ChevronRight size={20} color={Colors.card} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  reportTypesContainer: {
    backgroundColor: Colors.card,
    paddingVertical: 12,
  },
  reportTypes: {
    paddingHorizontal: 16,
    gap: 12,
  },
  reportTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: Colors.background,
  },
  selectedReportType: {
    backgroundColor: Colors.primary,
  },
  reportTypeText: {
    fontSize: 14,
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
  reportDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  summaryItem: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitle: {
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
  summaryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryDetail: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  progressItem: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.progressBarBackground,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.progressBar,
    borderRadius: 4,
  },
  progressStage: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  noDataText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    marginTop: 20,
  },
  issuesContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  issuesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  issueItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  issueDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.danger,
    marginTop: 6,
    marginRight: 8,
  },
  issueContent: {
    flex: 1,
  },
  issueStage: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  issueDescription: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  issueDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  delaysContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  delaysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  delaysTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  delaysTotalDays: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.danger,
  },
  delayItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  delayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.warning,
    marginTop: 6,
    marginRight: 8,
  },
  delayContent: {
    flex: 1,
  },
  delayStage: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  delayReason: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  delayFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  delayDays: {
    fontSize: 12,
    color: Colors.danger,
  },
  delayDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  generateReportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  generateReportText: {
    flex: 1,
    textAlign: 'center',
    color: Colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
});