'use client';

import * as React from 'react';
import createCache from '@emotion/cache';
import { useServerInsertedHTML } from 'next/navigation';
import { CacheProvider as EmotionCacheProvider } from '@emotion/react';

export default function EmotionCache({ children }: { children: React.ReactNode }) {
  const [cache] = React.useState(() => {
    const cache = createCache({ key: 'css', prepend: true });
    cache.compat = true;
    return cache;
  });

  useServerInsertedHTML(() => {
    const entries = Object.entries(cache.inserted);
    if (entries.length === 0) {
      return null;
    }
    let styles = '';
    let dataEmotionAttribute = cache.key;

    entries.forEach(([name, value]) => {
      if (typeof value === 'string') {
        styles += value;
        dataEmotionAttribute += ` ${name}`;
      }
    });

    return (
      <style
        key={cache.key}
        data-emotion={dataEmotionAttribute}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return <EmotionCacheProvider value={cache}>{children}</EmotionCacheProvider>;
}
