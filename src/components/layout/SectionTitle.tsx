import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
export function SectionTitle({icon:Icon,children,tone='mint'}:{icon:LucideIcon;children:ReactNode;tone?:'mint'|'lavender'|'yellow'}) {
  return <h2 className="section-title"><span className={`section-symbol ${tone}`} aria-hidden="true"><Icon size={20} strokeWidth={1.8}/></span><span>{children}</span></h2>
}
