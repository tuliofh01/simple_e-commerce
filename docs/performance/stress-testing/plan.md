# Stress Testing Plan

This document outlines the strategy, tools, and procedures for stress testing the Simple E-Commerce Platform.

## 🎯 Objectives

1. **Determine System Limits**: Find maximum concurrent users and request rates
2. **Identify Bottlenecks**: Pinpoint performance bottlenecks in backend/frontend
3. **Validate Scaling**: Test horizontal scaling capabilities
4. **Ensure Reliability**: Verify system stability under peak load

## 📊 Testing Strategy

### Test Categories

| Type | Purpose | Duration | Load Level |
|------|---------|----------|------------|
| **Smoke Test** | Verify basic functionality | 1 min | Light |
| **Load Test** | Normal operating conditions | 10 min | Expected peak |
| **Stress Test** | Beyond normal capacity | 15 min | 2-3x peak |
| **Spike Test** | Sudden traffic surge | 2 min | 10x peak |
| **Endurance Test** | Long-term stability | 1-24 hours | Moderate |
| **Soak Test** | Resource exhaustion | 4-8 hours | Moderate-high |

### Target Metrics

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| API Response Time (P95) | < 200ms | < 500ms | > 500ms |
| API Response Time (P99) | < 500ms | < 1s | > 1s |
| Error Rate | < 0.1% | < 1% | > 1% |
| CPU Usage | < 70% | < 85% | > 85% |
| Memory Usage | < 70% | < 85% | > 85% |
| Database Connections | < 70% | < 85% | > 85% |

---

## 🛠️ Testing Tools

### Tool Selection

| Tool | Purpose | Pros | Cons |
|------|---------|------|------|
| **wrk** | HTTP benchmarking | Lightweight, Lua scripting | Single-threaded |
| **k6** | Load testing | Modern, JavaScript | Resource heavy |
| **Apache AB** | Simple benchmarks | Easy to use | Limited features |
| **Vegeta** | HTTP load testing | Constant rate, visual reports | No GUI |
| **Locust** | Distributed load testing | Python-based, scalable | Complex setup |
| **JMeter** | Full-featured testing | Enterprise-grade | Java, complex |

### Recommended Tools

```bash
# wrk - Quick HTTP benchmarks
sudo apt install wrk

# k6 - Modern load testing
brew install k6  # macOS
curl -sL https://github.com/grafana/k6/releases | tar xz
sudo mv k6 /usr/local/bin/

# vegeta - Constant attack rate
brew install vegeta  # macOS
```

---

## 📈 Test Scenarios

### Scenario 1: Browse Products
```javascript
// k6 script: products-browse.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up
    { duration: '5m', target: 100 },  // Sustain
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function() {
  const res = http.get('http://localhost:8080/api/products?limit=20');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'has products': (r) => r.json('products').length > 0,
    'has pagination': (r) => r.json('pagination') !== undefined,
  });
  
  sleep(1);
}
```

### Scenario 2: User Authentication
```javascript
// k6 script: auth-flow.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '3m', target: 50 },
    { duration: '1m', target: 0 },
  ],
};

const credentials = JSON.parse(open('./users.json'));

export default function() {
  const user = credentials[Math.floor(Math.random() * credentials.length)];
  
  // Login
  const loginRes = http.post('http://localhost:8080/api/auth/login',
    JSON.stringify({ username: user.username, password: user.password }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  check(loginRes, {
    'login successful': (r) => r.status === 200,
    'has token': (r) => r.json('token') !== undefined,
  });
  
  if (loginRes.status === 200) {
    const token = loginRes.json('token');
    
    // Get profile
    const profileRes = http.get('http://localhost:8080/api/auth/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    check(profileRes, {
      'profile retrieved': (r) => r.status === 200,
    });
  }
  
  sleep(2);
}
```

### Scenario 3: Complete Purchase Flow
```javascript
// k6 script: checkout-flow.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 20 },
    { duration: '5m', target: 20 },
    { duration: '2m', target: 0 },
  ],
};

export default function() {
  // 1. Login
  const loginRes = http.post('http://localhost:8080/api/auth/login',
    JSON.stringify({ username: 'testuser', password: 'password' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  if (loginRes.status !== 200) return;
  
  const token = loginRes.json('token');
  const authHeader = { 'Authorization': `Bearer ${token}` };
  
  // 2. Browse products
  const productsRes = http.get('http://localhost:8080/api/products?limit=10',
    { headers: authHeader }
  );
  
  const products = productsRes.json('products');
  const product = products[0];
  
  // 3. Create order (simplified - assumes cart is populated)
  const orderRes = http.post('http://localhost:8080/api/orders',
    JSON.stringify({
      items: [{ productId: product.id, quantity: 1 }],
      customerEmail: 'test@example.com',
      shippingAddress: '123 Test St'
    }),
    { headers: { ...authHeader, 'Content-Type': 'application/json' } }
  );
  
  check(orderRes, {
    'order created': (r) => r.status === 201,
    'has order id': (r) => r.json('id') !== undefined,
  });
  
  sleep(3);
}
```

