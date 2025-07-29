'use client';

import { useSearchParams } from 'next/navigation';
import TagImage from '../TagImage';

export default function TagImagePreview() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'Unknown';
  const content = searchParams.get('content') || '';
  const avatar = searchParams.get('avatar') || 'https://cdn.discordapp.com/embed/avatars/0.png';

  return (
    <div style={{ maxWidth: 500, transform: 'scale(2)', transformOrigin: 'top left' }} id='tag-image-preview'>
      <div style={{ background: 'transparent', paddingLeft: 15, paddingTop: 15, paddingBottom: 15 }}>
        <TagImage name={name} content={content} avatar={avatar} />
      </div>
    </div>
  );
}
