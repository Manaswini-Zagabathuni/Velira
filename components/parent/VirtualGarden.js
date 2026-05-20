'use client';

export default function VirtualGarden({ completedTasks = 0, totalTasks = 0 }) {
  const progress = totalTasks > 0 ? completedTasks / totalTasks : 0;

  const getPlantStage = () => {
    if (progress === 0) return 'seed';
    if (progress < 0.3) return 'sprout';
    if (progress < 0.6) return 'growing';
    if (progress < 1) return 'blooming';
    return 'flourishing';
  };

  const stage = getPlantStage();

  const messages = {
    seed: "Complete your first task to start growing! 🌱",
    sprout: "You're growing! Keep it up! 🌿",
    growing: "Doing great! Your plant is thriving 🌾",
    blooming: "Almost there! Beautiful blooms ahead 🌸",
    flourishing: "You did it! Your garden is in full bloom! 🌺",
  };

  return (
    <div className="velira-card text-center">
      <h2 className="font-display text-xl text-velira-900 mb-1">Your Garden</h2>
      <p className="font-body text-xs text-gray-400 mb-4">{messages[stage]}</p>

      {/* Garden SVG */}
      <div className="flex items-end justify-center gap-3 h-28 mb-3">
        {/* Ground */}
        <svg viewBox="0 0 200 120" className="w-full max-w-[220px]">
          {/* Sky */}
          <rect width="200" height="120" fill="#f0faf5" rx="12" />

          {/* Ground */}
          <ellipse cx="100" cy="110" rx="80" ry="12" fill="#b4e6ce" />

          {/* Seed */}
          {stage === 'seed' && (
            <ellipse cx="100" cy="108" rx="6" ry="4" fill="#8a6228" className="animate-pulse-soft" />
          )}

          {/* Sprout */}
          {stage === 'sprout' && (
            <g className="sway">
              <line x1="100" y1="108" x2="100" y2="90" stroke="#2a9669" strokeWidth="2.5" strokeLinecap="round" />
              <ellipse cx="94" cy="92" rx="6" ry="4" fill="#4db587" transform="rotate(-30 94 92)" />
              <ellipse cx="106" cy="92" rx="6" ry="4" fill="#4db587" transform="rotate(30 106 92)" />
            </g>
          )}

          {/* Growing */}
          {stage === 'growing' && (
            <g className="sway">
              <line x1="100" y1="108" x2="100" y2="72" stroke="#2a9669" strokeWidth="3" strokeLinecap="round" />
              <ellipse cx="88" cy="80" rx="10" ry="7" fill="#4db587" transform="rotate(-20 88 80)" />
              <ellipse cx="112" cy="80" rx="10" ry="7" fill="#4db587" transform="rotate(20 112 80)" />
              <ellipse cx="100" cy="72" rx="8" ry="6" fill="#82d1ad" />
            </g>
          )}

          {/* Blooming */}
          {stage === 'blooming' && (
            <g className="sway">
              <line x1="100" y1="108" x2="100" y2="65" stroke="#2a9669" strokeWidth="3" strokeLinecap="round" />
              <ellipse cx="84" cy="78" rx="12" ry="8" fill="#4db587" transform="rotate(-25 84 78)" />
              <ellipse cx="116" cy="78" rx="12" ry="8" fill="#4db587" transform="rotate(25 116 78)" />
              {/* Flower */}
              {[0,60,120,180,240,300].map((angle, i) => (
                <ellipse key={i} cx={100 + 10 * Math.cos(angle * Math.PI / 180)} cy={65 + 10 * Math.sin(angle * Math.PI / 180)}
                  rx="5" ry="8" fill="#f9a8d4"
                  transform={`rotate(${angle} ${100 + 10 * Math.cos(angle * Math.PI / 180)} ${65 + 10 * Math.sin(angle * Math.PI / 180)})`} />
              ))}
              <circle cx="100" cy="65" r="7" fill="#fde68a" />
            </g>
          )}

          {/* Flourishing */}
          {stage === 'flourishing' && (
            <g className="sway">
              <line x1="100" y1="108" x2="100" y2="58" stroke="#2a9669" strokeWidth="3.5" strokeLinecap="round" />
              <ellipse cx="80" cy="75" rx="14" ry="9" fill="#4db587" transform="rotate(-30 80 75)" />
              <ellipse cx="120" cy="75" rx="14" ry="9" fill="#4db587" transform="rotate(30 120 75)" />
              <ellipse cx="90" cy="65" rx="10" ry="7" fill="#82d1ad" transform="rotate(-15 90 65)" />
              <ellipse cx="110" cy="65" rx="10" ry="7" fill="#82d1ad" transform="rotate(15 110 65)" />
              {/* Big flower */}
              {[0,45,90,135,180,225,270,315].map((angle, i) => (
                <ellipse key={i} cx={100 + 11 * Math.cos(angle * Math.PI / 180)} cy={58 + 11 * Math.sin(angle * Math.PI / 180)}
                  rx="5" ry="9" fill="#f9a8d4"
                  transform={`rotate(${angle} ${100 + 11 * Math.cos(angle * Math.PI / 180)} ${58 + 11 * Math.sin(angle * Math.PI / 180)})`} />
              ))}
              <circle cx="100" cy="58" r="8" fill="#fde68a" />
              {/* Stars */}
              <text x="30" y="35" fontSize="12" className="animate-float">✨</text>
              <text x="155" y="40" fontSize="10" className="animate-float">🌟</text>
            </g>
          )}
        </svg>
      </div>

      {/* Progress bar */}
      <div className="bg-velira-100 rounded-full h-2 mb-2">
        <div className="bg-velira-500 h-2 rounded-full transition-all duration-700"
          style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
      <p className="font-body text-xs text-gray-400">
        {completedTasks} of {totalTasks} tasks · <span className="text-velira-600 font-medium">{stage}</span>
      </p>
    </div>
  );
}

