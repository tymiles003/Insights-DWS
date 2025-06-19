import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Organization {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  role: string;
  member_count: number;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'admin' | 'member';
  created_at: string;
  updated_at: string;
  user_email?: string;
  user_full_name?: string;
}

export const useOrganizations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: organizations = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['organizations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_organizations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Organization[];
    },
    enabled: !!user,
  });

  const createOrganization = useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error('User not authenticated');
      
      // First create the organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({ name })
        .select()
        .single();
      
      if (orgError) throw orgError;
      
      // Then add the current user as an admin
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: orgData.id,
          user_id: user.id,
          role: 'admin'
        });
      
      if (memberError) throw memberError;
      
      return orgData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations', user?.id] });
      toast({
        title: 'Organization Created',
        description: 'Your organization has been created successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create organization',
        variant: 'destructive',
      });
    },
  });

  const updateOrganization = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from('organizations')
        .update({ name })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations', user?.id] });
      toast({
        title: 'Organization Updated',
        description: 'Organization details have been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update organization',
        variant: 'destructive',
      });
    },
  });

  const deleteOrganization = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations', user?.id] });
      toast({
        title: 'Organization Deleted',
        description: 'The organization has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete organization',
        variant: 'destructive',
      });
    },
  });

  return {
    organizations,
    isLoading,
    error,
    createOrganization: createOrganization.mutate,
    isCreating: createOrganization.isPending,
    updateOrganization: updateOrganization.mutate,
    isUpdating: updateOrganization.isPending,
    deleteOrganization: deleteOrganization.mutate,
    isDeleting: deleteOrganization.isPending,
  };
};

export const useOrganizationMembers = (organizationId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: members = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['organization-members', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          id,
          organization_id,
          user_id,
          role,
          created_at,
          updated_at,
          profiles:user_id (
            email,
            full_name
          )
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to include user details
      return data.map(member => ({
        ...member,
        user_email: member.profiles?.email,
        user_full_name: member.profiles?.full_name,
      })) as OrganizationMember[];
    },
    enabled: !!organizationId && !!user,
  });

  const addMember = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: 'admin' | 'member' }) => {
      if (!organizationId) throw new Error('Organization ID is required');
      
      // First, find the user by email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();
      
      if (userError) {
        if (userError.code === 'PGRST116') {
          throw new Error(`User with email ${email} not found`);
        }
        throw userError;
      }
      
      // Then add the user to the organization
      const { data, error } = await supabase
        .from('organization_members')
        .insert({
          organization_id: organizationId,
          user_id: userData.id,
          role
        })
        .select(`
          id,
          organization_id,
          user_id,
          role,
          created_at,
          updated_at,
          profiles:user_id (
            email,
            full_name
          )
        `)
        .single();
      
      if (error) {
        if (error.code === '23505') {
          throw new Error('This user is already a member of the organization');
        }
        throw error;
      }
      
      return {
        ...data,
        user_email: data.profiles?.email,
        user_full_name: data.profiles?.full_name,
      } as OrganizationMember;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-members', organizationId] });
      toast({
        title: 'Member Added',
        description: 'The member has been added to the organization successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add member',
        variant: 'destructive',
      });
    },
  });

  const updateMemberRole = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: 'admin' | 'member' }) => {
      const { data, error } = await supabase
        .from('organization_members')
        .update({ role })
        .eq('id', memberId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-members', organizationId] });
      toast({
        title: 'Role Updated',
        description: 'The member\'s role has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update member role',
        variant: 'destructive',
      });
    },
  });

  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', memberId);
      
      if (error) throw error;
      return memberId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-members', organizationId] });
      toast({
        title: 'Member Removed',
        description: 'The member has been removed from the organization.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove member',
        variant: 'destructive',
      });
    },
  });

  return {
    members,
    isLoading,
    error,
    addMember: addMember.mutate,
    isAdding: addMember.isPending,
    updateMemberRole: updateMemberRole.mutate,
    isUpdating: updateMemberRole.isPending,
    removeMember: removeMember.mutate,
    isRemoving: removeMember.isPending,
  };
};