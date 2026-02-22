'use client'

export default function Stats() {
  const logos = [
    { src: '/logos/yalidine.png', alt: 'Yalidine Express' },
    { src: '/logos/algerie-poste.svg', alt: 'Algérie Poste' },
    { src: '/logos/satim.png', alt: 'SATIM CIB' },
    { src: '/logos/algerie-telecom.png', alt: 'Algérie Télécom' },
    { src: '/logos/telegram.svg', alt: 'Telegram' },
    { src: '/logos/meta.svg', alt: 'Meta' },
    { src: '/logos/cloudflare.svg', alt: 'Cloudflare' },
    { src: '/logos/anthropic.svg', alt: 'Anthropic AI' },
  ]

  return (
    <section className="py-4 md:py-8 bg-white border-y border-slate-100">
      <div className="max-w-5xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-4 md:flex md:items-center md:justify-center gap-x-6 gap-y-3 md:gap-16">
          {logos.map((logo) => (
            <img
              key={logo.alt}
              src={logo.src}
              alt={logo.alt}
              className="h-6 md:h-10 mx-auto object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
              style={{ mixBlendMode: 'multiply' }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
