import { useState, useCallback, useMemo } from 'react';
import { EditableItemType } from '../types/soa';

export interface TimelineHeaderConfig {
  id: string;
  label: string;
  isFocused: boolean;
  originalPosition: number;
  type: 'period' | 'cycle' | 'week' | 'day' | 'visit' | 'time-of-day' | 'allowed-window' | 'time-relative';
  isVisible: boolean;
  isActive: boolean;
}

export interface TimelineHeaderManagement {
  headers: TimelineHeaderConfig[];
  editingHeaderId: string | null;
  focusedHeaderId: string | null;
  focusedHeaderType: EditableItemType | null;
  isFocusMode: boolean;
}

const DEFAULT_HEADERS: TimelineHeaderConfig[] = [
  { id: 'period', label: 'PERIOD', isFocused: false, originalPosition: 0, type: 'period', isVisible: true, isActive: true },
  { id: 'cycle', label: 'CYCLE', isFocused: false, originalPosition: 1, type: 'cycle', isVisible: true, isActive: true },
  { id: 'week', label: 'WEEK', isFocused: false, originalPosition: 2, type: 'week', isVisible: true, isActive: true },
  { id: 'day', label: 'DAY', isFocused: false, originalPosition: 3, type: 'day', isVisible: true, isActive: true },
  { id: 'time-relative', label: 'TIME RELATIVE (H)', isFocused: false, originalPosition: 4, type: 'time-relative', isVisible: true, isActive: true },
  { id: 'time-of-day', label: 'TIME OF DAY', isFocused: false, originalPosition: 5, type: 'time-of-day', isVisible: true, isActive: true },
  { id: 'allowed-window', label: 'TIME WINDOW (H)', isFocused: false, originalPosition: 6, type: 'allowed-window', isVisible: true, isActive: true },
  { id: 'visit', label: 'VISIT LABEL', isFocused: false, originalPosition: 7, type: 'visit', isVisible: true, isActive: true }
];

export const useTimelineHeaderManagement = () => {
  const [headers, setHeaders] = useState<TimelineHeaderConfig[]>(DEFAULT_HEADERS);
  const [editingHeaderId, setEditingHeaderId] = useState<string | null>(null);
  const [focusedHeaderId, setFocusedHeaderId] = useState<string | null>(null);
  const [focusedHeaderType, setFocusedHeaderType] = useState<EditableItemType | null>(null);

  // Computed values
  const isFocusMode = useMemo(() => 
    focusedHeaderId !== null && focusedHeaderType !== null,
    [focusedHeaderId, focusedHeaderType]
  );

  // Filtered header arrays
  const activeHeaders = useMemo(() => 
    headers.filter(header => header.isActive),
    [headers]
  );

  const inactiveHeaders = useMemo(() => 
    headers.filter(header => !header.isActive),
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

  // Visibility and active state management
  const toggleVisibility = useCallback((headerId: string) => {
    setHeaders(prev => prev.map(header => 
      header.id === headerId 
        ? { ...header, isVisible: !header.isVisible }
        : header
    ));
  }, []);

  const toggleActive = useCallback((headerId: string) => {
    setHeaders(prev => prev.map(header => 
      header.id === headerId 
        ? { ...header, isActive: !header.isActive }
        : header
    ));
  }, []);

  // Focus functionality
  const focusHeader = useCallback((headerId: string, headerType: EditableItemType) => {
    // Set focus state
    setFocusedHeaderId(headerId);
    setFocusedHeaderType(headerType);

    // Update headers: set focused state
    setHeaders(prev => prev.map(header => ({
      ...header,
      isFocused: header.id === headerId
    })));
  }, []);

  const unfocusHeader = useCallback(() => {
    // Clear focus state
    setFocusedHeaderId(null);
    setFocusedHeaderType(null);

    // Clear focused state from all headers
    setHeaders(prev => prev.map(header => ({
      ...header,
      isFocused: false
    })));
  }, []);

  // Get header by ID
  const getHeaderById = useCallback((headerId: string) => {
    return headers.find(header => header.id === headerId);
  }, [headers]);

  // Check if header is focused
  const isHeaderFocused = useCallback((headerId: string) => {
    return focusedHeaderId === headerId;
  }, [focusedHeaderId]);

  return {
    // State
    headers,
    activeHeaders,
    inactiveHeaders,
    editingHeaderId,
    focusedHeaderId,
    focusedHeaderType,
    isFocusMode,
    
    // Actions
    startEditingHeader,
    saveHeaderLabel,
    cancelEditingHeader,
    focusHeader,
    unfocusHeader,
    toggleVisibility,
    toggleActive,
    
    // Utilities
    getHeaderById,
    isHeaderFocused
  };
};