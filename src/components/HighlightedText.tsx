'use client';

import { Text } from '@mantine/core';
import { useMemo } from 'react';

interface HighlightedTextProps {
  text: string;
  highlight: string;
  highlightColor?: string;
}

export default function HighlightedText({
  text,
  highlight,
  highlightColor = '#fff3cd',
}: HighlightedTextProps) {
  const parts = useMemo(() => {
    if (!highlight.trim()) {
      return [{ text, isHighlight: false }];
    }

    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const splitText = text.split(regex);

    return splitText.map((part) => ({
      text: part,
      isHighlight: regex.test(part),
    }));
  }, [text, highlight]);

  return (
    <>
      {parts.map((part, i) =>
        part.isHighlight ? (
          <Text
            key={i}
            component="mark"
            style={{
              backgroundColor: highlightColor,
              padding: '0 2px',
              borderRadius: 2,
            }}
          >
            {part.text}
          </Text>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </>
  );
}
