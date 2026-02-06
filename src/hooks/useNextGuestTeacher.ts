import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface GuestTeacher {
  id: string;
  name: string;
  title: string;
  short_description: string | null;
  photo_url: string | null;
  session_date: string;
  session_title: string;
  what_to_expect: string[];
  is_active: boolean;
}

export function useNextGuestTeacher() {
  const [teacher, setTeacher] = useState<GuestTeacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchNextTeacher = async () => {
      try {
        const now = new Date().toISOString();
        
        const { data, error: fetchError } = await supabase
          .from('guest_teachers')
          .select('*')
          .eq('is_active', true)
          .gte('session_date', now)
          .order('session_date', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (fetchError) throw fetchError;
        setTeacher(data);
      } catch (err) {
        console.error('Error fetching next guest teacher:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchNextTeacher();
  }, []);

  return { teacher, loading, error };
}

// Helper function to calculate next 3rd Thursday
export function getNextThirdThursday(): Date {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();
  
  // Find 3rd Thursday of current month
  let thirdThursday = getThirdThursdayOfMonth(year, month);
  
  // If it's past, get next month's
  if (thirdThursday < now) {
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
    thirdThursday = getThirdThursdayOfMonth(year, month);
  }
  
  // Set time to 7:30 PM GMT
  thirdThursday.setUTCHours(19, 30, 0, 0);
  
  return thirdThursday;
}

function getThirdThursdayOfMonth(year: number, month: number): Date {
  const firstDay = new Date(year, month, 1);
  const dayOfWeek = firstDay.getDay();
  
  // Days until first Thursday (Thursday = 4)
  let daysUntilThursday = (4 - dayOfWeek + 7) % 7;
  
  // Third Thursday is 14 days after first Thursday
  const thirdThursday = new Date(year, month, 1 + daysUntilThursday + 14);
  
  return thirdThursday;
}

// Format the session date for display
export function formatGuestSessionDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}