import { useEffect } from 'react';

const SITE = 'Global AgriTech Innovation Hub';

export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE}` : SITE;
  }, [title]);
}
