import { useCallback, useEffect, useState } from 'react';
import { api } from '@/services/api';

export type AssignmentStatus = 'active' | 'expired' | 'archived';

export type AssignmentDto = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: AssignmentStatus;
  tools: ('ev3' | 'tinkercad')[];
  submissionCount?: number;
};

export function useAssignments(enabled = true) {
  const [rows, setRows] = useState<AssignmentDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<{ data: AssignmentDto[] }>('/api/assignments', {
        params: { page: 1, pageSize: 100 },
      });
      setRows(data.data);
    } catch (e) {
      setError((e as Error).message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    void reload();
  }, [enabled, reload]);

  return { rows, loading, error, reload };
}

