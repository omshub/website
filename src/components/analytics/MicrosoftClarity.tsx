'use client';

import { useEffect } from 'react';
import Clarity from '@microsoft/clarity';

interface MicrosoftClarityProps {
  projectId: string;
}

export default function MicrosoftClarity({ projectId }: MicrosoftClarityProps) {
  useEffect(() => {
    Clarity.init(projectId);
  }, [projectId]);

  return null;
}
