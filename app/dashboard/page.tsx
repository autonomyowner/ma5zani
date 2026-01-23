import Sidebar from '@/components/dashboard/Sidebar'
import StatsCards from '@/components/dashboard/StatsCards'
import OrdersTable from '@/components/dashboard/OrdersTable'
import ProductsList from '@/components/dashboard/ProductsList'
import { mockStats, mockOrders, mockProducts } from '@/lib/mock-data'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <div>
            <h1
              className="text-2xl font-bold text-[#0054A6]"
              style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
            >
              Dashboard
            </h1>
            <p className="text-slate-500 text-sm">Welcome back, Ahmed</p>
          </div>

          <div className="flex items-center gap-4">
            <span className="px-4 py-2 bg-[#22B14C]/10 text-[#22B14C] rounded-lg text-sm font-medium">
              Plus Plan Active
            </span>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 space-y-8">
          {/* Stats */}
          <StatsCards stats={mockStats} />

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-4">
            <button className="p-4 bg-white rounded-xl border-2 border-dashed border-slate-200 hover:border-[#0054A6] hover:bg-[#0054A6]/5 transition-all text-left">
              <span
                className="text-lg font-bold text-[#0054A6] block"
                style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
              >
                + Add Product
              </span>
              <span className="text-sm text-slate-500">Upload new inventory</span>
            </button>
            <button className="p-4 bg-white rounded-xl border-2 border-dashed border-slate-200 hover:border-[#F7941D] hover:bg-[#F7941D]/5 transition-all text-left">
              <span
                className="text-lg font-bold text-[#F7941D] block"
                style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
              >
                + Create Order
              </span>
              <span className="text-sm text-slate-500">Manual order entry</span>
            </button>
            <button className="p-4 bg-white rounded-xl border-2 border-dashed border-slate-200 hover:border-[#00AEEF] hover:bg-[#00AEEF]/5 transition-all text-left">
              <span
                className="text-lg font-bold text-[#00AEEF] block"
                style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
              >
                View Analytics
              </span>
              <span className="text-sm text-slate-500">Sales & performance</span>
            </button>
          </div>

          {/* Orders Table */}
          <OrdersTable orders={mockOrders} />

          {/* Products List */}
          <ProductsList products={mockProducts} />
        </div>
      </main>
    </div>
  )
}
