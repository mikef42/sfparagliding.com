import { HeroBlock } from './HeroBlock'
import { RichTextBlock } from './RichTextBlock'
import { FeaturedProductsBlock } from './FeaturedProductsBlock'
import { FeaturedServicesBlock } from './FeaturedServicesBlock'
import { ImageTextBlock } from './ImageTextBlock'
import { TestimonialsBlock } from './TestimonialsBlock'
import { CTABannerBlock } from './CTABannerBlock'
import { FAQAccordionBlock } from './FAQAccordionBlock'
import { GalleryBlock } from './GalleryBlock'
import { SpacerBlock } from './SpacerBlock'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const blockComponents: Record<string, React.ComponentType<{ block: any }>> = {
  hero: HeroBlock,
  richText: RichTextBlock,
  featuredProducts: FeaturedProductsBlock,
  featuredServices: FeaturedServicesBlock,
  imageText: ImageTextBlock,
  testimonials: TestimonialsBlock,
  ctaBanner: CTABannerBlock,
  faqAccordion: FAQAccordionBlock,
  gallery: GalleryBlock,
  spacer: SpacerBlock,
}

interface RenderBlocksProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  blocks: any[]
}

export function RenderBlocks({ blocks }: RenderBlocksProps) {
  if (!blocks || blocks.length === 0) return null

  return (
    <>
      {blocks.map((block, i) => {
        const Component = blockComponents[block.blockType]
        if (!Component) return null
        return <Component key={block.id || i} block={block} />
      })}
    </>
  )
}
