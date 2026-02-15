'use client'

import Card from '@/components/ui/Card'
import { useLanguage } from '@/lib/LanguageContext'

interface DashboardStats {
  ordersToday: number
  pendingOrders: number
  monthlyRevenue: number
  totalProducts: number
}

interface StatsCardsProps {
  stats: DashboardStats
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const { t } = useLanguage()

  const cards = [
    {
      label: t.dashboard.ordersToday,
      value: stats.ordersToday.toString(),
      color: 'bg-[#0054A6]',
      textColor: 'text-[#0054A6]',
    },
    {
      label: t.dashboard.pendingOrders,
      value: stats.pendingOrders.toString(),
      color: 'bg-[#F7941D]',
      textColor: 'text-[#F7941D]',
    },
    {
      label: t.dashboard.monthlyRevenue,
      value: stats.monthlyRevenue.toLocaleString(),
      suffix: t.dashboard.dzd,
      color: 'bg-[#22B14C]',
      textColor: 'text-[#22B14C]',
    },
    {
      label: t.dashboard.totalProducts,
      value: stats.totalProducts.toString(),
      color: 'bg-[#00AEEF]',
      textColor: 'text-slate-900',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {cards.map((card, index) => (
        <Card key={index} variant="bordered" className="relative overflow-hidden">
          <div className={`absolute top-0 left-0 right-0 h-1 ${card.color}`} />
          <p className="text-xs sm:text-sm text-slate-500 mb-1">{card.label}</p>
          <p
            className={`text-2xl sm:text-3xl font-bold ${card.textColor}`}
            style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
          >
            {card.value}
          </p>
          {card.suffix && (
            <p className="text-xs sm:text-sm text-slate-500">{card.suffix}</p>
          )}
        </Card>
      ))}
    </div>
  )
}
