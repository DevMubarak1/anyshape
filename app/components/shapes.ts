// Preset shapes defined as SVG clip paths
// All shapes are normalized to fit within a 0-100 viewBox

export interface Shape {
  id: string;
  name: string;
  path: string;
  icon: string;
}

export const presetShapes: Shape[] = [
  {
    id: 'circle',
    name: 'Circle',
    path: 'M 50 0 A 50 50 0 1 1 50 100 A 50 50 0 1 1 50 0 Z',
    icon: '⭕',
  },
  {
    id: 'square',
    name: 'Square',
    path: 'M 0 0 L 100 0 L 100 100 L 0 100 Z',
    icon: '⬜',
  },
  {
    id: 'rounded-square',
    name: 'Rounded Square',
    path: 'M 15 0 L 85 0 Q 100 0 100 15 L 100 85 Q 100 100 85 100 L 15 100 Q 0 100 0 85 L 0 15 Q 0 0 15 0 Z',
    icon: '▢',
  },
  {
    id: 'heart',
    name: 'Heart',
    path: 'M 50 20 C 20 -10 -10 30 10 50 L 50 90 L 90 50 C 110 30 80 -10 50 20 Z',
    icon: '❤️',
  },
  {
    id: 'star',
    name: 'Star',
    path: 'M 50 0 L 61 35 L 98 35 L 68 57 L 79 91 L 50 70 L 21 91 L 32 57 L 2 35 L 39 35 Z',
    icon: '⭐',
  },
  {
    id: 'hexagon',
    name: 'Hexagon',
    path: 'M 50 0 L 93.3 25 L 93.3 75 L 50 100 L 6.7 75 L 6.7 25 Z',
    icon: '⬡',
  },
  {
    id: 'triangle',
    name: 'Triangle',
    path: 'M 50 5 L 95 90 L 5 90 Z',
    icon: '△',
  },
  {
    id: 'diamond',
    name: 'Diamond',
    path: 'M 50 0 L 100 50 L 50 100 L 0 50 Z',
    icon: '◇',
  },
  {
    id: 'pentagon',
    name: 'Pentagon',
    path: 'M 50 0 L 97.55 34.55 L 79.39 90.45 L 20.61 90.45 L 2.45 34.55 Z',
    icon: '⬠',
  },
  {
    id: 'octagon',
    name: 'Octagon',
    path: 'M 29.3 0 L 70.7 0 L 100 29.3 L 100 70.7 L 70.7 100 L 29.3 100 L 0 70.7 L 0 29.3 Z',
    icon: '⯃',
  },
  {
    id: 'oval',
    name: 'Oval',
    path: 'M 50 10 A 40 35 0 1 1 50 80 A 40 35 0 1 1 50 10 Z',
    icon: '⬭',
  },
  {
    id: 'cross',
    name: 'Cross',
    path: 'M 35 0 L 65 0 L 65 35 L 100 35 L 100 65 L 65 65 L 65 100 L 35 100 L 35 65 L 0 65 L 0 35 L 35 35 Z',
    icon: '✚',
  },
  {
    id: 'arrow',
    name: 'Arrow',
    path: 'M 50 0 L 100 40 L 70 40 L 70 100 L 30 100 L 30 40 L 0 40 Z',
    icon: '↑',
  },
  {
    id: 'cloud',
    name: 'Cloud',
    path: 'M 25 60 A 20 20 0 0 1 25 30 A 25 25 0 0 1 50 20 A 25 25 0 0 1 75 30 A 20 20 0 0 1 75 60 A 15 15 0 0 1 80 75 A 15 15 0 0 1 65 85 L 35 85 A 15 15 0 0 1 20 75 A 15 15 0 0 1 25 60 Z',
    icon: '☁️',
  },
  {
    id: 'message',
    name: 'Message',
    path: 'M 5 5 L 95 5 L 95 65 L 55 65 L 35 85 L 35 65 L 5 65 Z',
    icon: '💬',
  },
  {
    id: 'shield',
    name: 'Shield',
    path: 'M 50 5 L 90 15 L 90 45 Q 90 80 50 95 Q 10 80 10 45 L 10 15 Z',
    icon: '🛡️',
  },
];

// Helper function to generate polygon points for custom shapes
export function generatePolygonPath(sides: number, rotation: number = -90): string {
  const points: string[] = [];
  const angleStep = (2 * Math.PI) / sides;
  const startAngle = (rotation * Math.PI) / 180;
  
  for (let i = 0; i < sides; i++) {
    const angle = startAngle + i * angleStep;
    const x = 50 + 45 * Math.cos(angle);
    const y = 50 + 45 * Math.sin(angle);
    points.push(`${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  
  return `M ${points[0]} L ${points.slice(1).join(' L ')} Z`;
}

// Helper function to generate star path
export function generateStarPath(points: number, innerRadius: number = 0.4): string {
  const pathPoints: string[] = [];
  const outerRadius = 45;
  const inner = outerRadius * innerRadius;
  const angleStep = Math.PI / points;
  const startAngle = -Math.PI / 2;
  
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : inner;
    const angle = startAngle + i * angleStep;
    const x = 50 + radius * Math.cos(angle);
    const y = 50 + radius * Math.sin(angle);
    pathPoints.push(`${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  
  return `M ${pathPoints[0]} L ${pathPoints.slice(1).join(' L ')} Z`;
}
