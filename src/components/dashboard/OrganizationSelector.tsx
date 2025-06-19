import React, { useState } from 'react';
import { Building2, ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useOrganizations, Organization } from '@/hooks/useOrganizations';
import { useNavigate } from 'react-router-dom';

interface OrganizationSelectorProps {
  currentOrganization: Organization | null;
  onOrganizationChange: (org: Organization | null) => void;
}

const OrganizationSelector = ({ 
  currentOrganization, 
  onOrganizationChange 
}: OrganizationSelectorProps) => {
  const navigate = useNavigate();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  
  const {
    organizations,
    isLoading,
    createOrganization,
    isCreating,
  } = useOrganizations();

  const handleCreateOrg = () => {
    if (newOrgName.trim()) {
      createOrganization(newOrgName.trim());
      setNewOrgName('');
      setShowCreateDialog(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full md:w-auto justify-between">
            <div className="flex items-center">
              <Building2 className="h-4 w-4 mr-2" />
              <span className="truncate max-w-[150px]">
                {currentOrganization ? currentOrganization.name : 'Personal Account'}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Organizations</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem 
              onClick={() => onOrganizationChange(null)}
              className={!currentOrganization ? 'bg-accent text-accent-foreground' : ''}
            >
              <Building2 className="h-4 w-4 mr-2" />
              <span>Personal Account</span>
            </DropdownMenuItem>
            
            {organizations.map(org => (
              <DropdownMenuItem 
                key={org.id}
                onClick={() => onOrganizationChange(org)}
                className={currentOrganization?.id === org.id ? 'bg-accent text-accent-foreground' : ''}
              >
                <Building2 className="h-4 w-4 mr-2" />
                <span className="truncate">{org.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            <span>Create Organization</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/admin')}>
            <Building2 className="h-4 w-4 mr-2" />
            <span>Manage Organizations</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Create Organization Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
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
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateOrg} disabled={!newOrgName.trim() || isCreating}>
              {isCreating ? 'Creating...' : 'Create Organization'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OrganizationSelector;