import { useAuth } from "@/hooks/use-auth";
import { DocumentUpload } from "@/components/document-upload";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Document, User } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  FileText, 
  Tags, 
  Trash2, 
  Plus, 
  X, 
  UserCircle, 
  Shield,
  ScrollText,
  Activity,
  Search,
  Calendar,
  BarChart2,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSystemMetrics } from "@/hooks/use-system-metrics";

// ... existing imports remain unchanged


export default function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: documents } = useQuery<Document[]>({ 
    queryKey: ["/api/documents"]
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: user?.isAdmin
  });

  const { data: auditLogs } = useQuery({
    queryKey: ["/api/audit-logs"],
    enabled: user?.isAdmin
  });

  const { data: systemMetrics } = useQuery({
    queryKey: ["/api/system-metrics"],
    enabled: user?.isAdmin
  });

  // ... existing mutations remain unchanged

  const deleteLogsMutation = useMutation({
    mutationFn: async (logIds: number[]) => {
      await apiRequest("DELETE", "/api/audit-logs", { logIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audit-logs"] });
      toast({
        title: "Logs deleted",
        description: "Selected audit logs have been deleted successfully."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete logs",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You need admin privileges to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" /> Return Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Chat
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="documents">
          <TabsList className="w-full mb-8">
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
            <TabsTrigger value="monitoring">System Monitoring</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
          </TabsList>

          {/* Existing TabsContent for documents and users remain unchanged */}
          <TabsContent value="documents">
            <div className="grid gap-4">
              {documents?.map((doc) => (
                <DocumentCard 
                  key={doc.id} 
                  document={doc}
                  onDelete={() => deleteDocumentMutation.mutate(doc.id)}
                  onUpdateTags={(tags) => updateTagsMutation.mutate({ id: doc.id, tags })}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="users">
            <div className="grid gap-4">
              {users?.map((u) => (
                <Card key={u.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCircle className="h-5 w-5" />
                      {u.username}
                      {u.isAdmin && (
                        <Badge variant="default" className="ml-2">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardFooter>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant={u.isAdmin ? "destructive" : "default"}
                          size="sm"
                          disabled={u.id === user?.id} // Prevent self-modification
                        >
                          {u.isAdmin ? "Remove Admin" : "Make Admin"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            {u.isAdmin ? "Remove Admin Privileges" : "Grant Admin Privileges"}
                          </DialogTitle>
                          <DialogDescription>
                            {u.isAdmin 
                              ? "Are you sure you want to remove admin privileges from this user?"
                              : "Are you sure you want to grant admin privileges to this user?"
                            }
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant={u.isAdmin ? "destructive" : "default"}
                            onClick={() => toggleAdminMutation.mutate({ 
                              id: u.id, 
                              isAdmin: !u.isAdmin 
                            })}
                          >
                            Confirm
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="audit-logs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ScrollText className="h-5 w-5" />
                  Audit Logs
                </CardTitle>
                <CardDescription>
                  View and manage system activity logs
                </CardDescription>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search logs..."
                      className="w-full"
                      prefix={<Search className="h-4 w-4 text-muted-foreground" />}
                    />
                  </div>
                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Time Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">Last 24 hours</SelectItem>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="all">All time</SelectItem>
                    </SelectContent>
                  </Select>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear Logs
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Clear Audit Logs</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete all filtered audit logs? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline">Cancel</Button>
                        <Button 
                          variant="destructive"
                          onClick={() => deleteLogsMutation.mutate([])}
                        >
                          Delete
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auditLogs?.map((log: any) => (
                    <Card key={log.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{log.action}</p>
                            <p className="text-sm text-muted-foreground">
                              {log.details}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              {new Date(log.timestamp).toLocaleString()}
                            </p>
                            <Badge variant="outline">{log.user}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Monitoring
                </CardTitle>
                <CardDescription>
                  Real-time system performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Use the useSystemMetrics hook */}
                {(() => {
                  const { metrics, error, isConnected } = useSystemMetrics();

                  if (error) {
                    return (
                      <div className="text-center py-8">
                        <p className="text-destructive">{error}</p>
                        <Button variant="outline" className="mt-4">
                          Retry Connection
                        </Button>
                      </div>
                    );
                  }

                  if (!metrics) {
                    return (
                      <div className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground mt-2">
                          {isConnected ? "Loading metrics..." : "Connecting to metrics service..."}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Resource Usage</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {metrics.resources.map((metric) => (
                              <div key={metric.name} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">{metric.name}</span>
                                  <span className="text-sm text-muted-foreground">{metric.value}</span>
                                </div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-primary transition-all duration-500 ease-in-out"
                                    style={{ width: `${metric.percentage}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">System Health</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {metrics.health.map((metric) => (
                              <div key={metric.name} className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                  <Badge 
                                    variant={metric.status === 'healthy' ? 'default' : 'destructive'}
                                    className="h-2 w-2 rounded-full p-0"
                                  />
                                  {metric.name}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {metric.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload">
            <DocumentUpload />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function DocumentCard({ 
  document, 
  onDelete,
  onUpdateTags 
}: { 
  document: Document;
  onDelete: () => void;
  onUpdateTags: (tags: string[]) => void;
}) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [editedTags, setEditedTags] = useState(document.metadata?.tags || []);

  const handleAddTag = () => {
    if (newTag.trim() && !editedTags.includes(newTag.trim())) {
      setEditedTags([...editedTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setEditedTags(editedTags.filter(t => t !== tag));
  };

  const handleSaveTags = () => {
    onUpdateTags(editedTags);
    setIsTagDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {document.title}
        </CardTitle>
        <CardDescription>
          Added on {new Date(document.createdAt).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {document.metadata?.summary}
        </p>
        {document.metadata?.tags?.length > 0 && (
          <div className="flex items-center gap-2">
            <Tags className="h-4 w-4" />
            <div className="flex flex-wrap gap-2">
              {document.metadata.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Tags className="h-4 w-4 mr-2" />
              Manage Tags
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage Tags</DialogTitle>
              <DialogDescription>
                Add or remove tags for better document organization.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Enter a new tag"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button onClick={handleAddTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {editedTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveTags}>Save Changes</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Document</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this document? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  onDelete();
                  setIsDeleteDialogOpen(false);
                }}
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}