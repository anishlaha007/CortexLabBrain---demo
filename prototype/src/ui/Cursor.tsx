// A teammate's live cursor: coloured arrow plus a name tag, Figma style.
export function Cursor({ color, name, onColor }: { color: string; name: string; onColor: string }) {
  return (
    <div className="cursor">
      <svg width="18" height="20" viewBox="0 0 18 20" aria-hidden="true">
        <path d="M2 1.5 15.5 9.2l-6 1.4-3 6.4Z" fill={color} stroke="rgba(0,0,0,0.25)" strokeWidth="1" strokeLinejoin="round" />
      </svg>
      <span className="cursor__tag" style={{ background: color, color: onColor }}>{name}</span>
    </div>
  )
}
