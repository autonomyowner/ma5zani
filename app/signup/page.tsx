'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'

const wilayas = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar',
  'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Algiers',
  'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
  'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
  'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
  'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
  'Ghardaïa', 'Relizane', 'El M\'Ghair', 'El Meniaa', 'Ouled Djellal', 'Bordj Badji Mokhtar',
  'Béni Abbès', 'Timimoun', 'Touggourt', 'Djanet', 'In Salah', 'In Guezzam'
]

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: '2,500',
    features: ['50 products', '1 warehouse', 'Standard delivery'],
  },
  {
    id: 'plus',
    name: 'Plus',
    price: '6,500',
    features: ['200 products', '3 warehouses', 'Express delivery'],
    popular: true,
  },
  {
    id: 'gros',
    name: 'Gros',
    price: '15,000',
    features: ['Unlimited products', 'All warehouses', 'Same-day delivery'],
  },
]

export default function SignupPage() {
  const [selectedPlan, setSelectedPlan] = useState('plus')
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-6 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#00AEEF]/5" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#F7941D]/5" />
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <Image
              src="/logo.png"
              alt="ma5zani"
              width={80}
              height={80}
              className="h-20 w-auto"
            />
            <span
              className="text-3xl font-bold text-[#0054A6]"
              style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
            >
              ma5zani
            </span>
          </Link>
        </div>

        <Card variant="elevated" className="shadow-xl">
          <div className="text-center mb-8">
            <h1
              className="text-2xl font-bold text-[#0054A6] mb-2"
              style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
            >
              Create Your Account
            </h1>
            <p className="text-slate-600">
              Start your 14-day free trial. No credit card required.
            </p>
          </div>

          <form className="space-y-8">
            {/* Personal Information */}
            <div>
              <h2
                className="text-lg font-semibold text-[#0054A6] mb-4"
                style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
              >
                1. Personal Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  id="fullName"
                  type="text"
                  label="Full Name"
                  placeholder="Ahmed Benali"
                />
                <Input
                  id="phone"
                  type="tel"
                  label="Phone Number"
                  placeholder="+213 555 123 456"
                />
                <Input
                  id="email"
                  type="email"
                  label="Email Address"
                  placeholder="you@example.com"
                />
                <Input
                  id="password"
                  type="password"
                  label="Password"
                  placeholder="Create a strong password"
                />
              </div>
            </div>

            {/* Business Address */}
            <div>
              <h2
                className="text-lg font-semibold text-[#0054A6] mb-4"
                style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
              >
                2. Business Address
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input
                    id="address"
                    type="text"
                    label="Street Address"
                    placeholder="123 Rue Didouche Mourad"
                  />
                </div>
                <div className="w-full">
                  <label
                    htmlFor="wilaya"
                    className="block text-sm font-medium text-slate-900 mb-2"
                    style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
                  >
                    Wilaya
                  </label>
                  <select
                    id="wilaya"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-900 transition-all duration-200 hover:border-slate-300 focus:border-[#00AEEF] focus:ring-0 focus:outline-none"
                  >
                    <option value="">Select your wilaya</option>
                    {wilayas.map((wilaya) => (
                      <option key={wilaya} value={wilaya}>{wilaya}</option>
                    ))}
                  </select>
                </div>
                <Input
                  id="postalCode"
                  type="text"
                  label="Postal Code"
                  placeholder="16000"
                />
              </div>
            </div>

            {/* Plan Selection */}
            <div>
              <h2
                className="text-lg font-semibold text-[#0054A6] mb-4"
                style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
              >
                3. Choose Your Plan
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                      selectedPlan === plan.id
                        ? 'border-[#0054A6] bg-[#0054A6]/5'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-2 right-2 bg-[#F7941D] text-white text-xs px-2 py-0.5 rounded-full font-medium">
                        Popular
                      </span>
                    )}
                    <h3
                      className="font-bold text-[#0054A6]"
                      style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
                    >
                      {plan.name}
                    </h3>
                    <p className="text-xl font-bold text-slate-900 mt-1">
                      {plan.price} <span className="text-sm font-normal text-slate-500">DZD/mo</span>
                    </p>
                    <ul className="mt-3 space-y-1">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="text-sm text-slate-600 flex items-center gap-2">
                          <span className="text-[#22B14C] font-bold">+</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-slate-300 text-[#0054A6] focus:ring-[#00AEEF]"
              />
              <label htmlFor="terms" className="text-sm text-slate-600">
                I agree to the{' '}
                <Link href="#" className="text-[#0054A6] hover:text-[#00AEEF]">Terms of Service</Link>
                {' '}and{' '}
                <Link href="#" className="text-[#0054A6] hover:text-[#00AEEF]">Privacy Policy</Link>
              </label>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full">
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600">
              Already have an account?{' '}
              <Link href="/login" className="text-[#0054A6] hover:text-[#00AEEF] font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </Card>

        <p className="mt-8 text-center text-sm text-slate-500">
          <Link href="/" className="hover:text-[#0054A6] transition-colors">
            Back to home
          </Link>
        </p>
      </div>
    </main>
  )
}
