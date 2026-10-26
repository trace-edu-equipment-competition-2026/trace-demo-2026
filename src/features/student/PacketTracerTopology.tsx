import { networkTopologySpecs } from '@/domain/simulationEngine'

function CiscoRouterSvg({ x, y, label, selected }: { x: number; y: number; label: string; selected?: boolean }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      {selected && (
        <rect
          x="-48"
          y="-34"
          width="96"
          height="68"
          rx="12"
          fill="#e7f6f2"
          stroke="#2b6f60"
          strokeWidth="2.5"
          strokeDasharray="4 2"
        />
      )}
      <ellipse cx="0" cy="14" rx="36" ry="13" fill="#1b3a4b" opacity="0.22" />
      <path d="M -34 -4 L -34 11 A 34 12 0 0 0 34 11 L 34 -4 Z" fill="url(#pt-router-body)" stroke="#234d63" strokeWidth="1.2" />
      <ellipse cx="0" cy="-4" rx="34" ry="12" fill="url(#pt-router-top)" stroke="#234d63" strokeWidth="1.2" />
      {/* Cisco Router 4 directional white arrows on top */}
      <g stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Left-top inward arrow */}
        <path d="M -21 -8 L -6 -5 M -9 -8 L -5 -5 L -10 -3" />
        {/* Right-bottom inward arrow */}
        <path d="M 21 0 L 6 -3 M 9 0 L 5 -3 L 10 -5" />
        {/* Top-right outward arrow */}
        <path d="M 4 -7 L 19 -10 M 15 -11 L 20 -10 L 17 -7" />
        {/* Bottom-left outward arrow */}
        <path d="M -4 -1 L -19 2 M -15 3 L -20 2 L -17 -1" />
      </g>
      <text x="0" y="-22" textAnchor="middle" fill="#183e35" fontSize="13" fontWeight="700">
        {label}
      </text>
    </g>
  )
}

function CiscoSwitchSvg({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <polygon points="-34,-2 -18,-12 34,-12 18,-2" fill="url(#pt-router-top)" stroke="#234d63" strokeWidth="1.1" />
      <rect x="-34" y="-2" width="52" height="16" fill="url(#pt-router-body)" stroke="#234d63" strokeWidth="1.1" />
      <polygon points="18,-2 34,-12 34,4 18,14" fill="#234d63" stroke="#1b3a4b" strokeWidth="1.1" />
      {/* Switch top arrows */}
      <g stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round">
        <path d="M -16 -8 L 4 -8 M 1 -10 L 5 -8 L 1 -6" />
        <path d="M 12 -5 L -8 -5 M -5 -7 L -9 -5 L -5 -3" />
      </g>
      {/* Front switch ports */}
      {[-26, -18, -10, -2, 6].map(px => (
        <rect key={px} x={px} y="3" width="5" height="5" fill="#163240" rx="0.8" />
      ))}
      <text x="42" y="6" textAnchor="start" fill="#525d50" fontSize="11" fontWeight="600">
        {label}
      </text>
    </g>
  )
}

function CiscoPcSvg({ x, y, label, selected }: { x: number; y: number; label: string; selected?: boolean }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      {selected && (
        <rect
          x="-48"
          y="-34"
          width="96"
          height="74"
          rx="12"
          fill="#e7f6f2"
          stroke="#2b6f60"
          strokeWidth="2.5"
          strokeDasharray="4 2"
        />
      )}
      {/* Base desktop case */}
      <rect x="-26" y="4" width="44" height="11" rx="1.5" fill="#5b8aa0" stroke="#2c5569" strokeWidth="1.1" />
      <line x1="-20" y1="9.5" x2="2" y2="9.5" stroke="#2c5569" strokeWidth="1.2" />
      <circle cx="12" cy="9.5" r="1.5" fill="#00d400" />
      {/* Monitor frame */}
      <polygon points="-22,-24 14,-24 18,-20 18,4 -22,4" fill="#6d9eb5" stroke="#2c5569" strokeWidth="1.1" />
      <rect x="-18" y="-20" width="28" height="20" rx="1.5" fill="url(#pt-pc-screen)" stroke="#2c5569" strokeWidth="1" />
      {/* Keyboard */}
      <polygon points="-30,18 16,18 24,28 -24,28" fill="#8bb5c9" stroke="#2c5569" strokeWidth="1.1" />
      <line x1="-22" y1="22" x2="14" y2="22" stroke="#3c677a" strokeWidth="1" strokeDasharray="3 2" />
      <line x1="-19" y1="25" x2="17" y2="25" stroke="#3c677a" strokeWidth="1" strokeDasharray="3 2" />
      <text x="-4" y="-29" textAnchor="middle" fill="#183e35" fontSize="13" fontWeight="700">
        {label}
      </text>
    </g>
  )
}

