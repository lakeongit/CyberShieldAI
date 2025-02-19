import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { insertDocumentSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useCallback } from "react";
import { AlertCircle, FileText, Loader2, Upload, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { readFileAsText, formatBytes } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface UploadFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'error' | 'success';
  error?: string;
}

export function DocumentUpload() {
  const { toast } = useToast();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async (data: { title: string; content: string }) => {
      const res = await apiRequest("POST", "/api/documents", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
    },
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = async (file: File) => {
    try {
      const content = await readFileAsText(file);
      const title = file.name.replace(/\.[^/.]+$/, ""); // Remove file extension

      await uploadMutation.mutateAsync({ title, content });

      setFiles(prev =>
        prev.map(f =>
          f.file === file
            ? { ...f, status: 'success', progress: 100 }
            : f
        )
      );

      toast({
        title: "Document uploaded",
        description: `${file.name} has been processed and added to the knowledge base.`,
      });
    } catch (error) {
      setFiles(prev =>
        prev.map(f =>
          f.file === file
            ? { ...f, status: 'error', error: error.message }
            : f
        )
      );

      toast({
        title: "Upload failed",
        description: `Failed to upload ${file.name}: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const newFiles = Array.from(e.dataTransfer.files).map(file => ({
      file,
      progress: 0,
      status: 'pending' as const,
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Process each file
    newFiles.forEach(async ({ file }) => {
      setFiles(prev =>
        prev.map(f =>
          f.file === file
            ? { ...f, status: 'uploading' }
            : f
        )
      );

      await processFile(file);
    });
  }, []);

  const removeFile = (file: File) => {
    setFiles(prev => prev.filter(f => f.file !== file));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Documents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
          )}
        >
          <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-1">
            Drag and drop your documents here
          </p>
          <p className="text-xs text-muted-foreground">
            Supports plain text (.txt), markdown (.md)
          </p>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            {files.map(({ file, status, progress, error }) => (
              <div
                key={file.name}
                className="flex items-center gap-2 p-2 rounded border bg-card"
              >
                <FileText className="h-4 w-4 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatBytes(file.size)}
                  </p>
                  {status === 'uploading' && (
                    <Progress value={progress} className="h-1 mt-2" />
                  )}
                  {status === 'error' && (
                    <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" />
                      {error}
                    </p>
                  )}
                </div>
                {status === 'uploading' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => removeFile(file)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}