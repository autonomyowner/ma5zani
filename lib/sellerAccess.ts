export function sellerHasAccess(seller: { isActivated?: boolean; trialEndsAt?: number }): boolean {
  if (seller.isActivated) return true
  if (seller.trialEndsAt && seller.trialEndsAt > Date.now()) return true
  return false
}

export function getTrialDaysLeft(seller: { trialEndsAt?: number }): number {
  if (!seller.trialEndsAt) return 0
  const ms = seller.trialEndsAt - Date.now()
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)))
}

export function isTrialActive(seller: { isActivated?: boolean; trialEndsAt?: number }): boolean {
  return !seller.isActivated && !!seller.trialEndsAt && seller.trialEndsAt > Date.now()
}
