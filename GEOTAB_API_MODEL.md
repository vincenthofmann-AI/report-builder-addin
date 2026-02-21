# Geotab API Information Architecture Model

## Complete API Object Hierarchy

### 1. **Fleet Assets** (Core Entities)
```
Device (Parent)
├── GoDevice (Base class)
│   ├── Go5, Go6, Go7, Go8, Go9, Go9B
│   ├── GoCurve, GoCurveAuxiliary
│   └── GoAnywhere, GoAnywhereLite
├── CustomDevice, CustomVehicleDevice
└── UntrackedAsset
```

### 2. **People & Drivers**
```
User (Parent)
├── Driver (extends User)
├── DriverChange
└── DriverRegulation
```

### 3. **Trip & Location Data**
```
LogRecord (GPS/position data)
Trip
├── Start/Stop timestamps
├── Distance
├── Duration
└── Linked to Device + Driver
```

### 4. **Diagnostics & Engine Health**
```
Diagnostic (Parent)
├── DataDiagnostic (measurements)
├── FaultData (fault codes)
└── StatusData (engine status)

Related:
├── Controller
├── ParameterGroup
├── Source
└── FailureMode
```

### 5. **Rules & Alerts**
```
Rule (violation definitions)
├── Condition (trigger logic)
├── ConditionType
└── ExceptionEvent (violations)

Notifications:
├── DistributionList
└── Recipient
```

### 6. **Fuel & Energy**
```
Traditional Vehicles:
├── FillUp
├── FuelUsed
└── FuelTransaction

Electric Vehicles:
├── ChargeEvent
├── EVStatusInfo
├── BatteryStateOfHealth
└── RangeEstimate
```

### 7. **Compliance & Safety**
```
Hours of Service:
├── DutyStatusLog
├── DutyStatusAvailability
└── DutyStatusViolation

Vehicle Inspection:
├── DVIRLog (inspection reports)
├── DVIRDefect
└── Trailer, TrailerAttachment

Clean Truck Check:
├── EmissionVehicleEnrollment
└── EmissionComplianceEvent
```

### 8. **Infrastructure & Organization**
```
Organizational:
├── Group (hierarchical org structure)
├── SecurityClearance
└── SecurityFilter

Geographic:
├── Zone (geofences)
├── Route
└── RoutePlanItem

Schedule:
├── WorkTime
└── WorkHoliday
```

### 9. **Communication & Content**
```
TextMessage
├── TextContent
├── CannedResponseContent
├── LocationContent
├── SerialIoxContent
└── MimeContent
```

### 10. **Add-Ins & Extensions**
```
AddIn
├── AddInConfiguration
├── AddInData
└── IoxAddOn (hardware peripherals)

Storage:
├── BinaryData
├── CustomData
└── MediaFile
```

---

## AI-Powered Insights Available from Geotab

### **Geotab Data Intelligence Platform**

**Scale:**
- 4.3 million connected vehicles globally
- 55 billion data points processed daily
- ML models trained on aggregate fleet data

**AI Capabilities:**

#### 1. **Collision Prediction & Safety**
```javascript
// Potential API integration (hypothetical based on Geotab AI)
{
  insight: "collision_risk",
  confidence: 0.87,
  driver: "Driver123",
  prediction: "High risk of collision in next 7 days",
  factors: ["Hard braking events", "Speed violations", "Fatigue patterns"]
}
```

**Available Data:**
- Collision detection events
- Safety benchmarks
- Driver behavior scores
- Peer group comparisons

#### 2. **Predictive Maintenance**
```javascript
{
  insight: "maintenance_prediction",
  vehicle: "Device456",
  component: "Engine",
  prediction: "Service required within 500 km",
  confidence: 0.92,
  recommendation: "Schedule engine inspection"
}
```

**Available Data:**
- Engine fault codes (FaultData)
- Diagnostic measurements (StatusData)
- Service history
- Component degradation patterns

#### 3. **Route Optimization**
```javascript
{
  insight: "route_efficiency",
  route: "Route789",
  optimization: "25% fuel savings possible",
  suggestion: "Alternative route via Highway 101",
  factors: ["Traffic patterns", "Fuel efficiency", "Time savings"]
}
```

**Available Data:**
- Trip history
- Fuel consumption patterns
- Traffic data
- Route performance

#### 4. **Driver Performance**
```javascript
{
  insight: "driver_efficiency",
  driver: "Driver123",
  score: 85,
  benchmark: "Top 20% in peer group",
  improvements: ["Reduce idle time by 15%", "Optimize acceleration patterns"]
}
```

**Available Data:**
- Driving behavior metrics
- Fuel efficiency scores
- Safety violations
- Hours of service compliance

