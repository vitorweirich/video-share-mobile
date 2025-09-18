import { jsonHeaders } from '@/constants/api';
import { useAuth } from '@/contexts/AuthContext';
import * as FileSystem from 'expo-file-system';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type VideoItem = {
  id: number;
  title: string;
  // The short share URL returned by backend; use ShortLinkController to resolve
  shareUrl?: string;
  expiresIn?: string; // ISO datetime
};

type VideosContextType = {
  videos: VideoItem[];
  refresh: () => Promise<void>;
  upload: (
    pickedFile: { uri: string; name: string; mimeType: string; size: number },
    onProgress?: (progress: number) => void,
    onStage?: (stage:
      | 'preparing'
      | 'requesting'
      | 'uploading'
      | 'registering'
      | 'refreshing'
      | 'done') => void,
  ) => Promise<VideoItem>;
  getPlaybackUrl: (videoId: number) => Promise<string>;
  getById: (id: number) => VideoItem | undefined;
};

const VideosContext = createContext<VideosContextType | undefined>(undefined);

export function VideosProvider({ children }: { children: React.ReactNode }) {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const { authFetch } = useAuth();

  const refresh = useCallback(async () => {
    const res = await authFetch('/v1/videos/me?rows=20');
    if (!res.ok) throw new Error('Falha ao listar vídeos');
    const page = await res.json();
    // Page<VideoDTO>: map to VideoItem
    const mapped: VideoItem[] = (page?.content || []).map((v: any) => ({
      id: v.id,
      title: v.name,
      shareUrl: v.shareUrl,
      expiresIn: v.expiresIn,
    }));
    setVideos(mapped);
  }, [authFetch]);

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  const requestSignedPut = useCallback(async (name: string, size: number, mimeType: string) => {
    const res = await authFetch('/v1/videos/upload', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ fileName: name, fileSize: size, contentType: mimeType }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Falha ao requisitar URL de upload (${res.status})${body ? `: ${body}` : ''}`);
    }
    const data = await res.json();
    return data as { signedUrl: string; videoId: number; expirationDate: string };
  }, [authFetch]);

  const doUploadToSignedUrl = useCallback(async (signedUrl: string, file: { uri: string; mimeType: string }, onProgress?: (progress: number) => void, knownSize?: number) => {
    // Ensure we have a file:// path. If it's a content:// URI, copy to cache first.
    let uploadUri = file.uri;
    if (!uploadUri.startsWith('file://')) {
      const target = `${FileSystem.cacheDirectory}upload-${Date.now()}`;
      await FileSystem.copyAsync({ from: uploadUri, to: target });
      uploadUri = target;
    }
    onProgress?.(0);
    const result = await FileSystem.uploadAsync(
      signedUrl,
      uploadUri,
      {
        httpMethod: 'PUT',
        headers: { 'Content-Type': file.mimeType },
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      }
    );
    if (!result || result.status < 200 || result.status >= 300) {
      const response = result?.body ? ` - ${result.body}` : '';
      throw new Error(`Falha ao enviar arquivo (HTTP ${result?.status ?? 'desconhecido'})${response}`);
    }
    onProgress?.(1);
  }, []);

  const registerUploaded = useCallback(async (videoId: number) => {
    const res = await authFetch(`/v1/videos/upload/${videoId}/register-uploaded`, { method: 'PATCH' });
    if (!res.ok && res.status !== 204) {
      const body = await res.text().catch(() => '');
      throw new Error(`Falha ao registrar upload (${res.status})${body ? `: ${body}` : ''}`);
    }
  }, [authFetch]);

  const upload = useCallback(async (
    pickedFile: { uri: string; name: string; mimeType: string; size: number },
    onProgress?: (progress: number) => void,
    onStage?: (stage: 'preparing' | 'requesting' | 'uploading' | 'registering' | 'refreshing' | 'done') => void,
  ) => {
    try {
      onStage?.('preparing');
      // Ensure local file path and determine size reliably
      let activeUri = pickedFile.uri;
      if (!activeUri.startsWith('file://')) {
        const extFromName = (pickedFile.name.split('.').pop() || 'tmp');
        const target = `${FileSystem.cacheDirectory}upload-${Date.now()}.${extFromName}`;
        await FileSystem.copyAsync({ from: activeUri, to: target });
        activeUri = target;
      }
      let effectiveSize = pickedFile.size;
      if (!effectiveSize || effectiveSize <= 0) {
        try {
          const info = await FileSystem.getInfoAsync(activeUri);
          // @ts-ignore size is available on native platforms
          effectiveSize = (info as any)?.size ?? 0;
        } catch {}
        if (!effectiveSize) {
          throw new Error('Não foi possível determinar o tamanho do arquivo selecionado.');
        }
      }

      onStage?.('requesting');
      const req = await requestSignedPut(pickedFile.name, effectiveSize, pickedFile.mimeType);

      onStage?.('uploading');
      try {
        await doUploadToSignedUrl(
          req.signedUrl,
          { uri: activeUri, mimeType: pickedFile.mimeType },
          onProgress,
          effectiveSize,
        );
      } catch (e: any) {
        // Upload falhou após criar o registro do vídeo no backend
        throw new Error(`Falha no envio do arquivo: ${e?.message || e}`);
      }

      onStage?.('registering');
      await registerUploaded(req.videoId);

      onStage?.('refreshing');
      await refresh();

      onStage?.('done');
      const item = videos.find(v => v.id === req.videoId) || ({ id: req.videoId, title: pickedFile.name } as VideoItem);
      return item;
    } catch (err) {
      // Propaga erro detalhado para a UI
      throw err;
    }
  }, [doUploadToSignedUrl, registerUploaded, refresh, requestSignedPut, videos]);

  const getPlaybackUrl = useCallback(async (videoId: number) => {
    const res = await authFetch(`/v1/videos/${videoId}`);
    if (!res.ok) throw new Error('Falha ao obter URL do vídeo');
    const data = await res.json();
    // Backend returns SignedUrlDTO: either short link or direct signed URL
    return (data?.signedUrl as string) || '';
  }, [authFetch]);

  const getById = useCallback((id: number) => videos.find(v => v.id === id), [videos]);

  const value = useMemo(() => ({ videos, refresh, upload, getPlaybackUrl, getById }), [videos, refresh, upload, getPlaybackUrl, getById]);
  return <VideosContext.Provider value={value}>{children}</VideosContext.Provider>;
}

export function useVideos() {
  const ctx = useContext(VideosContext);
  if (!ctx) throw new Error('useVideos must be used within VideosProvider');
  return ctx;
}
