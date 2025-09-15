import { cn } from '@/utils/cn';

export function LivingBorder({
  children,
  className,
  offset = 10,
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { offset?: number }) {
  return (
    <div className={cn('relative flex overflow-hidden rounded-md p-[2px]', className)}>
      <div className='relative z-10 w-full'>{children}</div>
      <div
        style={{
          bottom: `-${offset}px`,
          left: `-${offset}px`,
          right: `-${offset}px`,
          top: `-${offset}px`,
        }}
        className='absolute m-auto aspect-square animate-spin-slow rounded-full bg-gradient-to-r from-[#4ade80] via-[#22d3ee] to-[#0a1f1b]'
      />
    </div>
  );
}
