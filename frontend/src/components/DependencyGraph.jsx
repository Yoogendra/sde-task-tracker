// frontend/src/components/DependencyGraph.jsx
import React, { useEffect, useRef, useState } from 'react';

const DependencyGraph = ({ tasks }) => {
    const canvasRef = useRef(null);
    const nodesRef = useRef([]); // Store node positions for hit testing
    
    // Viewport State
    const [selectedNode, setSelectedNode] = useState(null);
    const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
    
    // Interaction Refs
    const isMouseDownRef = useRef(false);
    const dragStartRef = useRef({ x: 0, y: 0 }); 
    const lastMousePosRef = useRef({ x: 0, y: 0 }); 

    // --- DRAWING LOGIC ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || tasks.length === 0) return;
        
        const ctx = canvas.getContext('2d');
        
        // Fix Resolution
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        // 1. Calculate Nodes
        const calculateNodes = () => {
            const calculatedNodes = [];
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = Math.min(canvas.width, canvas.height) / 3;
            const angleStep = (2 * Math.PI) / (tasks.length || 1);

            tasks.forEach((task, index) => {
                const angle = index * angleStep - (Math.PI / 2);
                calculatedNodes.push({
                    id: task.id,
                    title: task.title,
                    status: task.status,
                    x: centerX + radius * Math.cos(angle),
                    y: centerY + radius * Math.sin(angle),
                    radius: 30 // Hit radius
                });
            });
            return calculatedNodes;
        };

        const nodes = calculateNodes();
        nodesRef.current = nodes; 

        // 2. Clear & Transform
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(transform.x, transform.y);
        ctx.scale(transform.scale, transform.scale);

        // 3. Draw Arrows
        tasks.forEach(task => {
            if (task.dependencies) {
                task.dependencies.forEach(dep => {
                    const fromNode = nodes.find(n => n.id === task.id);
                    const toNode = nodes.find(n => n.id === dep.depends_on);
                    
                    if (fromNode && toNode) {
                        const isRelated = selectedNode === null || 
                                          fromNode.id === selectedNode || 
                                          toNode.id === selectedNode;

                        ctx.globalAlpha = isRelated ? 1 : 0.1;
                        ctx.strokeStyle = isRelated ? '#94a3b8' : '#e2e8f0';
                        ctx.lineWidth = 2;
                        
                        drawArrow(ctx, fromNode.x, fromNode.y, toNode.x, toNode.y);
                    }
                });
            }
        });

        // 4. Draw Nodes
        nodes.forEach(node => {
            let isRelated = true;
            if (selectedNode !== null) {
                const isDirect = node.id === selectedNode;
                const isNeighbor = tasks.some(t => 
                    (t.id === selectedNode && t.dependencies.some(d => d.depends_on === node.id)) ||
                    (t.id === node.id && t.dependencies.some(d => d.depends_on === selectedNode))
                );
                isRelated = isDirect || isNeighbor;
            }

            ctx.globalAlpha = isRelated ? 1 : 0.15; 

            ctx.beginPath();
            ctx.arc(node.x, node.y, 25, 0, 2 * Math.PI);

            // Colors
            if (node.status === 'completed') ctx.fillStyle = '#10b981';
            else if (node.status === 'blocked') ctx.fillStyle = '#f43f5e';
            else if (node.status === 'in_progress') ctx.fillStyle = '#3b82f6';
            else ctx.fillStyle = '#94a3b8';

            // Selection Border
            if (node.id === selectedNode) {
                ctx.lineWidth = 4;
                ctx.strokeStyle = '#0f172a'; 
                ctx.stroke();
            } else {
                ctx.lineWidth = 1;
                ctx.strokeStyle = '#475569';
                ctx.stroke();
            }
            ctx.fill();

            // Text
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(node.id, node.x, node.y);

            // Title
            ctx.fillStyle = '#fcfcfc';
            ctx.font = '10px Arial';
            ctx.fillText(node.title.substring(0, 10), node.x, node.y + 35);
        });

        ctx.restore();

    }, [tasks, transform, selectedNode]);

    // --- MOUSE HANDLERS ---

    const handleWheel = (e) => {
        e.preventDefault();
        const zoomSensitivity = 0.001;
        setTransform(prev => {
            const newScale = Math.min(Math.max(0.5, prev.scale - e.deltaY * zoomSensitivity), 3);
            return { ...prev, scale: newScale };
        });
    };

    const handleMouseDown = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        isMouseDownRef.current = true;
        dragStartRef.current = { x, y }; 
        lastMousePosRef.current = { x, y };
    };

    const handleMouseMove = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;

        // Pointer Cursor Logic
        const worldX = (currentX - transform.x) / transform.scale;
        const worldY = (currentY - transform.y) / transform.scale;
        const isHovering = nodesRef.current.some(node => 
            Math.sqrt((node.x - worldX) ** 2 + (node.y - worldY) ** 2) <= node.radius
        );
        canvasRef.current.style.cursor = isHovering ? 'pointer' : (isMouseDownRef.current ? 'grabbing' : 'grab');

        // Panning Logic
        if (isMouseDownRef.current) {
            const dx = currentX - lastMousePosRef.current.x;
            const dy = currentY - lastMousePosRef.current.y;
            setTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
            lastMousePosRef.current = { x: currentX, y: currentY };
        }
    };

    const handleMouseUp = (e) => {
        isMouseDownRef.current = false;
        const rect = canvasRef.current.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;

        // Only click if we didn't drag
        const moveDist = Math.sqrt(
            (currentX - dragStartRef.current.x) ** 2 + 
            (currentY - dragStartRef.current.y) ** 2
        );

        if (moveDist < 5) {
            handleGraphClick(currentX, currentY);
        }
    };

    const handleGraphClick = (screenX, screenY) => {
        const worldX = (screenX - transform.x) / transform.scale;
        const worldY = (screenY - transform.y) / transform.scale;

        const clickedNode = nodesRef.current.find(node => {
            const dist = Math.sqrt((node.x - worldX) ** 2 + (node.y - worldY) ** 2);
            return dist <= node.radius;
        });

        if (clickedNode) {
            setSelectedNode(prev => prev === clickedNode.id ? null : clickedNode.id);
        } else {
            setSelectedNode(null); 
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.addEventListener('wheel', handleWheel, { passive: false });
            return () => canvas.removeEventListener('wheel', handleWheel);
        }
    }, []);

    // Helper: Arrow Drawing
    const drawArrow = (ctx, fromX, fromY, toX, toY) => {
        const headlen = 10; // Slightly bigger arrowhead
        const angle = Math.atan2(toY - fromY, toX - fromX);
        const offset = 28; 

        const startX = fromX + offset * Math.cos(angle);
        const startY = fromY + offset * Math.sin(angle);
        const endX = toX - offset * Math.cos(angle);
        const endY = toY - offset * Math.sin(angle);

        // Draw Line
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Draw Arrowhead
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - headlen * Math.cos(angle - Math.PI / 6), endY - headlen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(endX - headlen * Math.cos(angle + Math.PI / 6), endY - headlen * Math.sin(angle + Math.PI / 6));
        
        // --- THIS FIXES THE INVISIBLE ARROW ---
        ctx.fillStyle = ctx.strokeStyle; 
        ctx.fill();
    };

    return (
        <canvas 
            ref={canvasRef}
            className="w-full h-full block touch-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => isMouseDownRef.current = false}
        />
    );
};

export default DependencyGraph;