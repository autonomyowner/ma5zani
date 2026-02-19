import { Id } from '@/convex/_generated/dataModel'
import { Language } from '@/lib/translations'

export interface V3TemplateProps {
  page: {
    pageId: string
    content: {
      headline: string
      subheadline: string
      featureBullets: Array<{ title: string; description: string }>
      ctaText: string
      urgencyText?: string
      productDescription: string
      socialProof?: string
      guaranteeText?: string
      secondaryCta?: string
      scarcityText?: string
      microCopy?: { delivery: string; payment: string; returns: string }
    }
    design: {
      primaryColor: string
      accentColor: string
      backgroundColor: string
      textColor: string
      gradientFrom?: string
      gradientTo?: string
      contrastValidated?: boolean
      isDarkTheme?: boolean
    }
    templateVersion?: number
    templateType?: string
    enhancedImageKeys?: string[]
    sceneImageKeys?: string[]
  }
  product: {
    _id: Id<'products'>
    name: string
    price: number
    salePrice?: number
    imageKeys: string[]
    sizes: string[]
    colors: string[]
    stock: number
    status: string
  }
  storefront: {
    _id: Id<'storefronts'>
    slug: string
    boutiqueName: string
    sellerId: Id<'sellers'>
    metaPixelId?: string
  }
  language: Language
  isRTL: boolean
}
