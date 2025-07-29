import React from 'react';
import { DiscordMessages, DiscordMessage } from '@skyra/discord-components-react';
import MarkdownRenderer from './MarkdownRenderer';

export default function TagImage({ name, content, avatar }) {
  return (
    <div style={{ background: 'transparent', padding: 0, margin: 0 }}>
      <DiscordMessages>
        <DiscordMessage author={name} avatar={avatar}>
          <MarkdownRenderer content={content} />
        </DiscordMessage>
      </DiscordMessages>
    </div>
  );
}
