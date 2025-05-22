import React, { useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Plus } from 'lucide-react-native';
import { usePlotStore } from '@/store/plotStore';
import PlotCard from '@/components/PlotCard';
import EmptyState from '@/components/EmptyState';
import { getPlotSummary } from '@/utils/plot';
import Colors from '@/constants/colors';

export default function DashboardScreen() {
  const router = useRouter();
  const { plots } = usePlotStore();
  
  // Force a re-render when the screen is focused to update the plot summaries
  useFocusEffect(
    useCallback(() => {
      // This is just to trigger a re-render
    }, [])
  );
  
  const plotSummaries = plots.map(plot => getPlotSummary(plot));
  
  const handleAddPlot = () => {
    router.push('/plot/new');
  };
  
  if (plots.length === 0) {
    return (
      <EmptyState
        title="No Plots Yet"
        message="Start tracking your construction projects by adding your first plot."
        buttonText="Add Your First Plot"
        onPress={handleAddPlot}
      />
    );
  }
  
  return (
    <View style={styles.container}>
      <FlatList
        data={plotSummaries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PlotCard plot={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      
      <TouchableOpacity style={styles.fab} onPress={handleAddPlot}>
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
});