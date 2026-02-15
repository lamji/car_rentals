/**
 * Hook to listen for AI rules updates via Socket.IO and invalidate cache
 */
import { useEffect } from 'react';
import { useSocket } from '@/components/providers/SocketProvider';
import { invalidateRulesCache } from '@/lib/ai-knowledge-base';

export function useAiRulesSync() {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleRulesUpdate = (data: { action: string; ruleNumber?: number; count?: number }) => {
      console.log('🔔 AI rules updated:', data);
      invalidateRulesCache();
    };

    socket.on('ai_rules_updated', handleRulesUpdate);

    return () => {
      socket.off('ai_rules_updated', handleRulesUpdate);
    };
  }, [socket]);
}
