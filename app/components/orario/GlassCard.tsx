import { HTMLAttributes } from 'react';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  tintColor?: string;
}

export function GlassCard({
  children,
  tintColor,
  className = '',
  ...props
}: GlassCardProps) {
  return (
    <div
      className={`card-glass rounded-2xl transition-all duration-300 ${className}`}
      style={tintColor ? { backgroundColor: tintColor } : undefined}
      {...props}
    >
      {children}
    </div>
  );
}
