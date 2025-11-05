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
      className={`backdrop-blur-md bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-2xl shadow-lg transition-all duration-300 ${className}`}
      style={tintColor ? { backgroundColor: tintColor } : undefined}
      {...props}
    >
      {children}
    </div>
  );
}
