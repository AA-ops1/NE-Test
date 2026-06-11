import * as LucideIcons from 'lucide-react';

function pascalIcon(name) {
  return String(name).split(/[-_]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
}

export default function Icon({ name, className, size = 16 }) {
  if (!name) return null;
  const iconName = pascalIcon(name);
  const LucideIcon = LucideIcons[iconName];
  if (!LucideIcon) return null;
  return <LucideIcon size={size} className={className} aria-hidden="true" />;
}
