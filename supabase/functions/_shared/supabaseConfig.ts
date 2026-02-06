/**
 * Centralized Supabase URL configuration for edge functions
 * Use these helpers instead of hardcoding Supabase URLs
 */

// SUPABASE_URL is automatically available in Supabase edge functions
export const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';

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
 * @param functionName - The name of the edge function
 * @returns Full URL to the edge function endpoint
 */
export const getFunctionUrl = (functionName: string): string =>
  `${SUPABASE_URL}/functions/v1/${functionName}`;

