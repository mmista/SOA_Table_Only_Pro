import { useState, useCallback, useMemo } from 'react';
import { SOAData, VisitLink } from '../types/soa';

interface VisitLinkState {
  hoveredVisit: string | null;
  hoveredActivityCell: { visitId: string; activityId: string } | null;
}

export const useVisitLinks = (data: SOAData) => {
  const [linkState, setLinkState] = useState<VisitLinkState>({
    hoveredVisit: null,
    hoveredActivityCell: null
  });

  // Create a map of visit ID to linked visits for quick lookup
  const visitLinkMap = useMemo(() => {
    const map = new Map<string, string[]>();
    
    if (data.visitLinks) {
      data.visitLinks.forEach(link => {
        link.visitIds.forEach(visitId => {
          const linkedVisits = link.visitIds.filter(id => id !== visitId);
          map.set(visitId, linkedVisits);
        });
      });
    }
    
    return map;
  }, [data.visitLinks]);

  // Get all visits that are linked to a given visit
  const getLinkedVisits = useCallback((visitId: string): string[] => {
    return visitLinkMap.get(visitId) || [];
  }, [visitLinkMap]);

  // Check if a visit is linked to any other visits
  const isVisitLinked = useCallback((visitId: string): boolean => {
    return visitLinkMap.has(visitId);
  }, [visitLinkMap]);

  // Get the link info for a visit
  const getVisitLinkInfo = useCallback((visitId: string): VisitLink | null => {
    if (!data.visitLinks) return null;
    
    return data.visitLinks.find(link => 
      link.visitIds.includes(visitId)
    ) || null;
  }, [data.visitLinks]);

  // Handle visit column hover
  const handleVisitHover = useCallback((visitId: string | null) => {
    setLinkState(prev => ({
      ...prev,
      hoveredVisit: visitId
    }));
  }, []);

  // Handle activity cell hover
  const handleActivityCellHover = useCallback((visitId: string | null, activityId: string | null) => {
    setLinkState(prev => ({
      ...prev,
      hoveredActivityCell: visitId && activityId ? { visitId, activityId } : null
    }));
  }, []);

  // Check if a visit should be highlighted (either directly hovered or linked to hovered)
  const shouldHighlightVisit = useCallback((visitId: string): boolean => {
    if (linkState.hoveredVisit === visitId) return true;
    
    if (linkState.hoveredVisit && isVisitLinked(linkState.hoveredVisit)) {
      const linkedVisits = getLinkedVisits(linkState.hoveredVisit);
      return linkedVisits.includes(visitId);
    }
    
    return false;
  }, [linkState.hoveredVisit, isVisitLinked, getLinkedVisits]);

  // Check if an activity cell should be highlighted
  const shouldHighlightActivityCell = useCallback((visitId: string, activityId: string): boolean => {
    if (linkState.hoveredActivityCell?.visitId === visitId && 
        linkState.hoveredActivityCell?.activityId === activityId) {
      return true;
    }
    
    if (linkState.hoveredActivityCell && isVisitLinked(linkState.hoveredActivityCell.visitId)) {
      const linkedVisits = getLinkedVisits(linkState.hoveredActivityCell.visitId);
      return linkedVisits.includes(visitId) && 
             linkState.hoveredActivityCell.activityId === activityId;
    }
    
    return false;
  }, [linkState.hoveredActivityCell, isVisitLinked, getLinkedVisits]);

  return {
    isVisitLinked,
    getLinkedVisits,
    getVisitLinkInfo,
    handleVisitHover,
    handleActivityCellHover,
    shouldHighlightVisit,
    shouldHighlightActivityCell,
    hoveredVisit: linkState.hoveredVisit,
    hoveredActivityCell: linkState.hoveredActivityCell
  };
};