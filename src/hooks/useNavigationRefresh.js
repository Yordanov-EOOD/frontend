import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Custom hook to handle data refreshing on navigation
 * This helps ensure fresh data when users navigate back to pages
 */
export const useNavigationRefresh = (queryKeys = [], options = {}) => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const prevLocationRef = useRef(location.pathname);
  const { 
    invalidateOnBack = true, 
    refetchOnBack = false,
    debounceMs = 100 
  } = options;

  useEffect(() => {
    const currentPath = location.pathname;
    const prevPath = prevLocationRef.current;

    // Check if this is a navigation event (not initial load)
    if (prevPath !== currentPath) {
      const timer = setTimeout(() => {
        console.log(`Navigation detected: ${prevPath} -> ${currentPath}`);
        
        if (invalidateOnBack) {
          // Invalidate specified query keys
          queryKeys.forEach(queryKey => {
            queryClient.invalidateQueries({ queryKey });
          });
        }

        if (refetchOnBack) {
          // Force refetch specified query keys
          queryKeys.forEach(queryKey => {
            queryClient.refetchQueries({ queryKey });
          });
        }

        // Store current path for next comparison
        prevLocationRef.current = currentPath;
      }, debounceMs);

      return () => clearTimeout(timer);
    }
  }, [location.pathname, queryClient, queryKeys, invalidateOnBack, refetchOnBack, debounceMs]);

  // Return function to manually trigger refresh
  const manualRefresh = () => {
    queryKeys.forEach(queryKey => {
      queryClient.invalidateQueries({ queryKey });
    });
  };

  return { manualRefresh };
};

export default useNavigationRefresh;
