const BASE_URL = "http://127.0.0.1:8000/api"

// Generic fetch wrapper with error handling
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// Expense types
export interface Expense {
  id: string
  amount: number
  category: string
  date: string
  notes?: string
}

// Subscription types
export interface Subscription {
  id: string
  name: string
  cost: number
  billingCycle: "monthly" | "yearly"
  category: string
  isActive: boolean
  lastUsed?: string
  cancelSuggested?: boolean
}

// Tax section types
export interface TaxSection {
  section: string
  name: string
  maxLimit: number
  invested: number
  expenses: { name: string; amount: number }[]
}

// Insight types
export interface SpendingInsight {
  type: "warning" | "tip" | "achievement"
  title: string
  description: string
  actionLabel?: string
}

// Habit types
export interface Challenge {
  id: string
  title: string
  description: string
  progress: number
  target: number
  streak: number
  completed: boolean
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earned: boolean
  earnedDate?: string
}

// API functions
export const api = {
  // Dashboard
  getDashboardData: () => fetchApi<{
    healthScore: number
    totalSpending: number
    totalSavings: number
    subscriptionCost: number
    spendingByCategory: { name: string; value: number; color: string }[]
    monthlyTrend: { month: string; spending: number; savings: number }[]
    insights: SpendingInsight[]
  }>("/dashboard"),

  // Expenses
  getExpenses: (filters?: { category?: string; startDate?: string; endDate?: string }) => {
    const params = new URLSearchParams()
    if (filters?.category) params.append("category", filters.category)
    if (filters?.startDate) params.append("startDate", filters.startDate)
    if (filters?.endDate) params.append("endDate", filters.endDate)
    const query = params.toString() ? `?${params.toString()}` : ""
    return fetchApi<Expense[]>(`/expenses${query}`)
  },

  createExpense: (expense: Omit<Expense, "id">) =>
    fetchApi<Expense>("/expenses", {
      method: "POST",
      body: JSON.stringify(expense),
    }),

  updateExpense: (id: string, expense: Partial<Expense>) =>
    fetchApi<Expense>(`/expenses/${id}`, {
      method: "PUT",
      body: JSON.stringify(expense),
    }),

  deleteExpense: (id: string) =>
    fetchApi<void>(`/expenses/${id}`, { method: "DELETE" }),

  // Subscriptions
  getSubscriptions: () => fetchApi<Subscription[]>("/subscriptions"),

  updateSubscription: (id: string, data: Partial<Subscription>) =>
    fetchApi<Subscription>(`/subscriptions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Tax
  getTaxData: () => fetchApi<{
    sections: TaxSection[]
    totalSavings: number
    oldRegimeTax: number
    newRegimeTax: number
  }>("/tax"),

  // Insights
  getInsights: () => fetchApi<{
    weeklySpending: { day: string; amount: number }[]
    categoryTrends: { category: string; trend: number; amount: number }[]
    userType: "saver" | "impulsive" | "balanced"
    score: number
  }>("/insights"),

  // Habits
  getHabits: () => fetchApi<{
    challenges: Challenge[]
    badges: Badge[]
    totalStreak: number
  }>("/habits"),

  updateChallenge: (id: string, progress: number) =>
    fetchApi<Challenge>(`/habits/challenges/${id}`, {
      method: "PUT",
      body: JSON.stringify({ progress }),
    }),
}

export default api
