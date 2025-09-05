import { useState, useCallback, useMemo } from 'react';
import { Comment, CommentModalState } from '../types/soa';

export const useComments = () => {
  const [comments, setComments] = useState<Map<string, Comment>>(new Map());
  const [commentModal, setCommentModal] = useState<CommentModalState>({
    isOpen: false,
    cellId: '',
    cellType: 'activity',
    position: { x: 0, y: 0 }
  });

  // Generate a unique key for each cell
  const getCellKey = useCallback((cellId: string, cellType: string) => {
    return `${cellType}:${cellId}`;
  }, []);

  // Check if a cell has a comment
  const hasComment = useCallback((cellId: string, cellType: string) => {
    const key = getCellKey(cellId, cellType);
    return comments.has(key);
  }, [comments, getCellKey]);

  // Get comment for a cell
  const getComment = useCallback((cellId: string, cellType: string) => {
    const key = getCellKey(cellId, cellType);
    return comments.get(key);
  }, [comments, getCellKey]);

  // Save or update a comment
  const saveComment = useCallback((cellId: string, cellType: string, content: string) => {
    const key = getCellKey(cellId, cellType);
    const now = new Date();
    
    const existingComment = comments.get(key);
    const comment: Comment = {
      id: existingComment?.id || `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      cellId,
      cellType: cellType as any,
      content,
      createdAt: existingComment?.createdAt || now,
      updatedAt: now,
      author: 'Current User' // In a real app, this would come from auth context
    };

    setComments(prev => new Map(prev).set(key, comment));
  }, [comments, getCellKey]);

  // Delete a comment
  const deleteComment = useCallback((cellId: string, cellType: string) => {
    const key = getCellKey(cellId, cellType);
    setComments(prev => {
      const newComments = new Map(prev);
      newComments.delete(key);
      return newComments;
    });
  }, [getCellKey]);

  // Open comment modal
  const openCommentModal = useCallback((
    cellId: string, 
    cellType: 'activity' | 'period' | 'cycle' | 'week' | 'day',
    position: { x: number; y: number }
  ) => {
    const existingComment = getComment(cellId, cellType);
    setCommentModal({
      isOpen: true,
      cellId,
      cellType,
      position,
      existingComment: existingComment?.content
    });
  }, [getComment]);

  // Close comment modal
  const closeCommentModal = useCallback(() => {
    setCommentModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Get comment statistics
  const commentStats = useMemo(() => {
    const totalComments = comments.size;
    const commentsByType = Array.from(comments.values()).reduce((acc, comment) => {
      acc[comment.cellType] = (acc[comment.cellType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: totalComments,
      byType: commentsByType
    };
  }, [comments]);

  // Export comments (for backup/sharing)
  const exportComments = useCallback(() => {
    const commentsArray = Array.from(comments.values());
    return JSON.stringify(commentsArray, null, 2);
  }, [comments]);

  // Import comments (for restore/sharing)
  const importComments = useCallback((commentsJson: string) => {
    try {
      const commentsArray: Comment[] = JSON.parse(commentsJson);
      const newComments = new Map<string, Comment>();
      
      commentsArray.forEach(comment => {
        const key = getCellKey(comment.cellId, comment.cellType);
        newComments.set(key, {
          ...comment,
          createdAt: new Date(comment.createdAt),
          updatedAt: new Date(comment.updatedAt)
        });
      });
      
      setComments(newComments);
      return true;
    } catch (error) {
      console.error('Failed to import comments:', error);
      return false;
    }
  }, [getCellKey]);

  return {
    // State
    commentModal,
    commentStats,
    
    // Comment operations
    hasComment,
    getComment,
    saveComment,
    deleteComment,
    
    // Modal operations
    openCommentModal,
    closeCommentModal,
    
    // Utility operations
    exportComments,
    importComments
  };
};