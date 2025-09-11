import { useState, useCallback, useMemo } from 'react';

export interface TimelineHeaderConfig {
  id: string;
  label: string;
  isVisible: boolean;
  isActive: boolean;
  originalPosition: number;
  type: 'period' | 'cycle' | 'week' | 'day' | 'visit' | 'time-of-day' | 'allowed-window' | 'time-relative';
}

export interface TimelineHeaderManagement {
  headers: TimelineHeaderConfig[];
  hiddenHeaders: TimelineHeaderConfig[];
  visibleHeaders: TimelineHeaderConfig[];
  activeHeaders: TimelineHeaderConfig[];
  inactiveHeaders: TimelineHeaderConfig[];
  editingHeaderId: string | null;
  isHiddenContainerExpanded: boolean;
  focusedHeaderId: string | null;
  focusedHeaderType: 'period' | 'cycle' | 'week' | null;
}

const DEFAULT_HEADERS: TimelineHeaderConfig[] = [
  { id: 'period', label: 'PERIOD', isVisible: true, isActive: true, originalPosition: 0, type: 'period' },
  { id: 'cycle', label: 'CYCLE', isVisible: true, isActive: true, originalPosition: 1, type: 'cycle' },
  { id: 'week', label: 'WEEK', isVisible: true, isActive: true, originalPosition: 2, type: 'week' },
  { id: 'day', label: 'DAY', isVisible: true, isActive: true, originalPosition: 3, type: 'day' },
  { id: 'time-relative', label: 'TIME RELATIVE (H)', isVisible: true, isActive: true, originalPosition: 4, type: 'time-relative' },
  { id: 'time-of-day', label: 'TIME OF DAY', isVisible: true, isActive: true, originalPosition: 5, type: 'time-of-day' },
  { id: 'allowed-window', label: 'TIME WINDOW (H)', isVisible: true, isActive: true, originalPosition: 6, type: 'allowed-window' },
  { id: 'visit', label: 'VISIT LABEL', isVisible: true, isActive: true, originalPosition: 7, type: 'visit' }
];

export const useTimelineHeaderManagement = () => {
  const [headers, setHeaders] = useState<TimelineHeaderConfig[]>(DEFAULT_HEADERS);
  const [editingHeaderId, setEditingHeaderId] = useState<string | null>(null);
  const [isHiddenContainerExpanded, setIsHiddenContainerExpanded] = useState(false);
  const [focusedHeaderId, setFocusedHeaderId] = useState<string | null>(null);
  const [focusedHeaderType, setFocusedHeaderType] = useState<'period' | 'cycle' | 'week' | null>(null);

  // Computed values
  const visibleHeaders = useMemo(() => 
    headers.filter(header => header.isActive && header.isVisible).sort((a, b) => a.originalPosition - b.originalPosition),
    [headers]
  );

  const hiddenHeaders = useMemo(() => 
    headers.filter(header => header.isActive && !header.isVisible).sort((a, b) => a.originalPosition - b.originalPosition),
    [headers]
  );

  const activeHeaders = useMemo(() => 
    headers.filter(header => header.isActive).sort((a, b) => a.originalPosition - b.originalPosition),
    [headers]
  );

  const inactiveHeaders = useMemo(() => 
    headers.filter(header => !header.isActive).sort((a, b) => a.originalPosition - b.originalPosition),
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
    // If hiding a focused header, unfocus all first
    if (focusedHeaderId === headerId) {
      setFocusedHeaderId(null);
      setFocusedHeaderType(null);
      // Restore visibility to all active headers of the focused type
      if (focusedHeaderType) {
        setHeaders(prev => prev.map(header => 
          header.isActive && header.type === focusedHeaderType
            ? { ...header, isVisible: true }
            : header
        ));
      }
    }
    
    setHeaders(prev => prev.map(header => 
      header.id === headerId && header.isActive
        ? { ...header, isVisible: false }
        : header
    ));
  }, []);

  const showHeader = useCallback((headerId: string) => {
    // If we're in focus mode and showing a header, exit focus mode first
    if (focusedHeaderId && focusedHeaderType) {
      setFocusedHeaderId(null);
      setFocusedHeaderType(null);
      // Restore visibility to all active headers of the focused type
      setHeaders(prev => prev.map(header => 
        header.isActive && header.type === focusedHeaderType
          ? { ...header, isVisible: true }
          : header
      ));
      return;
    }
    
    setHeaders(prev => prev.map(header => 
      header.id === headerId && header.isActive
        ? { ...header, isVisible: true }
        : header
    ));
  }, []);

  // Header activation/deactivation
  const disableHeader = useCallback((headerId: string) => {
    setHeaders(prev => prev.map(header => 
      header.id === headerId 
        ? { ...header, isActive: false, isVisible: false }
        : header
    ));
  }, []);

  const enableHeader = useCallback((headerId: string) => {
    setHeaders(prev => prev.map(header => 
      header.id === headerId 
        ? { ...header, isActive: true, isVisible: true }
        : header
    ));
  }, []);

  // Hidden container management
  const toggleHiddenContainer = useCallback(() => {
    setIsHiddenContainerExpanded(prev => !prev);
  }, []);

  const restoreAllHeaders = useCallback(() => {
    setFocusedHeaderId(null);
    setFocusedHeaderType(null);
    setHeaders(prev => prev.map(header => header.isActive ? { ...header, isVisible: true } : header));
    setIsHiddenContainerExpanded(false);
  }, []);

  // Focus functionality
  const focusHeader = useCallback((headerId: string, headerType: 'period' | 'cycle' | 'week') => {
    // If already focused on this header, unfocus
    if (focusedHeaderId === headerId) {
      setFocusedHeaderId(null);
      setFocusedHeaderType(null);
      // Restore visibility to all active headers of this type
      setHeaders(prev => prev.map(header => 
        header.isActive && header.type === headerType
          ? { ...header, isVisible: true }
          : header
      ));
      return;
    }
    
    // Set new focus
    setFocusedHeaderId(headerId);
    setFocusedHeaderType(headerType);
    
    // Hide all other headers of the same type, show only the focused one
    setHeaders(prev => prev.map(header => {
      if (header.isActive && header.type === headerType) {
        return { ...header, isVisible: header.id === headerId };
      }
      return header;
    }));
  }, [focusedHeaderId]);

  const unfocusAllHeaders = useCallback(() => {
    if (focusedHeaderType) {
      // Restore visibility to all active headers of the focused type
      setHeaders(prev => prev.map(header => 
        header.isActive && header.type === focusedHeaderType
          ? { ...header, isVisible: true }
          : header
      ));
    }
    setFocusedHeaderId(null);
    setFocusedHeaderType(null);
  }, [focusedHeaderType]);

  return {
    // State
    headers,
    visibleHeaders,
    hiddenHeaders,
    activeHeaders,
    inactiveHeaders,
    editingHeaderId,
    isHiddenContainerExpanded,
    focusedHeaderId,
    focusedHeaderType,
    
    // Actions
    startEditingHeader,
    saveHeaderLabel,
    cancelEditingHeader,
    hideHeader,
    showHeader,
    disableHeader,
    enableHeader,
    toggleHiddenContainer,
    restoreAllHeaders,
    focusHeader,
    unfocusAllHeaders,
    
    // Computed
    hiddenCount: hiddenHeaders.length,
    hasHiddenHeaders: hiddenHeaders.length > 0,
    hasInactiveHeaders: inactiveHeaders.length > 0
  };
};