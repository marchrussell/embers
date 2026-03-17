export interface LibrarySession {
  id: string;
  title: string;
  description?: string;
  duration: number;
  teacher: string;
  image: string | null;
  locked: boolean;
  created_at?: string;
  technique?: string;
  intensity?: string;
  order_index?: number | null;
}

export interface FavouriteSession {
  id: string;
  title: string;
  duration: number;
  teacher: string;
  image: string | null;
  locked: boolean;
}

export interface LibraryCategory {
  id: string;
  name: string;
  description: string;
  image: string;
  sessions: LibrarySession[];
}

export interface LibraryProgram {
  id: string;
  title: string;
  description: string;
  image: string;
  classCount: number;
  locked: boolean;
  sessions: LibrarySession[];
}
