'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { GraphData, Category } from '@/lib/api';

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
      const isMobile = window.innerWidth < 768;
      const padding = isMobile ? 24 : 100;
      const heightOffset = isMobile ? 300 : 200;

      setDimensions({
        width: Math.max(300, window.innerWidth - padding),
        height: Math.max(400, window.innerHeight - heightOffset),
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
    const colors: Record<string, string> = {
      [Category.ARTICLE]: '#10b981',        // green
      [Category.TUTORIAL]: '#f59e0b',        // orange
      [Category.DOCUMENTATION]: '#ec4899',   // pink
      [Category.TOOL]: '#8b5cf6',            // purple
      [Category.VIDEO]: '#ef4444',           // red
      [Category.REPOSITORY]: '#3b82f6',      // blue
      [Category.RESEARCH]: '#14b8a6',        // teal
      [Category.NEWS]: '#f97316',            // orange-red
      [Category.REFERENCE]: '#06b6d4',       // cyan
      [Category.OTHER]: '#94a3b8',           // gray
    };
    return colors[category] || colors[Category.OTHER];
  };

  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900 touch-none">
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