export function PacketTracerTopology({
  target,
  onSelect,
  routeFixed = false,
  extended = false,
  extensionFixed = false,
  interactive = true,
}: {
  target?: string
  onSelect?: (id: string) => void
  routeFixed?: boolean
  extended?: boolean
  extensionFixed?: boolean
  interactive?: boolean
}) {
  return (
    <div className="network-topology pt-topology-container" aria-label="프로젝트 구성도">
      <div className="pt-canvas-wrap">
        <svg
          className="pt-topology-svg"
          viewBox="0 0 860 355"
          role="img"
          aria-label="Cisco Packet Tracer 스타일 본사-지사 정적 라우팅 토폴로지"
        >
          <defs>
            <linearGradient id="pt-router-body" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2f6680" />
              <stop offset="45%" stopColor="#77b1cc" />
              <stop offset="100%" stopColor="#26546b" />
            </linearGradient>
            <linearGradient id="pt-router-top" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#94cae0" />
              <stop offset="100%" stopColor="#4c88a3" />
            </linearGradient>
            <linearGradient id="pt-pc-screen" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d9f2fc" />
              <stop offset="100%" stopColor="#7abbd6" />
            </linearGradient>
          </defs>

          {/* Left & Right Site Grouping Boxes (Packet Tracer style) */}
          <rect x="115" y="56" width="160" height="148" fill="none" stroke="#68736d" strokeWidth="1.8" />
          <text x="195" y="45" textAnchor="middle" fill="#243b34" fontSize="13" fontWeight="700">
            본사 네트워크 (R1)
          </text>

          <rect x="585" y="56" width="160" height="148" fill="none" stroke="#68736d" strokeWidth="1.8" />
          <text x="665" y="45" textAnchor="middle" fill="#243b34" fontSize="13" fontWeight="700">
            지사 네트워크 (R2)
          </text>

          {/* Red Serial WAN Lightning Link between R1 and R2 */}
          <polyline
            points="195,96 418,44 434,76 665,96"
            fill="none"
            stroke="#e60000"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <text x="430" y="28" textAnchor="middle" fill="#8c1d18" fontSize="12" fontWeight="700">
            WAN 직렬 구간 · 10.0.0.0/30
          </text>

          {/* Black Straight-Through Ethernet Links (HQ) */}
          <line x1="195" y1="108" x2="195" y2="174" stroke="#111111" strokeWidth="3" />
          <line x1="195" y1="186" x2="195" y2="232" stroke="#111111" strokeWidth="3" />

          {/* Black Straight-Through Ethernet Links (Branch) */}
          <line x1="665" y1="108" x2="665" y2="174" stroke="#111111" strokeWidth="3" />
          <line x1="665" y1="186" x2="665" y2="232" stroke="#111111" strokeWidth="3" />

          {/* Optional Extended Scenario Link (R1 Gi0/1 -> PC-C 192.168.30.10/24) */}
          {extended && (
            <g>
              <line
                x1="195"
                y1="102"
                x2="355"
                y2="255"
                stroke="#111111"
                strokeWidth="2.5"
                strokeDasharray={extensionFixed ? undefined : '5 4'}
              />
              <circle
                cx="228"
                cy="132"
                r="6"
                fill={extensionFixed ? '#00d400' : '#e60000'}
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              <rect x="242" y="138" width="136" height="22" rx="4" fill="#f7fafc" stroke="#cbd5e1" />
              <text x="310" y="153" textAnchor="middle" fill="#1e293b" fontSize="11" fontWeight="600">
                Gi0/1: 192.168.30.1/24
              </text>
              <CiscoPcSvg x={365} y={272} label="PC-C" />
              <text x="365" y="320" textAnchor="middle" fill="#1e293b" fontSize="11" fontWeight="600">
                192.168.30.10/24
              </text>
            </g>
          )}

          {/* Link Status LEDs (Packet Tracer Green Circles) */}
          {/* WAN Serial Link LEDs */}
          <circle cx="242" cy="85" r="6.5" fill="#00d400" stroke="#ffffff" strokeWidth="1.5" />
          <circle
            cx="618"
            cy="88"
            r="6.5"
            fill={routeFixed ? '#00d400' : '#f59e0b'}
            stroke="#ffffff"
            strokeWidth="1.5"
          />

          {/* HQ LAN Link LEDs */}
          <circle cx="195" cy="136" r="5.5" fill="#00d400" stroke="#ffffff" strokeWidth="1.2" />
          <circle cx="195" cy="206" r="5.5" fill="#00d400" stroke="#ffffff" strokeWidth="1.2" />
          <circle cx="195" cy="228" r="5.5" fill="#00d400" stroke="#ffffff" strokeWidth="1.2" />

          {/* Branch LAN Link LEDs */}
          <circle cx="665" cy="136" r="5.5" fill="#00d400" stroke="#ffffff" strokeWidth="1.2" />
          <circle cx="665" cy="206" r="5.5" fill="#00d400" stroke="#ffffff" strokeWidth="1.2" />
          <circle cx="665" cy="228" r="5.5" fill="#00d400" stroke="#ffffff" strokeWidth="1.2" />

          {/* IP Address Labels (Packet Tracer style white/tinted badges) */}
          <g>
            <rect x="255" y="68" width="110" height="22" rx="4" fill="#f4f8fb" stroke="#d0dce5" />
            <text x="310" y="83" textAnchor="middle" fill="#111827" fontSize="12" fontWeight="600">
              10.0.0.1/30
            </text>

            <rect x="495" y="72" width="110" height="22" rx="4" fill="#f4f8fb" stroke="#d0dce5" />
            <text x="550" y="87" textAnchor="middle" fill="#111827" fontSize="12" fontWeight="600">
              10.0.0.2/30
            </text>

            <rect x="14" y="124" width="122" height="22" rx="4" fill="#f4f8fb" stroke="#d0dce5" />
            <text x="75" y="139" textAnchor="middle" fill="#111827" fontSize="12" fontWeight="600">
              192.168.10.1/24
            </text>

            <rect x="724" y="124" width="122" height="22" rx="4" fill="#f4f8fb" stroke="#d0dce5" />
            <text x="785" y="139" textAnchor="middle" fill="#111827" fontSize="12" fontWeight="600">
              192.168.20.1/24
            </text>
          </g>

          {/* Switches */}
          <CiscoSwitchSvg x={195} y={180} label="SW1" />
          <CiscoSwitchSvg x={665} y={180} label="SW2" />

          {/* Clickable Routers and PCs */}
          <g
            className={interactive ? 'pt-svg-node' : ''}
            onClick={() => interactive && onSelect?.('R1')}
          >
            <CiscoRouterSvg x={195} y={96} label="R1 (본사)" selected={target === 'R1'} />
          </g>
          <g
            className={interactive ? 'pt-svg-node' : ''}
            onClick={() => interactive && onSelect?.('R2')}
          >
            <CiscoRouterSvg x={665} y={96} label="R2 (지사)" selected={target === 'R2'} />
          </g>
          <g
            className={interactive ? 'pt-svg-node' : ''}
            onClick={() => interactive && onSelect?.('PC-A')}
          >
            <CiscoPcSvg x={195} y={272} label="PC-A" selected={target === 'PC-A'} />
          </g>
          <g
            className={interactive ? 'pt-svg-node' : ''}
            onClick={() => interactive && onSelect?.('PC-B')}
          >
            <CiscoPcSvg x={665} y={272} label="PC-B" selected={target === 'PC-B'} />
          </g>

          {/* Bottom Host IP & Default Gateway Labels */}
          <g>
            <rect x="115" y="308" width="160" height="40" rx="6" fill="#f4f8fb" stroke="#d0dce5" />
            <text x="195" y="324" textAnchor="middle" fill="#111827" fontSize="12" fontWeight="700">
              192.168.10.10/24
            </text>
            <text x="195" y="341" textAnchor="middle" fill="#4b5563" fontSize="11">
              게이트웨이 : 192.168.10.1
            </text>

            <rect x="585" y="308" width="160" height="40" rx="6" fill="#f4f8fb" stroke="#d0dce5" />
            <text x="665" y="324" textAnchor="middle" fill="#111827" fontSize="12" fontWeight="700">
              192.168.20.10/24
            </text>
            <text x="665" y="341" textAnchor="middle" fill="#4b5563" fontSize="11">
              게이트웨이 : 192.168.20.1
            </text>
          </g>
        </svg>
      </div>

      {interactive && (
        <div className="pt-device-selector" role="group" aria-label="장비 선택">
          {networkTopologySpecs.map(node => (
            <button
              type="button"
              key={node.id}
              className={`pt-device-btn ${target === node.id ? 'selected-node' : ''}`}
              aria-pressed={target === node.id}
              onClick={() => onSelect?.(node.id)}
            >
              <strong>
                {node.id} <small>({node.role})</small>
              </strong>
              <span>{node.ip}</span>
              <small>{node.detail}</small>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
