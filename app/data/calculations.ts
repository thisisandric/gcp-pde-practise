export interface CalculationStep {
  label: string;
  detail: string;
}

export interface CalculationExample {
  id: string;
  title: string;
  category: string;
  scenario: string;
  formula: string;
  steps: CalculationStep[];
  result: string;
  takeaway: string;
}

export const calculations: CalculationExample[] = [
  {
    id: "bq-ondemand-cost",
    title: "BigQuery On-Demand Query Cost",
    category: "BigQuery",
    scenario: "A query scans 250 GB of data in the US multi-region. On-demand rate is $6.25 per TiB, with the first 1 TiB/month free.",
    formula: "Cost = (Bytes scanned in TiB) × $6.25/TiB",
    steps: [
      { label: "Convert GB to TiB", detail: "250 GB ÷ 1024 = 0.244 TiB" },
      { label: "Apply free tier", detail: "First 1 TiB/month is free — if this is within the free allotment, cost is $0" },
      { label: "Apply rate (if free tier exhausted)", detail: "0.244 TiB × $6.25/TiB = $1.525" }
    ],
    result: "$1.53 per query (assuming free tier already used)",
    takeaway: "Always check bytes scanned with EXPLAIN or the query validator before running — cost scales linearly with data scanned, not rows returned."
  },
  {
    id: "bq-slots-breakeven",
    title: "BigQuery Slots vs On-Demand Break-Even",
    category: "BigQuery",
    scenario: "Your team scans an average of 400 TiB/month with on-demand pricing. Should you switch to a 100-slot Standard reservation?",
    formula: "Break-even TiB = Monthly slot cost ÷ $6.25/TiB",
    steps: [
      { label: "Monthly cost of 100 slots", detail: "100 slots × $0.04/slot/hr × 730 hrs/month = $2,920/month" },
      { label: "On-demand cost for 400 TiB", detail: "400 TiB × $6.25/TiB = $2,500/month" },
      { label: "Compare", detail: "$2,500 (on-demand) < $2,920 (100 slots) → stay on-demand" },
      { label: "Find break-even point", detail: "$2,920 ÷ $6.25 = 467.2 TiB/month" }
    ],
    result: "Switch to slots only once scanning exceeds ~467 TiB/month",
    takeaway: "The commonly cited '$2,400/month' rule of thumb assumes 100 slots at list price; always recompute break-even against your actual scanned volume."
  },
  {
    id: "bq-partition-pruning",
    title: "Partition Pruning Savings",
    category: "BigQuery",
    scenario: "A table has 365 daily partitions totaling 10 TB. A query filters to the last 7 days only.",
    formula: "Savings % = (Excluded partitions ÷ Total partitions) × 100",
    steps: [
      { label: "Partitions scanned", detail: "7 out of 365 partitions accessed" },
      { label: "Partitions excluded", detail: "365 − 7 = 358 partitions skipped" },
      { label: "Reduction percentage", detail: "358 ÷ 365 = 98.1% fewer partitions scanned" },
      { label: "Bytes scanned (approx, even distribution)", detail: "10 TB × (7/365) ≈ 0.192 TB scanned" },
      { label: "Query cost", detail: "0.192 TB × $6.25 ≈ $1.20 (vs $62.50 for a full scan)" }
    ],
    result: "~98% cost reduction: $1.20 vs $62.50 for a full table scan",
    takeaway: "Partition pruning only triggers when the filter is on the partitioning column directly (e.g. event_date >= '2026-09-01'), not wrapped in a function like EXTRACT()."
  },
  {
    id: "dataflow-worker-sizing",
    title: "Dataflow Worker Count for Backlog Drain",
    category: "Dataflow",
    scenario: "A streaming pipeline has a 2 TB backlog. Each worker processes 100 MB/min. Target drain time is 300 seconds (5 minutes).",
    formula: "Workers needed = Backlog ÷ (Per-worker throughput × Target drain time)",
    steps: [
      { label: "Convert backlog to MB", detail: "2 TB = 2,000,000 MB" },
      { label: "Convert target time to minutes", detail: "300 seconds = 5 minutes" },
      { label: "Total throughput needed", detail: "2,000,000 MB ÷ 5 min = 400,000 MB/min required" },
      { label: "Divide by per-worker throughput", detail: "400,000 MB/min ÷ 100 MB/min per worker = 4,000 workers" }
    ],
    result: "4,000 workers needed to drain in 5 minutes (unrealistic — relax the SLA or pre-scale gradually)",
    takeaway: "Extreme backlog-to-SLA ratios reveal when a fixed drain-time target is unreasonable; THROUGHPUT_BASED autoscaling will scale toward --max_num_workers instead, so always set a sane cap."
  },
  {
    id: "dataflow-throughput",
    title: "Dataflow Pipeline Throughput Calculation",
    category: "Dataflow",
    scenario: "A batch job processes 50 million elements in 40 minutes.",
    formula: "Throughput (elements/sec) = Total elements ÷ Duration (seconds)",
    steps: [
      { label: "Convert duration to seconds", detail: "40 minutes × 60 = 2,400 seconds" },
      { label: "Divide elements by duration", detail: "50,000,000 ÷ 2,400 = 20,833 elements/sec" }
    ],
    result: "≈ 20,833 elements/sec average throughput",
    takeaway: "Compare this to your peak ingestion rate (e.g. Pub/Sub publish rate) — if throughput is consistently below input rate, backlog will grow indefinitely regardless of autoscaling cap."
  },
  {
    id: "dataflow-cost",
    title: "Dataflow Streaming Job Monthly Cost",
    category: "Dataflow",
    scenario: "A streaming pipeline runs continuously with an average of 15 n1-standard-4 workers at $0.19/hr each.",
    formula: "Monthly cost = Workers × Hourly rate × 730 hours",
    steps: [
      { label: "Hourly cost", detail: "15 workers × $0.19/hr = $2.85/hr" },
      { label: "Monthly cost (730 hrs/month average)", detail: "$2.85/hr × 730 hrs = $2,080.50/month" }
    ],
    result: "≈ $2,080/month for compute alone (excludes Pub/Sub and BigQuery costs)",
    takeaway: "Streaming jobs run 24/7 by default — always compute against 730 hrs/month, not business hours, unless you explicitly schedule pipeline start/stop."
  },
  {
    id: "gcs-lifecycle-savings",
    title: "Cloud Storage Lifecycle Cost Savings",
    category: "Cloud Storage",
    scenario: "100 GB dataset: Standard for 30 days, Nearline for 60 days, Coldline for 275 days, then Archive for 9 years (compliance).",
    formula: "Total cost = Σ (GB × class rate × months in that class)",
    steps: [
      { label: "Standard (Month 1)", detail: "100 GB × $0.020/GB × 1 month = $2.00" },
      { label: "Nearline (Months 2-3)", detail: "100 GB × $0.010/GB × 2 months = $2.00" },
      { label: "Coldline (Months 4-12)", detail: "100 GB × $0.004/GB × 9 months = $3.60" },
      { label: "Archive (Years 2-10)", detail: "100 GB × $0.0012/GB × 108 months = $12.96" },
      { label: "Sum all phases", detail: "$2.00 + $2.00 + $3.60 + $12.96 = $20.56 over 10 years" },
      { label: "Compare to all-Standard", detail: "100 GB × $0.020 × 120 months = $240.00 over 10 years" }
    ],
    result: "$20.56 (tiered) vs $240.00 (all-Standard) — 91.4% savings",
    takeaway: "Lifecycle transitions are free to configure; the only costs are the storage class rates themselves plus one-time retrieval fees if data is accessed while archived."
  },
  {
    id: "pubsub-cost",
    title: "Pub/Sub Monthly Messaging Cost",
    category: "Pub/Sub",
    scenario: "A topic publishes 1 billion messages/month, each read by 2 subscriptions (so 2 billion pull operations).",
    formula: "Cost = (Publish ops ÷ 10M × $5) + (Pull ops ÷ 10M × $10)",
    steps: [
      { label: "Publish cost", detail: "(1,000,000,000 ÷ 10,000,000) × $5 = 100 × $5 = $500" },
      { label: "Pull cost (2 subscriptions)", detail: "(2,000,000,000 ÷ 10,000,000) × $10 = 200 × $10 = $2,000" },
      { label: "Apply free tier", detail: "First 10 GB/month free (negligible at this volume — ignored here)" },
      { label: "Total", detail: "$500 + $2,000 = $2,500/month" }
    ],
    result: "≈ $2,500/month total messaging cost",
    takeaway: "Cost scales with number of subscriptions, not just publish volume — fan-out to 5 subscriptions instead of 2 would push pull costs to $5,000/month."
  },
  {
    id: "pubsub-backlog-lag",
    title: "Pub/Sub Subscription Lag Estimate",
    category: "Pub/Sub",
    scenario: "The oldest unacknowledged message is 45 seconds old. Current throughput is 5,000 msg/sec and messages average 2 KB.",
    formula: "Backlog (messages) ≈ Oldest unacked age × Current throughput",
    steps: [
      { label: "Estimate backlog size in messages", detail: "45 sec × 5,000 msg/sec = 225,000 messages" },
      { label: "Estimate backlog size in bytes", detail: "225,000 × 2 KB = 450,000 KB ≈ 439 MB" }
    ],
    result: "≈ 225,000 messages (≈ 439 MB) currently backlogged",
    takeaway: "Oldest unacked message age is the most direct lag signal in Cloud Monitoring — pair it with throughput to estimate whether Dataflow needs more workers."
  },
  {
    id: "dataproc-preemptible-savings",
    title: "Dataproc Preemptible Mix Cost Savings",
    category: "Dataproc",
    scenario: "20 n1-standard-4 workers run a 2-hour Spark job. Regular rate: $0.19/hr/node. Preemptible rate: $0.057/hr/node (70% discount).",
    formula: "Cost = (Regular nodes × rate + Preemptible nodes × discounted rate) × hours",
    steps: [
      { label: "All-regular baseline", detail: "20 × $0.19 × 2 hrs = $7.60" },
      { label: "50/50 mix cost", detail: "(10 × $0.19 + 10 × $0.057) × 2 hrs = ($1.90 + $0.57) × 2 = $4.94" },
      { label: "25/75 mix cost", detail: "(5 × $0.19 + 15 × $0.057) × 2 hrs = ($0.95 + $0.855) × 2 = $3.61" },
      { label: "Savings at 25/75 mix", detail: "($7.60 − $3.61) ÷ $7.60 = 52.5% savings" }
    ],
    result: "50/50 mix: $4.94 (35% savings) — 25/75 mix: $3.61 (53% savings)",
    takeaway: "Keep primary (regular) workers for the driver and stateful tasks; push parallelizable executors to preemptible secondary workers — Spark retries evicted tasks automatically."
  },
  {
    id: "dataproc-ephemeral-vs-fixed",
    title: "Ephemeral vs Always-On Dataproc Cluster",
    category: "Dataproc",
    scenario: "A daily 2-hour Spark job runs on 20 workers. Compare an always-on cluster vs an ephemeral (create-run-delete) cluster.",
    formula: "Always-on cost = Workers × rate × 24 hrs; Ephemeral cost = Workers × rate × job duration",
    steps: [
      { label: "Always-on daily cost", detail: "20 × $0.19 × 24 hrs = $91.20/day" },
      { label: "Ephemeral daily cost", detail: "20 × $0.19 × 2 hrs = $7.60/day" },
      { label: "Monthly comparison", detail: "$91.20 × 30 = $2,736/month vs $7.60 × 30 = $228/month" },
      { label: "Savings", detail: "($2,736 − $228) ÷ $2,736 = 91.7% savings" }
    ],
    result: "Ephemeral clusters save ≈ 92% for a job that only runs 2 hrs/day",
    takeaway: "Always prefer ephemeral (workflow template or job-scoped) clusters for scheduled batch jobs — an always-on cluster only makes sense if utilization exceeds ~80% of the day."
  },
  {
    id: "spanner-node-capacity",
    title: "Cloud Spanner Node Capacity Planning",
    category: "Spanner",
    scenario: "Your application needs to sustain 45,000 QPS with sub-10ms latency.",
    formula: "Nodes needed = Required QPS ÷ QPS per node (≈7,000)",
    steps: [
      { label: "Divide required QPS by per-node capacity", detail: "45,000 ÷ 7,000 = 6.43 → round up to 7 nodes" },
      { label: "Check regional minimum", detail: "7 nodes > 3-node minimum, so no adjustment needed" },
      { label: "Monthly cost", detail: "7 nodes × $0.90/hr × 730 hrs = $4,599/month" }
    ],
    result: "7 nodes required, costing ≈ $4,599/month (regional)",
    takeaway: "7,000 QPS/node is a planning heuristic, not a hard guarantee — actual capacity depends on row size, hotspotting, and read/write mix; load test before committing to a node count."
  },
  {
    id: "spanner-multiregion-cost",
    title: "Spanner Regional vs Multi-Region Cost",
    category: "Spanner",
    scenario: "Compare a 3-node regional instance to a 5-node multi-region instance (minimum for multi-region HA).",
    formula: "Monthly cost = Nodes × $0.90/hr × 730 hrs",
    steps: [
      { label: "Regional (3 nodes)", detail: "3 × $0.90 × 730 = $1,971/month" },
      { label: "Multi-region (5 nodes)", detail: "5 × $0.90 × 730 = $3,285/month" },
      { label: "Cost difference", detail: "$3,285 − $1,971 = $1,314/month premium (67% more)" }
    ],
    result: "Multi-region costs $1,314/month more than regional for the minimum viable configuration",
    takeaway: "Only pay the multi-region premium when you have a genuine cross-region strong-consistency or regional-failover requirement — otherwise regional + read replicas is cheaper."
  },
  {
    id: "transfer-time-bandwidth",
    title: "Data Migration Transfer Time",
    category: "Data Ingestion",
    scenario: "Migrating 50 TB from on-prem to Cloud Storage over a 1 Gbps dedicated link.",
    formula: "Transfer time (sec) = Data size (MB) ÷ Bandwidth (MB/sec)",
    steps: [
      { label: "Convert link speed to MB/sec", detail: "1 Gbps ÷ 8 = 125 MB/sec (theoretical max)" },
      { label: "Convert data size to MB", detail: "50 TB = 50,000,000 MB" },
      { label: "Compute transfer time", detail: "50,000,000 ÷ 125 = 400,000 seconds" },
      { label: "Convert to days", detail: "400,000 ÷ 86,400 = 4.63 days" }
    ],
    result: "≈ 4.6 days at theoretical maximum throughput (real-world: plan for 6-8 days with overhead)",
    takeaway: "Above ~10-20 TB with limited bandwidth, compare against a Transfer Appliance ($300/week) — physical shipping often beats network transfer once you factor in real-world throughput of 60-80% of link capacity."
  },
  {
    id: "egress-cost",
    title: "Cloud Storage Egress Cost Comparison",
    category: "Cloud Storage",
    scenario: "A service needs to export 10 TB per month. Compare keeping it in GCP vs downloading to on-prem.",
    formula: "Egress cost = GB transferred × $0.12/GB (internet egress)",
    steps: [
      { label: "Convert TB to GB", detail: "10 TB = 10,240 GB" },
      { label: "Apply egress rate", detail: "10,240 GB × $0.12/GB = $1,228.80/month" },
      { label: "Compare to intra-GCP", detail: "Same transfer to BigQuery/Compute Engine within GCP = $0" }
    ],
    result: "$1,228.80/month if leaving GCP vs $0 if staying within GCP",
    takeaway: "Architect pipelines to keep processing inside GCP end-to-end; only export final, minimized result sets (e.g. a 1 GB report instead of a 10 TB raw dataset) to control egress costs."
  }
];
