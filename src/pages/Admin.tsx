import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useOrganizations, useOrganizationMembers, Organization, OrganizationMember } from '@/hooks/useOrganizations';
import { 
  Building2, 
  Users, 
  Plus, 
  Trash2, 
  Edit, 
  UserPlus, 
  Shield, 
  User, 
  Loader2,
  ChevronRight
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  
  const {
    organizations,
    isLoading: orgsLoading,
    createOrganization,
    isCreating,
    updateOrganization,
    isUpdating,
    deleteOrganization,
    isDeleting,
  } = useOrganizations();
  
  const {
    members,
    isLoading: membersLoading,
    addMember,
    isAdding,
    updateMemberRole,
    isUpdating: isUpdatingRole,
    removeMember,
    isRemoving,
  } = useOrganizationMembers(selectedOrg?.id);
  
  // Dialog states
  const [newOrgName, setNewOrgName] = useState('');
  const [editOrgName, setEditOrgName] = useState('');
  const [editOrgId, setEditOrgId] = useState<string | null>(null);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'admin' | 'member'>('member');
  const [showNewOrgDialog, setShowNewOrgDialog] = useState(false);
  const [showEditOrgDialog, setShowEditOrgDialog] = useState(false);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  
  const handleCreateOrg = () => {
    if (newOrgName.trim()) {
      createOrganization(newOrgName.trim());
      setNewOrgName('');
      setShowNewOrgDialog(false);
    }
  };
  
  const handleUpdateOrg = () => {
    if (editOrgId && editOrgName.trim()) {
      updateOrganization({ id: editOrgId, name: editOrgName.trim() });
      setEditOrgId(null);
      setEditOrgName('');
      setShowEditOrgDialog(false);
    }
  };
  
  const handleDeleteOrg = (id: string) => {
    deleteOrganization(id);
    if (selectedOrg?.id === id) {
      setSelectedOrg(null);
    }
  };
  
  const handleAddMember = () => {
    if (selectedOrg && newMemberEmail.trim()) {
      addMember({ 
        email: newMemberEmail.trim(), 
        role: newMemberRole 
      });
      setNewMemberEmail('');
      setNewMemberRole('member');
      setShowAddMemberDialog(false);
    }
  };
  
  const handleEditOrg = (org: Organization) => {
    setEditOrgId(org.id);
    setEditOrgName(org.name);
    setShowEditOrgDialog(true);
  };
  
  const isAdmin = (member: OrganizationMember) => member.role === 'admin';
  
  // Check if current user is admin of selected org
  const isCurrentUserAdmin = selectedOrg?.role === 'admin';
  
  // Check if current user is the member being viewed
  const isCurrentUser = (memberId: string) => memberId === user?.id;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader userEmail={user?.email} />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <Button onClick={() => setShowNewOrgDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Organization
          </Button>
        </div>
        
        <Tabs defaultValue="organizations" className="space-y-4">
          <TabsList>
            <TabsTrigger value="organizations" className="flex items-center">
              <Building2 className="h-4 w-4 mr-2" />
              Organizations
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Members
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="organizations" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {orgsLoading ? (
                <div className="col-span-3 flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : organizations.length === 0 ? (
                <div className="col-span-3 text-center py-8">
                  <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No Organizations</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first organization to start managing users and notebooks.
                  </p>
                  <Button onClick={() => setShowNewOrgDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Organization
                  </Button>
                </div>
              ) : (
                organizations.map(org => (
                  <Card key={org.id} className={`${selectedOrg?.id === org.id ? 'border-primary' : ''}`}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{org.name}</CardTitle>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                                <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                              </svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditOrg(org)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Organization</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{org.name}"? This action cannot be undone and will remove all associated data.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteOrg(org.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <CardDescription>
                        {org.member_count} {org.member_count === 1 ? 'member' : 'members'} • 
                        Your role: <span className="font-medium capitalize">{org.role}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button 
                        variant={selectedOrg?.id === org.id ? "default" : "outline"} 
                        className="w-full"
                        onClick={() => setSelectedOrg(org)}
                      >
                        {selectedOrg?.id === org.id ? 'Selected' : 'Select'}
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="members" className="space-y-4">
            {!selectedOrg ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Organization Selected</h3>
                <p className="text-muted-foreground mb-4">
                  Please select an organization to manage its members.
                </p>
                <Button onClick={() => navigate('/admin')} variant="outline">
                  Select Organization
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{selectedOrg.name}</h2>
                    <p className="text-muted-foreground">Manage organization members</p>
                  </div>
                  {isCurrentUserAdmin && (
                    <Button onClick={() => setShowAddMemberDialog(true)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Member
                    </Button>
                  )}
                </div>
                
                <Separator className="my-4" />
                
                {membersLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : members.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No Members</h3>
                    <p className="text-muted-foreground mb-4">
                      This organization doesn't have any members yet.
                    </p>
                    {isCurrentUserAdmin && (
                      <Button onClick={() => setShowAddMemberDialog(true)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Member
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="bg-card rounded-md border">
                    <div className="grid grid-cols-12 p-4 font-medium text-muted-foreground">
                      <div className="col-span-5">User</div>
                      <div className="col-span-3">Role</div>
                      <div className="col-span-2">Joined</div>
                      <div className="col-span-2 text-right">Actions</div>
                    </div>
                    <Separator />
                    {members.map(member => (
                      <div key={member.id} className="grid grid-cols-12 p-4 items-center border-b last:border-0">
                        <div className="col-span-5 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">
                              {member.user_full_name || 'Unnamed User'}
                              {isCurrentUser(member.user_id) && (
                                <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">{member.user_email}</div>
                          </div>
                        </div>
                        <div className="col-span-3">
                          {isCurrentUserAdmin && !isCurrentUser(member.user_id) ? (
                            <Select
                              value={member.role}
                              onValueChange={(value: 'admin' | 'member') => {
                                updateMemberRole({ memberId: member.id, role: value });
                              }}
                              disabled={isUpdatingRole}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">
                                  <div className="flex items-center">
                                    <Shield className="h-4 w-4 mr-2 text-primary" />
                                    Admin
                                  </div>
                                </SelectItem>
                                <SelectItem value="member">
                                  <div className="flex items-center">
                                    <User className="h-4 w-4 mr-2" />
                                    Member
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="flex items-center">
                              {isAdmin(member) ? (
                                <>
                                  <Shield className="h-4 w-4 mr-2 text-primary" />
                                  <span>Admin</span>
                                </>
                              ) : (
                                <>
                                  <User className="h-4 w-4 mr-2" />
                                  <span>Member</span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="col-span-2 text-sm text-muted-foreground">
                          {new Date(member.created_at).toLocaleDateString()}
                        </div>
                        <div className="col-span-2 text-right">
                          {isCurrentUserAdmin && !isCurrentUser(member.user_id) && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Member</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove this member from the organization? They will lose access to all organization resources.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => removeMember(member.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Create Organization Dialog */}
      <Dialog open={showNewOrgDialog} onOpenChange={setShowNewOrgDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
            <DialogDescription>
              Create a new organization to manage users and resources.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input
                id="org-name"
                placeholder="Enter organization name"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewOrgDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateOrg} disabled={!newOrgName.trim() || isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Organization'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Organization Dialog */}
      <Dialog open={showEditOrgDialog} onOpenChange={setShowEditOrgDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>
            <DialogDescription>
              Update the organization details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-org-name">Organization Name</Label>
              <Input
                id="edit-org-name"
                placeholder="Enter organization name"
                value={editOrgName}
                onChange={(e) => setEditOrgName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditOrgDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateOrg} disabled={!editOrgName.trim() || isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Organization'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Member Dialog */}
      <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
            <DialogDescription>
              Add a new member to {selectedOrg?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="member-email">Email Address</Label>
              <Input
                id="member-email"
                type="email"
                placeholder="Enter member's email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-role">Role</Label>
              <Select value={newMemberRole} onValueChange={(value: 'admin' | 'member') => setNewMemberRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-primary" />
                      Admin
                    </div>
                  </SelectItem>
                  <SelectItem value="member">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Member
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Admins can manage organization settings and members. Members can only access shared resources.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMemberDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddMember} 
              disabled={!newMemberEmail.trim() || isAdding}
            >
              {isAdding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Member'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;