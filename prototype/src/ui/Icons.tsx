// Inline stroke icons, drawn to one 16px grid so they share weight with the type.

export type IconName =
  | 'search' | 'bell' | 'plus' | 'minus' | 'fit' | 'file' | 'branch' | 'merge' | 'pull'
  | 'close' | 'thumbUp' | 'thumbDown' | 'eye' | 'export' | 'more' | 'send' | 'sparkle'
  | 'github' | 'drive' | 'onedrive' | 'labpc' | 'paper' | 'robot' | 'web' | 'chat'
  | 'check' | 'compass' | 'sun' | 'moon' | 'coffee' | 'arrowLeft'

const P: Record<IconName, React.ReactNode> = {
  search: <><circle cx="7" cy="7" r="4.5" /><path d="m10.5 10.5 3 3" /></>,
  bell: <><path d="M4 11V7.5a4 4 0 0 1 8 0V11l1 1.5H3Z" /><path d="M6.5 14a1.6 1.6 0 0 0 3 0" /></>,
  plus: <path d="M8 3v10M3 8h10" />,
  minus: <path d="M3 8h10" />,
  fit: <path d="M3 6V3h3M10 3h3v3M13 10v3h-3M6 13H3v-3" />,
  file: <><path d="M4 2.5h5l3 3v8H4Z" /><path d="M9 2.5v3h3" /></>,
  branch: <><circle cx="4.5" cy="3.5" r="1.5" /><circle cx="4.5" cy="12.5" r="1.5" /><circle cx="11.5" cy="5.5" r="1.5" /><path d="M4.5 5v6M11.5 7c0 3-7 2-7 4" /></>,
  merge: <><circle cx="4.5" cy="3.5" r="1.5" /><circle cx="11.5" cy="12.5" r="1.5" /><circle cx="11.5" cy="3.5" r="1.5" /><path d="M11.5 5v6M4.5 5c0 4 7 3 7 6" /></>,
  pull: <><path d="M2.5 8h7" /><path d="m7 5 3 3-3 3" /><path d="M12.5 3v10" /></>,
  close: <path d="m4 4 8 8M12 4l-8 8" />,
  thumbUp: <><path d="M5 7v6.5H3V7Z" /><path d="M5 7l2.5-4.5c1 0 1.7.8 1.5 1.8L8.6 6.5H12a1.2 1.2 0 0 1 1.2 1.4l-.8 4.4a1.4 1.4 0 0 1-1.4 1.2H5" /></>,
  thumbDown: <><path d="M5 9V2.5H3V9Z" /><path d="M5 9l2.5 4.5c1 0 1.7-.8 1.5-1.8L8.6 9.5H12a1.2 1.2 0 0 0 1.2-1.4l-.8-4.4A1.4 1.4 0 0 0 11 2.5H5" /></>,
  eye: <><path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8Z" /><circle cx="8" cy="8" r="2" /></>,
  export: <><path d="M8 2.5v8" /><path d="m5 5.5 3-3 3 3" /><path d="M3 10v3.5h10V10" /></>,
  more: <><circle cx="3.5" cy="8" r=".9" /><circle cx="8" cy="8" r=".9" /><circle cx="12.5" cy="8" r=".9" /></>,
  send: <><path d="M2.5 8h9" /><path d="m8 4 4 4-4 4" /></>,
  sparkle: <path d="M8 2v3M8 11v3M2 8h3M11 8h3M4 4l1.8 1.8M10.2 10.2 12 12M12 4l-1.8 1.8M5.8 10.2 4 12" />,
  github: <path d="M8 1.8a6.2 6.2 0 0 0-2 12.1c.3 0 .4-.1.4-.3v-1.1c-1.7.4-2.1-.8-2.1-.8-.3-.7-.7-.9-.7-.9-.6-.4 0-.4 0-.4.6 0 1 .7 1 .7.6 1 1.5.7 1.9.5 0-.4.2-.7.4-.9-1.4-.1-2.8-.7-2.8-3 0-.7.2-1.2.6-1.6 0-.2-.3-.8.1-1.6 0 0 .5-.2 1.7.6a5.8 5.8 0 0 1 3 0c1.2-.8 1.7-.6 1.7-.6.3.8.1 1.4.1 1.6.4.4.6 1 .6 1.6 0 2.3-1.4 2.9-2.8 3 .2.2.4.6.4 1.2v1.7c0 .2.1.4.4.3A6.2 6.2 0 0 0 8 1.8Z" />,
  drive: <><path d="M5.6 2.5h4.8l4.1 7.2-2.4 4H3.9l-2.4-4Z" /><path d="m5.6 2.5 4.1 7.2h4.8M10.4 2.5 6.3 9.7l-2.4 4M1.5 9.7h8.2" /></>,
  onedrive: <path d="M4.2 12.5h8.3a2.5 2.5 0 0 0 .2-5 3.6 3.6 0 0 0-6.6-1.3 2.7 2.7 0 0 0-1.9 6.3Z" />,
  labpc: <><rect x="2" y="3" width="12" height="8" rx="1" /><path d="M6 13.5h4M8 11v2.5" /></>,
  paper: <><path d="M4 2.5h8v11H4Z" /><path d="M6 5.5h4M6 8h4M6 10.5h2.5" /></>,
  robot: <><rect x="3" y="5" width="10" height="7.5" rx="2" /><path d="M8 5V2.8" /><circle cx="8" cy="2.4" r=".6" /><circle cx="6" cy="8.5" r=".8" /><circle cx="10" cy="8.5" r=".8" /></>,
  web: <><circle cx="8" cy="8" r="6" /><path d="M2 8h12M8 2c1.8 2 1.8 10 0 12M8 2c-1.8 2-1.8 10 0 12" /></>,
  chat: <path d="M2.5 3.5h11v7.5H7l-3 2.5v-2.5H2.5Z" />,
  check: <path d="m3 8.5 3 3 7-7" />,
  compass: <><circle cx="8" cy="8" r="6" /><path d="m10.5 5.5-1.5 3.5-3.5 1.5 1.5-3.5Z" /></>,
  sun: <><circle cx="8" cy="8" r="2.8" /><path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M12.6 3.4l-1 1M4.4 11.6l-1 1" /></>,
  moon: <path d="M13 9.5A5.5 5.5 0 0 1 6.5 3a5.5 5.5 0 1 0 6.5 6.5Z" />,
  coffee: <><path d="M3 6h8v4a3.5 3.5 0 0 1-3.5 3.5h-1A3.5 3.5 0 0 1 3 10Z" /><path d="M11 7h1a1.8 1.8 0 0 1 0 3.6h-1" /><path d="M6 2.5c-.5.7.5 1.3 0 2M8.5 2.5c-.5.7.5 1.3 0 2" /></>,
  arrowLeft: <><path d="M13 8H3" /><path d="m7 4-4 4 4 4" /></>,
}

export function Icon({ name, size = 16, className }: { name: IconName; size?: number; className?: string }) {
  const filled = name === 'github'
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={1.35}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {P[name]}
    </svg>
  )
}
