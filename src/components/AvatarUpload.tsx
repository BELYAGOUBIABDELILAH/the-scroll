import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface AvatarUploadProps {
  currentUrl: string | null;
  displayName: string | null;
  size?: "sm" | "lg";
}

export const AvatarUpload = ({ currentUrl, displayName, size = "sm" }: AvatarUploadProps) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sizeClass = size === "lg" ? "h-20 w-20" : "h-10 w-10";

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image.", variant: "destructive" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 2MB.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/avatars/${path}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("user_id", user.id);
      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ["scribe-profile"] });
      toast({ title: "Avatar updated!" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="group relative inline-block">
      <Avatar className={`${sizeClass} border border-border`}>
        <AvatarImage src={currentUrl ?? undefined} />
        <AvatarFallback className="bg-secondary text-foreground font-serif">
          {displayName?.[0]?.toUpperCase() ?? "?"}
        </AvatarFallback>
      </Avatar>
      {user && (
        <>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute inset-0 flex items-center justify-center rounded-full bg-background/60 opacity-0 transition-opacity group-hover:opacity-100"
            aria-label="Upload avatar"
          >
            <Camera className="h-4 w-4 text-foreground" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
        </>
      )}
    </div>
  );
};
