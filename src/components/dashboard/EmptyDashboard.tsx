import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Globe, Video, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CreateNotebookDialog from '@/components/notebook/CreateNotebookDialog';

const EmptyDashboard = () => {
  const navigate = useNavigate();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <div className="text-center py-16">
      <div className="mb-12">
        <h2 className="text-3xl font-medium text-foreground mb-4">Create your first notebook</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">InsightsDWS is an AI-powered research and writing assistant that works best with the sources you upload</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
        <div className="bg-card rounded-lg border border-border p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">PDFs</h3>
          <p className="text-muted-foreground">Upload research papers, reports, and documents</p>
        </div>

        <div className="bg-card rounded-lg border border-border p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <Globe className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Websites</h3>
          <p className="text-muted-foreground">Add web pages and online articles as sources</p>
        </div>

        <div className="bg-card rounded-lg border border-border p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <Video className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Audio</h3>
          <p className="text-muted-foreground">Include multimedia content in your research</p>
        </div>
      </div>

      <Button onClick={() => setShowCreateDialog(true)} size="lg" className="bg-primary hover:bg-primary/90">
        <Upload className="h-5 w-5 mr-2" />
        Create notebook
      </Button>
      
      <CreateNotebookDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
      />
    </div>
  );
};

export default EmptyDashboard;