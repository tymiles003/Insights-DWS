import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import NotebookCard from './NotebookCard';
import { Check, Grid3X3, List, ChevronDown, Plus } from 'lucide-react';
import { useNotebooks } from '@/hooks/useNotebooks';
import { useNavigate } from 'react-router-dom';
import { useOrganizations, Organization } from '@/hooks/useOrganizations';
import CreateNotebookDialog from '@/components/notebook/CreateNotebookDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const NotebookGrid = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('Most recent');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  
  const {
    notebooks,
    isLoading,
  } = useNotebooks(selectedOrg?.id);
  
  const { organizations } = useOrganizations();
  
  const navigate = useNavigate();

  const sortedNotebooks = useMemo(() => {
    if (!notebooks) return [];
    
    const sorted = [...notebooks];
    
    if (sortBy === 'Most recent') {
      return sorted.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    } else if (sortBy === 'Title') {
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    }
    
    return sorted;
  }, [notebooks, sortBy]);

  const handleNotebookClick = (notebookId: string, e: React.MouseEvent) => {
    // Check if the click is coming from a delete action or other interactive element
    const target = e.target as HTMLElement;
    const isDeleteAction = target.closest('[data-delete-action="true"]') || target.closest('.delete-button') || target.closest('[role="dialog"]');
    if (isDeleteAction) {
      console.log('Click prevented due to delete action');
      return;
    }
    navigate(`/notebook/${notebookId}`);
  };

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Loading notebooks...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center space-x-4">
          <Button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6" 
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create new
          </Button>
          
          {organizations.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {selectedOrg ? selectedOrg.name : 'Personal Notebooks'}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem 
                  onClick={() => setSelectedOrg(null)}
                  className={!selectedOrg ? 'bg-accent text-accent-foreground' : ''}
                >
                  Personal Notebooks
                  {!selectedOrg && <Check className="ml-2 h-4 w-4" />}
                </DropdownMenuItem>
                {organizations.map(org => (
                  <DropdownMenuItem 
                    key={org.id} 
                    onClick={() => setSelectedOrg(org)}
                    className={selectedOrg?.id === org.id ? 'bg-accent text-accent-foreground' : ''}
                  >
                    {org.name}
                    {selectedOrg?.id === org.id && <Check className="ml-2 h-4 w-4" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center space-x-2 bg-card rounded-lg border px-3 py-2 cursor-pointer hover:bg-muted transition-colors">
                <span className="text-sm text-foreground">{sortBy}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setSortBy('Most recent')} className="flex items-center justify-between">
                Most recent
                {sortBy === 'Most recent' && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('Title')} className="flex items-center justify-between">
                Title
                {sortBy === 'Title' && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sortedNotebooks.map(notebook => (
          <div key={notebook.id} onClick={e => handleNotebookClick(notebook.id, e)}>
            <NotebookCard notebook={{
              id: notebook.id,
              title: notebook.title,
              date: new Date(notebook.updated_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              }),
              sources: notebook.sources?.[0]?.count || 0,
              icon: notebook.icon || '📝',
              color: notebook.color || 'gray'
            }} />
          </div>
        ))}
      </div>
      
      <CreateNotebookDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
      />
    </div>
  );
};

export default NotebookGrid;