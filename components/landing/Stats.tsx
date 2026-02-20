'use client'

export default function Stats() {
  const logos = [
    { src: '/logos/yalidine.png', alt: 'Yalidine Express' },
    { src: '/logos/algerie-poste.svg', alt: 'Algérie Poste' },
    { src: '/logos/satim.png', alt: 'SATIM CIB' },
    { src: '/logos/algerie-telecom.png', alt: 'Algérie Télécom' },
  ]

  return (
    <section className="py-8 bg-white border-y border-slate-100">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-center gap-10 md:gap-16 flex-wrap">
          {logos.map((logo) => (
            <img
              key={logo.alt}
              src={logo.src}
              alt={logo.alt}
              className="h-8 md:h-10 object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
              style={{ mixBlendMode: 'multiply' }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
