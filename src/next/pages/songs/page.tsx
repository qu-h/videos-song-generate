import React from 'react';
import type { Metadata } from 'next';
import { SongManager } from '../../../react/SongManager';
import '../../../styles/songs.css';

export const metadata: Metadata = {
  title: 'Suno Music Studio · Quản lý Bài hát & YouTube Publish',
  description: 'Quản lý toàn diện prompt Suno, file MP3 âm thanh, link YouTube publish và lời bài hát dạng Markdown trên source code.',
};

export default function SongsPage() {
  return (
    <div style={{ minHeight: '100%', padding: '0' }}>
      <SongManager />
    </div>
  );
}

