import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type AppRole = 'admin' | 'guide' | 'client';

// Cache roles to prevent refetching on every render/tab switch
const rolesCache = new Map<string, { roles: AppRole[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Deduplication: share a single in-flight promise per user
const inflightRequests = new Map<string, Promise<AppRole[]>>();

export const useUserRole = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>(() => {
    // Initialize from cache if available
    if (user?.id) {
      const cached = rolesCache.get(user.id);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.roles;
      }
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(() => {
    // If we have cached roles, don't show loading
    if (user?.id) {
      const cached = rolesCache.get(user.id);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return false;
      }
    }
    return true;
  });
  
  // Track if we've already fetched for this user
  const fetchedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchRoles = async () => {
      if (!user) {
        setRoles([]);
        setIsLoading(false);
        fetchedUserIdRef.current = null;
        return;
      }

      // Skip if we already fetched for this user and have valid cache
      const cached = rolesCache.get(user.id);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        if (fetchedUserIdRef.current === user.id) {
          return; // Already fetched, skip
        }
        setRoles(cached.roles);
        setIsLoading(false);
        fetchedUserIdRef.current = user.id;
        return;
      }

      // Don't refetch if we already fetched for this exact user
      if (fetchedUserIdRef.current === user.id) {
        return;
      }

      try {
        // Deduplicate: reuse in-flight request if one exists
        let fetchPromise = inflightRequests.get(user.id);
        if (!fetchPromise) {
          fetchPromise = Promise.resolve(
            supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', user.id)
          ).then(({ data, error }) => {
              inflightRequests.delete(user.id);
              if (error) throw error;
              const roles = (data || []).map((r) => r.role as AppRole);
              rolesCache.set(user.id, { roles, timestamp: Date.now() });
              return roles;
            })
            .catch((err) => {
              inflightRequests.delete(user.id);
              throw err;
            });
          inflightRequests.set(user.id, fetchPromise);
        }

        const fetchedRoles = await fetchPromise;

        if (!isMounted) return;
        
        setRoles(fetchedRoles);
        fetchedUserIdRef.current = user.id;
      } catch (err) {
        console.error('Error fetching user roles:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchRoles();
    
    return () => {
      isMounted = false;
    };
  }, [user?.id]); // Only depend on user.id, not the entire user object

  const isGuide = roles.includes('guide') || roles.includes('admin');
  const isAdmin = roles.includes('admin');

  // Function to force refresh roles (useful after role changes)
  const refreshRoles = useCallback(() => {
    if (user?.id) {
      rolesCache.delete(user.id);
      fetchedUserIdRef.current = null;
    }
  }, [user?.id]);

  return { roles, isGuide, isAdmin, isLoading, refreshRoles };
};
