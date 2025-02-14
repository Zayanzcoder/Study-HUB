import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { StudyPreferences, StudyRecommendation } from "@shared/schema";
import { Loader2, Brain, Book, Target } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function AIRecommendations() {
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<string[]>([]);
  const [newSubject, setNewSubject] = useState("");
  const [learningStyle, setLearningStyle] = useState<string>("visual");
  const [studyGoals, setStudyGoals] = useState<string>("");
  const [difficultyLevel, setDifficultyLevel] = useState<string>("intermediate");

  // Fetch user's study preferences
  const { data: preferences, isLoading: preferencesLoading } = useQuery<StudyPreferences>({
    queryKey: ["/api/study-preferences"],
  });

  // Initialize state from preferences
  useEffect(() => {
    if (preferences) {
      setSubjects(preferences.subjects || []);
      setLearningStyle(preferences.learningStyle || "visual");
      setStudyGoals(preferences.studyGoals || "");
      setDifficultyLevel(preferences.difficultyLevel || "intermediate");
    }
  }, [preferences]);

  // Fetch recommendations
  const { data: recommendations, isLoading: recommendationsLoading } = useQuery<StudyRecommendation[]>({
    queryKey: ["/api/recommendations"],
    enabled: !!preferences,
  });

  // Save preferences mutation
  const savePreferencesMutation = useMutation({
    mutationFn: async (preferences: Partial<StudyPreferences>) => {
      const res = await apiRequest("POST", "/api/study-preferences", preferences);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/study-preferences"] });
      toast({
        title: "Preferences saved",
        description: "Your study preferences have been updated.",
      });
    },
  });

  // Generate new recommendation mutation
  const generateRecommendationMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/recommendations/generate");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations"] });
      toast({
        title: "New recommendations generated",
        description: "Check out your personalized study plan!",
      });
    },
  });

  const addSubject = () => {
    if (newSubject && !subjects.includes(newSubject)) {
      const updatedSubjects = [...subjects, newSubject];
      setSubjects(updatedSubjects);
      setNewSubject("");
      savePreferencesMutation.mutate({ subjects: updatedSubjects });
    }
  };

  const removeSubject = (subject: string) => {
    const updatedSubjects = subjects.filter(s => s !== subject);
    setSubjects(updatedSubjects);
    savePreferencesMutation.mutate({ subjects: updatedSubjects });
  };

  const handleSavePreferences = async () => {
    await savePreferencesMutation.mutateAsync({
      subjects,
      learningStyle,
      studyGoals,
      difficultyLevel
    });
  };

  if (preferencesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">AI Study Recommendations</h1>
        <Button 
          onClick={() => generateRecommendationMutation.mutate()}
          disabled={generateRecommendationMutation.isPending}
        >
          {generateRecommendationMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Brain className="h-4 w-4 mr-2" />
          )}
          Generate New Recommendations
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Preferences Section */}
        <Card>
          <CardHeader>
            <CardTitle>Study Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Subjects */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Subjects</label>
              <div className="flex gap-2">
                <Input
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Add a subject..."
                  className="flex-1"
                />
                <Button onClick={addSubject} variant="outline">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {subjects.map((subject) => (
                  <div
                    key={subject}
                    className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {subject}
                    <button
                      onClick={() => removeSubject(subject)}
                      className="hover:text-destructive"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Style */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Learning Style</label>
              <Select
                value={learningStyle}
                onValueChange={(value) => {
                  setLearningStyle(value);
                  savePreferencesMutation.mutate({ learningStyle: value });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your learning style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visual">Visual</SelectItem>
                  <SelectItem value="auditory">Auditory</SelectItem>
                  <SelectItem value="reading">Reading/Writing</SelectItem>
                  <SelectItem value="kinesthetic">Kinesthetic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Study Goals */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Study Goals</label>
              <Textarea
                placeholder="What are your study goals?"
                value={studyGoals}
                onChange={(e) => {
                  setStudyGoals(e.target.value);
                  savePreferencesMutation.mutate({ studyGoals: e.target.value });
                }}
              />
            </div>

            {/* Difficulty Level */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Preferred Difficulty Level</label>
              <Select
                value={difficultyLevel}
                onValueChange={(value) => {
                  setDifficultyLevel(value);
                  savePreferencesMutation.mutate({ difficultyLevel: value });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleSavePreferences}
              disabled={savePreferencesMutation.isPending}
              className="w-full"
            >
              {savePreferencesMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Save Preferences
            </Button>
          </CardContent>
        </Card>

        {/* Recommendations Section */}
        <Card>
          <CardHeader>
            <CardTitle>Your Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendationsLoading ? (
              <div className="flex items-center justify-center h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : recommendations?.length ? (
              recommendations.map((rec) => (
                <Card key={rec.id} className="bg-secondary">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2 text-primary">
                      <Book className="h-4 w-4" />
                      <h3 className="font-semibold">{rec.subject}</h3>
                    </div>
                    <p className="text-sm">{rec.recommendation}</p>
                    {rec.resources && (
                      <div className="pt-2">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Recommended Resources:
                        </h4>
                        <p className="text-sm text-muted-foreground">{rec.resources}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recommendations yet. Set your preferences and generate some!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}