import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { usePlotStore } from '@/store/plotStore';
import Colors from '@/constants/colors';
import { formatDate } from '@/utils/date';

// Simple calendar implementation
export default function CalendarScreen() {
  const { plots } = usePlotStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  const [events, setEvents] = useState<{plotId: string, plotName: string, stageName: string, type: 'start' | 'end'}[]>([]);
  
  // Generate calendar days for the current month
  useEffect(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days: Date[] = [];
    
    // Add previous month days to fill the first week
    const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    for (let i = firstDayOfWeek; i > 0; i--) {
      const prevMonthDay = new Date(year, month, 1 - i);
      days.push(prevMonthDay);
    }
    
    // Add current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    // Add next month days to fill the last week
    const lastDayOfWeek = lastDay.getDay(); // 0 = Sunday, 6 = Saturday
    for (let i = 1; i < 7 - lastDayOfWeek; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    setCalendarDays(days);
  }, [selectedDate]);
  
  // Find events for the selected date
  useEffect(() => {
    if (!plots.length) return;
    
    const selectedDateStr = formatDateForComparison(selectedDate);
    const dayEvents: {plotId: string, plotName: string, stageName: string, type: 'start' | 'end'}[] = [];
    
    plots.forEach(plot => {
      plot.stages.forEach(stage => {
        // Skip auto-completed stages
        if (stage.autoCompleted) return;
        
        // Check planned start dates
        if (stage.plannedStartDate && formatDateForComparison(new Date(stage.plannedStartDate)) === selectedDateStr) {
          dayEvents.push({
            plotId: plot.id,
            plotName: plot.name,
            stageName: stage.name,
            type: 'start'
          });
        }
        
        // Check planned end dates
        if (stage.plannedEndDate && formatDateForComparison(new Date(stage.plannedEndDate)) === selectedDateStr) {
          dayEvents.push({
            plotId: plot.id,
            plotName: plot.name,
            stageName: stage.name,
            type: 'end'
          });
        }
        
        // Check actual start dates
        if (stage.actualStartDate && formatDateForComparison(new Date(stage.actualStartDate)) === selectedDateStr && !stage.autoCompleted) {
          dayEvents.push({
            plotId: plot.id,
            plotName: plot.name,
            stageName: stage.name,
            type: 'start'
          });
        }
        
        // Check actual end dates
        if (stage.actualEndDate && formatDateForComparison(new Date(stage.actualEndDate)) === selectedDateStr && !stage.autoCompleted) {
          dayEvents.push({
            plotId: plot.id,
            plotName: plot.name,
            stageName: stage.name,
            type: 'end'
          });
        }
      });
    });
    
    setEvents(dayEvents);
  }, [plots, selectedDate]);
  
  // Helper function to format date for consistent comparison
  const formatDateForComparison = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  
  const goToPreviousMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  };
  
  const goToNextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
  };
  
  const selectDay = (day: Date) => {
    setSelectedDate(day);
  };
  
  const isToday = (day: Date) => {
    const today = new Date();
    return day.getDate() === today.getDate() &&
      day.getMonth() === today.getMonth() &&
      day.getFullYear() === today.getFullYear();
  };
  
  const isSelectedDay = (day: Date) => {
    return day.getDate() === selectedDate.getDate() &&
      day.getMonth() === selectedDate.getMonth() &&
      day.getFullYear() === selectedDate.getFullYear();
  };
  
  const isDifferentMonth = (day: Date) => {
    return day.getMonth() !== selectedDate.getMonth();
  };
  
  const isWeekend = (day: Date) => {
    const dayOfWeek = day.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // 0 is Sunday, 6 is Saturday
  };
  
  const hasEvents = (day: Date) => {
    const dayStr = formatDateForComparison(day);
    
    return plots.some(plot => 
      plot.stages.some(stage => 
        // Skip auto-completed stages
        !stage.autoCompleted && (
          (stage.plannedStartDate && formatDateForComparison(new Date(stage.plannedStartDate)) === dayStr) ||
          (stage.plannedEndDate && formatDateForComparison(new Date(stage.plannedEndDate)) === dayStr) ||
          (stage.actualStartDate && formatDateForComparison(new Date(stage.actualStartDate)) === dayStr) ||
          (stage.actualEndDate && formatDateForComparison(new Date(stage.actualEndDate)) === dayStr)
        )
      )
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth}>
          <Text style={styles.headerButton}>Previous</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </Text>
        <TouchableOpacity onPress={goToNextMonth}>
          <Text style={styles.headerButton}>Next</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.weekdaysContainer}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <Text key={index} style={[
            styles.weekdayText,
            (index === 0 || index === 6) && styles.weekendText
          ]}>
            {day}
          </Text>
        ))}
      </View>
      
      <View style={styles.calendarGrid}>
        {calendarDays.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayContainer,
              isToday(day) && styles.todayContainer,
              isSelectedDay(day) && styles.selectedDayContainer,
              isWeekend(day) && styles.weekendContainer,
            ]}
            onPress={() => selectDay(day)}
          >
            <Text style={[
              styles.dayText,
              isDifferentMonth(day) && styles.differentMonthText,
              isSelectedDay(day) && styles.selectedDayText,
              isWeekend(day) && styles.weekendText,
            ]}>
              {day.getDate()}
            </Text>
            {hasEvents(day) && <View style={styles.eventDot} />}
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.eventsContainer}>
        <Text style={styles.eventsTitle}>
          Events for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>
        
        <ScrollView style={styles.eventsList}>
          {events.length === 0 ? (
            <Text style={styles.noEventsText}>No events for this day</Text>
          ) : (
            events.map((event, index) => (
              <View key={index} style={styles.eventItem}>
                <View style={[
                  styles.eventTypeIndicator, 
                  { backgroundColor: event.type === 'start' ? Colors.primary : Colors.secondary }
                ]} />
                <View style={styles.eventContent}>
                  <Text style={styles.eventPlot}>{event.plotName}</Text>
                  <Text style={styles.eventStage}>{event.stageName}</Text>
                  <Text style={styles.eventType}>
                    {event.type === 'start' ? 'Start' : 'End'} Date
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerButton: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  weekdaysContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    color: Colors.textSecondary,
    fontWeight: '500',
    fontSize: 14,
  },
  weekendText: {
    color: Colors.textSecondary,
    opacity: 0.6,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 16,
  },
  dayContainer: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  todayContainer: {
    backgroundColor: Colors.border,
    borderRadius: 20,
  },
  selectedDayContainer: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
  },
  weekendContainer: {
    backgroundColor: Colors.background,
  },
  dayText: {
    fontSize: 16,
    color: Colors.text,
  },
  differentMonthText: {
    color: Colors.textSecondary,
    opacity: 0.5,
  },
  selectedDayText: {
    color: Colors.card,
    fontWeight: '600',
  },
  eventDot: {
    position: 'absolute',
    bottom: 6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  eventsContainer: {
    flex: 1,
    marginTop: 16,
  },
  eventsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  eventsList: {
    flex: 1,
  },
  noEventsText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
  eventItem: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  eventTypeIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  eventContent: {
    flex: 1,
  },
  eventPlot: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  eventStage: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  eventType: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});