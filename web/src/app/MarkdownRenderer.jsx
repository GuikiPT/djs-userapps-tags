import React from 'react';
import {
  DiscordBold,
  DiscordItalic,
  DiscordUnderlined,
  DiscordSpoiler,
  DiscordCode,
  DiscordQuote,
  DiscordHeader,
  DiscordSubscript,
  DiscordLink,
  DiscordTime,
  DiscordMention,
} from '@skyra/discord-components-react';

// Helper to parse a line and return an array of React elements
function parseDiscordMarkdown(line, rolesStorage) {
  // Replace Discord markdown with Discord component React elements
  // Only basic demo, not full-featured
  let elements = [];
  let replaced = line;

  // Subscript
  if (/^-# (.+)$/.test(replaced)) {
    const match = replaced.match(/^-# (.+)$/);
    elements.push(<DiscordSubscript key="subscript">{match[1]}</DiscordSubscript>);
    return elements;
  }
  // Header
  if (/^(#{1,3}) (.+)$/.test(replaced)) {
    const match = replaced.match(/^(#{1,3}) (.+)$/);
    elements.push(<DiscordHeader key="header" level={match[1].length}>{match[2]}</DiscordHeader>);
    return elements;
  }
  // Quote
  if (/^(>{1,3}) (.+)$/.test(replaced)) {
    const match = replaced.match(/^(>{1,3}) (.+)$/);
    elements.push(<DiscordQuote key="quote">{match[2]}</DiscordQuote>);
    return elements;
  }
  // Spoiler
  replaced = replaced.replace(/\|\|(.+?)\|\|/g, (__, text) => {
    elements.push(<DiscordSpoiler key={`spoiler-${text}`}>{text}</DiscordSpoiler>);
    return '';
  });
  // Bold
  replaced = replaced.replace(/\*\*(.+?)\*\*/g, (__, text) => {
    elements.push(<DiscordBold key={`bold-${text}`}>{text}</DiscordBold>);
    return '';
  });
  // Italic
  replaced = replaced.replace(/\*(.+?)\*/g, (__, text) => {
    elements.push(<DiscordItalic key={`italic-${text}`}>{text}</DiscordItalic>);
    return '';
  });
  // Underlined
  replaced = replaced.replace(/__(.+?)__/g, (__, text) => {
    elements.push(<DiscordUnderlined key={`underlined-${text}`}>{text}</DiscordUnderlined>);
    return '';
  });
  // Code
  replaced = replaced.replace(/`{1,2}(.+?)`{1,2}/g, (__, text) => {
    elements.push(<DiscordCode key={`code-${text}`}>{text}</DiscordCode>);
    return '';
  });
  // Link
  replaced = replaced.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (__, label, url) => {
    elements.push(<DiscordLink key={`link-${label}`} href={url} target="_blank" rel="noreferrer">{label}</DiscordLink>);
    return '';
  });
  // Time
  replaced = replaced.replace(/<(t:\d+:[tTdDfFR])>/g, (__, time) => {
    elements.push(<DiscordTime key={`time-${time}`}>{`<${time}>`}</DiscordTime>);
    return '';
  });
  // Mentions
  replaced = replaced.replace(/<@(\d{18,21})>/g, (__, userId) => {
    elements.push(<DiscordMention key={`user-${userId}`} type="user">{userId}</DiscordMention>);
    return '';
  });
  replaced = replaced.replace(/<#(\d{18,21})>/g, (__, channelId) => {
    elements.push(<DiscordMention key={`channel-${channelId}`} type="channel">{channelId}</DiscordMention>);
    return '';
  });
  replaced = replaced.replace(/<@&(\d{18,21})>/g, (__, roleId) => {
    const roleLabel = rolesStorage?.getRoleById?.(roleId);
    elements.push(<DiscordMention key={`role-${roleId}`} type="role">{roleLabel ?? roleId}</DiscordMention>);
    return '';
  });
  replaced = replaced.replace(/<\/(\w+):\d{18,21}>/g, (__, command) => {
    elements.push(<DiscordMention key={`slash-${command}`} type="slash">{command}</DiscordMention>);
    return '';
  });

  // If nothing matched, push the remaining text
  if (replaced.trim()) {
    elements.push(replaced);
  }
  return elements;
}

export default function MarkdownRenderer({ content, rolesStorage }) {
  const lines = content.split('\n');
  let result = [];
  for (const element of lines) {
    const parsed = parseDiscordMarkdown(element, rolesStorage);
    result.push(...parsed);
    result.push(<br key={`br-${result.length}`} />);
  }
  return <>{result}</>;
}