#### 5. **Fleet Utilization**
```javascript
{
  insight: "fleet_optimization",
  underutilized: ["Vehicle A", "Vehicle B"],
  overutilized: ["Vehicle C"],
  recommendation: "Redistribute 3 vehicles from Region 1 to Region 2"
}
```

**Available Data:**
- Vehicle usage patterns
- Trip frequency
- Idle time analysis
- Geographic distribution

#### 6. **EV Battery Health**
```javascript
{
  insight: "battery_degradation",
  vehicle: "EV123",
  currentHealth: "87%",
  prediction: "80% health in 6 months",
  recommendation: "Optimize charging strategy"
}
```

**Available Data:**
- BatteryStateOfHealth
- ChargeEvent patterns
- RangeEstimate trends
- Temperature impacts

---

## Recommended IA for Report Builder

### **Three-Tier Structure**

#### **Tier 1: Business Categories** (User-Friendly)
```
Fleet Operations
├── Vehicle Performance
├── Driver Management
├── Fuel & Energy
└── Compliance & Safety

Analytics & Insights
├── AI Predictions
├── Benchmarks
└── Optimization
```

#### **Tier 2: Report Types** (Use Cases)
```
Fleet Operations > Vehicle Performance
├── Vehicle Utilization
├── Maintenance Tracking
├── Trip Analysis
└── Location History

Analytics & Insights > AI Predictions
├── Collision Risk
├── Maintenance Forecasts
├── Efficiency Opportunities
└── Cost Optimization
```

#### **Tier 3: Data Objects** (API Mapping)
```
Vehicle Utilization Report
Data Sources:
├── Device (vehicles)
├── Trip (journeys)
├── LogRecord (GPS data)
└── StatusData (engine metrics)

AI Enhancement:
└── Fleet Utilization Insight (suggested)
```

---

## Integration Strategy

### **Phase 1: Object Browser**
Replace current data source dropdown with hierarchical browser:
```
📦 Fleet Operations
  └─ 🚗 Vehicle Performance
      └─ Device, Trip, StatusData
  └─ 👤 Driver Management
      └─ Driver, User, DutyStatusLog
  └─ ⛽ Fuel & Energy
      └─ FuelUsed, ChargeEvent, EVStatusInfo

📊 Analytics & Insights
  └─ 🤖 AI Predictions
      └─ Collision Risk, Predictive Maintenance
```

### **Phase 2: AI Insights Panel**
Add optional "AI Insights" section:
```
┌─────────────────────────────────────┐
│ 💡 Suggested Insights               │
├─────────────────────────────────────┤
│ ✓ Add Collision Risk Score          │
│ ✓ Add Maintenance Prediction        │
│ ✓ Add Fleet Utilization %           │
└─────────────────────────────────────┘
```

When user clicks, auto-add:
- Calculated field
- Appropriate aggregation
- Visualization recommendation

### **Phase 3: Smart Templates**
Pre-built report templates:
```
Template: "Fleet Safety Dashboard"
- Collision events by driver
- Safety score trends
- AI risk predictions
- Compliance violations
```

---

## Why NOT to Use Apache Superset

### **Technical Limitations:**

1. **Requires Backend Server**
   - Superset is a Python/Flask application
   - Needs database connections
   - Cannot run client-side in a browser
   - Geotab Add-Ins are pure client-side

2. **Embedding Requirements**
   - `@superset-ui/embedded-sdk` uses iframes
   - Requires authentication server
   - Needs CORS configuration
   - Guest token generation required

3. **Architecture Mismatch**
```
Superset Architecture:
Browser → Superset Server → Database
         (Python/Flask)

Geotab Add-In Architecture:
Browser → MyGeotab API
(Client-side only, no backend)
```

4. **Complexity vs. Benefit**
   - Would need to run a separate Superset server
   - User would authenticate twice (MyGeotab + Superset)
   - Data would need to sync MyGeotab → Database → Superset
   - Massive infrastructure overhead

### **Better Approach:**
- Keep our custom builder
- Use Zenith components (native to Geotab)
- Add Geotab-specific intelligence (API object awareness)
- Integrate AI insights from Geotab Data Intelligence
- Direct MyGeotab API calls (no middleware)

---

## Next Steps

1. **Build Object Browser UI**
   - Hierarchical navigation (Business > Use Case > Objects)
   - Smart suggestions based on related objects
   - Multi-object selection with relationship mapping

2. **Add AI Insights Integration**
   - Research Geotab Data Intelligence API access
   - Create "AI Insights" panel with suggested metrics
   - One-click insertion of AI-powered fields

3. **Create Report Templates**
   - Pre-built templates for common use cases
   - Auto-configure objects, fields, aggregations
   - Include AI insights by default

4. **Enhance with Geotab Domain Knowledge**
   - Field relationships (Device → Trip → Driver)
   - Recommended aggregations per object
   - Business metric calculations (MPG, Cost per Mile, etc.)
