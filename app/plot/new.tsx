import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { usePlotStore } from '@/store/plotStore';
import Colors from '@/constants/colors';
import { getCurrentDate, formatDate } from '@/utils/date';
import { Calendar } from 'lucide-react-native';

export default function NewPlotScreen() {
  const router = useRouter();
  const { addPlot } = usePlotStore();
  
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().setMonth(new Date().getMonth() + 3))); // Default to 3 months from now
  
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  
  const handleCreatePlot = () => {
    // Validate inputs
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a plot name');
      return;
    }
    
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter a plot address');
      return;
    }
    
    if (endDate <= startDate) {
      Alert.alert('Error', 'End date must be after start date');
      return;
    }
    
    // Create the plot
    addPlot(name, address, startDate.toISOString(), endDate.toISOString());
    
    // Navigate back to dashboard
    router.push('/');
  };
  
  const onStartDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(Platform.OS === 'ios');
    setStartDate(currentDate);
    
    // If end date is before the new start date, update it
    if (endDate < currentDate) {
      // Set end date to 3 months after the new start date
      const newEndDate = new Date(currentDate);
      newEndDate.setMonth(newEndDate.getMonth() + 3);
      setEndDate(newEndDate);
    }
  };
  
  const onEndDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || endDate;
    setShowEndDatePicker(Platform.OS === 'ios');
    setEndDate(currentDate);
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Plot Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter plot name"
          placeholderTextColor={Colors.textSecondary}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Address</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder="Enter plot address"
          placeholderTextColor={Colors.textSecondary}
          multiline
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Start Date</Text>
        <TouchableOpacity 
          style={styles.datePickerButton}
          onPress={() => setShowStartDatePicker(true)}
        >
          <Text style={styles.dateText}>{formatDate(startDate.toISOString())}</Text>
          <Calendar size={20} color={Colors.primary} />
        </TouchableOpacity>
        
        {showStartDatePicker && (
          <DateTimePicker
            testID="startDatePicker"
            value={startDate}
            mode="date"
            display={Platform.OS === 'ios' ? "inline" : "default"}
            onChange={onStartDateChange}
          />
        )}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>End Date</Text>
        <TouchableOpacity 
          style={styles.datePickerButton}
          onPress={() => setShowEndDatePicker(true)}
        >
          <Text style={styles.dateText}>{formatDate(endDate.toISOString())}</Text>
          <Calendar size={20} color={Colors.primary} />
        </TouchableOpacity>
        
        {showEndDatePicker && (
          <DateTimePicker
            testID="endDatePicker"
            value={endDate}
            mode="date"
            display={Platform.OS === 'ios' ? "inline" : "default"}
            onChange={onEndDateChange}
            minimumDate={startDate}
          />
        )}
      </View>
      
      <TouchableOpacity style={styles.createButton} onPress={handleCreatePlot}>
        <Text style={styles.createButtonText}>Create Plot</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  datePickerButton: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: Colors.text,
  },
  createButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  createButtonText: {
    color: Colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
});