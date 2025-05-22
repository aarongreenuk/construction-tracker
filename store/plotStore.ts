import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Plot, Delay, Issue } from '@/types/plot';
import { createNewPlot, updateStageStatus, generateUniqueId } from '@/utils/plot';
import { getCurrentDate } from '@/utils/date';

interface PlotState {
  plots: Plot[];
  addPlot: (name: string, address: string, startDate: string, endDate: string) => void;
  updatePlot: (updatedPlot: Plot) => void;
  deletePlot: (plotId: string) => void;
  updateStageStatus: (plotId: string, stageId: string, status: 'not-started' | 'in-progress' | 'completed' | 'delayed') => void;
  addStageNote: (plotId: string, stageId: string, note: string) => void;
  addStageIssue: (plotId: string, stageId: string, description: string) => void;
  resolveStageIssue: (plotId: string, stageId: string, issueId: string) => void;
  addStageDelay: (plotId: string, stageId: string, reason: string, daysAdded: number) => void;
  addPlotNote: (plotId: string, note: string) => void;
}

export const usePlotStore = create<PlotState>()(
  persist(
    (set, get) => ({
      plots: [],
      
      addPlot: (name, address, startDate, endDate) => {
        const newPlot = createNewPlot(name, address, startDate, endDate);
        set(state => ({
          plots: [...state.plots, newPlot]
        }));
      },
      
      updatePlot: (updatedPlot) => {
        set(state => ({
          plots: state.plots.map(plot => 
            plot.id === updatedPlot.id ? { ...updatedPlot, updatedAt: getCurrentDate() } : plot
          )
        }));
      },
      
      deletePlot: (plotId) => {
        set(state => ({
          plots: state.plots.filter(plot => plot.id !== plotId)
        }));
      },
      
      updateStageStatus: (plotId, stageId, status) => {
        const { plots } = get();
        const plotToUpdate = plots.find(plot => plot.id === plotId);
        
        if (plotToUpdate) {
          const updatedPlot = updateStageStatus(plotToUpdate, stageId, status);
          set(state => ({
            plots: state.plots.map(plot => plot.id === plotId ? updatedPlot : plot)
          }));
        }
      },
      
      addStageNote: (plotId, stageId, note) => {
        set(state => ({
          plots: state.plots.map(plot => {
            if (plot.id === plotId) {
              return {
                ...plot,
                stages: plot.stages.map(stage => {
                  if (stage.id === stageId) {
                    return {
                      ...stage,
                      notes: stage.notes ? `${stage.notes}

${getCurrentDate().split('T')[0]}: ${note}` : `${getCurrentDate().split('T')[0]}: ${note}`
                    };
                  }
                  return stage;
                }),
                updatedAt: getCurrentDate()
              };
            }
            return plot;
          })
        }));
      },
      
      addStageIssue: (plotId, stageId, description) => {
        const newIssue: Issue = {
          id: generateUniqueId(),
          description,
          createdAt: getCurrentDate(),
          resolved: false
        };
        
        set(state => ({
          plots: state.plots.map(plot => {
            if (plot.id === plotId) {
              return {
                ...plot,
                stages: plot.stages.map(stage => {
                  if (stage.id === stageId) {
                    return {
                      ...stage,
                      issues: [...stage.issues, newIssue]
                    };
                  }
                  return stage;
                }),
                updatedAt: getCurrentDate()
              };
            }
            return plot;
          })
        }));
      },
      
      resolveStageIssue: (plotId, stageId, issueId) => {
        set(state => ({
          plots: state.plots.map(plot => {
            if (plot.id === plotId) {
              return {
                ...plot,
                stages: plot.stages.map(stage => {
                  if (stage.id === stageId) {
                    return {
                      ...stage,
                      issues: stage.issues.map(issue => {
                        if (issue.id === issueId) {
                          return {
                            ...issue,
                            resolved: true,
                            resolvedAt: getCurrentDate()
                          };
                        }
                        return issue;
                      })
                    };
                  }
                  return stage;
                }),
                updatedAt: getCurrentDate()
              };
            }
            return plot;
          })
        }));
      },
      
      addStageDelay: (plotId, stageId, reason, daysAdded) => {
        const newDelay: Delay = {
          id: generateUniqueId(),
          reason,
          daysAdded,
          createdAt: getCurrentDate()
        };
        
        set(state => ({
          plots: state.plots.map(plot => {
            if (plot.id === plotId) {
              return {
                ...plot,
                stages: plot.stages.map(stage => {
                  if (stage.id === stageId) {
                    return {
                      ...stage,
                      delays: [...stage.delays, newDelay],
                      status: 'delayed'
                    };
                  }
                  return stage;
                }),
                updatedAt: getCurrentDate()
              };
            }
            return plot;
          })
        }));
      },
      
      addPlotNote: (plotId, note) => {
        set(state => ({
          plots: state.plots.map(plot => {
            if (plot.id === plotId) {
              return {
                ...plot,
                notes: plot.notes ? `${plot.notes}

${getCurrentDate().split('T')[0]}: ${note}` : `${getCurrentDate().split('T')[0]}: ${note}`,
                updatedAt: getCurrentDate()
              };
            }
            return plot;
          })
        }));
      }
    }),
    {
      name: 'plot-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);