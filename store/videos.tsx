import AsyncStorage from '@react-native-async-storage/async-storage';
import { nanoid } from 'nanoid/non-secure';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type VideoItem = {
  id: string;
  title: string;
  uri: string; // local file uri
  owner?: string;
};

type VideosContextType = {
  videos: VideoItem[];
  addVideo: (title: string, uri: string, owner?: string) => Promise<VideoItem>;
  getById: (id: string) => VideoItem | undefined;
};

const STORAGE_KEY = 'video-share:videos';

const VideosContext = createContext<VideosContextType | undefined>(undefined);

export function VideosProvider({ children }: { children: React.ReactNode }) {
  const [videos, setVideos] = useState<VideoItem[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setVideos(JSON.parse(raw));
      } catch {}
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(videos)).catch(() => {});
  }, [videos]);

  const addVideo = useCallback(async (title: string, uri: string, owner?: string) => {
    const v: VideoItem = { id: nanoid(8), title, uri, owner };
    setVideos(prev => [v, ...prev]);
    return v;
  }, []);

  const getById = useCallback((id: string) => videos.find(v => v.id === id), [videos]);

  const value = useMemo(() => ({ videos, addVideo, getById }), [videos, addVideo, getById]);
  return <VideosContext.Provider value={value}>{children}</VideosContext.Provider>;
}

export function useVideos() {
  const ctx = useContext(VideosContext);
  if (!ctx) throw new Error('useVideos must be used within VideosProvider');
  return ctx;
}
