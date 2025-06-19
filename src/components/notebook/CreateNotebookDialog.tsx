import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useNotebooks } from '@/hooks/useNotebooks';
import { useOrganizations, Organization } from '@/hooks/useOrganizations';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateNotebookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateNotebookDialog = ({ open, onOpenChange }: CreateNotebookDialogProps) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  
  const { createNotebook, isCreating } = useNotebooks();
  const { organizations, isLoading: orgsLoading } = useOrganizations();

  const handleSubmit = () => {
    if (!title.trim()) return;
    
    createNotebook(
      {
        title: title.trim(),
        description: description.trim(),
        organizationId: selectedOrgId || undefined
      },
      {
        onSuccess: (data) => {
          console.log('Notebook created:', data);
          setTitle('');
          setDescription('');
          setSelectedOrgId(null);
          onOpenChange(false);
          navigate(`/notebook/${data.id}`);
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Notebook</DialogTitle>
          <DialogDescription>
            Create a new notebook to organize your sources and insights.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter notebook title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Enter a description for your notebook"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          {organizations.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="organization">Organization (optional)</Label>
              <Select value={selectedOrgId || ''} onValueChange={(value) => setSelectedOrgId(value || null)}>
                <SelectTrigger>
                  <SelectValue placeholder="Personal Notebook" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Personal Notebook</SelectItem>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Organization notebooks are shared with all organization members.
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!title.trim() || isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Notebook'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNotebookDialog;