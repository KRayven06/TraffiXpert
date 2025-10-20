import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video } from "lucide-react";

const cameras = [
  { id: "CAM-01", location: "North Approach", status: "Online", imageId: "camera-1" },
  { id: "CAM-02", location: "South Approach", status: "Online", imageId: "camera-2" },
  { id: "CAM-03", location: "East Approach", status: "Offline", imageId: "camera-3" },
  { id: "CAM-04", location: "West Approach", status: "Online", imageId: "camera-4" },
];

export function CameraMonitoring() {
  const images = PlaceHolderImages;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg">Camera Monitoring</CardTitle>
        <CardDescription>Live status of intersection cameras.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {cameras.map((camera) => {
          const image = images.find(img => img.id === camera.imageId);
          return (
            <div key={camera.id} className="flex items-center gap-4">
              <div className="w-16 h-12 rounded-md overflow-hidden border bg-secondary shrink-0">
                  {image ? <Image 
                    src={image.imageUrl} 
                    alt={image.description} 
                    width={64} 
                    height={48} 
                    className="object-cover w-full h-full"
                    data-ai-hint={image.imageHint}
                  /> : <div className="w-full h-full flex items-center justify-center bg-muted"><Video className="w-6 h-6 text-muted-foreground"/></div>}
              </div>
              <div className="flex-grow">
                <p className="font-semibold text-sm">{camera.id} - {camera.location}</p>
                <p className="text-xs text-muted-foreground">{camera.status}</p>
              </div>
              <Badge variant={camera.status === 'Online' ? 'default' : 'destructive'} className="bg-green-500/20 text-green-700 border-green-500/30 data-[variant=destructive]:bg-red-500/20 data-[variant=destructive]:text-red-700 data-[variant=destructive]:border-red-500/30">
                {camera.status}
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
