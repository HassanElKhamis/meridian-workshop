<template>
  <div class="restocking">
    <div class="page-header">
      <h2>{{ t('restocking.title') }}</h2>
      <p>{{ t('restocking.description') }}</p>
    </div>

    <!-- Budget Control -->
    <div class="budget-control">
      <label for="budget-input">{{ t('restocking.budget') }}</label>
      <div class="budget-input-row">
        <input
          id="budget-input"
          type="number"
          v-model.number="budgetInput"
          :placeholder="t('restocking.budgetPlaceholder')"
          class="budget-input"
          min="0"
          step="1000"
        />
        <button @click="loadData" class="apply-btn">
          {{ t('restocking.apply') }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading">{{ t('common.loading') }}</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <!-- Summary Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">{{ t('restocking.itemsCount') }}</div>
          <div class="stat-value">{{ recommendations.length }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t('restocking.totalCost') }}</div>
          <div class="stat-value">${{ formatNumber(summaryData.total_estimated_cost) }}</div>
        </div>
        <div class="stat-card" v-if="summaryData.budget_limit">
          <div class="stat-label">{{ t('restocking.budgetUsed') }}</div>
          <div class="stat-value" :class="budgetClass">
            {{ summaryData.budget_used_percentage.toFixed(1) }}%
          </div>
        </div>
        <div class="stat-card" v-if="summaryData.budget_limit">
          <div class="stat-label">{{ t('restocking.withinBudget') }}</div>
          <div class="stat-value">{{ summaryData.items_within_budget }} / {{ summaryData.total_items }}</div>
        </div>
      </div>

      <!-- Priority Breakdown -->
      <div class="priority-grid">
        <div class="priority-card critical">
          <div class="priority-count">{{ priorityCounts.critical }}</div>
          <div class="priority-label">{{ t('restocking.critical') }}</div>
        </div>
        <div class="priority-card high">
          <div class="priority-count">{{ priorityCounts.high }}</div>
          <div class="priority-label">{{ t('restocking.high') }}</div>
        </div>
        <div class="priority-card medium">
          <div class="priority-count">{{ priorityCounts.medium }}</div>
          <div class="priority-label">{{ t('restocking.medium') }}</div>
        </div>
        <div class="priority-card low">
          <div class="priority-count">{{ priorityCounts.low }}</div>
          <div class="priority-label">{{ t('restocking.low') }}</div>
        </div>
      </div>

      <!-- Recommendations Table -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">{{ t('restocking.recommendations') }}</h3>
        </div>

        <div v-if="recommendations.length === 0" class="no-data">
          {{ t('restocking.noRecommendations') }}
        </div>

        <div v-else class="table-container">
          <table class="restock-table">
            <thead>
              <tr>
                <th>{{ t('restocking.sku') }}</th>
                <th>{{ t('restocking.itemName') }}</th>
                <th>{{ t('restocking.category') }}</th>
                <th>{{ t('restocking.warehouse') }}</th>
                <th>{{ t('restocking.onHand') }}</th>
                <th>{{ t('restocking.forecastedDemand') }}</th>
                <th>{{ t('restocking.gap') }}</th>
                <th>{{ t('restocking.priority') }}</th>
                <th>{{ t('restocking.recommendedQty') }}</th>
                <th>{{ t('restocking.unitCost') }}</th>
                <th>{{ t('restocking.estimatedCost') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in recommendations" :key="item.sku + '-' + item.warehouse">
                <td><strong>{{ item.sku }}</strong></td>
                <td>{{ translateProductName(item.item_name) }}</td>
                <td>{{ translateCategory(item.category) }}</td>
                <td>{{ translateWarehouse(item.warehouse) }}</td>
                <td>
                  <span :class="getStockClass(item.quantity_on_hand, item.reorder_point)">
                    {{ item.quantity_on_hand }}
                  </span>
                </td>
                <td>{{ item.forecasted_demand }}</td>
                <td>
                  <span class="badge danger">{{ item.restocking_gap }}</span>
                </td>
                <td>
                  <span :class="['priority-badge', item.priority]">
                    {{ t('restocking.' + item.priority) }}
                  </span>
                </td>
                <td><strong>{{ item.recommended_quantity }}</strong></td>
                <td>${{ formatNumber(item.unit_cost) }}</td>
                <td><strong>${{ formatNumber(item.estimated_cost) }}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { api } from '../api'
import { useI18n } from '../composables/useI18n'
import { useFilters } from '../composables/useFilters'

export default {
  name: 'Restocking',
  setup() {
    const { t, translateProductName, translateWarehouse } = useI18n()
    const loading = ref(true)
    const error = ref(null)
    const recommendations = ref([])
    const summaryData = ref({})
    const budgetInput = ref(null)

    const { selectedLocation, selectedCategory } = useFilters()

    const translateCategory = (category) => {
      const categoryMap = {
        'Circuit Boards': t('categories.circuitBoards'),
        'Sensors': t('categories.sensors'),
        'Actuators': t('categories.actuators'),
        'Controllers': t('categories.controllers'),
        'Power Supplies': t('categories.powerSupplies')
      }
      return categoryMap[category] || category
    }

    const priorityCounts = computed(() => {
      const counts = { critical: 0, high: 0, medium: 0, low: 0 }
      recommendations.value.forEach(item => {
        if (counts[item.priority] !== undefined) {
          counts[item.priority]++
        }
      })
      return counts
    })

    const budgetClass = computed(() => {
      const pct = summaryData.value.budget_used_percentage || 0
      if (pct >= 95) return 'budget-alert'
      if (pct >= 80) return 'budget-warning'
      return 'budget-ok'
    })

    const getStockClass = (onHand, reorderPoint) => {
      if (onHand <= reorderPoint * 0.5) return 'stock-critical'
      if (onHand < reorderPoint) return 'stock-low'
      return ''
    }

    const formatNumber = (num) => {
      var str = num.toFixed(2)
      var parts = str.split('.')
      var intPart = parts[0]
      var decPart = parts[1]

      var formatted = ''
      var count = 0
      for (var i = intPart.length - 1; i >= 0; i--) {
        if (count > 0 && count % 3 === 0) {
          formatted = ',' + formatted
        }
        formatted = intPart[i] + formatted
        count++
      }

      return formatted + '.' + decPart
    }

    const loadData = async () => {
      try {
        loading.value = true
        error.value = null

        var params = {}
        if (budgetInput.value && budgetInput.value > 0) {
          params.budget = budgetInput.value
        }
        if (selectedLocation.value && selectedLocation.value !== 'all') {
          params.warehouse = selectedLocation.value
        }
        if (selectedCategory.value && selectedCategory.value !== 'all') {
          params.category = selectedCategory.value
        }

        const response = await api.getRestockingRecommendations(params)
        recommendations.value = response.recommendations || []
        summaryData.value = {
          total_estimated_cost: response.total_estimated_cost || 0,
          budget_limit: response.budget_limit || null,
          items_within_budget: response.items_within_budget || 0,
          total_items: response.total_items || 0,
          budget_used_percentage: response.budget_used_percentage || 0
        }
      } catch (err) {
        error.value = 'Failed to load restocking data: ' + err.message
      } finally {
        loading.value = false
      }
    }

    onMounted(loadData)

    return {
      t, loading, error, recommendations, summaryData, budgetInput,
      priorityCounts, budgetClass,
      loadData, formatNumber, getStockClass,
      translateProductName, translateWarehouse, translateCategory
    }
  }
}
</script>

<style scoped>
.restocking {
  padding: 0;
}

.page-header {
  margin-bottom: 1.5rem;
}

.page-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.25rem 0;
}

.page-header p {
  color: #64748b;
  font-size: 0.938rem;
  margin: 0;
}

/* Budget Control */
.budget-control {
  background: white;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.budget-control label {
  font-weight: 600;
  color: #475569;
  font-size: 0.938rem;
  white-space: nowrap;
}

.budget-input-row {
  display: flex;
  gap: 0.75rem;
  flex: 1;
}

.budget-input {
  flex: 1;
  max-width: 240px;
  padding: 0.5rem 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.938rem;
  transition: border-color 0.2s;
}

.budget-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.apply-btn {
  padding: 0.5rem 1.25rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}

.apply-btn:hover {
  background: #2563eb;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #3b82f6;
}

.stat-label {
  font-size: 0.813rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
}

.budget-ok {
  color: #10b981;
}

.budget-warning {
  color: #f59e0b;
}

.budget-alert {
  color: #ef4444;
}

/* Priority Grid */
.priority-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.priority-card {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: center;
  border-top: 4px solid transparent;
}

.priority-card.critical {
  border-top-color: #ef4444;
}

.priority-card.high {
  border-top-color: #f97316;
}

.priority-card.medium {
  border-top-color: #f59e0b;
}

.priority-card.low {
  border-top-color: #3b82f6;
}

.priority-count {
  font-size: 2rem;
  font-weight: 700;
  color: #0f172a;
}

.priority-label {
  font-size: 0.813rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* Card / Table */
.card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-header {
  margin-bottom: 1.25rem;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.table-container {
  overflow-x: auto;
}

.restock-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.restock-table th {
  background: #f8fafc;
  padding: 0.75rem 0.625rem;
  text-align: left;
  font-weight: 600;
  color: #64748b;
  border-bottom: 2px solid #e2e8f0;
  white-space: nowrap;
  font-size: 0.813rem;
}

.restock-table td {
  padding: 0.625rem;
  border-bottom: 1px solid #e2e8f0;
  color: #334155;
}

.restock-table tr:hover {
  background: #f8fafc;
}

/* Stock Level Colors */
.stock-critical {
  color: #ef4444;
  font-weight: 600;
}

.stock-low {
  color: #f59e0b;
  font-weight: 600;
}

/* Priority Badges */
.priority-badge {
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.priority-badge.critical {
  background: #fee2e2;
  color: #991b1b;
}

.priority-badge.high {
  background: #fff7ed;
  color: #9a3412;
}

.priority-badge.medium {
  background: #fef3c7;
  color: #92400e;
}

.priority-badge.low {
  background: #eff6ff;
  color: #1e40af;
}

.badge {
  padding: 0.2rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge.danger {
  background: #fee2e2;
  color: #991b1b;
}

.no-data {
  padding: 3rem;
  text-align: center;
  color: #10b981;
  font-weight: 600;
  font-size: 1.063rem;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #64748b;
}

.error {
  background: #fee2e2;
  color: #991b1b;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
}
</style>