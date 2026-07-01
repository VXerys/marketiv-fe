export interface DerivedBudgetValues {
  platformFee: number;
  totalPayment: number;
  estimatedViews: number;
  budgetPerCreator: number;
  viewsPerCreator: number;
}

export function getDerivedBudgetValues(
  pricePerThousandViews: number,
  totalBudgetEscrow: number,
  creatorQuota: number
): DerivedBudgetValues {
  const platformFee = Math.round(totalBudgetEscrow * 0.15);
  const totalPayment = totalBudgetEscrow + platformFee;
  
  const estimatedViews = pricePerThousandViews > 0 
    ? Math.round((totalBudgetEscrow / pricePerThousandViews) * 1000) 
    : 0;

  const budgetPerCreator = creatorQuota > 0 
    ? Math.round(totalBudgetEscrow / creatorQuota) 
    : 0;

  const viewsPerCreator = creatorQuota > 0 
    ? Math.round(estimatedViews / creatorQuota) 
    : 0;

  return {
    platformFee,
    totalPayment,
    estimatedViews,
    budgetPerCreator,
    viewsPerCreator,
  };
}
