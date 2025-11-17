'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { GraphData } from '@/lib/api';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
});

interface KnowledgeGraphProps {
  data: GraphData;
  onNodeClick?: (node: any) => void;
}

export default function KnowledgeGraph({ data, onNodeClick }: KnowledgeGraphProps) {
  const graphRef = useRef<any>();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth - 100,
        height: window.innerHeight - 200,
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Transform data for react-force-graph
  const graphData = {
    nodes: data.nodes.map(node => ({
      id: node.id,
      name: node.label,
      url: node.url,
      category: node.category,
      tags: node.tags,
    })),
    links: data.edges.map(edge => ({
      source: edge.source,
      target: edge.target,
    })),
  };

  // Color scheme for different categories
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Uncategorized': '#94a3b8',
      'Reference': '#3b82f6',
      'Article': '#10b981',
      'Tutorial': '#f59e0b',
      'Tool': '#8b5cf6',
      'Documentation': '#ec4899',
    };
    return colors[category] || '#94a3b8';
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        nodeLabel="name"
        nodeColor={(node: any) => getCategoryColor(node.category)}
        nodeRelSize={6}
        linkColor={() => '#cbd5e1'}
        linkWidth={2}
        onNodeClick={(node: any) => {
          if (onNodeClick) {
            onNodeClick(node);
          }
        }}
        enableNodeDrag={true}
        enableZoomInteraction={true}
        enablePanInteraction={true}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const label = node.name;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;

          // Draw node circle
          ctx.beginPath();
          ctx.arc(node.x, node.y, 6, 0, 2 * Math.PI, false);
          ctx.fillStyle = getCategoryColor(node.category);
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2 / globalScale;
          ctx.stroke();

          // Draw label
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#374151';
          ctx.fillText(label, node.x, node.y + 12);
        }}
      />
    </div>
  );
}
