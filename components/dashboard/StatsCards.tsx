'use client'

import Card from '@/components/ui/Card'
import { DashboardStats } from '@/lib/mock-data'

interface StatsCardsProps {
  stats: DashboardStats
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: 'Orders Today',
      value: stats.ordersToday.toString(),
      change: '+12%',
      positive: true,
    },
    {
      label: 'Pending Orders',
      value: stats.pendingOrders.toString(),
      change: '5 urgent',
      positive: false,
    },
    {
      label: 'Monthly Revenue',
      value: `${stats.monthlyRevenue.toLocaleString()} DZD`,
      change: '+23%',
      positive: true,
    },
    {
      label: 'Total Products',
      value: stats.totalProducts.toString(),
      change: '2 low stock',
      positive: false,
    },
  ]

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <Card key={index} variant="bordered" className="relative overflow-hidden">
          {/* Accent bar */}
          <div className={`absolute top-0 left-0 right-0 h-1 ${
            index === 0 ? 'bg-[#0054A6]' :
            index === 1 ? 'bg-[#F7941D]' :
            index === 2 ? 'bg-[#22B14C]' :
            'bg-[#00AEEF]'
          }`} />

          <p className="text-sm text-slate-500 mb-1">{card.label}</p>
          <p
            className="text-3xl font-bold text-slate-900"
            style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
          >
            {card.value}
          </p>
          <p className={`text-sm mt-2 ${card.positive ? 'text-[#22B14C]' : 'text-[#F7941D]'}`}>
            {card.change}
          </p>
        </Card>
      ))}
    </div>
  )
}
