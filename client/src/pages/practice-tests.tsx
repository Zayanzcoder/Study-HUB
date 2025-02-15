import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PracticeTest } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function PracticeTests() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { data: tests, isLoading } = useQuery<PracticeTest[]>({
    queryKey: ['/api/practice-tests'],
  });

  const createTestMutation = useMutation({
    mutationFn: async (test: Partial<PracticeTest>) => {
      const res = await apiRequest("POST", "/api/practice-tests", test);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/practice-tests'] });
      toast({
        title: "Success",
        description: "Practice test created successfully",
      });
    },
  });

  const handleCreateTest = () => {
    createTestMutation.mutate({
      title: "New Test",
      description: "Click to edit this test",
      subject: "General",
      grade: 10,
      difficultyLevel: "intermediate",
      timeLimit: 60,
      totalQuestions: 0,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Practice Tests</h1>
        <Button onClick={handleCreateTest}>Create New Test</Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests?.map((test) => (
          <Card key={test.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{test.title}</CardTitle>
              <CardDescription>Grade {test.grade} • {test.subject}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{test.description}</p>
                <div className="flex gap-2">
                  <Badge>{test.difficultyLevel}</Badge>
                  <Badge variant="secondary">{test.totalQuestions} questions</Badge>
                  <Badge variant="secondary">{test.timeLimit} minutes</Badge>
                </div>
                <Button 
                  className="w-full mt-4"
                  onClick={() => setLocation(`/practice-tests/${test.id}`)}
                >
                  Start Test
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {(!tests || tests.length === 0) && (
          <div className="col-span-full text-center p-12 bg-muted rounded-lg">
            <p className="text-muted-foreground">No practice tests available yet.</p>
            <Button variant="outline" className="mt-4" onClick={handleCreateTest}>
              Create Your First Test
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}