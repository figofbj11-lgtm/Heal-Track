import React, { useState } from 'react';

function InteractiveChart({ isHC }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const data = [
    { day: 1, healing: 15, label: 'Day 1', desc: 'Baseline Incision. High Risk.' },
    { day: 7, healing: 45, label: 'Day 7', desc: 'Granulating Incision. Moderate.' },
    { day: 14, healing: 82, label: 'Day 14', desc: 'Remodeling Incision. Low Risk/Good.' }
  ];

  // SVG parameters
  const width = 500;
  const height = 200;
  const paddingX = 60;
  const paddingY = 30;

  // Scale calculations
  const xScale = (day) => {
    // day 1 maps to paddingX, day 14 maps to width - paddingX
    return paddingX + ((day - 1) / (14 - 1)) * (width - 2 * paddingX);
  };

  const yScale = (healing) => {
    // 0% maps to height - paddingY, 100% maps to paddingY
    return height - paddingY - (healing / 100) * (height - 2 * paddingY);
  };

  // Generate SVG Path
  const points = data.map(d => ({ x: xScale(d.day), y: yScale(d.healing) }));
  
  // Create beautiful cubic bezier curve strings
  let pathD = '';
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
  }

  // Path for gradient filling under the line
  const fillD = pathD ? `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z` : '';

  return (
    <div className={`p-4 bg-white dark:bg-slate-800/40 rounded-2xl border border-gray-100 dark:border-slate-800 ${isHC ? 'thick-border' : ''}`}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 className="font-bold text-sm text-gray-500 dark:text-gray-400">Healing Progression trend</h4>
          <span className="text-xl font-extrabold title-font">+4.8% / Day Avg</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-2 py-1 rounded-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Improving Rate
        </div>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          {/* Gradients */}
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a56db" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#1a56db" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((val) => (
            <g key={val} className="opacity-10 dark:opacity-5">
              <line 
                x1={paddingX} 
                y1={yScale(val)} 
                x2={width - paddingX} 
                y2={yScale(val)} 
                stroke="currentColor" 
                strokeWidth="1"
              />
              <text 
                x={paddingX - 10} 
                y={yScale(val) + 4} 
                textAnchor="end" 
                fontSize="10" 
                fontWeight="bold"
                fill="currentColor"
              >
                {val}%
              </text>
            </g>
          ))}

          {/* X Axis Labels */}
          {data.map((d) => (
            <text
              key={d.day}
              x={xScale(d.day)}
              y={height - 8}
              textAnchor="middle"
              fontSize="10"
              fontWeight="bold"
              className="fill-gray-400 dark:fill-gray-500"
            >
              {d.label}
            </text>
          ))}

          {/* Shaded Area */}
          {fillD && (
            <path d={fillD} fill="url(#chartGradient)" />
          )}

          {/* Smooth Line */}
          {pathD && (
            <path 
              d={pathD} 
              fill="none" 
              stroke={isHC ? '#0000ff' : '#1a56db'} 
              strokeWidth={isHC ? '4' : '3'} 
              strokeLinecap="round"
            />
          )}

          {/* Interactive dots */}
          {data.map((d, index) => {
            const x = xScale(d.day);
            const y = yScale(d.healing);
            const isHovered = hoveredPoint === index;

            return (
              <g 
                key={d.day}
                onMouseEnter={() => setHoveredPoint(index)}
                onMouseLeave={() => setHoveredPoint(null)}
                className="cursor-pointer"
              >
                {/* Glow ring */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 12 : 8}
                  fill={isHC ? '#0000ff' : '#1a56db'}
                  fillOpacity={isHovered ? 0.3 : 0.15}
                  className="transition-all duration-200"
                />
                {/* Main dot */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : 4}
                  fill={isHC ? '#0000ff' : '#1a56db'}
                  stroke="white"
                  strokeWidth="2"
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint !== null && (
          <div 
            className="absolute bg-slate-900 text-white p-2.5 rounded-xl text-xs card-shadow pointer-events-none transition-all duration-150 border border-slate-800"
            style={{
              left: `${xScale(data[hoveredPoint].day) / width * 100}%`,
              top: `${yScale(data[hoveredPoint].healing) / height * 100 - 32}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="font-bold">{data[hoveredPoint].label}: {data[hoveredPoint].healing}% Healed</div>
            <div className="text-[10px] text-gray-400 mt-0.5">{data[hoveredPoint].desc}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InteractiveChart;
