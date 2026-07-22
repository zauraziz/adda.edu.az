'use client';
import { useEffect, useState } from 'react';
import { STRAPI_URL } from '@/lib/strapi';

interface ReactionBarProps {
  targetType: 'article' | 'announcement' | 'event' | 'milestone';
  targetSlug: string;
}

type EmojiType = 'anchor' | 'ship' | 'compass' | 'wave';

const EMOJIS: { type: EmojiType; icon: string }[] = [
  { type: 'anchor', icon: '⚓' },
  { type: 'ship', icon: '🚢' },
  { type: 'compass', icon: '🧭' },
  { type: 'wave', icon: '🌊' }
];

export default function ReactionBar({ targetType, targetSlug }: ReactionBarProps) {
  const [counts, setCounts] = useState<Record<EmojiType, number>>({ anchor: 0, ship: 0, compass: 0, wave: 0 });
  const [userReacted, setUserReacted] = useState<Record<EmojiType, boolean>>({ anchor: false, ship: false, compass: false, wave: false });
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Session ID yaradılması və ya oxunması (yalnız client-side)
    let sid = localStorage.getItem('adda_session_id');
    if (!sid) {
      sid = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
      localStorage.setItem('adda_session_id', sid);
    }
    setSessionId(sid);

    // Cari reaksiyaların çəkilməsi
    fetch(`${STRAPI_URL}/api/reactions?filters[targetType][$eq]=${targetType}&filters[targetSlug][$eq]=${targetSlug}&pagination[pageSize]=100`)
      .then(r => r.ok ? r.json() : null)
      .then(res => {
        if (!res?.data) return;
        
        const newCounts = { anchor: 0, ship: 0, compass: 0, wave: 0 };
        const newUserReacted = { anchor: false, ship: false, compass: false, wave: false };
        
        res.data.forEach((item: any) => {
          const emoji = item.emoji as EmojiType;
          if (newCounts[emoji] !== undefined) {
            newCounts[emoji]++;
            if (item.sessionId === sid) {
              newUserReacted[emoji] = true;
            }
          }
        });
        
        setCounts(newCounts);
        setUserReacted(newUserReacted);
        setIsLoaded(true);
      })
      .catch(err => {
        console.error('Reactions fetch xetasi:', err);
        setIsLoaded(true); // Xəta olsa da UI bloku açılsın
      });
  }, [targetType, targetSlug]);

  const handleReaction = async (emoji: EmojiType) => {
    if (userReacted[emoji] || !sessionId) return;

    // Optimistik yeniləmə (dərhal reaksiya)
    setCounts(prev => ({ ...prev, [emoji]: prev[emoji] + 1 }));
    setUserReacted(prev => ({ ...prev, [emoji]: true }));

    try {
      const res = await fetch(`${STRAPI_URL}/api/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: { targetType, targetSlug, emoji, sessionId }
        })
      });
      if (!res.ok) throw new Error('API xetasi');
    } catch (err) {
      console.error('Reaction post xetasi:', err);
      // Xəta olarsa optimistik yeniləməni geri al
      setCounts(prev => ({ ...prev, [emoji]: prev[emoji] - 1 }));
      setUserReacted(prev => ({ ...prev, [emoji]: false }));
    }
  };

  if (!isLoaded) return null; // Hydration fərqinin qarşısını almaq üçün mount olana qədər gizlədilir

  return (
    <div className="na-reaction-bar">
      {EMOJIS.map(e => (
        <button
          key={e.type}
          onClick={() => handleReaction(e.type)}
          className={`na-reaction-btn ${userReacted[e.type] ? 'active' : ''}`}
          disabled={userReacted[e.type]}
          aria-label={`React with ${e.type}`}
        >
          <span className="na-reaction-emoji">{e.icon}</span>
          <span className="na-reaction-count">{counts[e.type]}</span>
        </button>
      ))}
    </div>
  );
}
