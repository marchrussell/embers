/**
 * Centralized Supabase URL configuration
 * Use these helpers instead of hardcoding Supabase URLs throughout the codebase
 */

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

// Extract project ID from URL (e.g., "zduvevumquhmgagcumwa" from "https://zduvevumquhmgagcumwa.supabase.co")
export const SUPABASE_PROJECT_ID = SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] ?? '';

/**
 * Build a public storage URL for a file in a Supabase bucket
 * @param bucket - The storage bucket name (e.g., "videos", "class-images")
 * @param path - The file path within the bucket
 * @returns Full public URL to the storage object
 */
export const getStorageUrl = (bucket: string, path: string): string =>
  `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;

/**
 * Build an edge function URL
 * @param functionName - The name of the edge function (e.g., "daily-get-token")
 * @returns Full URL to the edge function endpoint
 */
export const getFunctionUrl = (functionName: string): string =>
  `${SUPABASE_URL}/functions/v1/${functionName}`;

