import { useState, useEffect } from 'react';
import { api, Link, GraphData } from '@/lib/api';

export function useLinks(isAuthenticated: boolean) {
  const [links, setLinks] = useState<Link[]>([]);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [linksData, graphDataResult] = await Promise.all([
        api.getLinks(),
        api.getGraphData(),
      ]);
      setLinks(linksData);
      setGraphData(graphDataResult);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAuthenticated]);

  return {
    links,
    graphData,
    loading,
    refetch: fetchData,
  };
}
