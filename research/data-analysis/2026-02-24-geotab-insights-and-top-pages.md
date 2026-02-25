# Geotab AI Insights & Top Pages Analysis

**Date:** 2026-02-24
**Type:** Data Analysis
**Conducted By:** Claude (Vincent Hofmann)
**Data Source:** BigQuery (`geotab-dna-prod.PaBaseLayer_EU.PageUsageMapped`)

## Objective

Identify:
1. Which AI insights are available in MyGeotab
2. Most-used pages and dashboards to inform recipe creation
3. Common dashboard patterns that should be supported in Overview-Builder

## Method

- Queried BigQuery for top 50 pages by unique users (90-day window)
- Searched GitLab Development repo for AI/prediction features
- Analyzed page usage patterns and engagement metrics

## Key Findings

### Top 10 Most-Used Pages (90 days, EU region)

| Rank | Page Name | Unique Users | Avg Seconds/User | Category |
|------|-----------|--------------|------------------|----------|
| 1 | map | 838,595 | 4,886 | Operations |
| 2 | tripsHistory | 396,538 | 1,369 | Operations |
| 3 | hosLogs | 85,925 | 2,046 | Compliance |
| 4 | Geotab Drive - Events | 55,420 | 156 | Safety (Mobile) |
| 5 | dvirs | 43,808 | 784 | Compliance |
| 6 | hosLog | 33,959 | 1,021 | Compliance |
| 7 | riskManagement | 29,800 | 446 | **Safety/AI** |
| 8 | faults | 27,960 | 223 | Maintenance |
| 9 | engineMeasurements | 26,346 | 311 | Maintenance |
| 10 | hosAvailability | 24,997 | 1,186 | Compliance |

### AI-Powered & Insight Pages

| Page Name | Unique Users | Category | AI Capability |
|-----------|--------------|----------|---------------|
| **collisionRisk** | 23,534 | Safety | ML-powered collision risk scoring |
| **riskManagement** | 29,800 | Safety | Aggregated risk insights |
| **addin-evsa-index** | 2,557 | Sustainability | EV Suitability Assessment (AI) |
| **addin-collision_reconstruction** | 5,675 | Safety | Collision analysis |
| **maintenanceWorkRequest** | 20,078 | Maintenance | Work request insights |
| **maintenanceSchedules** | 20,919 | Maintenance | Predictive scheduling |

### Usage Patterns by Category

**Safety & Risk (High Engagement):**
- riskManagement: 29,800 users
- collisionRisk: 23,534 users
- exception/exceptions: 39,232 combined users
- High seconds/user indicating deep analysis work

**Compliance (Very High Usage):**
- hosLogs: 85,925 users
- hosAvailability: 24,997 users
- hosViolations: 22,800 users
- iftaMiles: 18,727 users

**Maintenance (Moderate-High Usage):**
- maintenanceSchedules: 20,919 users
- maintenanceWorkRequest: 20,078 users
- faults: 27,960 users
- engineFaults: 15,497 users

**Fuel & Sustainability:**
- fuelUsage: 17,242 users
- fuelEvents: 13,586 users
- evCharging: 4,452 users
- addin-evsa: 2,557 users (AI-powered)

**Operations:**
- map: 838,595 users (dominant)
- tripsHistory: 396,538 users
- assetMonitoring: 8,620 users
- routes: 10,040 users

## AI Insights Available in MyGeotab

Based on GitLab search and page analysis:

### 1. **Collision Risk** (`collisionRisk` page)
- **Entity:** Analytics model for collision prediction
- **Location:** `apps/MyGeotab/geotab/checkmate/ui/pages/collisionRisk/`
- **Components:**
  - averageCollisionRiskCard
  - collisionRiskBenchmarkBar
  - analyticsModelVersionRegistry
- **Insight Type:** ML-powered risk scoring with benchmark comparison

### 2. **Risk Management** (`riskManagement` page)
- **Usage:** 29,800 users
- **Insight Type:** Aggregated safety risk insights
- **Likely combines:** Driver behavior, collision risk, exception data

### 3. **EV Suitability Assessment** (EVSA)
- **Page:** `addin-evsa-index`
- **Insight Type:** AI-powered EV suitability recommendations
- **Usage:** 2,557 users

### 4. **Maintenance Insights**
- **Pages:** maintenanceSchedules, maintenanceWorkRequest
- **Insight Type:** Predictive maintenance scheduling
- **Pattern:** Already implemented in Maintenance Overview

### 5. **Exception Insights**
- **Pages:** exception, exceptions
- **Insight Type:** Rule violations and anomaly detection
- **High engagement:** Deep analysis tool

## Implications for Overview-Builder

### Must-Have Dashboard Recipes (Ranked by Priority)

#### **Priority 1: Safety Scorecard**
- **Justification:** 29,800 (riskManagement) + 23,534 (collisionRisk) = 53K+ users
- **Components:**
  - Collision risk score with benchmark
  - Exception trends
  - Driver risk rankings
  - Safety events summary
