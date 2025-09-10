import { useState, useCallback, useMemo } from 'react';

export interface TimelineHeaderConfig {
  id: string;
  label: string;
  isVisible: boolean;
  originalPosition: number;
  type: 'period' | 'cycle' | 'week' | 'day' | 'visit' | 'time-of-day' | 'allowed-window' | 'time-relative';
}

export interface TimelineHeaderManagement {
  headers: TimelineHeaderConfig[];
  hiddenHeaders: TimelineHeaderConfig[];
  visibleHeaders: TimelineHeaderConfig[];
  editingHeaderId: string | null;
  isHiddenContainerExpanded: boolean;
}

const DEFAULT_HEADERS: TimelineHeaderConfig[] = [
  { id: 'period', label: 'PERIOD', isVisible: true, originalPosition: 0, type: 'period' },
  { id: 'cycle', label: 'CYCLE', isVisible: true, originalPosition: 1, type: 'cycle' },
  { id: 'week', label: 'WEEK', isVisible: true, originalPosition: 2, type: 'week' },
  { id: 'day', label: 'DAY', isVisible: true, originalPosition: 3, type: 'day' },
  { id: 'time-relative', label: 'TIME RELATIVE (H)', isVisible: true, originalPosition: 4, type: 'time-relative' },
  { id: 'time-of-day', label: 'TIME OF DAY', isVisible: true, originalPosition: 5, type: 'time-of-day' },
  { id: 'allowed-window', label: 'TIME WINDOW (H)', isVisible: true, originalPosition: 6, type: 'allowed-window' },
  { id: 'visit', label: 'VISIT LABEL', isVisible: true, originalPosition: 7, type: 'visit' }
];

export const useTimelineHeaderManagement = () => {
  const [headers, setHeaders] = useState<TimelineHeaderConfig[]>(DEFAULT_HEADERS);
  const [editingHeaderId, setEditingHeaderId] = useState<string | null>(null);
  const [isHiddenContainerExpanded, setIsHiddenContainerExpanded] = useState(false);

  // Computed values
  const visibleHeaders = useMemo(() => 
    headers.filter(header => header.isVisible).sort((a, b) => a.originalPosition - b.originalPosition),
    [headers]
  );

  const hiddenHeaders = useMemo(() => 
    headers.filter(header => !header.isVisible).sort((a, b) => a.originalPosition - b.originalPosition),
    [headers]
  );

  // Header renaming
  const startEditingHeader = useCallback((headerId: string) => {
    setEditingHeaderId(headerId);
  }, []);

  const saveHeaderLabel = useCallback((headerId: string, newLabel: string) => {
    setHeaders(prev => prev.map(header => 
      header.id === headerId 
        ? { ...header, label: newLabel.trim() || header.label }
        : header
    ));
    setEditingHeaderId(null);
  }, []);

  const cancelEditingHeader = useCallback(() => {
    setEditingHeaderId(null);
  }, []);

  // Header visibility
  const hideHeader = useCallback((headerId: string) => {
    setHeaders(prev => prev.map(header => 
      header.id === headerId 
        ? { ...header, isVisible: false }
        : header
    ));
  }, []);

  const showHeader = useCallback((headerId: string) => {
    setHeaders(prev => prev.map(header => 
      header.id === headerId 
        ? { ...header, isVisible: true }
        : header
    ));
  }, []);

  // Hidden container management
  const toggleHiddenContainer = useCallback(() => {
    setIsHiddenContainerExpanded(prev => !prev);
  }, []);

  const restoreAllHeaders = useCallback(() => {
    setHeaders(prev => prev.map(header => ({ ...header, isVisible: true })));
    setIsHiddenContainerExpanded(false);
  }, []);

  return {
    // State
    headers,
    visibleHeaders,
    hiddenHeaders,
    editingHeaderId,
    isHiddenContainerExpanded,
    
    // Actions
    startEditingHeader,
    saveHeaderLabel,
    cancelEditingHeader,
    hideHeader,
    showHeader,
    toggleHiddenContainer,
    restoreAllHeaders,
    
    // Computed
    hiddenCount: hiddenHeaders.length,
    hasHiddenHeaders: hiddenHeaders.length > 0
  };
};