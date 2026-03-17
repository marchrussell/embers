import { useQuery } from '@tanstack/react-query';
import { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { LiveReplay } from '../types';

type RawReplayRow = {
  id: string;
  title: string;
  session_type: string | null;
  start_time: string;
  end_time: string | null;
  recording_url: string | null;
  guest_teachers: { name: string; photo_url: string | null } | { name: string; photo_url: string | null }[] | null;
};

export const AVAILABILITY_DAYS: Record<LiveReplay['session_type'], number | null> = {
  'weekly-reset': 7,
  'monthly-presence': 30,
  'guest-session': null,
};

export const useLiveReplays = () => {
  return useQuery({
    queryKey: ['live-replays'],
    queryFn: async (): Promise<LiveReplay[]> => {
      const { data, error } = await supabase
        .from('live_sessions')
        .select(`
          id,
          title,
          session_type,
          start_time,
          end_time,
          recording_url,
          guest_teachers!linked_session_id(name, photo_url)
        `)
        .not('recording_url', 'is', null)
        .not('session_type', 'is', null)
        .order('start_time', { ascending: false }) as unknown as {
          data: RawReplayRow[] | null;
          error: PostgrestError | null;
        };

      if (error) throw error;

      return (data ?? []).map((row) => {
        const teacher = Array.isArray(row.guest_teachers)
          ? row.guest_teachers[0]
          : row.guest_teachers;
        return {
          id: row.id,
          title: row.title,
          session_type: row.session_type as LiveReplay['session_type'],
          start_time: row.start_time,
          end_time: row.end_time ?? null,
          recording_url: row.recording_url as string,
          teacher_name: teacher?.name ?? undefined,
          teacher_photo: teacher?.photo_url ?? undefined,
        };
      });
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};