### Scenario 4: Mixed Workload
```javascript
// k6 script: mixed-workload.js
import http from 'k6/http';
import { check, sleep, random } from 'k6';

export const options = {
  stages: [
    { duration: '3m', target: 100 },
    { duration: '10m', target: 100 },
    { duration: '3m', target: 0 },
  ],
};

export default function() {
  const endpoints = [
    { method: 'GET', url: '/api/products', weight: 40 },
    { method: 'GET', url: '/api/products/featured', weight: 20 },
    { method: 'GET', url: '/api/blog/posts', weight: 15 },
    { method: 'POST', url: '/api/auth/login', weight: 15 },
    { method: 'GET', url: '/api/auth/profile', weight: 10 },
  ];
  
  // Weighted random endpoint selection
  const rand = Math.random() * 100;
  let cumulative = 0;
  let selected;
  
  for (const endpoint of endpoints) {
    cumulative += endpoint.weight;
    if (rand <= cumulative) {
      selected = endpoint;
      break;
    }
  }
  
  const res = http.get(`http://localhost:8080${selected.url}`);
  
  check(res, {
    [${selected.method} ${selected.url} successful]: (r) => r.status === 200,
  });
  
  sleep(random(1, 5));
}
```

---

## 🧪 Test Execution Procedures

### Pre-Test Checklist
```bash
#!/bin/bash
# pre-test-checklist.sh

echo "=== Pre-Test Checklist ==="

# 1. Check system resources
echo "CPU cores: $(nproc)"
echo "Memory: $(free -h | grep Mem | awk '{print $2}')"
echo "Disk: $(df -h / | tail -1)"

# 2. Verify services are running
echo ""
echo "=== Service Status ==="
curl -s http://localhost:8080/api/health || echo "Backend NOT running"
curl -s http://localhost:4200 || echo "Frontend NOT running"

# 3. Check database
echo ""
echo "=== Database Status ==="
ls -lh backend/data/database.db || echo "Database file missing"

# 4. Clear test data
echo ""
echo "=== Test Data ==="
echo "Running migrations..."
cd backend && dub run -- test-migrate || echo "Migration failed"

echo ""
echo "=== Checklist Complete ==="
```

### Running Tests

```bash
# Install k6
curl -sL https://github.com/grafana/k6/releases/download/v0.45.0/k6-v0.45.0-linux-amd64.tar.gz | tar xz
sudo mv k6-v0.45.0-linux-amd64/bin/k6 /usr/local/bin/

# Run smoke test
k6 run --env HOST=http://localhost:8080 scripts/smoke-test.js

# Run load test
k6 run --env HOST=http://localhost:8080 scripts/load-test.js

# Run stress test
k6 run --env HOST=http://localhost:8080 scripts/stress-test.js

