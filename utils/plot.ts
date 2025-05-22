import { Plot, PlotSummary, Stage, StageStatus } from '@/types/plot';
import { BUILD_STAGES, getStageIndex } from '@/constants/stages';
import { addDays, addWorkDays, getWorkDaysBetween, getCurrentDate } from '@/utils/date';

export const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const calculatePlotProgress = (plot: Plot): number => {
  const completedStages = plot.stages.filter(stage => stage.status === 'completed').length;
  return Math.round((completedStages / plot.stages.length) * 100);
};

export const calculateRemainingDuration = (plot: Plot): number => {
  const remainingStages = plot.stages.filter(
    stage => stage.status === 'not-started' || stage.status === 'in-progress'
  );
  
  let remainingDays = 0;
  
  remainingStages.forEach(stage => {
    if (stage.status === 'not-started') {
      remainingDays += stage.duration;
    } else if (stage.status === 'in-progress' && stage.actualStartDate) {
      const daysElapsed = getWorkDaysBetween(stage.actualStartDate, getCurrentDate());
      remainingDays += Math.max(0, stage.duration - daysElapsed);
    }
  });
  
  // Add days from delays
  const totalDelayDays = plot.stages.reduce((total, stage) => {
    return total + stage.delays.reduce((delayTotal, delay) => delayTotal + delay.daysAdded, 0);
  }, 0);
  
  return remainingDays + totalDelayDays;
};

export const calculatePlotStatus = (plot: Plot): { status: 'ahead' | 'behind' | 'on-schedule', daysAheadOrBehind: number } => {
  const remainingDuration = calculateRemainingDuration(plot);
  const workDaysUntilEnd = getWorkDaysBetween(getCurrentDate(), plot.endDate);
  
  if (remainingDuration < workDaysUntilEnd) {
    return { status: 'ahead', daysAheadOrBehind: workDaysUntilEnd - remainingDuration };
  } else if (remainingDuration > workDaysUntilEnd) {
    return { status: 'behind', daysAheadOrBehind: remainingDuration - workDaysUntilEnd };
  } else {
    return { status: 'on-schedule', daysAheadOrBehind: 0 };
  }
};

export const getPlotSummary = (plot: Plot): PlotSummary => {
  const currentStage = plot.stages.find(stage => stage.id === plot.currentStageId);
  const progress = calculatePlotProgress(plot);
  const remainingDuration = calculateRemainingDuration(plot);
  const { status, daysAheadOrBehind } = calculatePlotStatus(plot);
  
  return {
    id: plot.id,
    name: plot.name,
    currentStage: currentStage?.name || 'Not started',
    progress,
    daysRemaining: remainingDuration,
    status,
    daysAheadOrBehind,
  };
};

export const createNewPlot = (name: string, address: string, startDate: string, endDate: string): Plot => {
  let currentStartDate = startDate;
  const stages: Stage[] = BUILD_STAGES.map((stageTemplate, index) => {
    const plannedStartDate = index === 0 
      ? startDate 
      : currentStartDate;
    
    // Calculate the planned end date based on work days
    const plannedEndDate = addWorkDays(plannedStartDate, stageTemplate.duration);
    
    // Update the start date for the next stage
    currentStartDate = plannedEndDate;
    
    return {
      id: generateUniqueId(),
      name: stageTemplate.name,
      duration: stageTemplate.duration,
      status: index === 0 ? 'in-progress' : 'not-started',
      plannedStartDate,
      plannedEndDate,
      actualStartDate: index === 0 ? startDate : undefined,
      actualEndDate: undefined,
      notes: '',
      issues: [],
      delays: [],
      autoCompleted: false,
    };
  });
  
  return {
    id: generateUniqueId(),
    name,
    address,
    startDate,
    endDate,
    currentStageId: stages[0].id,
    stages,
    notes: '',
    createdAt: getCurrentDate(),
    updatedAt: getCurrentDate(),
  };
};

export const updateStageStatus = (plot: Plot, stageId: string, status: StageStatus): Plot => {
  // Find the index of the stage being updated
  const stageIndex = plot.stages.findIndex(stage => stage.id === stageId);
  
  // Auto-complete all previous stages if this stage is being marked as completed
  let updatedStages = [...plot.stages];
  if (status === 'completed' && stageIndex > 0) {
    // Mark all previous stages as completed if they aren't already
    for (let i = 0; i < stageIndex; i++) {
      if (updatedStages[i].status !== 'completed') {
        updatedStages[i] = {
          ...updatedStages[i],
          status: 'completed',
          actualStartDate: updatedStages[i].actualStartDate || getCurrentDate(),
          actualEndDate: getCurrentDate(),
          autoCompleted: true // Mark as auto-completed
        };
      }
    }
  }
  
  // Update the target stage
  updatedStages = updatedStages.map((stage, index) => {
    if (stage.id === stageId) {
      const updatedStage = { ...stage, status, autoCompleted: false }; // Explicitly marked, not auto-completed
      
      // Update actual dates based on status
      if (status === 'in-progress' && !updatedStage.actualStartDate) {
        updatedStage.actualStartDate = getCurrentDate();
      } else if (status === 'completed' && !updatedStage.actualEndDate) {
        updatedStage.actualEndDate = getCurrentDate();
      }
      
      return updatedStage;
    }
    return stage;
  });
  
  // Find the next stage to set as current if the current stage was completed
  let updatedCurrentStageId = plot.currentStageId;
  if (status === 'completed' && stageId === plot.currentStageId) {
    const currentStageIndex = updatedStages.findIndex(stage => stage.id === stageId);
    if (currentStageIndex < updatedStages.length - 1) {
      updatedCurrentStageId = updatedStages[currentStageIndex + 1].id;
      // Set the next stage to in-progress
      updatedStages[currentStageIndex + 1].status = 'in-progress';
      updatedStages[currentStageIndex + 1].actualStartDate = getCurrentDate();
    }
  }
  
  // If we're updating a stage that's not the current one and it's being completed,
  // we need to ensure the current stage is set correctly
  if (status === 'completed' && stageId !== plot.currentStageId) {
    // Find the first non-completed stage
    const firstNonCompletedIndex = updatedStages.findIndex(stage => stage.status !== 'completed');
    
    if (firstNonCompletedIndex !== -1) {
      updatedCurrentStageId = updatedStages[firstNonCompletedIndex].id;
      
      // If it's not already in progress, set it to in-progress
      if (updatedStages[firstNonCompletedIndex].status === 'not-started') {
        updatedStages[firstNonCompletedIndex] = {
          ...updatedStages[firstNonCompletedIndex],
          status: 'in-progress',
          actualStartDate: getCurrentDate()
        };
      }
    }
  }
  
  return {
    ...plot,
    stages: updatedStages,
    currentStageId: updatedCurrentStageId,
    updatedAt: getCurrentDate(),
  };
};