- **Pattern:** Card-based overview with metric trends

#### **Priority 2: Maintenance Overview**
- **Justification:** 20,919 (schedules) + 20,078 (requests) + 27,960 (faults) = 69K+ users
- **Components:** ✅ Already implemented (reference pattern)
  - Immediate actions (overdue/severe)
  - Work order metrics
  - Breakdown risk
  - Performance insights
- **Pattern:** Immediate actions + metric chart + performance cards

#### **Priority 3: Compliance Dashboard**
- **Justification:** 85,925 (hosLogs) + 24,997 (availability) + 22,800 (violations) = 134K+ users
- **Components:**
  - HOS violations summary
  - Driver availability
  - IFTA miles tracking
  - Compliance trends
- **Pattern:** Alert cards + compliance metrics + trend charts

#### **Priority 4: Fleet Operations**
- **Justification:** 838,595 (map) + 396,538 (trips) = 1.2M+ users
- **Components:**
  - Asset locations (map-based)
  - Trip summaries
  - Route completion
  - Asset utilization
- **Pattern:** Map view + summary cards + metrics

#### **Priority 5: Fuel & Sustainability**
- **Justification:** 17,242 (fuelUsage) + 13,586 (fuelEvents) + 4,452 (evCharging) = 35K+ users
- **Components:**
  - Fuel consumption trends
  - EV charging insights
  - Sustainability metrics
  - Cost analysis
- **Pattern:** Metric cards + trend charts + benchmarks

### Common Dashboard Patterns Identified

**Pattern 1: Overview Card with Metrics** (most common)
```
[Icon] Title
Description
[↑/↓ X%] trend indicator
```
Used in: Maintenance, Safety, Fuel, Operations

**Pattern 2: Immediate Actions Section**
```
⚠️ High Priority Items
- Item 1 [count]
- Item 2 [count]
- Item 3 [count]
```
Used in: Maintenance, Safety, Compliance

**Pattern 3: Metric Chart with Switcher**
```
[Metric Selector Dropdown]
[Line/Bar Chart with Trend]
[Date Range Filter]
```
Used in: Maintenance, Fuel, Operations

**Pattern 4: Performance Rankings**
```
Top/Bottom Assets or Drivers by Metric
1. [Asset/Driver] [Value] [Badge]
2. ...
```
Used in: Maintenance, Safety, Operations

**Pattern 5: Benchmark Comparison**
```
Your Fleet: [Score]
[Progress Bar vs Industry Benchmark]
Industry Average: [Score]
```
Used in: Safety (Collision Risk), potentially Maintenance

## Recommendations for Overview-Builder

### Core Insights to Integrate

1. **Collision Risk Scores** - High engagement, ML-powered
2. **Maintenance Predictions** - Existing pattern, proven UX
3. **Exception Trends** - High usage for safety monitoring
4. **Fuel Efficiency Metrics** - Cost-focused insights
5. **EV Suitability** - Growing segment, AI-powered

### MVP Recipe Set

1. **Safety Scorecard** (Priority 1)
2. **Maintenance Overview** (Priority 2) - use existing pattern
3. **Compliance Dashboard** (Priority 3)

### Phase 2 Recipes

4. Fleet Operations Dashboard
5. Fuel & Sustainability Dashboard
6. Custom (user-configured)

### Layout Components Needed

Based on patterns found:
- ✅ **Overview Card** (already have from react-library)
- **Immediate Actions Card** (copy from Maintenance)
- **Metric Chart with Switcher** (copy from Maintenance)
- **Performance Rankings Card** (copy from Maintenance)
- **Benchmark Bar Component** (from collisionRisk)
- **Trend Indicator Pill** (from overview component)
- **Map View Component** (from map page)

### Data Sources Required

- **Safety:** Collision risk API, exception events
- **Maintenance:** Work orders, schedules, fault predictions
- **Compliance:** HOS logs, violations, IFTA
- **Operations:** Trips, routes, asset locations
- **Fuel:** Fuel transactions, efficiency metrics
- **EV:** Charging sessions, suitability scores

## Next Steps

1. ✅ Document AI insights available (this document)
2. Map API entities to each dashboard recipe
3. Create recipe configuration schema
4. Design conversational flow for recipe selection
5. Build recipe templates with component mappings
6. Implement add-in framework for dashboard creation

## Raw Data

See BigQuery query results in research folder for full page usage breakdown.

**Query used:**
```sql
SELECT
  PageName,
  COUNT(DISTINCT UserPseudoId) as unique_users_90d,
  SUM(EngagedSeconds) as total_engaged_seconds,
  SAFE_DIVIDE(SUM(EngagedSeconds), COUNT(DISTINCT UserPseudoId)) as seconds_per_user
FROM `geotab-dna-prod.PaBaseLayer_EU.PageUsageMapped`
WHERE StatusDate >= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)
GROUP BY PageName
ORDER BY unique_users_90d DESC
LIMIT 50
```

**Data freshness:** 2026-02-24 (EU region)
