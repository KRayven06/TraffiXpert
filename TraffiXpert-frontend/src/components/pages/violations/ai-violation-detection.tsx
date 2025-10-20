"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
// Corrected import for the named export 'PlaceHolderImages'
import { PlaceHolderImages } from "@/lib/placeholder-images";

// --- Define Types matching Backend API ---
interface DetectViolationInputDTO {
    imageUrl: string; // Assuming we send a data URL
}

interface DetectViolationOutputDTO {
  hasViolation: boolean;
  violationType: string | null;
  confidence: number | null;
}
// --- End Type Definitions ---

const API_BASE_URL = 'http://localhost:8080/api';

export function AIViolationDetection() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<DetectViolationOutputDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ variant: "destructive", title: "File too large", description: "Please select an image smaller than 5MB." });
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast({ variant: "destructive", title: "Invalid file type", description: "Please select an image file (e.g., JPG, PNG, WEBP)." });
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysisResult(null);
      setError(null);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAnalyzeImage = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onloadend = async () => {
          const base64dataUrl = reader.result as string;
          const inputData: DetectViolationInputDTO = { imageUrl: base64dataUrl };

          // TODO: Create POST /api/ai/detect-violation in Spring Boot backend
          const response = await fetch(`${API_BASE_URL}/ai/detect-violation`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', },
              body: JSON.stringify(inputData),
          });

          if (!response.ok) {
               let errorDetails = `Status: ${response.status}`;
               try { const errorJson = await response.json(); errorDetails = errorJson.message || JSON.stringify(errorJson); } catch (e) { /* Ignore */ }
              throw new Error(`Analysis failed: ${errorDetails}`);
          }

          const result: DetectViolationOutputDTO = await response.json();
          setAnalysisResult(result);
      };

      reader.onerror = (error) => {
          console.error("Error reading file:", error);
          throw new Error("Failed to read image file.");
      };

    } catch (e: any) {
      console.error("Error analyzing image:", e);
      setError(e.message || "An unexpected error occurred during analysis.");
      toast({ variant: "destructive", title: "Analysis Failed", description: e.message || "Could not analyze the image." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseExample = () => {
    // Select a random image from the imported array
    const randomIndex = Math.floor(Math.random() * PlaceHolderImages.length);
    const exampleImage = PlaceHolderImages[randomIndex];
    const exampleImageUrl = exampleImage.imageUrl; // Get the URL

     fetch(exampleImageUrl)
        .then(res => res.blob())
        .then(blob => {
             // Create a filename based on the URL or use a default
             const filename = exampleImageUrl.substring(exampleImageUrl.lastIndexOf('/') + 1) || "example.jpg";
             const pseudoFile = new File([blob], filename, { type: blob.type });
             setSelectedFile(pseudoFile);
             setPreviewUrl(URL.createObjectURL(pseudoFile));
             setAnalysisResult(null);
             setError(null);
             if (fileInputRef.current) { fileInputRef.current.value = ""; }
        }).catch(err => {
             console.error("Error fetching example image:", err);
             toast({ variant: "destructive", title: "Error", description: "Could not load example image." });
        });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg">AI Violation Detection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="image-upload">Upload Traffic Image</Label>
          <Input
            id="image-upload" type="file" accept="image/*"
            onChange={handleFileChange} ref={fileInputRef}
            className="mt-1" disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground mt-1">Max 5MB (JPG, PNG, WEBP)</p>
        </div>

        {previewUrl && (
          <div className="relative border rounded-md p-2 bg-muted/50">
            <Image
              src={previewUrl} alt="Selected traffic image"
              width={400} height={300}
              className="rounded object-contain mx-auto max-h-[300px]"
            />
            <Button
              variant="ghost" size="icon" onClick={handleRemoveImage}
              className="absolute top-1 right-1 h-6 w-6 bg-background/80 hover:bg-destructive/80 hover:text-destructive-foreground rounded-full"
              disabled={isLoading} >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex gap-2">
            <Button onClick={handleAnalyzeImage} disabled={!selectedFile || isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                {isLoading ? "Analyzing..." : "Analyze Image"}
            </Button>
            <Button onClick={handleUseExample} variant="outline" disabled={isLoading}>
                Use Example
            </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Analysis Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {analysisResult && !error && (
          analysisResult.hasViolation ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Violation Detected!</AlertTitle>
              <AlertDescription>
                Type: {analysisResult.violationType || 'N/A'} (Confidence: {analysisResult.confidence ? (analysisResult.confidence * 100).toFixed(1) + '%' : 'N/A'})
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="default" className="border-green-500 text-green-700 dark:border-green-700 dark:text-green-400">
              <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-600" />
              <AlertTitle>No Violation Detected</AlertTitle>
              <AlertDescription>
                The AI analysis did not find evidence of a traffic violation. (Confidence: {analysisResult.confidence ? (analysisResult.confidence * 100).toFixed(1) + '%' : 'N/A'})
              </AlertDescription>
            </Alert>
          )
        )}
      </CardContent>
    </Card>
  );
}
