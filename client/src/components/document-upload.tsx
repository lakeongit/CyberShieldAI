import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { insertDocumentSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useCallback, useRef } from "react";
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

interface UploadResponse {
  id: number;
  title: string;
  metadata: {
    category: string;
    tags: string[];
    summary: string;
  };
  confidence: number;
}

const ALLOWED_FILE_TYPES = ['.txt', '.md', '.pdf', '.doc', '.docx'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function DocumentUpload() {
  const { toast } = useToast();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStats, setUploadStats] = useState({ total: 0, completed: 0, failed: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation<UploadResponse, Error, { title: string; content: string; fileType: string }>({
    mutationFn: async (data) => {
      const res = await apiRequest("POST", "/api/documents", data);
      if (!res.ok) {
        const errorData = await res.json();
        if (errorData.details?.confidence) {
          throw new Error(`Low confidence in document classification (${Math.round(errorData.details.confidence * 100)}%). Please review the content and try again.`);
        }
        throw new Error(errorData.error || "Failed to upload document");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });

      // Show detailed success message with metadata
      toast({
        title: "Document uploaded successfully",
        description: (
          <div className="space-y-2">
            <p>Category: {data.metadata.category}</p>
            <p>Tags: {data.metadata.tags.join(", ")}</p>
            <p className="text-xs text-muted-foreground">{data.metadata.summary}</p>
          </div>
        ),
      });
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

  const validateFile = (file: File): string | null => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_FILE_TYPES.includes(extension)) {
      return `Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size exceeds 5MB limit';
    }
    return null;
  };

  const processFile = async (file: File) => {
    try {
      const validationError = validateFile(file);
      if (validationError) {
        throw new Error(validationError);
      }

      const progressInterval = setInterval(() => {
        setFiles(prev =>
          prev.map(f =>
            f.file === file && f.status === 'uploading'
              ? { ...f, progress: Math.min(90, f.progress + 10) }
              : f
          )
        );
      }, 200);

      const fileType = '.' + file.name.split('.').pop()?.toLowerCase();
      const content = await readFileAsText(file);
      const title = file.name.replace(/\.[^/.]+$/, "");

      await uploadMutation.mutateAsync({ title, content, fileType });
      clearInterval(progressInterval);

      setFiles(prev =>
        prev.map(f =>
          f.file === file
            ? { ...f, status: 'success', progress: 100 }
            : f
        )
      );

      setUploadStats(prev => ({
        ...prev,
        completed: prev.completed + 1
      }));

      if (files.length === 1) {
        toast({
          title: "Document uploaded",
          description: `${file.name} has been processed and added to the knowledge base.`,
        });
      }
    } catch (error: any) {
      setFiles(prev =>
        prev.map(f =>
          f.file === file
            ? { ...f, status: 'error', error: error.message }
            : f
        )
      );

      setUploadStats(prev => ({
        ...prev,
        failed: prev.failed + 1
      }));

      if (files.length === 1) {
        toast({
          title: "Upload failed",
          description: `Failed to upload ${file.name}: ${error.message}`,
          variant: "destructive",
        });
      }
    }

    if (uploadStats.completed + uploadStats.failed === uploadStats.total) {
      if (uploadStats.total > 1) {
        toast({
          title: "Batch upload complete",
          description: `Successfully uploaded ${uploadStats.completed} of ${uploadStats.total} documents. ${uploadStats.failed ? `Failed: ${uploadStats.failed}` : ''}`,
          variant: uploadStats.failed ? "destructive" : "default",
        });
      }
    }
  };

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const droppedFiles = Array.from(selectedFiles);
    const newFiles = droppedFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending' as const,
    }));

    setFiles(prev => [...prev, ...newFiles]);
    setUploadStats({ total: droppedFiles.length, completed: 0, failed: 0 });

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
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, []);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

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
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:bg-muted/50"
          )}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            multiple
            accept={ALLOWED_FILE_TYPES.join(',')}
          />
          <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-1">
            Click here or drag and drop your documents
          </p>
          <p className="text-xs text-muted-foreground">
            Supports txt, md, pdf, doc, docx up to 5MB
          </p>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            {files.map(({ file, status, progress, error }) => (
              <div
                key={file.name}
                className={cn(
                  "flex items-center gap-2 p-2 rounded border bg-card",
                  status === 'success' && "border-green-500 bg-green-50/50",
                  status === 'error' && "border-red-500 bg-red-50/50"
                )}
              >
                <FileText className="h-4 w-4 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(file.size)}
                    </p>
                    {status === 'uploading' && (
                      <p className="text-xs text-muted-foreground">
                        {progress}%
                      </p>
                    )}
                  </div>
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