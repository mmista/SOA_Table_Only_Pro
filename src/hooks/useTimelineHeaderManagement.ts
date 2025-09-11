import { useState, useCallback, useMemo } from 'react';
import { EditableItemType } from '../types/soa';

export interface TimelineHeaderConfig {
  id: string;
  label: string;
  isVisible: boolean;
  isActive: boolean;
  isMinimized: boolean;
  isFocused: boolean;
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
  focusedHeaderType: EditableItemType | null;
  isFocusMode: boolean;
}

const DEFAULT_HEADERS: TimelineHeaderConfig[] = [
  { id: 'period', label: 'PERIOD', isVisible: true, isActive: true, isMinimized: false, isFocused: false, originalPosition: 0, type: 'period' },
  { id: 'cycle', label: 'CYCLE', isVisible: true, isActive: true, isMinimized: false, isFocused: false, originalPosition: 1, type: 'cycle' },
  { id: 'week', label: 'WEEK', isVisible: true, isActive: true, isMinimized: false, isFocused: false, originalPosition: 2, type: 'week' },
  { id: 'day', label: 'DAY', isVisible: true, isActive: true, isMinimized: false, isFocused: false, originalPosition: 3, type: 'day' },
  { id: 'time-relative', label: 'TIME RELATIVE (H)', isVisible: true, isActive: true, isMinimized: false, isFocused: false, originalPosition: 4, type: 'time-relative' },
  { id: 'time-of-day', label: 'TIME OF DAY', isVisible: true, isActive: true, isMinimized: false, isFocused: false, originalPosition: 5, type: 'time-of-day' },
  { id: 'allowed-window', label: 'TIME WINDOW (H)', isVisible: true, isActive: true, isMinimized: false, isFocused: false, originalPosition: 6, type: 'allowed-window' },
  { id: 'visit', label: 'VISIT LABEL', isVisible: true, isActive: true, isMinimized: false, isFocused: false, originalPosition: 7, type: 'visit' }
];

export const useTimelineHeaderManagement = () => {
  const [headers, setHeaders] = useState<TimelineHeaderConfig[]>(DEFAULT_HEADERS);
  const [editingHeaderId, setEditingHeaderId] = useState<string | null>(null);
  const [isHiddenContainerExpanded, setIsHiddenContainerExpanded] = useState(false);
  const [focusedHeaderId, setFocusedHeaderId] = useState<string | null>(null);
  const [focusedHeaderType, setFocusedHeaderType] = useState<EditableItemType | null>(null);
  const [previousMinimizedStates, setPreviousMinimizedStates] = useState<Map<string, boolean>>(new Map());

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

  const isFocusMode = useMemo(() => 
    focusedHeaderId !== null && focusedHeaderType !== null,
    [focusedHeaderId, focusedHeaderType]
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

  // Header visibility (for row-level hiding)
  const hideHeaderRow = useCallback((headerId: string) => {
    setHeaders(prev => prev.map(header => 
      header.id === headerId && header.isActive
        ? { ...header, isVisible: false }
        : header
    ));
  }, []);

  const showHeaderRow = useCallback((headerId: string) => {
    setHeaders(prev => prev.map(header => 
      header.id === headerId && header.isActive
        ? { ...header, isVisible: true }
        : header
    ));
  }, []);

  // Header minimization (for column-level hiding)
  const minimizeHeader = useCallback((headerId: string) => {
    setHeaders(prev => prev.map(header => 
      header.id === headerId
        ? { ...header, isMinimized: true }
        : header
    ));
  }, []);

  const unminimizeHeader = useCallback((headerId: string) => {
    setHeaders(prev => prev.map(header => 
      header.id === headerId
        ? { ...header, isMinimized: false }
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

  // Focus functionality
  const focusHeader = useCallback((headerId: string, headerType: EditableItemType) => {
    // Save current minimized states
    const currentStates = new Map<string, boolean>();
    headers.forEach(header => {
      currentStates.set(header.id, header.isMinimized);
    });
    setPreviousMinimizedStates(currentStates);

    // Set focus state
    setFocusedHeaderId(headerId);
    setFocusedHeaderType(headerType);

    // Update headers: minimize all except the focused one and its hierarchy
    setHeaders(prev => prev.map(header => ({
      ...header,
      isFocused: header.id === headerId,
      isMinimized: header.id === headerId ? false : true
    })));
  }, [headers]);

  const unfocusHeader = useCallback(() => {
    // Clear focus state
    setFocusedHeaderId(null);
    setFocusedHeaderType(null);

    // Restore previous minimized states
    setHeaders(prev => prev.map(header => ({
      ...header,
      isFocused: false,
      isMinimized: previousMinimizedStates.get(header.id) || false
    })));

    // Clear saved states
    setPreviousMinimizedStates(new Map());
  }, [previousMinimizedStates]);

  // Toggle header visibility
  const toggleHeaderVisibility = useCallback((headerId: string) => {
    setHeaders(prev => prev.map(header => 
      header.id === headerId 
        ? { ...header, isVisible: !header.isVisible }
        : header
    ));
  }, []);

  // Hidden container management
  const toggleHiddenContainer = useCallback(() => {
    setIsHiddenContainerExpanded(prev => !prev);
  }, []);

  const restoreAllHeaders = useCallback(() => {
    setHeaders(prev => prev.map(header => header.isActive ? { ...header, isVisible: true } : header));
    setIsHiddenContainerExpanded(false);
  }, []);

  // Get header by ID
  const getHeaderById = useCallback((headerId: string) => {
    return headers.find(header => header.id === headerId);
  }, [headers]);

  // Check if header is minimized
  const isHeaderMinimized = useCallback((headerId: string) => {
    const header = getHeaderById(headerId);
    return header?.isMinimized || false;
  }, [getHeaderById]);

  // Check if header is focused
  const isHeaderFocused = useCallback((headerId: string) => {
    return focusedHeaderId === headerId;
  }, [focusedHeaderId]);

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
    isFocusMode,
    
    // Actions
    startEditingHeader,
    saveHeaderLabel,
    cancelEditingHeader,
    hideHeaderRow,
    showHeaderRow,
    minimizeHeader,
    unminimizeHeader,
    disableHeader,
    enableHeader,
    focusHeader,
    unfocusHeader,
    toggleHeaderVisibility,
    toggleHiddenContainer,
    restoreAllHeaders,
    
    // Utilities
    getHeaderById,
    isHeaderMinimized,
    isHeaderFocused,
    
    // Computed
    hiddenCount: hiddenHeaders.length,
    hasHiddenHeaders: hiddenHeaders.length > 0,
    hasInactiveHeaders: inactiveHeaders.length > 0
  };
};