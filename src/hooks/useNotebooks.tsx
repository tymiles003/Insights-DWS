import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CreateNotebookParams {
  title: string;
  description?: string;
  organizationId?: string;
}

export const useNotebooks = (organizationId?: string) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: notebooks = [],
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ['notebooks', user?.id, organizationId],
    queryFn: async () => {
      if (!user) {
        console.log('No user found, returning empty notebooks array');
        return [];
      }
      
      console.log('Fetching notebooks for user:', user.id, 'organization:', organizationId);
      
      let query = supabase
        .from('notebooks')
        .select('*');
      
      // If organizationId is provided, filter by organization
      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      } else {
        // Otherwise, show only personal notebooks (no organization)
        query = query.is('organization_id', null).eq('user_id', user.id);
      }
      
      const { data: notebooksData, error: notebooksError } = await query
        .order('updated_at', { ascending: false });

      if (notebooksError) {
        console.error('Error fetching notebooks:', notebooksError);
        throw notebooksError;
      }

      // Then get source counts separately for each notebook
      const notebooksWithCounts = await Promise.all(
        (notebooksData || []).map(async (notebook) => {
          const { count, error: countError } = await supabase
            .from('sources')
            .select('*', { count: 'exact', head: true })
            .eq('notebook_id', notebook.id);

          if (countError) {
            console.error('Error fetching source count for notebook:', notebook.id, countError);
            return { ...notebook, sources: [{ count: 0 }] };
          }

          return { ...notebook, sources: [{ count: count || 0 }] };
        })
      );

      console.log('Fetched notebooks:', notebooksWithCounts?.length || 0);
      return notebooksWithCounts || [];
    },
    enabled: isAuthenticated && !authLoading,
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error?.message?.includes('JWT') || error?.message?.includes('auth')) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Set up real-time subscription for notebooks updates
  useEffect(() => {
    if (!user?.id || !isAuthenticated) return;

    console.log('Setting up real-time subscription for notebooks');

    let channel;
    
    if (organizationId) {
      // Subscribe to organization notebooks
      channel = supabase
        .channel('org-notebooks-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notebooks',
            filter: `organization_id=eq.${organizationId}`
          },
          (payload) => {
            console.log('Real-time notebook update received:', payload);
            queryClient.invalidateQueries({ queryKey: ['notebooks', user.id, organizationId] });
          }
        )
        .subscribe();
    } else {
      // Subscribe to personal notebooks
      channel = supabase
        .channel('personal-notebooks-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notebooks',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Real-time notebook update received:', payload);
            queryClient.invalidateQueries({ queryKey: ['notebooks', user.id, null] });
          }
        )
        .subscribe();
    }

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id, isAuthenticated, queryClient, organizationId]);

  const createNotebook = useMutation({
    mutationFn: async ({ title, description, organizationId }: CreateNotebookParams) => {
      console.log('Creating notebook with data:', { title, description, organizationId });
      console.log('Current user:', user?.id);
      
      if (!user) {
        console.error('User not authenticated');
        throw new Error('User not authenticated');
      }

      const notebookData: any = {
        title,
        description,
        user_id: user.id,
        generation_status: 'pending',
      };
      
      // Add organization_id if provided
      if (organizationId) {
        notebookData.organization_id = organizationId;
      }

      const { data, error } = await supabase
        .from('notebooks')
        .insert(notebookData)
        .select()
        .single();

      if (error) {
        console.error('Error creating notebook:', error);
        throw error;
      }
      
      console.log('Notebook created successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Mutation success, invalidating queries');
      queryClient.invalidateQueries({ 
        queryKey: ['notebooks', user?.id, data.organization_id || null] 
      });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
    },
  });

  return {
    notebooks,
    isLoading: authLoading || isLoading,
    error: error?.message || null,
    isError,
    createNotebook: createNotebook.mutate,
    isCreating: createNotebook.isPending,
  };
};