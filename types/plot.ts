export type StageStatus = 'not-started' | 'in-progress' | 'completed' | 'delayed';

export interface Issue {
  id: string;
  description: string;
  createdAt: string;
  resolved: boolean;
  resolvedAt?: string;
}

export interface Delay {
  id: string;
  reason: string;
  daysAdded: number;
  createdAt: string;
}

export interface Stage {
  id: string;
  name: string;
  duration: number; // in days
  status: StageStatus;
  plannedStartDate?: string;
  plannedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  notes: string;
  issues: Issue[];
  delays: Delay[];
  autoCompleted?: boolean; // Flag to track if stage was auto-completed
}

export interface Plot {
  id: string;
  name: string;
  address: string;
  startDate: string;
  endDate: string;
  currentStageId: string;
  stages: Stage[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlotSummary {
  id: string;
  name: string;
  currentStage: string;
  progress: number;
  daysRemaining: number;
  status: 'ahead' | 'behind' | 'on-schedule';
  daysAheadOrBehind: number;
}