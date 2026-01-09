export function cartTransformRun(input) {
  const operations = []

  for (const line of input.cart.lines) {
    const tieredRaw = line.merchandise?.tieredPricing?.value
    if (!tieredRaw) continue

    const qty = line.quantity
    const basePrice = parseFloat(line.cost?.amountPerQuantity?.amount || '0')
    if (!basePrice || qty <= 0) continue

    const tiers = tieredRaw
      .split(',')
      .map(pair => {
        const [q, p] = pair.split(':')
        const quantity = Number(q?.trim())
        const price = Number(p?.replace('$', '').trim())
        return Number.isFinite(quantity) && Number.isFinite(price)
          ? { quantity, price }
          : null
      })
      .filter(Boolean)
      .sort((a, b) => b.quantity - a.quantity)

    const matchedTier = tiers.find(tier => qty >= tier.quantity)
    if (!matchedTier) continue

    if (matchedTier.price < basePrice) {
      operations.push({
        lineUpdate: {
          cartLineId: line.id,
          price: {
            adjustment: {
              fixedPricePerUnit: {
                amount: matchedTier.price.toFixed(2)
              }
            }
          }
        }
      })
    }
  }

  return { operations }
}
