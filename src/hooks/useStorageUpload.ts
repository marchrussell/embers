import { useRef, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

export const useStorageUpload = (bucket: string) => {
  const [uploading, setUploading] = useState(false);
  const cancelledRef = useRef(false);

  const upload = async (file: File, filePath: string): Promise<string | null> => {
    cancelledRef.current = false;
    setUploading(true);
    try {
      const { error } = await supabase.storage.from(bucket).upload(filePath, file);
      if (cancelledRef.current) return null;
      if (error) throw error;
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return publicUrl;
    } finally {
      if (!cancelledRef.current) {
        setUploading(false);
      }
    }
  };

  const cancelUpload = () => {
    cancelledRef.current = true;
    setUploading(false);
  };

  return { upload, uploading, cancelUpload };
};
