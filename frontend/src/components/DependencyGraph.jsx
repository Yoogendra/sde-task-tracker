// frontend/src/components/DependencyGraph.jsx
import React, { useEffect, useRef } from 'react';

const DependencyGraph = ({ tasks }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || tasks.length === 0) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // 1. Calculate Node Positions (Circular Layout)
        const nodes = [];
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 3; // Keep circles inside canvas
        const angleStep = (2 * Math.PI) / tasks.length;

        tasks.forEach((task, index) => {
            const angle = index * angleStep;
            nodes.push({
                id: task.id,
                title: task.title,
                status: task.status,
                // Position logic:
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle),
            });
        });

        // 2. Draw Connections (Arrows)
        ctx.strokeStyle = '#94a3b8'; // gray-400
        ctx.lineWidth = 2;

        tasks.forEach(task => {
            if (task.dependencies && task.dependencies.length > 0) {
                const fromNode = nodes.find(n => n.id === task.id);
                
                task.dependencies.forEach(dep => {
                    // dep.depends_on is the ID of the task we need
                    const targetId = dep.depends_on; 
                    const toNode = nodes.find(n => n.id === targetId);

                    if (fromNode && toNode) {
                        drawArrow(ctx, fromNode.x, fromNode.y, toNode.x, toNode.y);
                    }
                });
            }
        });

        // 3. Draw Nodes (Circles)
        nodes.forEach(node => {
            ctx.beginPath();
            ctx.arc(node.x, node.y, 30, 0, 2 * Math.PI);
            
            // Color based on status
            if (node.status === 'completed') ctx.fillStyle = '#bbf7d0'; // green
            else if (node.status === 'blocked') ctx.fillStyle = '#fca5a5'; // red
            else if (node.status === 'in_progress') ctx.fillStyle = '#bfdbfe'; // blue
            else ctx.fillStyle = '#f1f5f9'; // gray

            ctx.fill();
            ctx.strokeStyle = '#475569';
            ctx.stroke();

            // Draw ID inside circle
            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(node.id, node.x, node.y);
            
            // Draw Title below circle
            ctx.font = '12px Arial';
            ctx.fillText(node.title.substring(0, 10), node.x, node.y + 45);
        });

    }, [tasks]);

    // Helper to draw arrow
    const drawArrow = (ctx, fromX, fromY, toX, toY) => {
        const headlen = 10; 
        const angle = Math.atan2(toY - fromY, toX - fromX);
        
        // Offset start/end so lines don't overlap text inside circle
        const offset = 30; 
        const startX = fromX + offset * Math.cos(angle);
        const startY = fromY + offset * Math.sin(angle);
        const endX = toX - offset * Math.cos(angle);
        const endY = toY - offset * Math.sin(angle);

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Arrowhead
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - headlen * Math.cos(angle - Math.PI / 6), endY - headlen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(endX - headlen * Math.cos(angle + Math.PI / 6), endY - headlen * Math.sin(angle + Math.PI / 6));
        ctx.fillStyle = '#94a3b8';
        ctx.fill();
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 mt-8">
            <h3 className="text-xl font-bold mb-4 text-slate-800 border-b pb-2">Visualization</h3>
            <div className="flex justify-center bg-slate-50 rounded-lg overflow-hidden">
                <canvas ref={canvasRef} width={600} height={400} />
            </div>
            <p className="text-center text-xs text-slate-400 mt-2">
                Real-time dependency visualization using HTML5 Canvas
            </p>
        </div>
    );
};

export default DependencyGraph;