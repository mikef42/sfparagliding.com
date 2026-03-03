import { cn } from '@/lib/utils'

interface SpacerBlockProps {
  block: {
    height: 'small' | 'medium' | 'large'
  }
}

export function SpacerBlock({ block }: SpacerBlockProps) {
  return (
    <div
      className={cn(
        block.height === 'small' && 'h-8 lg:h-12',
        block.height === 'medium' && 'h-16 lg:h-24',
        block.height === 'large' && 'h-24 lg:h-40',
      )}
      aria-hidden="true"
    />
  )
}