# Run all scenarios
for script in scripts/*.js; do
  echo "Running: $script"
  k6 run --env HOST=http://localhost:8080 "$script"
done
```

### wrk Commands

```bash
# Simple load test
wrk -t4 -c100 -d30s http://localhost:8080/api/products

# With Lua script for complex scenarios
wrk -t4 -c100 -d30s -s scripts/auth.lua http://localhost:8080/api/auth/login

# High concurrency test
wrk -t8 -c500 -d60s http://localhost:8080/api/products

# Benchmark with think time
wrk -t4 -c50 -d30s -s scripts/think-time.lua http://localhost:8080/api/products
```

---

## 📊 Results Analysis

### Key Metrics to Track

| Metric | Description | Target |
|--------|-------------|--------|
| **Requests/sec** | Throughput | > 1000 rps |
| **Latency P50** | Median response | < 50ms |
| **Latency P95** | 95th percentile | < 200ms |
| **Latency P99** | 99th percentile | < 500ms |
| **Error Rate** | Failed requests | < 0.1% |
| **Timeout Rate** | Timeouts | < 0.01% |

### Result Interpretation

```bash
#!/bin/bash
# analyze-results.sh

echo "=== Performance Analysis ==="

# Parse k6 output
cat results.json | jq '.metrics.http_req_duration'

# Calculate percentiles
cat results.json | jq '.metrics.http_req_duration.values."p(95)"'
cat results.json | jq '.metrics.http_req_duration.values."p(99)"'

# Check error rate
ERROR_RATE=$(cat results.json | jq '.metrics.http_req_failed.values.rate')
echo "Error Rate: $ERROR_RATE"
if (( $(echo "$ERROR_RATE > 0.01" | bc -l) )); then
  echo "WARNING: Error rate exceeds 1%"
fi

# Compare against baseline
echo ""
echo "=== Baseline Comparison ==="
./compare-results.sh baseline.json results.json
```

### Visualization

```bash
#!/bin/bash
# generate-charts.sh

# Generate charts from k6 results
npm install -g k6reports
k6 report results.json --output-dir=reports/

# Create comparison chart
python3 << 'EOF'
import matplotlib.pyplot as plt
import json

with open('results.json') as f:
    data = json.load(f)

# Extract metrics
labels = ['P50', 'P95', 'P99']
latencies = [
    data['metrics']['http_req_duration']['values']['p(50)'],
    data['metrics']['http_req_duration']['values']['p(95)'],
    data['metrics']['http_req_duration']['values']['p(99)']
]

plt.figure(figsize=(10, 6))
plt.bar(labels, latencies, color=['green', 'yellow', 'red'])
plt.title('API Response Latency')
plt.ylabel('Milliseconds')
plt.axhline(y=200, color='r', linestyle='--', label='Target (200ms)')
plt.legend()
plt.savefig('latency-chart.png')
plt.close()

print("Chart saved to latency-chart.png")
EOF
```

---

## 🎯 Success Criteria

### By Test Type

| Test Type | Success Criteria |
|-----------|----------------|
| **Smoke Test** | All endpoints return 200, response < 500ms |
| **Load Test** | P95 < 200ms, error rate < 0.1%, no crashes |
| **Stress Test** | System handles 2x peak, graceful degradation |
| **Spike Test** | Recovery < 30 seconds, no data loss |
| **Endurance Test** | No memory growth, stable after 1 hour |

### Performance Targets

```yaml
performance_targets:
  api_response_time:
    p50: < 50ms
    p95: < 200ms
    p99: < 500ms
  
  throughput:
    requests_per_second: > 1000
    concurrent_users: > 500
  
  reliability:
    error_rate: < 0.1%
    uptime_during_test: 99.9%
  
  resources:
    cpu_peak: < 70%
    memory_peak: < 70%
    db_connections_peak: < 70%
```

---

## 📝 Test Schedule

### Weekly Benchmark Protocol
```
Every Monday:
├── 09:00 - Smoke tests (5 min)
├── 09:15 - Load tests (30 min)
├── 09:45 - Results review
└── 10:00 - Report generation

Monthly:
├── Full stress test (2 hours)
├── Spike test (30 min)
└── Endurance test (4 hours)
```

### Test Environment
| Environment | URL | Purpose |
|------------|-----|---------|
| Development | localhost:8080 | Quick tests |
| Staging | staging.example.com | Pre-release tests |
| Production | api.example.com | Benchmark tests |

---

## 🔧 Configuration Files

### k6 Configuration
```javascript
// k6-config.js
export const options = {
  scenarios: {
    browse_products: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100 },
        { duration: '10m', target: 100 },
        { duration: '2m', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
    auth_flows: {
      executor: 'constant-arrival-rate',
      rate: 50,
      timeUnit: '1s',
      duration: '15m',
      preAllocatedVUs: 50,
      maxVUs: 100,
    },
  },
  
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99'],
  },
  
  systemTags: ['check', 'error', 'group', 'method', 'name', 'status', 'url'],
  
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
};
```

---

## 📚 References

### Documentation
- [k6 Documentation](https://k6.io/docs/)
- [wrk Documentation](https://github.com/wg/wrk)
- [Vegeta Documentation](https://github.com/tsenart/vegeta)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)

### Related Documents
- [Performance Benchmarks](performance/benchmarks.md)
- [Optimization Guide](performance/optimization.md)
- [Architecture Overview](ARCHITECTURE.md)

---

**Document Version**: 1.0.0  
**Last Updated**: 2024-02-09  
**Owner**: Development Team