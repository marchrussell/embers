import { supabase } from "@/integrations/supabase/client";

interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
}

const DEFAULT_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  timeout: 10000, // 10 seconds
};

/**
 * Wraps a promise with a timeout
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

/**
 * Delays execution for a specified time
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Executes a Supabase query with timeout and retry logic
 */
export async function withRetry<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  config: RetryConfig = {}
): Promise<{ data: T | null; error: any }> {
  const { maxRetries, retryDelay, timeout } = { ...DEFAULT_CONFIG, ...config };
  
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await withTimeout(queryFn(), timeout);
      
      // If successful or has data, return immediately
      if (!result.error || result.data) {
        if (attempt > 0) {
          console.log(`✅ Query succeeded on attempt ${attempt + 1}`);
        }
        return result;
      }
      
      lastError = result.error;
      
      // Don't retry on certain errors
      if (isNonRetryableError(result.error)) {
        console.error('❌ Non-retryable error:', result.error);
        return result;
      }
      
      // If not the last attempt, wait and retry
      if (attempt < maxRetries) {
        console.warn(`⚠️ Query failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${retryDelay}ms...`);
        await delay(retryDelay);
      }
    } catch (error: any) {
      lastError = error;
      
      // Timeout errors should be retried
      if (error.message?.includes('timed out') && attempt < maxRetries) {
        console.warn(`⚠️ Query timed out (attempt ${attempt + 1}/${maxRetries + 1}), retrying...`);
        await delay(retryDelay);
        continue;
      }
      
      // For other errors, return immediately
      console.error('❌ Query error:', error);
      return { data: null, error };
    }
  }
  
  console.error(`❌ Query failed after ${maxRetries + 1} attempts`);
  return { data: null, error: lastError };
}

/**
 * Determines if an error should not be retried
 */
function isNonRetryableError(error: any): boolean {
  if (!error) return false;
  
  // Don't retry authentication errors
  if (error.code === 'PGRST301' || error.message?.includes('JWT')) {
    return true;
  }
  
  // Don't retry permission errors
  if (error.code === '42501' || error.message?.includes('permission denied')) {
    return true;
  }
  
  // Don't retry "not found" errors
  if (error.code === 'PGRST116') {
    return true;
  }
  
  return false;
}

/**
 * Safe wrapper for Supabase operations that logs errors and provides fallbacks
 */
export async function safeSupabaseOperation<T>(
  operation: () => Promise<{ data: T | null; error: any }>,
  fallbackValue: T,
  operationName: string = 'Supabase operation',
  config?: RetryConfig
): Promise<T> {
  try {
    const result = await withRetry(operation, config);
    
    if (result.error) {
      console.error(`Error in ${operationName}:`, result.error);
      return fallbackValue;
    }
    
    return result.data || fallbackValue;
  } catch (error) {
    console.error(`Exception in ${operationName}:`, error);
    return fallbackValue;
  }
}

/**
 * Batch multiple Supabase operations with individual error handling
 */
export async function batchOperations<T>(
  operations: Array<{
    fn: () => Promise<{ data: T | null; error: any }>;
    name: string;
    fallback: T;
  }>,
  config?: RetryConfig
): Promise<T[]> {
  const results = await Promise.allSettled(
    operations.map(({ fn, name, fallback }) =>
      safeSupabaseOperation(fn, fallback, name, config)
    )
  );
  
  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    console.error(`Batch operation "${operations[index].name}" failed:`, result.reason);
    return operations[index].fallback;
  });
}
