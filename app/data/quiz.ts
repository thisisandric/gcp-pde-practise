export interface QuizQuestion {
  id: number;
  question: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  options: Array<{ text: string; correct: boolean }>;
  explanation: string;
  bestPractice: string;
  references: string[];
}

export interface Reference {
  id: string;
  title: string;
  category: string;
  content: string;
  keyPoints: string[];
  externalLink?: string;
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "Your company runs ad-hoc SQL queries on a 500 TB dataset stored in BigQuery. Query patterns are unpredictable (sometimes 1 query/hour, sometimes 50 queries/hour). What pricing model minimizes monthly costs for this workload?",
    topic: "BigQuery",
    difficulty: "medium",
    options: [
      { text: "BigQuery Slots (100 slots) to ensure consistent performance", correct: false },
      { text: "On-demand pricing with partition and column pruning", correct: true },
      { text: "Dataproc cluster to run Spark SQL instead", correct: false },
      { text: "Cloud Storage to archive data and reduce BigQuery storage", correct: false }
    ],
    explanation: "For unpredictable workloads, on-demand pricing wins. Slots are fixed-cost regardless of usage, so they're wasteful when query frequency varies. With proper optimization (partitioning by date, clustering on key columns, selecting only needed columns), on-demand scales with actual usage.",
    bestPractice: "Switch to slot-based pricing only when monthly on-demand spend consistently exceeds ~$2,400/month for sustained workloads.",
    references: ["bq-pricing-model", "bq-slots-commitment", "bq-query-optimization"]
  },
  {
    id: 2,
    question: "You're optimizing a BigQuery query that currently scans 100 GB and costs $0.625. The table is partitioned by event_date (365 partitions) but NOT clustered. A query filters on event_date (last 7 days) AND product_id. What's the single best optimization to reduce bytes scanned?",
    topic: "BigQuery",
    difficulty: "medium",
    options: [
      { text: "Add clustering on product_id; this will reduce bytes by ~50%", correct: true },
      { text: "Create a materialized view; no bytes scanned on cache hit", correct: false },
      { text: "Load data into Bigtable instead; it's more efficient for filters", correct: false },
      { text: "Denormalize the table to avoid joins", correct: false }
    ],
    explanation: "The partition already eliminates 358/365 partitions (98% reduction). Clustering on product_id within those 7 partitions will further reduce scanned bytes by grouping related data, typically achieving 40-60% additional reduction.",
    bestPractice: "Use partitioning first (eliminates partitions), then cluster on high-cardinality filter columns. Together they can reduce costs by 95%+.",
    references: ["bq-partitioning", "bq-clustering", "bq-query-optimization"]
  },
  {
    id: 3,
    question: "A Dataflow streaming pipeline processes Pub/Sub messages. During peak hours, the backlog grows to 2 TB (~2000 seconds drain time at current throughput). Your target is <300 seconds. The pipeline currently uses 10 workers. What's the most cost-efficient solution?",
    topic: "Dataflow",
    difficulty: "hard",
    options: [
      { text: "Manually add 50 workers to meet the SLA", correct: false },
      { text: "Enable autoscaling with THROUGHPUT_BASED algorithm; let it scale up to meet backlog", correct: true },
      { text: "Reduce batch size from 1000 to 100 elements", correct: false },
      { text: "Switch to Cloud SQL for intermediate state management", correct: false }
    ],
    explanation: "THROUGHPUT_BASED autoscaling monitors backlog and automatically scales workers. It'll calculate: need ~65 workers to drain 2TB in 300 seconds, so scale up. Once peak passes, it scales back down automatically.",
    bestPractice: "Use --autoscaling_algorithm=THROUGHPUT_BASED for streaming, set --max_num_workers to cap costs, start with --num_workers=2.",
    references: ["dataflow-autoscaling", "dataflow-streaming", "dataflow-performance"]
  },
  {
    id: 4,
    question: "You're designing a real-time analytics pipeline: Pub/Sub → Dataflow → BigQuery. Expected throughput is 100K messages/sec, each 5 KB. Latency SLA is <10 seconds end-to-end. Which is your PRIMARY concern for latency?",
    topic: "Dataflow",
    difficulty: "hard",
    options: [
      { text: "Dataflow worker CPU utilization (aim for <75%)", correct: false },
      { text: "Dataflow windowing strategy and trigger configuration", correct: true },
      { text: "BigQuery slot reservation (must have >100 slots)", correct: false },
      { text: "Pub/Sub subscription ack deadline (should be ≥60 seconds)", correct: false }
    ],
    explanation: "At 100K msg/sec, the primary latency knob is windowing and triggers in Dataflow. If you use tumbling windows of 60 seconds but only emit on window close, you add 60 seconds latency immediately.",
    bestPractice: "For low-latency streaming, use EARLY triggers (speculative output) before window closes, not just ON_TIME triggers.",
    references: ["dataflow-windowing", "dataflow-triggers", "streaming-latency"]
  },
  {
    id: 5,
    question: "Your team uses Cloud Storage (Standard class) for a 100 GB data lake. Most data is queried in the first month, then rarely accessed for 7+ years (compliance requirement). What lifecycle policy minimizes annual storage cost?",
    topic: "Cloud Storage",
    difficulty: "easy",
    options: [
      { text: "Standard throughout (no change)", correct: false },
      { text: "Standard → Nearline after 30 days → Coldline after 90 days → Archive after 1 year", correct: true },
      { text: "Delete after 7 years (violates compliance)", correct: false },
      { text: "Nearline from day 1 (too much retrieval latency)", correct: false }
    ],
    explanation: "Lifecycle policies are free and automatic. This tiering saves ~95% on long-term compliance storage by using Archive class ($0.0012/GB/month vs $0.02/GB/month).",
    bestPractice: "Always implement lifecycle policies for compliance archives: Standard (hot) → Nearline (warm) → Coldline → Archive (cold).",
    references: ["gcs-storage-classes", "gcs-lifecycle", "gcs-cost-optimization"]
  },
  {
    id: 6,
    question: "A Dataproc cluster runs a 2-hour Spark ML job. You have 20 n1-standard-4 machines (static). How would you reduce monthly costs by 70% for this workload without sacrificing job reliability?",
    topic: "Dataproc",
    difficulty: "medium",
    options: [
      { text: "Replace 10 workers with preemptible instances (save $0.19→$0.057/vcpu/hr)", correct: true },
      { text: "Downsize to n1-standard-2 (half the vCPU)", correct: false },
      { text: "Run the job only once per week instead of daily", correct: false },
      { text: "Use Dataflow instead of Dataproc", correct: false }
    ],
    explanation: "Preemptible VMs cost ~70% less but can be terminated anytime. For batch ML jobs that can resume (Spark + HDFS checkpoint), mix regular + preemptible: 10 regular + 10 preemptible.",
    bestPractice: "Use 50/50 mix of regular + preemptible workers for Dataproc batch jobs.",
    references: ["dataproc-preemptible", "dataproc-cost", "dataproc-config"]
  },
  {
    id: 7,
    question: "You're building a user-facing transactional system (e-commerce payments, inventory). Traffic is global (US, EU, APAC). Strong consistency is mandatory. Which database solution is best?",
    topic: "Cloud SQL & Spanner",
    difficulty: "medium",
    options: [
      { text: "Cloud SQL with read replicas in each region", correct: false },
      { text: "Cloud Spanner (multi-region) with strong external consistency", correct: true },
      { text: "Firestore with eventual consistency", correct: false },
      { text: "BigQuery with streaming inserts", correct: false }
    ],
    explanation: "Spanner offers strong external consistency globally (all clients see committed data instantly), horizontal scaling, and automatic failover. Cloud SQL replicas provide eventual consistency—risky for payments.",
    bestPractice: "Spanner is expensive but necessary for: global strong consistency, >100K QPS, multi-region transactions.",
    references: ["spanner-consistency", "spanner-architecture", "transactional-db"]
  },
  {
    id: 8,
    question: "A Pub/Sub topic receives 500 messages/sec on average. The topic has a single subscription with 50 subscribers pulling concurrently. Throughput feels bottlenecked during spikes (1000 msg/sec). What's the root cause?",
    topic: "Pub/Sub",
    difficulty: "hard",
    options: [
      { text: "Subscription quota (default 1K msg/sec per topic) is the hard limit", correct: true },
      { text: "50 subscribers is too many; reduce to 10", correct: false },
      { text: "Message size is too large; compress to <1 KB", correct: false },
      { text: "Pub/Sub pricing is throttling throughput", correct: false }
    ],
    explanation: "Pub/Sub's default quota is 1,000 messages/sec per topic. At 1000 msg/sec spikes, you're hitting the hard limit. Fix: request a quota increase from Google Cloud Console (free, just administratively gated).",
    bestPractice: "Request quota increases proactively. For high-throughput topics (10K+ msg/sec), contact Google in advance.",
    references: ["pubsub-quota", "pubsub-scaling", "pubsub-throughput"]
  },
  {
    id: 9,
    question: "Your data pipeline ingests 500 GB daily via Cloud Data Transfer Service into Cloud Storage, then loads into BigQuery nightly. What is the cost of the data transfer step?",
    topic: "Data Ingestion",
    difficulty: "easy",
    options: [
      { text: "FREE for intra-GCP transfers (DTS only charges if data leaves GCP)", correct: true },
      { text: "$0.02/GB (standard egress rate)", correct: false },
      { text: "$0.12/GB (internet egress rate)", correct: false },
      { text: "Depends on source (on-prem = $0.02/GB, AWS = $0.10/GB)", correct: false }
    ],
    explanation: "Cloud Data Transfer Service is a managed Google product. Intra-GCP transfers are FREE. You only pay for storage (GCS) and query (BigQuery).",
    bestPractice: "Use DTS for one-time or scheduled imports from on-prem / third-party cloud. No transfer fee within GCP.",
    references: ["dts-overview", "data-transfer-cost", "gcs-egress"]
  },
  {
    id: 10,
    question: "You're designing a data warehouse. Expected query patterns: mostly OLAP (complex joins on 100 TB+), but 5% are OLTP transactions (single-row reads/writes at 1000 QPS). Should you use one BigQuery dataset for both or split?",
    topic: "Architecture",
    difficulty: "hard",
    options: [
      { text: "Single BigQuery dataset; BigQuery handles both patterns equally well", correct: false },
      { text: "Split: OLAP queries → BigQuery, OLTP transactions → Cloud Spanner or Cloud SQL", correct: true },
      { text: "Single Bigtable for everything; it's optimized for row-key access", correct: false },
      { text: "Use Firestore for OLTP and BigQuery for OLAP (overly complex)", correct: false }
    ],
    explanation: "BigQuery excels at OLAP (scans millions of rows, performs aggregations). Single-row OLTP transactions cause slowness because BigQuery's columnar architecture is mismatched.",
    bestPractice: "Never use a data warehouse for transactional reads/writes. Use a transactional DB (Spanner, Cloud SQL) as the source, replicate to BigQuery for analytics.",
    references: ["olap-oltp", "warehouse-design", "service-selection"]
  },
  {
    id: 11,
    question: "A BigQuery table holds 1 TB. Monthly costs are $20 (storage) + $100 (queries). You partition by date and cluster by user_id. Partition pruning removes 80% of scanned bytes; clustering removes 50% of what remains. What is the new monthly cost?",
    topic: "BigQuery",
    difficulty: "medium",
    options: [
      { text: "$20 storage + $10 queries (queries reduced 90%)", correct: true },
      { text: "$20 storage + $30 queries (only partition pruning applies)", correct: false },
      { text: "$10 storage + $50 queries (compression reduces storage)", correct: false },
      { text: "$0 (optimization is free)", correct: false }
    ],
    explanation: "Storage cost is unchanged at $20 — partitioning and clustering reorganize data but do not compress it. Query cost: $100 × 20% remaining after pruning = $20, then × 50% remaining after clustering = $10. New total is $30/month, of which queries are $10.",
    bestPractice: "Partition first to eliminate whole partitions, then cluster on high-cardinality filter columns. The reductions multiply rather than add.",
    references: ["bq-partitioning", "bq-clustering", "bq-query-optimization"]
  },
  {
    id: 12,
    question: "Compliance requires all data encrypted at rest with customer-managed keys (CMEK) via Cloud KMS across BigQuery, Dataflow, and Cloud Storage. What is the realistic additional cost and performance overhead?",
    topic: "Security",
    difficulty: "medium",
    options: [
      { text: "About $0.06 per key version per month plus minor API charges; negligible performance impact", correct: true },
      { text: "CMEK adds 10-20% query latency in BigQuery due to cipher overhead", correct: false },
      { text: "CMEK forces Dataflow workers to re-authenticate, adding significant autoscaling latency", correct: false },
      { text: "CMEK is free because Google-managed encryption is always included", correct: false }
    ],
    explanation: "Cloud KMS charges roughly $0.06 per active key version per month plus a small per-operation fee. Encryption and decryption are handled transparently with cached key material, so measurable query and pipeline latency impact is negligible. Google-managed encryption is free, but CMEK specifically requires KMS keys that you pay for.",
    bestPractice: "Enable CMEK where compliance requires key ownership, and define a rotation policy. Budget for KMS key and operation charges, not for performance loss.",
    references: ["cmek-encryption"]
  },
  {
    id: 13,
    question: "You are migrating a 50 TB PostgreSQL database to Google Cloud over a 1 Gbps link (125 MB/sec). Roughly how long does the initial full transfer take at theoretical maximum throughput?",
    topic: "Data Ingestion",
    difficulty: "medium",
    options: [
      { text: "About 111 hours (roughly 4.6 days), then ongoing change replication", correct: true },
      { text: "About 10 minutes, since Database Migration Service is heavily optimized", correct: false },
      { text: "About 1 hour using 10 parallel tunnels", correct: false },
      { text: "At least 7 days, because DMS throttles all transfers", correct: false }
    ],
    explanation: "50 TB is 50,000,000 MB. At 125 MB/sec that is 400,000 seconds, or about 111 hours (4.6 days). Parallel streams cannot exceed the 1 Gbps link, which is the binding constraint. Plan for longer in practice, since real throughput is typically 60-80% of link capacity.",
    bestPractice: "Above roughly 10-20 TB on a constrained link, compare against Transfer Appliance — physical shipping often wins once real-world throughput is factored in.",
    references: ["data-transfer-cost", "dts-overview"]
  },
  {
    id: 14,
    question: "A BigQuery job fails with a per-query resources-exceeded error on a large JOIN. You run on a reservation with 10 slots. What is the most direct fix?",
    topic: "BigQuery",
    difficulty: "hard",
    options: [
      { text: "Increase the reservation size so the query has more slots and memory available", correct: true },
      { text: "Switch to on-demand pricing, which has no per-query resource limits", correct: false },
      { text: "Add more JOIN keys so the optimizer partitions work differently", correct: false },
      { text: "Convert the table to an external table to bypass slot limits", correct: false }
    ],
    explanation: "Memory-intensive stages scale with available slots, so a larger reservation gives the query more capacity to complete. On-demand also enforces per-query resource limits, so switching pricing models does not remove the ceiling. Rewriting the query to reduce shuffle and aggregate earlier is the other valid lever, but adding arbitrary JOIN keys is not.",
    bestPractice: "Monitor INFORMATION_SCHEMA.JOBS_BY_PROJECT for slot consumption, and use autoscale reservations or short-lived capacity for occasional heavy queries rather than permanently oversizing.",
    references: ["bq-slots-commitment", "bq-query-optimization"]
  },
  {
    id: 15,
    question: "A pipeline is user click to Pub/Sub to Dataflow to Firestore, with an under 500 ms end-to-end SLA. Measured component times are 50 ms, 100 ms, and 200 ms respectively. Will you meet the SLA?",
    topic: "Architecture",
    difficulty: "medium",
    options: [
      { text: "No — component times sum to 350 ms, but publish, queuing, and bundling overhead typically push the total past 500 ms", correct: true },
      { text: "Yes — 350 ms leaves comfortable margin under 500 ms", correct: false },
      { text: "Yes — Firestore guarantees sub-500 ms end to end", correct: false },
      { text: "No — Pub/Sub alone always exceeds 500 ms", correct: false }
    ],
    explanation: "Summing component times gives 350 ms, but that ignores publish round-trip, network queuing, Dataflow bundling and commit, and acknowledgement overhead, which commonly add 150-300 ms. The realistic total sits near or above 500 ms, so the SLA is at risk without tuning windowing, triggers, and write batching.",
    bestPractice: "Always budget 150-300 ms for queuing, network, and bundling overhead. Validate against measured p95 and p99, not the sum of average component times.",
    references: ["streaming-latency", "service-selection"]
  },
  {
    id: 16,
    question: "You want alerting when overall project spend crosses a threshold, without building custom tooling. What is the correct GCP mechanism?",
    topic: "Cost Optimization",
    difficulty: "easy",
    options: [
      { text: "Cloud Billing budgets and alerts, optionally routed to Pub/Sub for automation", correct: true },
      { text: "Cloud Monitoring alerts, which include billing metrics by default", correct: false },
      { text: "A scheduled INFORMATION_SCHEMA query plus Cloud Functions", correct: false },
      { text: "Per-query maximum_bytes_billed settings", correct: false }
    ],
    explanation: "Cloud Billing budgets let you set an amount and threshold rules that send email notifications, and can publish to a Pub/Sub topic for programmatic response. Budget alerts notify you but do not cap spend on their own. INFORMATION_SCHEMA queries are useful for per-query BigQuery attribution, but they are custom tooling rather than the built-in mechanism.",
    bestPractice: "Set budget thresholds at 50%, 90%, and 100%, and route to Pub/Sub if you want automated responses. Pair with maximum_bytes_billed for hard per-query limits.",
    references: ["bq-cost-controls"]
  },
  {
    id: 17,
    question: "A business team needs BigQuery access, but you must prevent accidental full-table scans from generating runaway cost. What is the most effective guard?",
    topic: "Security",
    difficulty: "medium",
    options: [
      { text: "Set maximum_bytes_billed so oversized queries fail instead of running", correct: true },
      { text: "Grant only the Data Viewer IAM role, which blocks expensive queries", correct: false },
      { text: "Rely on Cloud Billing budget alerts to stop the queries", correct: false },
      { text: "Enable a reservation, which automatically caps per-query bytes", correct: false }
    ],
    explanation: "maximum_bytes_billed causes a query to fail immediately if it would scan more than the limit, so no cost is incurred. IAM roles govern access, not scan volume. Budget alerts notify after the fact without stopping the query. Reservations cap slot capacity, which affects speed rather than bytes scanned.",
    bestPractice: "Set maximum_bytes_billed as a default at the session or project level for exploratory users, and combine with authorized views that expose only pruned, clustered data.",
    references: ["bq-cost-controls", "bq-query-optimization"]
  },
  {
    id: 18,
    question: "Ten TB of Parquet lands daily in Cloud Storage and is moved to BigQuery by a 20-worker Dataflow job costing about $2,000/month. No transformation is applied beyond format handling. What happens if you switch to native BigQuery load jobs?",
    topic: "Cost Optimization",
    difficulty: "hard",
    options: [
      { text: "Cost drops sharply, because batch load jobs from Cloud Storage are free and the Dataflow compute disappears", correct: true },
      { text: "Cost rises, because BigQuery charges scan rates on loaded data", correct: false },
      { text: "Cost is unchanged, since load jobs are billed equivalently to Dataflow", correct: false },
      { text: "Cost rises about 25% due to load-job overhead", correct: false }
    ],
    explanation: "BigQuery batch load jobs from Cloud Storage do not consume query slots and are not billed per byte loaded, so the roughly $1,500-2,000/month of Dataflow worker time is eliminated. You continue paying for storage and for the queries you actually run. Dataflow remains the right tool only when genuine transformation, enrichment, or streaming semantics are required.",
    bestPractice: "Use native load jobs for straight ingestion of supported formats. Reserve Dataflow for real transformation logic, streaming windows, or joins that cannot be expressed as a load plus SQL.",
    references: ["bq-query-optimization", "service-selection", "dataflow-performance"]
  },
  {
    id: 19,
    question: "A financial institution needs long-retention audit logs of all data access. What is accurate about Cloud Audit Logs in this context?",
    topic: "Compliance",
    difficulty: "hard",
    options: [
      { text: "Data Access logs must be explicitly enabled, are billable at volume, and are best exported to Cloud Storage or BigQuery for long retention", correct: true },
      { text: "Audit logging cannot be combined with CMEK-encrypted resources", correct: false },
      { text: "All audit logs are retained for 7 years by default at no cost", correct: false },
      { text: "Admin Activity and Data Access logs are both disabled by default", correct: false }
    ],
    explanation: "Admin Activity logs are always on and free. Data Access logs are off by default for most services, must be enabled, and generate significant billable volume once retained beyond the free bucket retention. For multi-year compliance retention, export via a log sink to Cloud Storage (Coldline or Archive) or to BigQuery for queryability. Audit logging works normally alongside CMEK-encrypted resources.",
    bestPractice: "Enable Data Access logs only on the services that require them, then sink to Archive-class Cloud Storage for cheap multi-year retention with a locked retention policy.",
    references: ["audit-logging", "cmek-encryption", "gcs-storage-classes"]
  },
  {
    id: 20,
    question: "A Dataflow pipeline handling 1M messages/day costs $1,200/month. An architect proposes Cloud Tasks plus Cloud Run for about $50/month. What is the real trade-off?",
    topic: "Architecture",
    difficulty: "hard",
    options: [
      { text: "At only about 11 messages/sec the cheaper stack fits, but it gives up windowing, aggregation, and backpressure handling that Dataflow provides", correct: true },
      { text: "Cloud Run cannot exceed 10K requests/sec, whereas Dataflow scales past 100K", correct: false },
      { text: "Cloud Tasks does not durably persist messages, unlike Dataflow", correct: false },
      { text: "There is no trade-off — migrate immediately and save $1,150/month", correct: false }
    ],
    explanation: "One million messages per day averages roughly 11 per second, which a request-driven stack handles easily and far more cheaply. What you lose is Dataflow's streaming model: event-time windowing, stateful aggregation, watermarks and late data handling, exactly-once sink semantics, and automatic backpressure. If the workload is stateless per-message processing, the migration is sound; if it aggregates over time windows, it is not.",
    bestPractice: "Choose by workload shape, not headline price. Stateless per-event work suits Cloud Run and Cloud Tasks; windowed, stateful, or ordering-sensitive streaming belongs in Dataflow.",
    references: ["service-selection", "dataflow-streaming"]
  },
  {
    id: 21,
    question: "You store IoT telemetry in Bigtable with row key format `<timestamp>#<device_id>` so recent readings are easy to scan. With 2 million devices producing a combined 50,000 writes/sec, monitoring shows one tablet server absorbing nearly all write traffic while the rest sit idle. What row key change fixes this?",
    topic: "Bigtable",
    difficulty: "hard",
    options: [
      { text: "Add more nodes to the cluster so load spreads across more tablet servers", correct: false },
      { text: "Swap the key order to `<device_id>#<reversed_timestamp>`, so writes distribute across the spread of device_id values while keeping recent-first ordering per device", correct: true },
      { text: "Merge all columns into a single column family to reduce per-write I/O overhead", correct: false },
      { text: "Add a secondary index on device_id so lookups don't rely on the row key prefix", correct: false }
    ],
    explanation: "Bigtable row keys are stored in lexicographic order and sharded into contiguous key ranges (tablets). Leading the key with a timestamp means nearly every concurrent write shares an almost-identical, always-increasing prefix, so they all land in the same tablet range — a classic hotspot. Prefixing with a high-cardinality, evenly distributed field like device_id spreads writes across tablets; inverting the timestamp keeps per-device reads recent-first without leading with a monotonic value. Adding nodes doesn't help because tablet assignment is key-range based, not round-robin, and Bigtable has no secondary indexes.",
    bestPractice: "Never lead a Bigtable row key with a monotonically increasing value (timestamp, auto-increment ID); prefix with a well-distributed field and invert time components only as a suffix.",
    references: ["bigtable-rowkey-design"]
  },
  {
    id: 22,
    question: "A gaming backend stores per-player state (health, position, inventory) for 5 million concurrent players, with a combined peak of 200,000 single-row writes/sec and reads by player_id requiring single-digit-millisecond latency. There are no SQL joins, no multi-row transactions, and no analytical queries against this data. Which design best fits?",
    topic: "Bigtable",
    difficulty: "medium",
    options: [
      { text: "Cloud Spanner, with a single table and a global secondary index on player_id", correct: false },
      { text: "Bigtable, one row per player, with column families grouping related attributes (e.g., 'state', 'inventory') for efficient partial reads", correct: true },
      { text: "Firestore in Datastore mode, relying on automatic scaling to absorb the write rate", correct: false },
      { text: "BigQuery with streaming inserts, queried by player_id for each request", correct: false }
    ],
    explanation: "Bigtable is purpose-built for exactly this profile: massive single-key point lookups/writes at sub-10ms latency with linear scaling by adding nodes. Grouping related columns into column families lets a read of the 'state' family skip unrelated 'inventory' columns, cutting I/O. Spanner's relational engine and global consistency add cost and latency this workload doesn't need since there are no joins or multi-row transactions. Firestore's practical sustained throughput per database is well below 200,000 writes/sec. BigQuery is a columnar analytical warehouse, not a low-latency point-lookup serving layer.",
    bestPractice: "Use Bigtable for high-throughput single-key serving workloads, and design column families around which columns are read or written together to avoid pulling unrelated data on every request.",
    references: ["bigtable-service-selection", "service-selection"]
  },
  {
    id: 23,
    question: "Your nightly workflow must: (1) trigger a Dataflow batch job to transform raw logs, (2) wait for it to finish, (3) load results via a Dataproc Spark job, then (4) run downstream SQL transformations — with per-step retries, failure alerting, and the ability to backfill any single past day on demand. Which orchestration approach fits best?",
    topic: "Cloud Composer",
    difficulty: "medium",
    options: [
      { text: "Cloud Composer (managed Airflow), modeling the steps as a DAG with task dependencies, sensors, and per-task retry policies", correct: true },
      { text: "Cloud Scheduler triggering each job independently via Pub/Sub, with no cross-step dependency tracking", correct: false },
      { text: "Dataform alone, since it can also launch and monitor Dataflow and Dataproc jobs", correct: false },
      { text: "Cloud Workflows, since it avoids the operational overhead of running a Composer environment", correct: false }
    ],
    explanation: "Composer is the standard fit for complex, multi-system batch DAGs: it models task dependencies explicitly, provides sensors to wait on external job completion, per-task retry policies, a monitoring UI, and built-in backfill for arbitrary past execution dates. Cloud Scheduler firing jobs independently has no concept of 'wait for step 1 before step 2.' Dataform only orchestrates SQL/BigQuery-native transformations, not general Dataflow or Dataproc jobs. Cloud Workflows is a valid lightweight serverless orchestrator for a handful of API calls, but it lacks native backfill and the rich sensor/retry/DAG-visualization ecosystem needed for a multi-system nightly pipeline like this.",
    bestPractice: "Reach for Composer/Airflow when a pipeline spans multiple compute systems and needs sensors, retries, and backfill; reserve Cloud Workflows for simpler sequential orchestration of a few service calls.",
    references: ["composer-orchestration", "dataform-elt"]
  },
  {
    id: 24,
    question: "Your organization has 200+ BigQuery datasets across 15 teams. Auditors need to answer 'which pipeline produced this table, and what upstream sources feed it' within minutes, and data stewards need to tag PII columns for governance without editing every ETL job. Which approach satisfies both needs?",
    topic: "Data Catalog & Lineage",
    difficulty: "medium",
    options: [
      { text: "Dataplex/Data Catalog for searchable metadata and column-level PII tagging, combined with automatic lineage tracking across BigQuery, Dataflow, and Composer-orchestrated pipelines", correct: true },
      { text: "INFORMATION_SCHEMA queries against BigQuery job history, since it contains full cross-system lineage", correct: false },
      { text: "A manually maintained spreadsheet mapping table owners and upstream sources, updated whenever a pipeline changes", correct: false },
      { text: "Cloud Audit Logs Data Access logs, since they record every table read and write", correct: false }
    ],
    explanation: "Dataplex, which incorporates Data Catalog, provides a governed metadata layer with searchable tags (including policy tags for column-level PII that integrate with BigQuery access controls) and automatic lineage capture for supported GCP sources, showing upstream/downstream relationships without touching pipeline code. INFORMATION_SCHEMA exposes query-level job metadata within BigQuery only, not a cross-system lineage graph or a tagging mechanism. Manual spreadsheets don't scale and drift stale immediately. Audit logs record access events, not structural derivation lineage or governance tags.",
    bestPractice: "Enable Dataplex/Data Catalog lineage and apply column-level policy tags for PII so governance is enforced by BigQuery access controls, not just documented.",
    references: ["data-catalog-lineage"]
  },
  {
    id: 25,
    question: "A fraud-detection model is trained daily in BigQuery ML using rolling 30-day aggregate features. The real-time scoring API recomputes the same aggregates on the fly to score transactions in under 50ms, and your team has traced recurring accuracy drops to the online and offline feature values diverging. What is the recommended fix using Vertex AI?",
    topic: "Vertex AI",
    difficulty: "hard",
    options: [
      { text: "Precompute the features once and publish them to Vertex AI Feature Store, so both training and low-latency online serving read identical feature values from a shared store", correct: true },
      { text: "Move all feature computation into the serving API and cache results in Memorystore per request", correct: false },
      { text: "Retrain the model every 5 minutes so features are always maximally fresh", correct: false },
      { text: "Serve predictions directly from BigQuery ML using streaming inserts for the online path", correct: false }
    ],
    explanation: "Vertex AI Feature Store centralizes feature computation: an offline store serves point-in-time-correct historical values for training, and an online store serves the identical precomputed values with low latency for real-time scoring. This eliminates training/serving skew caused by two separate code paths computing 'the same' aggregate differently. Recomputing in the serving API duplicates and risks diverging from the training logic. More frequent retraining doesn't address a feature-computation mismatch. BigQuery is not designed to deliver consistent sub-50ms single-row serving latency.",
    bestPractice: "Compute each feature once, register it in Vertex AI Feature Store, and serve the same values to both training and online inference to remove skew and meet latency SLAs.",
    references: ["vertex-ai-feature-store"]
  },
  {
    id: 26,
    question: "You must classify 10 million product images into 500 categories. In-house ML engineers require full control over model architecture (a custom PyTorch model trained on A100 GPUs), and the only inference need is a nightly batch scoring run over 5 million new images — no real-time serving. What is the most cost-effective Vertex AI approach?",
    topic: "Vertex AI",
    difficulty: "hard",
    options: [
      { text: "Vertex AI custom training on A100 GPUs, then Vertex AI Batch Prediction to score images nightly, with no persistently deployed endpoint", correct: true },
      { text: "Vertex AI AutoML Image Classification, since it removes infrastructure management and always outperforms hand-built models", correct: false },
      { text: "Deploy the trained model to a Vertex AI online endpoint with autoscaling, and invoke it 5 million times each night in a loop", correct: false },
      { text: "Train on a Vertex AI Workbench notebook instance kept running continuously, then export the model to Cloud Run for inference", correct: false }
    ],
    explanation: "Custom training gives the architecture control the team explicitly wants (AutoML forecloses that, and doesn't guarantee outperforming a purpose-built model). Vertex AI Batch Prediction reads directly from Cloud Storage/BigQuery, scales out across distributed workers, and only incurs cost during the run. An online endpoint bills for provisioned serving nodes continuously and is built for low-latency request/response, not for grinding through 5 million images as one nightly batch. A permanently running notebook plus Cloud Run adds idle notebook cost and isn't optimized for GPU batch throughput at this scale.",
    bestPractice: "Match the Vertex AI serving mode to the access pattern: online endpoints for low-latency request/response, batch prediction for large offline scoring jobs, so you never pay for idle serving capacity.",
    references: ["vertex-ai-training-deployment"]
  },
  {
    id: 27,
    question: "A team currently uses Dataflow to extract, transform, and load data into BigQuery, but every transformation is pure SQL — joins, window functions, aggregations, no external API calls or non-SQL logic. Stakeholders now want version-controlled SQL, an automatic dependency graph, and built-in data quality tests. What architecture change is recommended?",
    topic: "Dataform",
    difficulty: "medium",
    options: [
      { text: "Load raw data into BigQuery with simple load jobs (EL), then use Dataform to run in-warehouse SQL transformations (T) with automatic dependency management and built-in assertions", correct: true },
      { text: "Keep Dataflow, since only Beam pipelines support production-grade retries", correct: false },
      { text: "Move the transformations into Cloud Composer PythonOperators executing raw SQL strings", correct: false },
      { text: "Replace the pipeline with Cloud Data Fusion for a no-code visual ETL pipeline", correct: false }
    ],
    explanation: "When every transformation is expressible in SQL against data already destined for BigQuery, ELT with Dataform fits better than Dataflow: it version-controls SQL, builds a dependency DAG automatically from ref() calls between models, and supports built-in assertions (uniqueness, not-null, custom checks) — exactly what's being requested. Dataflow adds unneeded operational cost for logic with no streaming, no external calls, and no non-SQL processing. Composer PythonOperators would require rebuilding dependency tracking and testing that Dataform already provides. Data Fusion targets no-code visual pipelines across heterogeneous sources, not lightweight in-warehouse SQL transformation with native testing.",
    bestPractice: "Use ELT with Dataform for pure SQL, in-warehouse BigQuery transformations that need dependency graphs and tests; keep Dataflow for logic that genuinely requires non-SQL processing, streaming, or work before data lands in the warehouse.",
    references: ["dataform-elt", "warehouse-design"]
  },
  {
    id: 28,
    question: "A Dataflow streaming pipeline aggregates revenue per 1-minute tumbling window from Pub/Sub and writes results to BigQuery. About 8% of mobile events arrive 2-5 minutes late. `allowedLateness` is currently 0, so late revenue is silently dropped. The business accepts a corrected total up to 10 minutes after window close but will not tolerate duplicate rows per window in BigQuery. What configuration achieves this?",
    topic: "Dataflow",
    difficulty: "hard",
    options: [
      { text: "Set allowedLateness to 10 minutes with accumulating trigger mode, and write to BigQuery via MERGE/UPSERT keyed by window start/end rather than plain append-only INSERT", correct: true },
      { text: "Set allowedLateness to 10 minutes, keep discarding mode, and use a plain streaming INSERT, relying on BigQuery to deduplicate matching rows", correct: false },
      { text: "Increase the window size to 15 minutes so the 2-5 minute late data always arrives before the window closes", correct: false },
      { text: "Set the watermark hold duration to 0 so late data bypasses the trigger and is processed immediately", correct: false }
    ],
    explanation: "With allowedLateness=10m and accumulating mode, Dataflow re-emits the full corrected total for a window (not just the delta) whenever late data arrives inside that window. Writing that corrected pane via MERGE/UPSERT keyed on the window boundaries replaces the prior row instead of appending a duplicate. Discarding mode only emits the incremental delta since the last pane, so it cannot produce a standalone corrected total, and BigQuery does not auto-deduplicate streamed rows. Widening the window doesn't guarantee arrival before close and adds latency to the 92% of on-time data. There is no watermark setting that bypasses triggering — the watermark is what triggers emission in the first place.",
    bestPractice: "For eventually-correct streaming aggregates, pair accumulating mode and allowedLateness with a MERGE/UPSERT sink keyed by window, never an append-only insert.",
    references: ["dataflow-windowing", "dataflow-triggers", "dataflow-exactly-once-watermarks"]
  },
  {
    id: 29,
    question: "A shared Pub/Sub topic ingests order events at 20,000 msg/sec from 40 microservices owned by different teams. A bad deploy from one producer team published malformed JSON, which repeatedly crashed 3 downstream Dataflow consumers until they were manually paused, causing a 45-minute outage. You must prevent one team's payload mistake from taking down shared consumers again, while remaining on Pub/Sub. What change addresses this most directly?",
    topic: "Pub/Sub",
    difficulty: "hard",
    options: [
      { text: "Enforce a Pub/Sub schema (Avro/Protobuf) on the topic to reject non-conforming messages at publish time, and configure each subscription's dead-letter policy to route unprocessable messages to a DLQ topic after a bounded number of delivery attempts", correct: true },
      { text: "Migrate to Google Cloud Managed Service for Apache Kafka, since Kafka natively prevents malformed messages from being published", correct: false },
      { text: "Increase each subscription's ack deadline so consumers have more time to process malformed messages", correct: false },
      { text: "Increase the subscription's message retention to 7 days so bad messages can be reprocessed later", correct: false }
    ],
    explanation: "A Pub/Sub schema rejects messages that don't conform to a registered Avro/Protobuf definition at publish time, stopping malformed payloads before any subscription ever sees them. A dead-letter policy then guarantees that any message a subscriber still can't process after a configured max delivery attempts is moved to a separate DLQ topic instead of being redelivered forever, which is exactly what caused the crash loop. Kafka doesn't solve this for free either — it needs an equivalent schema registry and dead-letter handling configured, and migrating doesn't address the immediate need to stay on Pub/Sub. Ack deadline governs processing time, not payload validity, and retention only affects how long messages remain available, not whether a crash loop occurs.",
    bestPractice: "Attach a schema to every shared Pub/Sub topic and configure a dead-letter topic with bounded max delivery attempts on every subscription, so bad payloads are rejected upfront and any message that still fails is quarantined rather than retried indefinitely.",
    references: ["pubsub-schema-dlq", "pubsub-quota"]
  },
  {
    id: 30,
    question: "An analyst ran an UPDATE with an unintended tautological WHERE clause 3 hours ago, overwriting all 400 million rows of an orders table. There is no explicit backup of this table. What is the fastest recovery option, and how long does it remain available by default if you take no special action?",
    topic: "BigQuery",
    difficulty: "medium",
    options: [
      { text: "Query the table with time travel (FOR SYSTEM_TIME AS OF) to read the pre-update state and restore it; time travel is available for up to 7 days by default", correct: true },
      { text: "Use fail-safe to instantly and directly query the pre-update rows; fail-safe is queryable for 7 days after time travel expires", correct: false },
      { text: "Recovery is impossible, since BigQuery does not retain historical row versions once a DML statement commits", correct: false },
      { text: "Restore from the nightly Cloud Storage export, accepting up to 24 hours of data loss", correct: false }
    ],
    explanation: "BigQuery retains historical table versions for time travel (default 7 days, configurable 2-7 days per dataset), so `SELECT * FROM orders FOR SYSTEM_TIME AS OF TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 3 HOUR)` can read the pre-update rows and be used to recreate the table with zero data loss. Fail-safe is a subsequent, non-queryable retention period intended only for Google-assisted recovery after time travel expires — you cannot self-service query it. Historical versions do exist, so recovery is possible. Restoring from a nightly export would work but loses more data and is slower than the precise point-in-time recovery time travel provides.",
    bestPractice: "Use time travel for self-service point-in-time recovery within the retention window, and take an explicit table snapshot before running risky multi-statement scripts or bulk DML for a longer-lived, cheap restore point.",
    references: ["bq-scripting-procedures"]
  },
  {
    id: 31,
    question: "Your company holds 200 TB of order events in AWS S3 and 50 TB already in BigQuery on GCP. Analysts need to run federated SQL joins across both without duplicating the S3 data into GCP, while minimizing cross-cloud egress. Governance also requires exposing a curated, access-controlled version of the combined data to a partner company without granting them direct access to your GCP project. Which combination fits?",
    topic: "BigQuery",
    difficulty: "hard",
    options: [
      { text: "BigQuery Omni to query the S3 data in place via BigLake tables (compute runs in AWS, avoiding egress for the query itself), then publish the curated result as a listing via Analytics Hub for the partner", correct: true },
      { text: "Copy all 200 TB from S3 to Cloud Storage, load it into native BigQuery tables, and share a service account key with the partner for direct table access", correct: false },
      { text: "Use BigQuery's EXTERNAL_QUERY function to query the S3 objects directly, since BigQuery can natively query any cloud object store without additional setup", correct: false },
      { text: "Set up Analytics Hub only, since it can execute cross-cloud queries natively without Omni or BigLake", correct: false }
    ],
    explanation: "BigQuery Omni runs the BigQuery engine in the source cloud region and queries S3 data in place through BigLake tables, avoiding both data duplication and egress for the query. Analytics Hub then publishes curated views as a data exchange listing that the partner subscribes to with controlled, revocable access — no shared credentials or direct project access required. Copying 200 TB defeats the stated goal of avoiding duplication and adds large storage/egress cost, and sharing a service account key is poor practice compared to Analytics Hub's managed sharing. Plain EXTERNAL_QUERY/external tables cannot reach into S3 without BigQuery Omni's cross-cloud engine, and Analytics Hub itself is a sharing layer, not a query execution engine.",
    bestPractice: "Use BigQuery Omni with BigLake for in-place, cross-cloud analytics without moving data, and use Analytics Hub to share curated datasets externally with fine-grained, revocable access instead of copying data or distributing credentials.",
    references: ["bq-omni-analytics-hub"]
  },
  {
    id: 32,
    question: "A healthcare analytics platform stores patient records in BigQuery. Requirements: (1) analysts must run aggregate queries but never see raw SSNs or full names, (2) a compromised analyst credential must not be able to exfiltrate data to a personal Cloud Storage bucket outside the organization, and (3) the security team, not Google, must be able to prove they can cryptographically destroy all data on demand. Which set of controls satisfies all three, correctly matched?",
    topic: "Security",
    difficulty: "hard",
    options: [
      { text: "Cloud DLP de-identification (tokenization/masking) on sensitive columns for requirement 1, a VPC Service Controls perimeter around the project for requirement 2, and CMEK via Cloud KMS for requirement 3", correct: true },
      { text: "CSEK for requirement 3 since it also allows instant cryptographic destruction, the IAM Data Viewer role alone for requirement 1, and firewall rules for requirement 2", correct: false },
      { text: "Column-level security (policy tags) alone satisfies all three requirements without DLP, VPC Service Controls, or CMEK", correct: false },
      { text: "CMEK for requirement 1, DLP for requirement 2, and VPC Service Controls for requirement 3", correct: false }
    ],
    explanation: "Each requirement maps to a distinct control. Cloud DLP de-identification tokenizes or masks SSNs/names so analysts see redacted values while aggregate queries over other columns still function. VPC Service Controls establishes a service perimeter that blocks data movement to resources outside it, such as a personal Cloud Storage bucket, even with valid credentials, which directly addresses exfiltration. CMEK via Cloud KMS lets the security team destroy a key version themselves, instantly rendering all CMEK-protected data unreadable independent of Google. CSEK isn't supported on BigQuery at all, so it cannot serve requirement 3 here; IAM roles alone don't mask column contents; policy tags govern column access but provide neither a network exfiltration boundary nor customer-held key destruction.",
    bestPractice: "Layer controls by the specific risk each addresses: DLP for content-level de-identification, VPC Service Controls for network/API exfiltration boundaries, and CMEK for customer-controlled cryptographic destruction — no single control covers all three.",
    references: ["security-dlp-vpcsc", "cmek-encryption"]
  }
];

export const references: Reference[] = [
  {
    id: "bq-pricing-model",
    title: "BigQuery Pricing Models",
    category: "BigQuery",
    content: `BigQuery offers two compute pricing models:

1. On-Demand Pricing ($6.25 per TiB scanned)
   - Best for: Unpredictable query patterns, low volume workloads
   - Pros: Pay only for what you scan, no commitment
   - Cons: Costs scale with query volume
   - First 1 TiB/month is free

2. Slot-Based (Capacity) Pricing
   - Standard: $0.04/slot/hour ($2,400/month per 100 slots)
   - Enterprise: $0.06/slot/hour ($3,600/month)
   - Enterprise Plus: $0.10/slot/hour ($6,000/month)
   - Flex Slots: $0.04/slot/hour, minimum 60 seconds
   - Best for: Sustained, predictable workloads
   - Pros: Predictable costs, isolated capacity
   - Cons: Fixed cost regardless of usage

Break-even Analysis:
- Switch to slots when monthly on-demand spend consistently exceeds ~$2,400/month
- Flex Slots ideal for temporary spikes without long-term commitment`,
    keyPoints: [
      "On-demand scales with usage, slots have fixed cost",
      "1 TiB/month free tier applies to on-demand only",
      "Slots provide cost predictability and performance isolation",
      "Break-even point: ~$2,400/month on-demand spend"
    ],
    externalLink: "https://cloud.google.com/bigquery/pricing"
  },
  {
    id: "bq-partitioning",
    title: "BigQuery Table Partitioning",
    category: "BigQuery",
    content: `Partitioning divides a table into segments based on a column value (typically a date).

Benefits:
- Reduces bytes scanned by 90-98% when filtering on partition column
- Reduces query cost proportionally (bytes scanned × $6.25)
- Improves query performance (fewer data blocks to scan)

Partition Types:
1. Time-based (DATE, TIMESTAMP): Most common
   - Automatic daily, hourly, monthly, yearly partitions
   
2. Integer-range based: For integer columns
   - Define start, end, interval (e.g., 0-100 by 10)

3. Ingestion-time: Based on when data is loaded

Best Practices:
- Always partition by date for time-series data
- Requires explicit date filter in queries for pruning to work
- Combine with clustering for additional optimization
- Example: WHERE event_date >= '2024-01-01' AND event_date < '2024-02-01'`,
    keyPoints: [
      "Typical partition pruning saves 80-95% of bytes",
      "Reduces query cost proportionally",
      "Date column is the most common partition key",
      "Filter queries MUST include partition column for pruning"
    ],
    externalLink: "https://cloud.google.com/bigquery/docs/partitioned-tables"
  },
  {
    id: "bq-clustering",
    title: "BigQuery Table Clustering",
    category: "BigQuery",
    content: `Clustering physically sorts data within partitions on specified columns, enabling faster filtering without increasing storage.

How It Works:
- Data sorted by cluster columns within each partition
- Blocks containing cluster key values are skipped during scans
- Reduces bytes scanned by 40-60% for filter queries

Cluster Key Selection:
- High-cardinality columns (user_id, product_id, region)
- Frequently filtered columns in WHERE clauses
- Columns used in GROUP BY operations
- Up to 4 columns can be clustered

Clustering vs Partitioning:
- Partitioning: Eliminates entire partitions (80-95% reduction)
- Clustering: Eliminates blocks within partitions (40-60% reduction)
- Layering both provides 95%+ cost reduction

Example Query:
  CREATE TABLE orders
  PARTITION BY DATE(order_date)
  CLUSTER BY customer_id, region
  AS SELECT * FROM raw_orders;

Performance Impact:
- Queries filter faster on cluster columns
- Materialized views benefit from clustering
- No performance penalty for non-clustered queries`,
    keyPoints: [
      "Clustering reduces bytes scanned within partitions",
      "Combine clustering WITH partitioning for maximum savings",
      "40-60% additional reduction when layered with partitioning",
      "High-cardinality filter columns are best for clustering"
    ],
    externalLink: "https://cloud.google.com/bigquery/docs/clustered-tables"
  },
  {
    id: "bq-query-optimization",
    title: "BigQuery Query Optimization Techniques",
    category: "BigQuery",
    content: `Strategies to reduce query costs and improve performance:

1. Column Projection (Select Only Needed Columns)
   - Scanning 10 columns uses 10× fewer bytes than SELECT *
   - Typical savings: 70-90% when selecting 1-2 columns from 20+
   
2. Avoid Unnecessary Operations
   - SELECT DISTINCT on large datasets causes full scan
   - Use approximate functions (APPROX_COUNT_DISTINCT) instead
   - Avoid SELECT * in subqueries

3. Use WHERE Clauses Effectively
   - Filter as early as possible in the query
   - Partition/cluster pruning requires explicit date filter
   - Bad: WHERE EXTRACT(YEAR FROM date) = 2024
   - Good: WHERE date >= '2024-01-01' AND date < '2025-01-01'

4. Join Optimization
   - Broadcast smaller table (< 1 GB): Use AS (table) in join hint
   - Join on INT/BIGINT columns (faster than strings)
   - Pre-aggregate large tables before joining

5. Materialized Views
   - Cache frequently computed aggregations
   - Automatic refresh (incremental updates)
   - Reduces repeated computation costs

6. Use INFORMATION_SCHEMA to Monitor Costs
   - Query JOBS_BY_PROJECT to see bytes_scanned per query
   - Identify expensive queries for optimization
   - Set maximum_bytes_billed to prevent runaway costs`,
    keyPoints: [
      "Column selection is the single biggest cost lever",
      "Partition pruning (date filters) saves 80-95%",
      "Clustering on filter columns saves additional 40-60%",
      "Monitor costs via INFORMATION_SCHEMA.JOBS_BY_PROJECT"
    ],
    externalLink: "https://cloud.google.com/bigquery/docs/best-practices-performance-compute"
  },
  {
    id: "bq-slots-commitment",
    title: "BigQuery Slots and Reservations",
    category: "BigQuery",
    content: `Slots represent virtual CPUs for query processing. Reservations allow you to purchase committed capacity.

Slot Types:
1. Standard Slots: $0.04/slot/hour (~$2,400/month per 100 slots)
2. Enterprise Slots: $0.06/slot/hour ($3,600/month)
3. Enterprise Plus: $0.10/slot/hour ($6,000/month)
4. Flex Slots: Pay-as-you-go, $0.04/slot/hour, minimum 60 seconds

Reservation Concepts:
- Slot Commitments: 1-year or 3-year purchase (25-40% discount)
- Flex Slots: No commitment, pay per minute
- Annual Commitment: ~$2,400 per 100 slots/year
- 3-Year Commitment: ~$5,500 per 100 slots/year (35% discount)

Capacity Management:
- Reserved slots available in a project via reservations
- Autoscaler can dynamically increase/decrease within limits
- Set minimum and maximum worker counts for autoscaling
- Unused slots don't spill over between projects

When to Use Slots:
- Monthly on-demand spend > $2,400 consistently
- Predictable, sustained workloads
- Need guaranteed capacity and isolation
- Cost certainty preferred over variable costs

Cost Saving Strategies:
- Combine committed + Flex slots
- Use Flex for temporary spikes above baseline
- Monitor utilization; right-size commitment`,
    keyPoints: [
      "Break-even: ~$2,400/month on-demand spend",
      "Slots provide cost predictability and performance isolation",
      "Flex Slots for spikes; commitments for baseline",
      "Annual commitment provides 25% discount"
    ],
    externalLink: "https://cloud.google.com/bigquery/docs/slots"
  },
  {
    id: "dataflow-autoscaling",
    title: "Dataflow Autoscaling Algorithms",
    category: "Dataflow",
    content: `Dataflow monitors workload and automatically adjusts worker count to maintain performance while minimizing cost.

Autoscaling Algorithms:

1. THROUGHPUT_BASED (Recommended for Streaming)
   - Monitors: Backlog size, current throughput
   - Decision: Calculate workers needed to drain backlog in target time
   - Formula: Workers = (Backlog / (Throughput × Target Drain Time))
   - Example: 2 TB backlog, 100 MB/sec throughput, 300 sec target
     → 2000 GB / (100 MB/sec × 300s) = 67 workers needed
   - Best for: Variable-rate streaming pipelines
   - Scaling latency: <60 seconds

2. CPU_BASED (Default for Batch)
   - Monitors: Average CPU utilization across workers
   - Target: 65-75% CPU utilization
   - Scales up when > 75%, down when < 50%
   - Less responsive for bursty traffic
   - Better for stable batch workloads

Configuration:
  gcloud dataflow jobs run my-job \\
    --autoscaling_algorithm=THROUGHPUT_BASED \\
    --num_workers=2 \\
    --max_num_workers=50 \\
    --region=us-central1

Cost Optimization:
- Start with --num_workers=2 (minimal baseline)
- Set reasonable --max_num_workers to prevent runaway scaling
- THROUGHPUT_BASED responds to actual demand
- Saves money during off-peak periods (automatic scale-down)`,
    keyPoints: [
      "THROUGHPUT_BASED best for streaming; responds to backlog",
      "CPU_BASED for batch; target 65-75% utilization",
      "Scale-down happens ~5-10 minutes after demand drops",
      "Start small (2 workers), autoscale up, max cap prevents cost spikes"
    ],
    externalLink: "https://cloud.google.com/dataflow/docs/guides/autoscaling"
  },
  {
    id: "dataflow-streaming",
    title: "Dataflow Streaming Pipeline Design",
    category: "Dataflow",
    content: `Building reliable, scalable streaming data pipelines with Apache Beam and Cloud Dataflow.

Pipeline Architecture:
1. Source → Pub/Sub (message ingestion)
2. Dataflow (process, transform, enrich)
3. Sink → BigQuery, Cloud Storage, Pub/Sub (output)

Key Concepts:

Windowing (Time-based grouping):
- Tumbling: Non-overlapping time periods (5-minute windows)
- Sliding: Overlapping windows (10-minute window, 1-minute slide)
- Session: Event-based windows (gap-based grouping)

Triggers (When to emit results):
- ON_TIME: Emit when window closes
- EARLY: Emit before window closes (speculative)
- LATE: Emit delayed data after window closes
- Use EARLY + LATE for low-latency, complete results

Backlog Management:
- Monitor backlog via Cloud Monitoring
- Target drain time: 60-300 seconds
- Enable autoscaling to handle spikes
- Monitor system lag metric

State Management:
- Use side inputs for small lookup tables
- Implement explicit state for complex transformations
- Consider external state store (Cloud Spanner) for shared state

Error Handling:
- Implement retry logic with exponential backoff
- Use Dead Letter Queue (Pub/Sub topic) for unprocessable messages
- Monitor error rates via metrics`,
    keyPoints: [
      "Choose window type based on use case (tumbling/sliding/session)",
      "Use EARLY triggers for low-latency requirements",
      "Monitor backlog; autoscale to meet drain time SLA",
      "Implement error handling with retry + DLQ pattern"
    ],
    externalLink: "https://cloud.google.com/dataflow/docs/concepts/beam-programming-model"
  },
  {
    id: "dataflow-windowing",
    title: "Dataflow Windowing Strategies",
    category: "Dataflow",
    content: `Windowing groups elements into finite batches for stateful operations.

Window Types:

1. Tumbling Windows (Non-overlapping)
   - Fixed 5-minute windows: [00:00-05:00), [05:00-10:00), ...
   - Best for: Aggregations (daily sales, hourly metrics)
   - Latency: Window duration + processing time
   
2. Sliding Windows (Overlapping)
   - 10-minute window, 1-minute slide
   - [00:00-10:00), [01:00-11:00), [02:00-12:00), ...
   - Best for: Moving averages, trend analysis
   - Requires more state (overlapping buckets)

3. Session Windows (Event-based)
   - Events grouped if they arrive within gap (e.g., 10 minutes)
   - Best for: User sessions, transaction sequences
   - Dynamic duration based on data arrival

4. Global Window
   - All data in single window (default)
   - Use with triggers for streaming pipelines
   - No automatic emission without trigger

Trigger Configuration:
  - ON_TIME: Emit at window close
  - EARLY triggers: Emit before close (every N events or time)
  - LATE triggers: Process data arriving after window close
  - Default: Discard late data

Example (Low-Latency Analytics):
  input
    .apply(Window.<Event>into(SlidingWindows.of(Duration.standardMinutes(10))
                                           .every(Duration.standardSeconds(5)))
           .withAllowedLateness(Duration.standardMinutes(5))
           .triggering(Repeatedly.forever(AfterPane.elementCountAtLeast(100))))
    .apply(Mean.globally())
    
This emits results every 5 seconds or every 100 events, whichever comes first.`,
    keyPoints: [
      "Window type determines latency and state overhead",
      "Tumbling (no overlap) is most efficient",
      "Triggers control emission frequency and completeness",
      "EARLY triggers provide low-latency estimates"
    ],
    externalLink: "https://cloud.google.com/dataflow/docs/concepts/beam-programming-model#windowing"
  },
  {
    id: "dataflow-triggers",
    title: "Dataflow Triggers and Panes",
    category: "Dataflow",
    content: `Triggers determine when a window emits results. Essential for balancing latency and completeness.

Trigger Types:

1. Default (ON_TIME)
   - Emits when window closes
   - Waits for watermark (indicator of data completeness)
   - Best for: Accurate, complete results
   - Latency: Window duration + watermark delay

2. EARLY Triggers
   - Emit speculative results before window closes
   - Enable low-latency with progressive refinement
   - Example: Emit every 10 seconds during window
   
3. LATE Triggers
   - Emit data arriving after window close
   - Handles late arrivals and corrections
   
4. REPEATED/CONTINUOUS Triggers
   - Emit every N elements or every T seconds
   - Useful for streaming aggregations

Pane Behavior:
   - EARLY panes: Speculative (may change)
   - ON_TIME pane: Main result (consider final)
   - LATE panes: Corrections (late data)

Low-Latency Strategy:
   Trigger.early(every N elements)
   .withAllowedLateness(...)
   .triggering(AfterPane.atLeastOnce())

This ensures:
- Quick emission (every N events, not waiting for window close)
- Repeated panes as data arrives
- Correction of earlier estimates with late data`,
    keyPoints: [
      "Default trigger waits for window close (high latency)",
      "EARLY triggers enable low-latency (10-100ms) emission",
      "Multiple panes (early, on-time, late) provide refinement",
      "Trade-off: Latency vs. completeness"
    ],
    externalLink: "https://cloud.google.com/dataflow/docs/concepts/beam-programming-model#triggers"
  },
  {
    id: "streaming-latency",
    title: "End-to-End Streaming Latency Optimization",
    category: "Streaming",
    content: `Achieving sub-second latency in data pipelines: Pub/Sub → Dataflow → BigQuery.

Latency Components:
1. Message publish to topic: ~50ms
2. Pub/Sub to subscriber: <100ms
3. Dataflow processing: 10-1000ms (depends on window/trigger)
4. Sink write (BigQuery/Firestore): 100-500ms
5. Network/queuing overhead: 100-300ms

Total realistic latency: 300-2000ms

Optimization Techniques:

1. Reduce Window Duration
   - Small windows (1-5 seconds) vs. 60-second windows
   - Every 1-second window: 1s latency vs. 60s
   
2. Use EARLY Triggers
   - Emit speculative results before window close
   - Instead of waiting for window, emit every 100 events
   - Reduces latency by 50-80%

3. Batch Size Tuning
   - Smaller batches: Lower latency, higher overhead
   - Larger batches: Higher latency, better throughput
   - Sweet spot: 100-500 elements

4. Streaming Engine
   - Use Streaming Engine (low-latency scheduler)
   - Bypasses some state management overhead
   - Enable via --enable_streaming_engine flag

5. Sink Choice
   - Firestore < BigQuery for latency (transactional)
   - Cloud Pubsub for sub-second messaging
   - Direct writes vs. batched

Example Configuration:
  window_duration = 1 second
  trigger = early emit every 100 elements
  batch_size = 50
  streaming_engine = enabled
  Expected latency: 200-300ms end-to-end`,
    keyPoints: [
      "Windowing strategy is primary latency lever",
      "EARLY triggers reduce latency 50-80%",
      "Streaming Engine improves low-latency performance",
      "Total path latency: sum of all hops, not just processing"
    ],
    externalLink: "https://cloud.google.com/dataflow/docs/guides/stream-processing"
  },
  {
    id: "dataflow-performance",
    title: "Dataflow Performance Tuning",
    category: "Dataflow",
    content: `Optimizing Dataflow jobs for throughput, latency, and cost.

Monitoring Metrics:
- Elements processed per second (throughput)
- Mean CPU utilization per worker
- System lag (max time an element spends in system)
- Backlog size (bytes/events waiting to process)

Performance Optimization:

1. Worker Configuration
   - Machine type: Choose based on memory requirements
   - Number of workers: Start at 2, autoscale to max
   - Disk size: Increase if spilling to disk
   - Preemptible: 70% cheaper for fault-tolerant jobs

2. Autoscaling Tuning
   - Algorithm: THROUGHPUT_BASED for streaming
   - Max workers: Set reasonable cap to prevent cost spikes
   - Scaling lag: ~1-2 minutes for scale-down

3. Batch Aggregation
   - Larger batches: Higher throughput, higher latency
   - Smaller batches: Lower latency, higher overhead
   - Sweet spot: 100-500 elements for most workloads

4. Shuffle Optimization (joins, group-by)
   - Spark Shuffle is heavy-weight; minimize shuffles
   - Pre-aggregate before shuffle when possible
   - Use side inputs for small lookup tables

5. State Store Management
   - Use Firestore for small, transactional state (<10GB)
   - BigTable for large, distributed state
   - In-memory for streaming aggregations

Debugging Performance Issues:
- Check worker CPU (should be 50-80% utilized)
- Monitor memory (OOM = need larger workers)
- Check system lag (indicates backlog growth)
- Profile hot stages (bottleneck identification)`,
    keyPoints: [
      "Throughput-based autoscaling best for streaming",
      "Batch size trade-off: latency vs. efficiency",
      "Minimize shuffles (join, group-by) operations",
      "Monitor system lag; scale up if growing"
    ],
    externalLink: "https://cloud.google.com/dataflow/docs/guides/deploy-batch-pipeline"
  },
  {
    id: "gcs-storage-classes",
    title: "Google Cloud Storage Classes",
    category: "Cloud Storage",
    content: `Storage classes in Cloud Storage with different access patterns and costs.

Storage Classes:

1. STANDARD ($0.020/GB/month)
   - Default class
   - Best for: Frequently accessed data (<30 days)
   - Retrieval cost: FREE
   - Minimum billing duration: None
   - Use case: Hot data, active queries

2. NEARLINE ($0.010/GB/month)
   - Best for: Infrequent access (30-90 days)
   - Retrieval cost: $0.01 per GB
   - Minimum billing: 30 days
   - Use case: Monthly backups, quarterly reports

3. COLDLINE ($0.004/GB/month)
   - Best for: Rare access (90-365 days)
   - Retrieval cost: $0.02 per GB
   - Minimum billing: 90 days
   - Use case: Yearly archives, compliance storage

4. ARCHIVE ($0.0012/GB/month)
   - Best for: Long-term compliance (1-7+ years)
   - Retrieval cost: $0.05 per GB
   - Minimum billing: 365 days
   - Retrieval time: Up to 12 hours
   - Use case: Compliance, legal holds

5. MULTI_REGION (Not a class, but a tier)
   - Standard Multi-region: Highest cost
   - Data replicated across regions
   - Use case: High availability

Cost Comparison (100 GB/year):
- Standard: $2,400
- Nearline: $1,200 (year 1: $200 storage + $1,000 retrieval if accessed monthly)
- Coldline: $480 (year 1: $400 storage + $80 retrieval if accessed once)
- Archive: $144 (year 1: $144 storage, no retrieval)

Selection Criteria:
- Know your access patterns
- Implement lifecycle policies for automatic tiering
- Archive after 1 year for compliance (95% savings)`,
    keyPoints: [
      "Standard: Hot data, frequent access",
      "Nearline/Coldline: Tiering for warm/cold data",
      "Archive: Long-term compliance, minimal access",
      "Lifecycle policies automate class transitions"
    ],
    externalLink: "https://cloud.google.com/storage/docs/storage-classes"
  },
  {
    id: "gcs-lifecycle",
    title: "Cloud Storage Lifecycle Policies",
    category: "Cloud Storage",
    content: `Automatic management of objects by transitioning between storage classes.

Lifecycle Actions:

1. Transition (SetStorageClass)
   - Move objects to cheaper storage after N days
   - Example: Standard → Archive after 365 days
   
2. Deletion
   - Automatically delete objects after N days
   - Use case: Temporary data, log files

3. Composite Actions
   - Transition AND delete in sequence
   - Example: Standard → Nearline (30d) → Coldline (90d) → Delete (2y)

Lifecycle Rule Conditions:
- Age: Days since object creation
- Match Storage Class: Apply rule to specific classes
- Match Prefix: Apply rule to path patterns (e.g., logs/*)
- Is Live: Differentiate between current and deleted versions

Example Policy:
  gcloud storage buckets update gs://my-bucket --lifecycle-config=lifecycle.json
  
  {
    "lifecycle": {
      "rule": [
        {
          "condition": {"age": 30},
          "action": {"type": "SetStorageClass", "storageClass": "NEARLINE"}
        },
        {
          "condition": {"age": 90},
          "action": {"type": "SetStorageClass", "storageClass": "COLDLINE"}
        },
        {
          "condition": {"age": 365},
          "action": {"type": "SetStorageClass", "storageClass": "ARCHIVE"}
        }
      ]
    }
  }

Cost Savings Example (100 GB):
- Manual (all Standard): $2,400/year
- With lifecycle (Standard → Archive after 1 year): $1,944/year (18% savings)
- Aggressive (Archive after 90 days): $432/year (82% savings)

Best Practices:
- Define clear lifecycle based on access patterns
- Use prefixes to apply different policies to data types
- Monitor access logs to verify patterns
- Archive after 1 year for compliance data
- Delete temporary data after N months`,
    keyPoints: [
      "Lifecycle policies are free and automatic",
      "Typical: Standard → Nearline (30d) → Coldline (90d) → Archive (1y)",
      "Can save 50-80% on long-term storage costs",
      "Critical for compliance data cost optimization"
    ],
    externalLink: "https://cloud.google.com/storage/docs/lifecycle"
  },
  {
    id: "gcs-cost-optimization",
    title: "Cloud Storage Cost Optimization",
    category: "Cloud Storage",
    content: `Strategies to minimize GCS costs while maintaining performance.

Cost Factors:
1. Storage: Depends on class ($0.020 - $0.0012/GB/month)
2. Operations: Free for reads in storage classes
3. Network egress: $0.12/GB to internet, free within GCP
4. Data transfer: Varies by service

Optimization Strategies:

1. Storage Class Tiering (Lifecycle Policies)
   - Standard (hot): First 30 days
   - Nearline (warm): 30-90 days
   - Coldline (cold): 90-365 days
   - Archive: 1+ years
   - Saves: 80-95% for compliance storage

2. Delete Unnecessary Data
   - Temporary/staging data: Delete after 7-30 days
   - Duplicate backups: Consolidate
   - Old logs: Archive or delete
   - Each GB deleted saves $0.020-0.0012/month

3. Regional Placement
   - Single-region: Cheaper than multi-region
   - Multi-region adds 10% cost for redundancy
   - Use multi-region only if HA required

4. Reduce Egress Costs
   - Keep data in GCP (egress = FREE)
   - Avoid downloads to on-prem
   - Use direct connections (Interconnect) for bulk egress
   - $0.12/GB saved for every GB kept in-cloud

5. Object Composition
   - Recompose objects instead of re-uploading
   - Saves bandwidth and time
   - Reduces egress costs

6. Smart Caching
   - CDN (Cloud CDN) for frequently accessed files
   - Cache in Memorystore for hot data
   - Reduces backend storage calls

Cost Calculation Example:
  100 GB dataset, accessed for 3 months then archived 7 years
  
  Manual (all Standard): 10 years × 12 months × 100 GB × $0.020 = $2,400
  
  With Lifecycle:
  - Months 1-3: Standard = 3 × $2 = $6
  - Months 4-12: Nearline = 9 × $1 = $9
  - Years 2-10: Archive = 9 × 12 × $0.12 = $13
  - Total: $28 (99% savings!)`,
    keyPoints: [
      "Lifecycle policies provide 80-95% savings for compliance",
      "Egress outside GCP costs $0.12/GB (keep data in cloud)",
      "Delete unnecessary data aggressively",
      "Archive for compliance; don't use Standard for 10-year holds"
    ],
    externalLink: "https://cloud.google.com/storage/docs/best-practices-cost-optimization"
  },
  {
    id: "pubsub-quota",
    title: "Pub/Sub Quotas and Scaling",
    category: "Pub/Sub",
    content: `Understanding and managing Pub/Sub quotas for high-throughput workloads.

Default Quotas:
1. Publishing: 10,000 messages/second per topic
2. Pulling: 10,000 messages/second per subscription
3. Message size: 10 MB per message
4. Message retention: 7 days default

Quota Increases:
- Available via Google Cloud Console
- Request based on business need
- Reviewed by Google team
- Usually approved for legitimate use cases

High-Throughput Configuration:
- Topics: Can handle 100K+ msg/sec with quota increase
- Subscriptions: Scale horizontally (add subscribers)
- Batching: Batch subscribe() for 100-500 messages
- Batch deadline: 100-500ms window

Scaling Strategies:

1. Multiple Subscriptions
   - 50 subscribers pulling from one topic
   - Each subscriber processes subset of messages
   - Scales throughput linearly

2. Topic Sharding
   - Multiple topics instead of one large topic
   - Distribute publishers across shards
   - Reduces single-point bottleneck

3. Message Batching
   - Batch subscribe() calls (RequestInfo batching)
   - Reduces overhead per message
   - Improves throughput 10-50%

4. Network Configuration
   - Use Private Google Access for private IP
   - VPC Service Controls for isolation
   - Reduces latency and improves throughput

Performance Tuning:
  PublisherOptions opts = PublisherOptions.newBuilder()
    .setRequestLimit(100)  // Batch 100 messages
    .setBatchMillis(100)   // Or after 100ms
    .build();
  
  Subscriber.create(options)
    .setFlowControl(FlowControlSettings.newBuilder()
      .setMaxMessages(100)
      .setMaxBytes(100L * 1024 * 1024)  // 100 MB
      .build());`,
    keyPoints: [
      "Default quota: 10K msg/sec per topic (scalable)",
      "Increasing subscribers doesn't increase quota",
      "Batching improves throughput by 10-50%",
      "Request quota increases proactively for high volume"
    ],
    externalLink: "https://cloud.google.com/pubsub/quotas"
  },
  {
    id: "pubsub-scaling",
    title: "Pub/Sub Architecture for Scale",
    category: "Pub/Sub",
    content: `Designing Pub/Sub topics and subscriptions for high-throughput, low-latency systems.

Topic Design:
- One topic per logical message stream
- Shard large topics (separate topics for shards)
- Consider key-based ordering requirements

Subscription Patterns:

1. Pull Subscriptions (Batch Processing)
   - Subscribers pull messages at their own pace
   - Best for: Dataflow, batch processing
   - High throughput, variable latency
   
2. Push Subscriptions (Push to Endpoint)
   - Pub/Sub pushes to HTTP/HTTPS endpoint
   - Best for: Cloud Functions, App Engine
   - Lower latency, needs active listener

3. Exactly-Once Delivery
   - Pub/Sub guarantees at-least-once by default
   - Deduplication logic in subscriber for exactly-once
   - Use message IDs to idempotently process

Ordering Guarantees:
- Per-key ordering available (partition by key)
- Enables sequence-dependent processing
- Small performance overhead (reduces parallelism)

Monitoring & Alerting:
- Oldest unacked message age (indicates lag)
- Message backlog (bytes waiting)
- Delivery latency (push subscriptions)
- Error rate (failed push attempts)

Cost Optimization:
- Publish: $5 per 10M messages ($0.0000005/msg)
- Pull: $10 per 10M messages ($0.000001/msg)
- 100 publishers, 10 subscribers: ~$5,000/month at 100K msg/sec

Example Configuration:
  Topic: user-events
  Subscriptions:
    - dataflow-ingestion (pull for ETL)
    - realtime-analytics (pull for Dataflow streaming)
    - notifications (push to Cloud Functions)
    
  Message Rate: 100K msg/sec
  Publishers: 100 (1000 msg/sec each)
  Subscribers: 50 (2000 msg/sec each)
  Ordering: By user_id (partition key)`,
    keyPoints: [
      "Topic per logical stream; shard if >10K msg/sec",
      "Pull subscriptions for high throughput",
      "Push subscriptions for low latency to endpoints",
      "Exactly-once requires deduplication logic"
    ],
    externalLink: "https://cloud.google.com/pubsub/docs/subscriber"
  },
  {
    id: "pubsub-throughput",
    title: "Pub/Sub Throughput Calculation",
    category: "Pub/Sub",
    content: `Calculating Pub/Sub capacity and planning for scale.

Throughput Metrics:
- Messages per second (msg/sec)
- Bytes per second (depends on message size)
- Latency: <100ms for Pub/Sub, additional for subscribers

Capacity Planning:

1. Calculate Daily Volume
   Example: 500 requests/sec, 5 KB per message
   - Requests: 500 msg/sec × 86,400 sec/day = 43.2M messages/day
   - Size: 43.2M × 5 KB = 216 GB/day
   - Monthly: 1.3TB data ingest

2. Determine Peak Rate
   - Average: 500 msg/sec
   - Peak (spikes): 2000 msg/sec (4× average)
   - Configure capacity for peak, not average

3. Subscriber Capacity
   - Each subscription/subscriber: ~2000 msg/sec practical limit
   - 100 subscribers: 100 × 2000 = 200K msg/sec capacity
   - Scale by adding subscribers

Cost Estimation:
  1B messages/month = 100 msg/sec average
  - Publish cost: (1B / 10M) × $5 = $500
  - Pull cost: (1B / 10M) × $10 = $1,000
  - Total: ~$1,500/month for 100 msg/sec
  
  100K msg/sec:
  - 2.6B messages/month (2.6T messages/month)
  - Publish: ~$1,300/month
  - Pull: ~$2,600/month
  - Total: ~$3,900/month (baseline)

Optimization:
- Batch publishing (100-500 messages per request)
- Batch pulling (100-500 messages per pull)
- Reduces API calls 100-500× (proportional cost reduction)
- Actually paying same total, but higher per-API efficiency`,
    keyPoints: [
      "Plan for peak rate, not average (usually 2-4× higher)",
      "Each subscriber: ~2000 msg/sec practical limit",
      "Costs: $0.0000005/publish, $0.000001/pull",
      "Batching reduces API calls; total cost same, better efficiency"
    ],
    externalLink: "https://cloud.google.com/pubsub/pricing"
  },
  {
    id: "dataproc-preemptible",
    title: "Dataproc Preemptible Workers",
    category: "Dataproc",
    content: `Using preemptible VMs in Dataproc for 70% cost savings.

What Are Preemptible VMs?
- Temporary compute instances (up to 25 hours)
- Can be terminated anytime (usually every 1-4 hours average)
- Cost: $0.057/vcpu/hour vs. $0.19 for regular (~70% discount)

When to Use:
- Batch jobs that can resume (HDFS checkpoints)
- Fault-tolerant workflows (Spark retries)
- NOT for long-running jobs without checkpoints
- NOT for interactive sessions (frequent interruptions)

Dataproc Configuration:
- Primary workers: Regular (handle driver, critical tasks)
- Secondary workers: Preemptible (parallel processing)
- Typical split: 50/50 or 25/75 (regular/preemptible)

Example Configuration:
  gcloud dataproc clusters create my-cluster \\
    --num-primary-workers=5 \\
    --num-secondary-workers=10 \\
    --secondary-worker-type=preemptible \\
    --machine-type=n1-standard-4 \\
    --region=us-central1

Cost Comparison (20 workers, 2 hours):
- All regular: 20 × $0.19 × 2 = $7.60
- 10 regular + 10 preemptible: (10 × $0.19) + (10 × $0.057) = $3.26/hour = $6.52 total
- 5 regular + 15 preemptible: (5 × $0.19) + (15 × $0.057) = $2.74/hour = $5.48 total

Reliability Strategy:
- Monitor preemption rate
- If >50% of secondary workers preempted: Reduce secondary count
- Spark handles retries automatically
- Use persistent HDFS (in primary nodes) for state

Fault Tolerance Best Practices:
- Enable autoscaling (handle preemptions automatically)
- Implement job checkpointing
- Use external state store (Cloud Spanner) for critical state
- Monitor job success rate

Limitations:
- Can't guarantee job completion (interruptions possible)
- Not suitable for time-critical batch jobs
- Monitor cost-benefit (sometimes faster = worth premium)`,
    keyPoints: [
      "70% cost savings: $0.057 vs. $0.19 per vcpu/hour",
      "Use only for fault-tolerant batch jobs",
      "Mix 50/50 regular + preemptible is typical",
      "Dataproc + Spark auto-retry handles interruptions"
    ],
    externalLink: "https://cloud.google.com/dataproc/docs/concepts/configuring-clusters/secondary-workers"
  },
  {
    id: "dataproc-cost",
    title: "Dataproc Cost Optimization",
    category: "Dataproc",
    content: `Strategies to minimize Dataproc cluster costs.

Cost Components:
1. Compute: Workers, master node, machine type
2. Storage: HDFS, persistent disks
3. Network: Egress charges (intra-GCP is free)
4. Software licensing: Open-source is free

Sizing Optimization:

1. Right-Sizing Workers
   - n1-standard-4: 4 vCPU, 15 GB RAM (~$0.19/hr)
   - n1-highmem-8: 8 vCPU, 52 GB RAM (~$0.38/hr)
   - High-memory Spark jobs need highmem nodes
   - Low-memory batch: highcpu nodes are cheaper
   
2. Auto-Scaling Configuration
   - Set min: 2 workers (baseline)
   - Set max: Based on peak requirement
   - Scale down after job completes (don't leave idle)

3. Preemptible Workers (70% discount)
   - Primary workers: Regular (master + critical tasks)
   - Secondary workers: Preemptible (parallel work)
   - Typical: 50/50 or 25/75 split

4. Ephemeral Clusters
   - Create cluster for job, delete after completion
   - vs. Long-running cluster with many jobs
   - Saves on idle time and unused capacity

5. Data Locality
   - Store data in GCS in same region
   - Reduces network transfers
   - Avoid cross-region ingestion

Cost Breakdown Example (Daily Spark Job):
  Job: 500 GB data, 2-hour processing
  
  Option 1: Fixed cluster (20 workers, always on)
  - 20 workers × $0.19/hr × 24 hours = $91.20/day
  - Storage (HDFS): ~$1/day (temporary)
  - Total: ~$92/day
  
  Option 2: Ephemeral cluster (autoscale 2-30 workers)
  - 2 baseline + 28 preemptible × 2 hours
  - (2 × $0.19) + (28 × $0.057) = $2.22/hr × 2 = $4.44/day
  - Storage: Negligible (GCS)
  - Total: ~$4.50/day (95% savings!)

Network Cost Optimization:
- Keep data in GCS (same region)
- Use Cloud Interconnect for large on-prem syncs
- Avoid egress to internet ($0.12/GB)`,
    keyPoints: [
      "Ephemeral clusters (create-for-job-delete) save 90%+ vs. always-on",
      "Preemptible workers reduce cost by 70%",
      "Right-size machine types for workload (CPU-intensive vs. memory-intensive)",
      "Store data in GCS (same region) to avoid egress"
    ],
    externalLink: "https://cloud.google.com/dataproc/pricing"
  },
  {
    id: "dataproc-config",
    title: "Dataproc Cluster Configuration",
    category: "Dataproc",
    content: `Configuring Dataproc clusters for performance and cost.

Cluster Initialization:

1. Basic Cluster
  gcloud dataproc clusters create my-cluster \\
    --region=us-central1 \\
    --master-machine-type=n1-standard-4 \\
    --worker-machine-type=n1-standard-4 \\
    --num-workers=5

2. High-Performance Cluster (Preemptible Mix)
  gcloud dataproc clusters create ml-cluster \\
    --region=us-central1 \\
    --master-machine-type=n1-highmem-8 \\
    --worker-machine-type=n1-highmem-16 \\
    --num-workers=3 \\
    --num-secondary-workers=10 \\
    --secondary-worker-type=preemptible \\
    --autoscaling-policy=cpu-scale

3. Auto-Scaling Policy
  gcloud compute instance-groups managed set-autoscaling my-cluster-w \\
    --max-num-replicas=30 \\
    --min-num-replicas=2 \\
    --target-cpu-utilization=0.6

Master Node Selection:
- Standard job: n1-standard-4 (4 vCPU, 15 GB)
- Large metadata: n1-highmem-4 (4 vCPU, 26 GB)
- Very large (10K+ nodes): n1-highmem-8 or larger

Worker Configuration:
- CPU-intensive (Spark Shuffle): n1-highcpu-16
- Memory-intensive (ML): n1-highmem-16
- Mixed: n1-standard-8 (balanced)

Storage Options:
1. HDFS (Ephemeral, on-cluster)
   - Fast, parallelized I/O
   - Lost when cluster deleted
   - Use for intermediate data
   
2. Persistent Disk (Attached to nodes)
   - Survives cluster deletion
   - Slower than HDFS
   - Use for outputs
   
3. GCS (External)
   - Cheapest long-term storage
   - Network latency (intra-GCP is fast)
   - Use for input/output data

Advanced Configuration (startup script):
  #!/bin/bash
  # Custom initialization
  gsutil cp gs://my-bucket/config.json /opt/
  pip install custom-library

  gcloud dataproc clusters create advanced-cluster \\
    --initialization-actions=gs://my-bucket/init.sh \\
    --region=us-central1 \\
    --properties=spark:spark.executor.memory=4g`,
    keyPoints: [
      "Master node size depends on metadata volume",
      "Worker type depends on job characteristics (CPU vs. memory)",
      "Ephemeral (on-cluster) HDFS for intermediate data",
      "GCS for long-term storage (survives cluster deletion)"
    ],
    externalLink: "https://cloud.google.com/dataproc/docs/concepts/configuring-clusters"
  },
  {
    id: "spanner-consistency",
    title: "Cloud Spanner: Strong External Consistency",
    category: "Spanner",
    content: `Cloud Spanner's unique consistency model for global transactions.

What Is Strong External Consistency?
- All clients see the committed data instantly
- No eventual consistency (no stale reads)
- Transactions are serializable (no dirty reads)
- Each transaction has a globally ordered timestamp

Why It Matters:
- Financial systems: No double-spending, correct account balances
- E-commerce: Inventory accuracy across regions
- Payments: Order execution strictly serialized
- Regulatory: Audit logs show true order of events

How It Works:
- Spanner uses Google's atomic clocks (TrueTime API)
- Accurate global time synchronization
- Guarantees transaction order across data centers
- Slight latency increase for consistency (99th percentile ~10ms)

Isolation Levels:
- SERIALIZABLE: Strict ordering (default, strongest)
- READ_COMMITTED: Faster, slightly weaker (application dependent)

Transaction Semantics:
  BEGIN TRANSACTION
    UPDATE accounts SET balance = balance - 100 WHERE id = 1;
    UPDATE accounts SET balance = balance + 100 WHERE id = 2;
    COMMIT;
  
  All clients see: Either both updates, or neither
  No intermediate state visible to other transactions

Cost-Benefit:
- Pros: Global consistency, high availability, horizontal scaling
- Cons: Expensive ($0.90/node/hour), minimum 3 nodes ($1,969/month)
- Worth it for: Global transactional apps, >100K QPS, multi-region

Comparison with Cloud SQL:
- Cloud SQL: Regional consistency, failover delay, no multi-region transactions
- Spanner: Global consistency, instant cross-region transactions, higher cost`,
    keyPoints: [
      "Strong external consistency: All clients see same committed data instantly",
      "Based on atomic clocks (TrueTime) for global time accuracy",
      "Serializable isolation (strictest): No dirty reads, no lost updates",
      "Trade-off: Cost ($0.90/node/hr) for global consistency"
    ],
    externalLink: "https://cloud.google.com/spanner/docs/true-time-external-consistency"
  },
  {
    id: "spanner-architecture",
    title: "Cloud Spanner Architecture and Scaling",
    category: "Spanner",
    content: `Cloud Spanner's distributed architecture for high availability and scale.

Spanner Basics:
- Horizontally scalable (add nodes to increase capacity)
- Multi-region replication (automatic)
- Strong consistency across regions (TrueTime)
- Horizontal partitioning (sharding by primary key)

Node Scaling:
- 1 node = ~7,000 QPS at <10ms latency
- 10 nodes = ~70,000 QPS
- 100 nodes = ~700,000 QPS
- Scales linearly (new nodes added quickly)

Configuration Options:

1. Regional Configuration
   - 3-node minimum (quorum for consensus)
   - Data stays in one region
   - Cheaper than multi-region
   - Cost: 3 nodes × $0.90/hr = $1,969/month

2. Multi-Region Configuration
   - 5-node minimum (for HA across regions)
   - Automatic failover
   - Data replicated across regions
   - Cost: 5 nodes × $0.90/hr = $3,285/month

3. Multi-Region + Read Replicas
   - Read-only copies in additional regions
   - Improve read latency in distant regions
   - 1-3 second replication lag

Instance Configuration:
  gcloud spanner instances create production \\
    --config=regional-us-central1 \\
    --description='Production database' \\
    --nodes=10

Database Optimization:

1. Primary Key Design
   - Hash-based (random): Even distribution
   - Range-based (sequential): Better for range queries
   - Composite keys: Multiple columns for uniqueness
   - Avoid monotonically increasing keys (hotspot risk)

2. Indexing Strategy
   - Create indexes on filter columns
   - Covering indexes for projection-only queries
   - Limit number of indexes (write overhead)

3. Transaction Isolation
   - Keep transactions short (faster commit)
   - Avoid long-running transactions (block others)
   - Use read-only transactions when possible (no locks)

4. Partitioning for Scale
   - Spanner automatically shards by primary key
   - Choose key that distributes load evenly
   - Avoid sequential keys that create hotspots

Cost Optimization:
- Regional (3 nodes): $1,969/month minimum
- Multi-region (5 nodes): $3,285/month minimum
- Read-only replicas: +$0.90/node/hr
- Only use if truly need global consistency + HA`,
    keyPoints: [
      "Linear scaling: Each node = ~7K QPS",
      "Regional (3 nodes minimum): $1,969/month",
      "Multi-region (5 nodes): $3,285/month",
      "Key design critical: Avoid sequential keys (create hotspots)"
    ],
    externalLink: "https://cloud.google.com/spanner/docs/instances"
  },
  {
    id: "transactional-db",
    title: "Choosing Transactional Databases",
    category: "Architecture",
    content: `Selecting between Cloud SQL, Cloud Spanner, and Firestore for transactional workloads.

Comparison Matrix:

| Aspect | Cloud SQL | Spanner | Firestore |
|--------|-----------|---------|-----------|
| Type | Relational | Relational | Document |
| Consistency | Strong | Strong | Eventual |
| Global | Regional + replicas | Native multi-region | Global |
| Max QPS | 1-10K | 100K+ | 10K+ |
| Multi-region Transactions | No (replication lag) | Yes (instant) | No |
| Cost (entry) | $60-350/mo | $1,969/mo | Pay-per-operation |
| Scaling | Vertical (larger instance) | Horizontal (add nodes) | Automatic |
| SQL Support | Yes (MySQL/PostgreSQL) | Yes (SQL) | No (Datastore QL) |

Cloud SQL Use Cases:
- Regional transactional apps (<100K QPS)
- Standard RDBMS features needed
- Existing MySQL/PostgreSQL workloads
- Cost-sensitive (cheaper than Spanner)

Cloud Spanner Use Cases:
- Global financial systems
- Multi-region strong consistency required
- Massive scale (>100K QPS)
- Mission-critical transactions
- Willing to pay premium ($0.90/node/hr)

Firestore Use Cases:
- Mobile apps (offline support)
- Flexible schema (JSON documents)
- Auto-scaling (pay only for use)
- Real-time data sync
- <10K QPS, eventual consistency acceptable

Architecture Pattern (Multi-Tier):
Mobile App → Firestore (flexible, real-time, offline)
Web App → Cloud SQL (RDBMS, regional)
Financial System → Cloud Spanner (global, strong consistency)
Analytics → BigQuery (analytical queries)

Migration Strategy:
1. Cloud SQL: Start here for relational data
2. Spanner: Upgrade if global consistency/scale needed
3. Firestore: For mobile/document-first apps

Hybrid Approach:
- Spanner: Transactional source of truth
- BigQuery: Analytics replica (nightly sync)
- Firestore: Mobile cache (push updates)`,
    keyPoints: [
      "Cloud SQL: Regional RDBMS (1-10K QPS, $60-350/mo)",
      "Spanner: Global strong consistency (100K+ QPS, $1,969+/mo)",
      "Firestore: Flexible documents (auto-scale, real-time)",
      "Choose by consistency requirement and scale"
    ],
    externalLink: "https://cloud.google.com/docs/tutorials/web-app-selection"
  },
  {
    id: "olap-oltp",
    title: "OLAP vs. OLTP Architecture",
    category: "Architecture",
    content: `Understanding the difference and choosing the right system.

OLAP (Online Analytical Processing):
- Purpose: Analytics, reporting, aggregations
- Queries: Complex, scan millions/billions of rows
- Write pattern: Bulk batch loads
- Latency: Seconds to minutes acceptable
- Tools: BigQuery, Redshift, Snowflake, Athena
- Example: "Revenue by region for all 2024 sales"

OLTP (Online Transaction Processing):
- Purpose: Business operations, transactions
- Queries: Single-row access by primary key
- Write pattern: Individual row inserts/updates
- Latency: <100ms required
- Tools: Cloud SQL, Spanner, Firestore, DynamoDB
- Example: "Deduct $100 from account #12345"

Why Separate Systems?
1. Storage: Columnar (OLAP) vs. Row-oriented (OLTP)
2. Indexing: Aggregation indexes (OLAP) vs. Primary keys (OLTP)
3. Consistency: Eventual ok (OLAP) vs. Strong required (OLTP)
4. Write optimization: Batch (OLAP) vs. Random (OLTP)
5. Read optimization: Full scan (OLAP) vs. Point lookup (OLTP)

Common Mistake:
❌ Using BigQuery for user transactions
- Each row access costs full scan price ($6.25 per TiB)
- Columnar storage optimized for bulk scans, not row access
- Latency: 10+ seconds per query (unacceptable for web apps)

❌ Using Cloud SQL for BI analytics
- Relational index lookups slow for aggregations
- Vertical scaling limits (can't scale to 100 TB easily)
- Scanning billion rows = timeout or very slow

Correct Architecture:
OLTP Source → Cloud SQL/Spanner (fast transactions)
          ↓
        ETL (nightly)
          ↓
OLAP Warehouse → BigQuery (analytics, BI)

Hybrid Workload Strategy:
If you have BOTH transaction + analytics:
1. Transactional DB (Cloud SQL/Spanner): Handle writes + reads
2. BigQuery: Replicate via Data Transfer Service nightly
3. Optional: Materialized views in BigQuery for common reports

Real-World Example (E-commerce):
- Transactions: Cloud SQL (orders, inventory, payments)
- Analytics: BigQuery (customer segmentation, sales trends)
- Nightly sync: Data Transfer Service (1-2 hour lag for reports)
- Cost: SQL ~$250/mo + BigQuery ~$500/mo analytics = $750/mo`,
    keyPoints: [
      "OLAP: Bulk scans (BigQuery) vs. OLTP: Point lookups (SQL)",
      "Never use BigQuery for row-level transactions",
      "Separate systems optimized for their access patterns",
      "Typical architecture: OLTP source → OLAP warehouse (nightly sync)"
    ],
    externalLink: "https://en.wikipedia.org/wiki/Online_transaction_processing"
  },
  {
    id: "service-selection",
    title: "GCP Service Selection Framework",
    category: "Architecture",
    content: `Decision framework for choosing the right GCP service.

1. Data Storage Decision Tree:
   Is it structured SQL data?
     YES → Cloud SQL (regional) or Spanner (global)
     NO → Is it time-series or columnar analytics?
            YES → BigQuery
            NO → Is it document/flexible schema?
                   YES → Firestore/Datastore
                   NO → Is it key-value or wide-column?
                          YES → Bigtable
                          NO → Cloud Storage (objects)

2. Data Processing Decision Tree:
   Is it batch or streaming?
     BATCH → Is it simple SQL transformation?
               YES → BigQuery SQL
               NO → Is it complex Spark logic?
                      YES → Dataproc
                      NO → Dataflow (complex ETL)
     STREAMING → Is it simple message processing?
                   YES → Cloud Functions + Pub/Sub
                   NO → Is it complex windowing/state?
                          YES → Dataflow
                          NO → Direct Pub/Sub subscriber

3. Cost-Benefit Evaluation:
   | Factor | Service A | Service B |
   |--------|-----------|-----------|
   | Throughput | X QPS | Y QPS |
   | Cost | $X/month | $Y/month |
   | Latency | T1 | T2 |
   | Operational Burden | High | Low |
   | Scalability | Limited | Unlimited |
   | Pick | If X > threshold | If Y < budget |

4. Startup Checklist:
   ☑ Throughput/QPS requirement
   ☑ Latency SLA (<10ms? <1s?)
   ☑ Monthly budget cap
   ☑ Consistency requirement (eventual ok?)
   ☑ Geographic distribution (regional? global?)
   ☑ Data retention (compliance?)
   ☑ Operational expertise (managed > self-managed)

5. Common Scenarios:

Scenario: Real-time analytics dashboard
- Requirement: <1 second latency, 1000 QPS
- Choice: BigQuery (cached results) + Pub/Sub input
- Cost: ~$500/mo (BigQuery slots)

Scenario: E-commerce inventory system
- Requirement: Strong consistency, global, <100ms latency
- Choice: Cloud Spanner
- Cost: ~$2,000/mo (minimum)

Scenario: Data lake with analytics
- Requirement: 100 TB storage, weekly analysis
- Choice: Cloud Storage (lifecycle) + BigQuery
- Cost: ~$300/mo (storage) + ~$200/mo (queries)

Scenario: IoT sensor data collection
- Requirement: 1M events/sec, long-term archival
- Choice: Pub/Sub + Dataflow + BigTable/Cloud Storage
- Cost: ~$3,000/mo (streaming) + ~$500/mo (storage)`,
    keyPoints: [
      "Throughput + latency SLA drives service choice",
      "Cost budget is hard constraint",
      "Consistency requirement (strong vs. eventual) matters",
      "Operational load: Managed services usually win long-term"
    ],
    externalLink: "https://cloud.google.com/architecture/data-lifecycle"
  },
  {
    id: "dts-overview",
    title: "Cloud Data Transfer Service Overview",
    category: "Data Ingestion",
    content: `Using Data Transfer Service for scheduled data imports.

What Is DTS?
- Managed service for scheduled bulk data transfers
- Copies data from external sources into GCS/BigQuery
- Supports: AWS S3, Azure Blob, on-prem (via partner connectors)
- Frequency: One-time or recurring (hourly to monthly)

Supported Sources:
1. AWS S3 → Google Cloud Storage
2. Azure Blob → Google Cloud Storage
3. On-prem (via partner) → Google Cloud Storage
4. BigQuery public datasets
5. Salesforce → BigQuery
6. Google Analytics → BigQuery

Workflow:
1. Configure transfer job
   - Source: S3 bucket, credentials, path
   - Destination: GCS bucket or BigQuery dataset
   - Schedule: Once, daily, weekly, monthly
   
2. Create scheduling
   - Set start date/time
   - Define recurrence pattern
   
3. Transfer runs automatically
   - Monitor progress in console
   - Retry on failure (configurable)
   
4. Data lands in GCS or BigQuery
   - Ready for analysis
   - Partitioned by transfer date (optional)

Cost:
- Transfer itself: FREE (intra-GCP)
- Storage (GCS): $0.02/GB/month (Standard)
- Query (BigQuery): $6.25/TiB scanned
- No data transfer charges for AWS/Azure to GCP

Example Configuration (AWS S3 → BigQuery):
  Source: s3://my-bucket/data/sales/*.csv
  Destination: projects/my-project/datasets/raw/table_sales
  Schedule: Daily at 2 AM
  Frequency: Every 24 hours
  Partition: By load date (_TABLE_SUFFIX)

Best Practices:
- Use transfer for recurring, scheduled imports
- Not suitable for real-time (use Pub/Sub/Dataflow)
- Implement idempotency (same file imported twice = no duplicates)
- Monitor transfer job history (failures, duration)
- Archive source files after successful transfer

Limitations:
- Not real-time (scheduled batches only)
- No transformation (copy as-is, use Dataflow to transform)
- Rate limits apply (but very high for typical workloads)

Comparison:
- DTS: Simple, scheduled, no code, FREE transfer
- Dataflow: Complex ETL, real-time, transformations
- Cloud Functions: Real-time events, small files
- gsutil: Manual/scripted copies`,
    keyPoints: [
      "Data transfer itself is FREE (only pay storage/query)",
      "Scheduled, managed transfers (no infrastructure)",
      "Not real-time; use Pub/Sub for streaming",
      "No transformation; use Dataflow if ETL needed"
    ],
    externalLink: "https://cloud.google.com/bigquery-transfer/docs"
  },
  {
    id: "data-transfer-cost",
    title: "Data Transfer Costs and Optimization",
    category: "Data Ingestion",
    content: `Understanding and minimizing data transfer costs.

Transfer Cost Components:

1. Intra-GCP (FREE)
   - GCS ↔ BigQuery: FREE
   - Cloud SQL ↔ GCS: FREE
   - Any GCP service to any other GCP service: FREE
   - Egress between regions: FREE

2. Egress to Internet ($0.12/GB)
   - GCS → On-prem: $0.12/GB
   - BigQuery export to S3: $0.12/GB
   - Any GCP → AWS/Azure: $0.12/GB
   - GCS → End-user download: $0.12/GB

3. Ingress to GCP (FREE)
   - On-prem → GCS: FREE
   - AWS/Azure → GCS: FREE
   - Internet upload: FREE

4. Data Transfer Service (FREE)
   - AWS S3 → GCS: FREE for transfer
   - Azure Blob → GCS: FREE for transfer

Cost Optimization Strategies:

1. Keep Data in GCP
   - Avoid internet egress ($0.12/GB = $12 per 100 GB)
   - Process in GCP natively
   - Export only final results
   - Example: 100 TB process → export 1 TB results = $120 vs. $12,000

2. Regional Storage
   - Same-region transfers: Fastest, no egress
   - Multi-region: 10% cost increase
   - Use only if HA required

3. Physical Media Transfer
   - For 100+ TB (>1 month at 1 Gbps):
   - Transfer Appliance: $300/week rental
   - Breaks even at ~10 TB (vs. 1 Gbps network = $1,200/week)

4. Bulk Imports
   - gsutil: $0.12/GB egress if from external
   - Data Transfer Service: FREE if external → GCS
   - DTS cheaper if recurring (AWS S3 sync daily)

5. Compress Before Transfer
   - Reduce size by 50-90% (Gzip, Brotli)
   - Transfer time: 50% of original
   - Example: 1 TB → 200 GB compressed = $24 vs. $120

Example (Data Migration):
Scenario: Migrate 50 TB from AWS S3 to BigQuery

Option 1: Direct Transfer (1 Gbps Network)
- Time: 50,000 GB / 125 MB/sec = ~4.6 days
- Cost: FREE (DTS) + storage + BigQuery queries
- Total: ~$500/month (storage + queries)

Option 2: Physical Media
- 1 Transfer Appliance (500 TB capacity): $300 week rental
- Shipped + returned: 1 week
- Cost: $300 + shipping + storage
- Faster: 1 week vs. 5 days of network (close)

Option 3: Staged (Compress + Network)
- Compress on-prem: 50 TB → 10 TB (80% compression)
- Transfer: 10 TB / 1 Gbps = 23 hours
- Decompress in GCS
- Cost: ~$50 (storage) + labor
- Best balance: Cheap + fast`,
    keyPoints: [
      "Egress to internet costs $0.12/GB (very expensive)",
      "Keep data in GCP: Process natively, avoid egress",
      "DTS: FREE transfer for AWS/Azure → GCS",
      "Physical media profitable for 100+ TB migrations"
    ],
    externalLink: "https://cloud.google.com/vpc/network-pricing#egress-pricing"
  },
  {
    id: "gcs-egress",
    title: "Cloud Storage Egress and Bandwidth Costs",
    category: "Cloud Storage",
    content: `Understanding egress charges and bandwidth optimization.

Egress Costs:

1. Within GCP (FREE)
   - GCS → Compute Engine: FREE
   - GCS → Dataflow: FREE
   - GCS → BigQuery: FREE
   - Cross-region within GCP: FREE

2. To Internet ($0.12/GB)
   - GCS → User download: $0.12/GB
   - GCS → On-prem: $0.12/GB
   - GCS → AWS: $0.12/GB

3. To Google Services (FREE)
   - GCS → YouTube: FREE
   - GCS → Google Analytics: FREE

Cost Example:
  100 GB download to user: 100 × $0.12 = $12
  1 TB download: 1,000 × $0.12 = $120
  10 TB download: 10,000 × $0.12 = $1,200
  100 TB download: 100,000 × $0.12 = $12,000

Egress Optimization:

1. Keep Data in GCP
   - Process in BigQuery (no egress)
   - Serve via Compute Engine (no egress)
   - Cloud CDN caches internally (reduces egress)
   - Example: Serve website assets via Cloud CDN + GCS = no egress

2. Cloud CDN
   - Caches GCS content at Google edge locations
   - First request: $0.12/GB egress
   - Cached requests: $0.085/GB egress (30% cheaper)
   - RoI: Worth it for content >1 GB/month

3. Compress Before Download
   - Gzip reduces size by 50-90%
   - Browser decompresses automatically
   - Example: 100 MB file → 10 MB gzipped = $1.20 vs. $12

4. Staged Downloads
   - Download to on-prem cache
   - Distribute locally (no egress)
   - Periodic sync (low bandwidth)

5. Transfer Appliance for Bulk
   - If >500 GB need to leave cloud: Use appliance
   - $300/week << $12,000 for 100 TB egress

Budget Alerts:
- Monitor egress in Cloud Billing
- Set alerts for >$500/month egress
- Investigate if unexpected

Example (SaaS Serving):
Architecture: GCS + Cloud CDN + Cloud Load Balancer
Users download assets (images, PDFs, videos) = via CDN (cached)
First load: Expensive ($0.085-0.12/GB)
Repeat loads: Cheaper ($0.085/GB cached)
Analytics export: Use BigQuery export to separate bucket (still in GCP)

No internet egress from main bucket → 95% cost reduction`,
    keyPoints: [
      "Egress to internet: $0.12/GB (very expensive)",
      "All intra-GCP transfers: FREE",
      "Cloud CDN reduces egress by 30% (first request)",
      "Compress data before download (50-90% reduction)"
    ],
    externalLink: "https://cloud.google.com/vpc/network-pricing"
  },
  {
    id: "warehouse-design",
    title: "Data Warehouse Design Patterns",
    category: "Architecture",
    content: `Designing a warehouse layer that serves analytics without degrading transactional systems.

Core principle:
Keep the system of record separate from the system of analysis. The transactional database owns correctness and low-latency writes; the warehouse owns scan-heavy aggregation.

Standard layered model:

1. Raw / landing layer
   - Ingested exactly as received, no transformation
   - Immutable, partitioned by ingestion date
   - Enables replay and audit

2. Staging / cleansed layer
   - Type casting, deduplication, null handling
   - Business keys resolved
   - Still close to source shape

3. Modeled / serving layer
   - Star schema or wide denormalized tables
   - Partitioned by the primary date dimension
   - Clustered on common filter columns

Denormalization guidance:
- BigQuery favors wide tables over many small joins
- Nested and repeated fields (STRUCT, ARRAY) model one-to-many without a join
- Reserve joins for genuinely large dimension tables

Replication from OLTP:
- Batch: scheduled export or Data Transfer Service, typically nightly
- CDC: Datastream for near-real-time change capture
- Choose based on how stale the reporting layer is allowed to be

Common mistakes:
- Pointing dashboards directly at the production transactional database
- Running row-level lookups against BigQuery
- Rebuilding full tables nightly when incremental partitioned loads would do
- Skipping the raw layer, which makes backfill and audit impossible`,
    keyPoints: [
      "Separate the system of record from the system of analysis",
      "Layer raw, staged, and modeled data rather than transforming in one step",
      "Prefer denormalized wide tables and nested fields over many joins in BigQuery",
      "Choose batch export or CDC based on acceptable reporting staleness"
    ],
    externalLink: "https://cloud.google.com/architecture/dw2bq/dw-bq-architecture"
  },
  {
    id: "cmek-encryption",
    title: "CMEK and Encryption at Rest",
    category: "Security",
    content: `Encryption options in Google Cloud, and what customer-managed keys actually change.

Three tiers:

1. Google-managed encryption (default)
   - All data at rest is encrypted automatically
   - Keys managed entirely by Google
   - No configuration, no additional cost

2. CMEK — customer-managed encryption keys
   - Keys live in Cloud KMS, in your project
   - You control rotation, disable, and destroy
   - Disabling the key makes the data inaccessible
   - Supported by BigQuery, Cloud Storage, Dataflow, Pub/Sub, Cloud SQL, Spanner

3. CSEK — customer-supplied encryption keys
   - You provide raw key material with each request
   - Cloud Storage and Compute Engine only
   - No KMS storage; you bear full key custody

Cost model:
- Roughly $0.06 per active key version per month
- Small per-operation charge for cryptographic calls
- Key material is cached, so steady-state performance impact is negligible

Operational considerations:
- Grant the service agent of each product the CMEK encrypter/decrypter role, or resource creation fails
- Key and resource generally must be in a compatible location
- Rotation creates a new key version; existing data stays readable under prior versions
- Destroying a key version is effectively irreversible data loss

When CMEK is the right answer:
- Regulatory requirement to hold or revoke keys yourself
- A need to prove cryptographic erasure
- Contractual separation of duties from the cloud provider`,
    keyPoints: [
      "Google-managed encryption is on by default and free",
      "CMEK adds key ownership, rotation control, and revocation via Cloud KMS",
      "Cost is driven by key versions and operations, not by data volume",
      "Missing service-agent key permissions is the most common CMEK failure"
    ],
    externalLink: "https://cloud.google.com/kms/docs/cmek"
  },
  {
    id: "audit-logging",
    title: "Cloud Audit Logs for Compliance",
    category: "Compliance",
    content: `What Cloud Audit Logs capture, what they cost, and how to retain them for compliance.

Four log types:

1. Admin Activity
   - Configuration and metadata changes
   - Always enabled, cannot be disabled
   - No charge

2. Data Access
   - Reads and writes of user data
   - Disabled by default for most services, must be enabled explicitly
   - Highest volume and the main cost driver

3. System Event
   - Google-initiated actions on your resources
   - Always enabled, no charge

4. Policy Denied
   - Access denied by a security policy
   - Enabled by default, billable

Retention:
- Default retention in the _Required bucket is 400 days for Admin Activity
- The _Default bucket retains 30 days unless reconfigured
- Multi-year compliance retention requires an export sink

Export patterns:
- To Cloud Storage: cheapest for long retention, use Coldline or Archive, apply a bucket retention lock for immutability
- To BigQuery: queryable, better for investigation, higher cost
- To Pub/Sub: forward to a SIEM in near real time

Recommended compliance setup:
- Enable Data Access logs only on services that require them
- Create an aggregated sink at the organization or folder level
- Route to Archive-class Cloud Storage with a locked retention policy
- Restrict access with a dedicated log-viewer role

Audit logs are encrypted like any other data and work normally alongside CMEK-protected resources.`,
    keyPoints: [
      "Admin Activity logs are always on and free; Data Access logs must be enabled and are billable",
      "Default retention is far shorter than typical compliance requirements",
      "Export to Archive-class Cloud Storage with retention lock for cheap immutable retention",
      "Enable Data Access logging selectively to control volume and cost"
    ],
    externalLink: "https://cloud.google.com/logging/docs/audit"
  },
  {
    id: "bq-cost-controls",
    title: "BigQuery Cost Controls and Guardrails",
    category: "Cost Optimization",
    content: `Mechanisms that prevent unexpected spend, ordered from hard stop to notification.

1. maximum_bytes_billed — hard per-query stop
   - The query fails before running if it would scan more than the limit
   - No cost incurred on a rejected query
   - Set per query, per session, or as a default for a project
   - The strongest guard against accidental full-table scans

2. Custom quotas — daily ceilings
   - Per-project or per-user daily query bytes limit
   - Further queries are rejected once the ceiling is hit
   - Blunt but effective for exploratory or shared environments

3. Reservations — capacity ceiling
   - Caps concurrent slot capacity, making spend predictable
   - Limits speed rather than bytes scanned
   - Queries queue instead of failing

4. Cloud Billing budgets — notification only
   - Threshold rules trigger email or Pub/Sub messages
   - Does not stop spend on its own
   - Route to Pub/Sub if you want automated response

Attribution and monitoring:
- INFORMATION_SCHEMA.JOBS_BY_PROJECT exposes bytes scanned, slot time, and user per job
- Label jobs and datasets to attribute cost by team
- Review the most expensive recurring queries before buying more capacity

Practical layering:
Set a project-wide maximum_bytes_billed default, add custom daily quotas for analyst accounts, expose curated authorized views over partitioned and clustered tables, and keep budget alerts as the backstop.`,
    keyPoints: [
      "maximum_bytes_billed is the only true per-query hard stop and costs nothing when it rejects",
      "Custom quotas cap daily scanned bytes per project or user",
      "Budget alerts notify but never prevent spend",
      "Use INFORMATION_SCHEMA.JOBS_BY_PROJECT to attribute cost before adding capacity"
    ],
    externalLink: "https://cloud.google.com/bigquery/docs/best-practices-costs"
  },
  {
    id: "bigtable-rowkey-design",
    title: "Bigtable Row Key Design and Hotspotting",
    category: "Bigtable",
    content: `Row key design is the single most important decision in a Bigtable schema — it determines both query performance and write distribution.

How Bigtable Shards Data:
- Rows are stored in a single sorted-string table, ordered lexicographically by row key
- The table is split into tablets, each owning a contiguous key range
- A tablet is served by exactly one node at a time; write/read load for a key range goes to that node

Hotspotting — the classic mistake:
- Leading a row key with a monotonically increasing value (current timestamp, auto-increment ID, sequential counter) means all recent writes share a near-identical, always-growing prefix
- Every concurrent write lands in the same (newest) tablet range, overloading one node while others idle
- Adding nodes does NOT fix this — tablet assignment is key-range based, not round-robin

Fixes:
1. Field promotion: lead with a high-cardinality, evenly distributed field (device_id, user_id, a hash) instead of time
2. Salting: prepend a computed hash bucket (e.g., hash(key) % N) to spread a hot key range across N prefixes
3. Reverse timestamps: within a per-entity prefix, store (Long.MAX - timestamp) as a suffix to get recent-first ordering without leading the key with time

Other row key rules:
- Keep row keys short — they're repeated in every column's storage and in every index
- Design for the read pattern first (Bigtable has no secondary indexes; only row key prefix and range scans are efficient)
- Human-readable, sortable keys (e.g., "device123#reverse_ts") aid debugging without hurting distribution, as long as the leading segment is well distributed`,
    keyPoints: [
      "Row keys are sorted lexicographically and sharded into contiguous tablets",
      "Never lead a row key with a monotonically increasing value (timestamp, auto-increment ID)",
      "Fix hotspots with field promotion (lead with a distributed field), salting, or reversed-timestamp suffixes",
      "Adding nodes does not fix hotspotting — it's a key-range problem, not a capacity problem"
    ],
    externalLink: "https://cloud.google.com/bigtable/docs/schema-design"
  },
  {
    id: "bigtable-service-selection",
    title: "Bigtable: Column Families and When to Choose It",
    category: "Bigtable",
    content: `Bigtable is a sparse, wide-column NoSQL database for massive-scale, low-latency, single-key access patterns.

When Bigtable Is the Right Choice:
- Very high throughput: millions of reads/writes per second, scaling linearly by adding nodes
- Latency requirement: single-digit-millisecond reads/writes by row key
- Access pattern: point lookups or range scans by row key prefix — no joins, no multi-row ACID transactions, no secondary indexes
- Typical uses: time-series/IoT telemetry, user/session state, ad-tech bidding data, recommendation feature serving

When to Choose Something Else:
- Need SQL, joins, or multi-row transactions → Cloud Spanner or Cloud SQL
- Need flexible documents, offline sync, small-to-medium scale → Firestore
- Need OLAP aggregation over large historical scans → BigQuery
- Sub-1TB dataset or low, spiky throughput → Bigtable's operational overhead usually isn't justified

Column Families:
- Columns are grouped into families, defined at table creation (schema changes require an admin operation)
- Each family has its own garbage-collection policy (max versions, max age) and is stored together on disk
- Group columns by shared access pattern and lifecycle: a "state" family read on every request should be separate from a rarely-read "audit" family, so a read of one doesn't pull the other's data
- Within a family, columns can be created dynamically per row (sparse schema) — no ALTER TABLE for new columns

Design Guidance:
- Fewer, well-chosen families beat many fine-grained ones; each family adds storage/read overhead
- Co-locate columns that are always read together; separate columns with different write frequency or retention needs`,
    keyPoints: [
      "Choose Bigtable for high-throughput, low-latency, single-key access with no joins or secondary indexes",
      "Prefer Spanner/Cloud SQL for relational needs, Firestore for flexible documents, BigQuery for OLAP",
      "Column families group columns with the same access pattern and garbage-collection policy",
      "Group frequently-read-together columns into one family to avoid pulling unrelated data"
    ],
    externalLink: "https://cloud.google.com/bigtable/docs/overview"
  },
  {
    id: "composer-orchestration",
    title: "Cloud Composer for Multi-System Batch Orchestration",
    category: "Orchestration",
    content: `Cloud Composer is managed Apache Airflow, used to orchestrate dependencies between heterogeneous data jobs.

Core Concepts:
- DAG (Directed Acyclic Graph): defines tasks and their dependencies (task B runs only after task A succeeds)
- Operators: pre-built integrations to trigger and monitor Dataflow, Dataproc, BigQuery, Cloud Functions, and external systems
- Sensors: wait for an external condition (a file landing in GCS, a job finishing) before downstream tasks proceed
- Retries and SLAs: per-task retry counts, backoff, and SLA-miss alerting configured declaratively

When Composer Is the Right Tool:
- A pipeline spans multiple compute systems (e.g., Dataflow → Dataproc → BigQuery) with real dependencies between steps
- You need backfill: re-running the DAG logic for an arbitrary past date
- You need a monitoring UI showing task-level success/failure history and duration trends

When to Choose Something Else:
- Cloud Workflows: lighter-weight, serverless orchestration of a small number of API/service calls; less operational overhead but no native backfill and a simpler dependency/retry model
- Dataform: orchestration scoped to SQL/BigQuery-native transformations only, not external compute jobs
- Cloud Scheduler: fire-and-forget triggering with no dependency tracking between the jobs it triggers

Cost and Operational Notes:
- Composer runs a persistent GKE-based environment, so there's a baseline cost even when no DAGs are running
- Composer 2 supports autoscaling workers, reducing (but not eliminating) idle cost
- Right-size environment size to DAG complexity and concurrency needs, not to peak job compute (Composer schedules and monitors; the actual heavy compute runs in Dataflow/Dataproc/BigQuery)`,
    keyPoints: [
      "Composer/Airflow fits multi-system DAGs needing dependencies, sensors, retries, and backfill",
      "Cloud Workflows suits lighter orchestration of a handful of API calls, but lacks native backfill",
      "Dataform orchestrates BigQuery SQL transformations only, not external Dataflow/Dataproc jobs",
      "Composer has a persistent baseline cost since it runs on a managed GKE environment"
    ],
    externalLink: "https://cloud.google.com/composer/docs/concepts/overview"
  },
  {
    id: "data-catalog-lineage",
    title: "Dataplex, Data Catalog, and Data Lineage",
    category: "Governance",
    content: `Governance at scale requires searchable metadata, access-tied tagging, and automatic lineage — not manual documentation.

Data Catalog (part of Dataplex):
- A searchable metadata catalog across BigQuery, Pub/Sub, Cloud Storage, and more
- Technical metadata (schema, size, last modified) is captured automatically
- Business metadata is added via tags and tag templates (e.g., a "PII" tag template with a sensitivity field)

Policy Tags and Column-Level Security:
- Policy tags attach to BigQuery columns and are enforced by IAM: a user without the right policy tag role sees the column blocked or masked, even with full table access
- This ties governance tags directly to enforcement, unlike a spreadsheet or wiki describing "who should" have access

Data Lineage:
- Automatically captured for supported integrations (BigQuery SQL jobs, Dataflow, Data Fusion, Composer-orchestrated pipelines)
- Shows upstream sources and downstream consumers of a table or file, and the job that produced each edge
- Answers "what fed this table" and "what breaks if I change this table" without manual tracing through job configs or tribal knowledge

Why Not Just Use Job History or Access Logs:
- INFORMATION_SCHEMA.JOBS shows individual BigQuery query jobs, not a cross-system lineage graph, and captures nothing about Dataflow/external sources
- Cloud Audit Logs Data Access logs record who read/wrote what and when — access history, not derivation lineage or governance tags
- Manual documentation (spreadsheets, wikis) drifts out of date the moment a pipeline changes and doesn't scale past a handful of tables

Practical Setup:
- Enable lineage on your BigQuery, Dataflow, and Composer pipelines
- Apply policy tags to PII columns at the source dataset so protection propagates to any view built on top
- Use Data Catalog search as the front door for "what data exists and who owns it" instead of tribal knowledge`,
    keyPoints: [
      "Data Catalog/Dataplex provides searchable metadata plus tagging tied to real IAM enforcement",
      "Policy tags enforce column-level access, not just document intended access",
      "Lineage is captured automatically for BigQuery, Dataflow, Data Fusion, and Composer pipelines",
      "Job history and audit logs show query/access events, not a derivation graph or governance tags"
    ],
    externalLink: "https://cloud.google.com/dataplex/docs/lineage"
  },
  {
    id: "vertex-ai-feature-store",
    title: "Vertex AI Feature Store: Avoiding Training/Serving Skew",
    category: "Vertex AI",
    content: `Feature Store centralizes feature computation so training and online serving use identical values.

The Skew Problem:
- Training pipelines often compute features in batch (e.g., a BigQuery SQL rolling aggregate)
- Serving pipelines often recompute the "same" feature on the fly, in a different language/framework, under latency pressure
- Small differences in windowing, null handling, or timing between the two implementations cause training/serving skew — the model sees different feature semantics at inference than it learned from

How Feature Store Fixes This:
- Features are computed once and registered as entities/features in Feature Store
- Offline store: supports point-in-time correct lookups for building training datasets (no future data leakage)
- Online store: serves the latest values for a given entity with low latency for real-time inference
- Both stores serve the same underlying feature definitions, removing the two-implementation problem entirely

When to Use It:
- Any model where the same feature is needed both for training (batch/historical) and online serving (real-time)
- Especially valuable when features are expensive aggregates (rolling windows, joins) that would otherwise be duplicated in application code

What It Doesn't Solve:
- It doesn't replace the need for a feature engineering pipeline — something still has to compute and write features into the store
- It doesn't fix latency if the underlying feature computation itself is slow; it fixes duplication and inconsistency, not raw compute cost`,
    keyPoints: [
      "Training/serving skew comes from two separate implementations computing 'the same' feature differently",
      "Feature Store computes each feature once and serves it identically to offline (training) and online (serving) consumers",
      "The offline store supports point-in-time correct lookups to avoid label leakage",
      "Feature Store removes duplication and inconsistency; it doesn't replace the feature computation pipeline itself"
    ],
    externalLink: "https://cloud.google.com/vertex-ai/docs/featurestore/overview"
  },
  {
    id: "vertex-ai-training-deployment",
    title: "Vertex AI: Training and Serving Mode Selection",
    category: "Vertex AI",
    content: `Choosing between AutoML and custom training, and between online endpoints and batch prediction, depends on control needs and access pattern.

AutoML vs. Custom Training:
- AutoML: no-code/low-code, Google selects and tunes the model architecture; fast to start, less control
- Custom training: you supply the training code/container (any framework — PyTorch, TensorFlow, XGBoost), choose the architecture, and select machine/accelerator types (including GPUs/TPUs)
- Choose custom training whenever the team needs a specific architecture, has existing model code, or needs capabilities AutoML doesn't expose

Online Endpoints vs. Batch Prediction:
- Online endpoint: a persistently deployed, autoscaling service for low-latency request/response inference; billed for provisioned node time whether or not requests arrive
- Batch Prediction: a managed job that reads inputs from Cloud Storage/BigQuery, runs inference across distributed workers, writes outputs, and then stops — billed only for the run
- Rule of thumb: if the workload is "score N items at some point," use Batch Prediction; if it's "respond to individual requests as they arrive," use an online endpoint

Common Mistake:
- Deploying an online endpoint and looping over it for a large offline batch wastes money on idle-node billing and underuses the parallelism Batch Prediction provides natively
- Conversely, using Batch Prediction for a user-facing feature that needs sub-second responses won't meet the latency requirement — it's designed for throughput, not per-request latency

Cost Pattern:
- Online endpoint: continuous cost proportional to provisioned nodes/hours, regardless of traffic
- Batch Prediction: cost proportional to the actual scoring job's compute time, nothing between runs`,
    keyPoints: [
      "Custom training gives architecture control that AutoML does not",
      "Online endpoints suit low-latency request/response and bill continuously for provisioned nodes",
      "Batch Prediction suits large offline scoring jobs and only bills for the run itself",
      "Looping requests into an online endpoint for a bulk job wastes cost versus using Batch Prediction"
    ],
    externalLink: "https://cloud.google.com/vertex-ai/docs/predictions/batch-predictions"
  },
  {
    id: "dataform-elt",
    title: "Dataform: ELT for BigQuery-Native SQL Transformations",
    category: "Dataform",
    content: `Dataform manages SQL-based ELT transformations that run entirely inside BigQuery.

ETL vs. ELT:
- ETL: transform data before it lands in the warehouse (e.g., Dataflow), useful when logic is non-SQL, needs streaming, or must run before storage
- ELT: load raw data into the warehouse first, then transform using the warehouse's own compute (BigQuery SQL) — useful when transformations are expressible in SQL and don't need to happen before landing

What Dataform Provides:
- Version-controlled SQL, organized as "models" (tables/views) with ref() calls between them
- Automatic dependency graph: Dataform infers execution order from which models reference which
- Built-in data quality assertions: uniqueness, not-null, custom SQL-based tests, run as part of the same pipeline
- Scheduled execution (including via Composer/Cloud Scheduler integration) and environment/workspace management for dev vs. prod

When to Choose Dataform:
- All transformation logic is expressible in SQL against data already in (or trivially loadable into) BigQuery
- The team wants tests and a dependency graph without hand-rolling both in a general-purpose orchestrator

When Not To:
- Non-SQL logic (custom parsing, ML inference, calling external APIs) — use Dataflow or a custom job
- True streaming/low-latency requirements — use Dataflow
- Orchestrating heterogeneous external systems (multiple compute engines, waiting on external events) — use Composer alongside or instead of Dataform`,
    keyPoints: [
      "ELT (transform after loading, in-warehouse) fits when transformations are pure SQL",
      "Dataform auto-builds a dependency graph from ref() calls and supports built-in data quality assertions",
      "Reserve Dataflow/ETL for non-SQL logic, streaming, or transforms needed before landing in the warehouse",
      "Dataform orchestrates BigQuery SQL models only, not external compute jobs like Dataflow or Dataproc"
    ],
    externalLink: "https://cloud.google.com/dataform/docs/overview"
  },
  {
    id: "dataflow-exactly-once-watermarks",
    title: "Dataflow Watermarks, Late Data, and Exactly-Once Sinks",
    category: "Dataflow",
    content: `Correcting streaming aggregates for late-arriving data requires coordinating trigger mode, allowed lateness, and idempotent writes.

Watermarks:
- A watermark is Dataflow's estimate of "no more data with an event time earlier than this will arrive"
- It's what allows a window to close and a default (ON_TIME) trigger to fire — it is not itself a bypass or shortcut setting

Allowed Lateness:
- withAllowedLateness(duration) extends how long a window continues to accept and re-trigger on late data after the watermark has passed the window's end
- After allowed lateness expires, further late data for that window is dropped

Accumulating vs. Discarding Trigger Mode:
- Discarding: each firing emits only the new elements accumulated since the last firing (a delta) — useful for append-only sinks tracking incremental changes
- Accumulating: each firing emits the full, updated result for the window including all data seen so far — necessary if you need a single corrected total per window rather than a series of deltas to sum yourself

Exactly-Once Sink Writes:
- Dataflow's internal processing provides effectively-once semantics for state and side effects within the pipeline
- Achieving exactly-once at an external sink (like BigQuery) when a window can re-fire (due to late data or retries) requires idempotent writes — e.g., MERGE/UPSERT keyed by a stable identifier (window start/end, or a natural key), not a plain append-only INSERT which would create duplicate rows per re-fire

Putting It Together:
- allowedLateness + accumulating mode + MERGE-keyed writes = a corrected total per window with no duplicate rows
- allowedLateness + discarding mode + append-only writes = a stream of deltas, useful only if the downstream consumer sums them itself`,
    keyPoints: [
      "Watermarks trigger window closure; they are not a setting that can be bypassed to force early processing",
      "allowedLateness extends how long a window keeps accepting and re-triggering on late data",
      "Accumulating mode emits the full corrected result per firing; discarding mode emits only the delta",
      "Exactly-once at an external sink requires idempotent writes (MERGE/UPSERT), not plain append-only inserts, when windows can re-fire"
    ],
    externalLink: "https://cloud.google.com/dataflow/docs/concepts/streaming-with-cloud-pubsub"
  },
  {
    id: "pubsub-schema-dlq",
    title: "Pub/Sub Schemas, Dead-Letter Topics, and Kafka Comparison",
    category: "Pub/Sub",
    content: `Protecting shared Pub/Sub topics from bad producers requires schema enforcement and dead-letter handling, not just retries.

Schema Enforcement:
- A schema (Avro or Protobuf) can be attached to a topic
- Publish calls that don't conform to the registered schema are rejected at publish time, before any subscriber ever receives the message
- This stops a producer's bad deploy from ever reaching downstream consumers, rather than relying on consumers to validate defensively

Dead-Letter Policies:
- Configured per subscription with a max delivery attempts count
- After a message fails to be acknowledged that many times, Pub/Sub forwards it to a separate dead-letter topic instead of redelivering it indefinitely
- This prevents a single malformed or unprocessable message from crash-looping a consumer forever, and isolates the bad message for inspection without blocking the rest of the stream

What Doesn't Fix a Crash Loop:
- Increasing ack deadline: gives more time to process a message, but a malformed message will still fail deterministically regardless of time given
- Increasing message retention: affects how long unacked/unprocessed messages remain available for redelivery, not whether processing succeeds

Pub/Sub vs. Kafka (Managed Service for Apache Kafka):
- Pub/Sub: fully managed, no partitions/brokers to size, automatic scaling, schema and DLQ features built in, pay-per-use
- Kafka: log-based semantics with consumer-group offset control, ecosystem compatibility (Kafka Connect, Kafka Streams), but requires managing partitions/brokers (even in the managed service) and its own schema registry for equivalent protection
- Migrating to Kafka does not, by itself, solve a schema-validation or dead-letter problem — equivalent protections must be configured there too; the choice between them should be driven by ecosystem/ordering/partitioning needs, not by an assumption that one is inherently safer`,
    keyPoints: [
      "A Pub/Sub schema rejects non-conforming messages at publish time, before subscribers see them",
      "Dead-letter policies move repeatedly-failing messages to a separate topic instead of retrying forever",
      "Ack deadline and retention settings do not fix a message that deterministically fails to process",
      "Kafka requires its own schema registry and dead-letter handling for equivalent protection — switching platforms doesn't solve this by itself"
    ],
    externalLink: "https://cloud.google.com/pubsub/docs/schemas"
  },
  {
    id: "bq-scripting-procedures",
    title: "BigQuery Scripting, Time Travel, and Fail-Safe",
    category: "BigQuery",
    content: `BigQuery supports multi-statement scripts, stored procedures, and point-in-time recovery mechanisms beyond simple query execution.

Multi-Statement Scripts and Procedures:
- BEGIN...END blocks allow multiple SQL statements, variables (DECLARE/SET), and control flow (IF, WHILE, loops) in one script
- CREATE PROCEDURE packages reusable multi-statement logic, callable with CALL
- Useful for orchestrating a sequence of DDL/DML without an external orchestrator, for logic that's simple enough to stay in SQL

Table Snapshots:
- CREATE SNAPSHOT TABLE captures a table's state at a point in time, at low cost (billed only for data that differs from the source)
- Explicit, named, and long-lived (not subject to the 2-7 day time travel window) — the right tool before a risky bulk DML or script
- Can be queried directly or used to restore a table

Time Travel:
- BigQuery retains historical versions of a table's data for a configurable window (default 7 days, adjustable 2-7 days per dataset)
- FOR SYSTEM_TIME AS OF <timestamp> queries the table as it existed at that time
- Enables self-service recovery from accidental DML (bad UPDATE/DELETE) without a separate backup, as long as it's caught within the window

Fail-Safe:
- A further retention period (currently 7 days) that begins after time travel expires
- NOT queryable directly by customers — it exists solely so Google can assist with data recovery in exceptional cases
- Should not be relied upon as a self-service recovery mechanism; time travel and snapshots are the self-service tools

Recovery Priority:
1. Time travel (fastest, self-service, works for any accidental DML within the window)
2. Table snapshot (if one was taken before the incident)
3. External backup/export (slower, may have more data loss)
4. Fail-safe (Google-assisted only, last resort, not self-service)`,
    keyPoints: [
      "BigQuery scripting supports BEGIN...END blocks, variables, control flow, and stored procedures",
      "Table snapshots are explicit, long-lived, low-cost point-in-time copies — take one before risky scripts or bulk DML",
      "Time travel (default 7 days) enables self-service FOR SYSTEM_TIME AS OF recovery from accidental DML",
      "Fail-safe extends retention further but is not customer-queryable — it's for Google-assisted recovery only"
    ],
    externalLink: "https://cloud.google.com/bigquery/docs/time-travel"
  },
  {
    id: "bq-omni-analytics-hub",
    title: "BigQuery Omni, BigLake, and Analytics Hub",
    category: "BigQuery",
    content: `Cross-cloud analytics and external data sharing without duplicating data.

BigQuery Omni:
- Runs the BigQuery query engine inside AWS or Azure, physically close to data stored in S3 or Azure Blob Storage
- Queries execute where the data lives, avoiding the need to copy it into GCP and avoiding cross-cloud egress for the query itself
- Results can be brought back to GCP (a smaller amount of data than the source) when needed

BigLake:
- Provides a unified table abstraction over data in Cloud Storage, S3, or Azure Blob Storage, with fine-grained (row/column-level) access control enforced consistently regardless of the underlying storage engine (BigQuery, Spark, etc.)
- BigQuery Omni uses BigLake tables to expose external-cloud data as queryable BigQuery tables without copying it

Analytics Hub:
- A data sharing platform: a data provider publishes curated datasets/views as "listings" in an exchange
- Subscribers (internal teams or external partners) attach to a listing and query it with access controlled and revocable by the publisher, without ever receiving copies of the underlying data or direct project/credential access
- Distinct from Omni/BigLake: Analytics Hub is about controlled sharing/distribution, not cross-cloud query execution

Choosing Between Them:
- Need to query data that lives in another cloud, in place → BigQuery Omni + BigLake
- Need to expose curated internal data to another team or an external partner without copying it or sharing credentials → Analytics Hub
- Both can be combined: query cross-cloud data via Omni/BigLake, then publish the curated result as an Analytics Hub listing

Anti-Patterns:
- Bulk-copying large external datasets into GCP purely to enable a join, when Omni could query them in place
- Sharing service account keys or IAM roles directly with an external partner instead of using Analytics Hub's listing model`,
    keyPoints: [
      "BigQuery Omni runs the query engine in AWS/Azure to query S3/Blob data in place, avoiding duplication and query-time egress",
      "BigLake provides a unified, access-controlled table abstraction over external-cloud storage",
      "Analytics Hub publishes curated datasets as listings for controlled, revocable sharing without copying data or credentials",
      "Omni/BigLake solve cross-cloud query execution; Analytics Hub solves controlled distribution — they compose together"
    ],
    externalLink: "https://cloud.google.com/bigquery/docs/omni-introduction"
  },
  {
    id: "security-dlp-vpcsc",
    title: "Layered Data Security: DLP, VPC Service Controls, and Key Management",
    category: "Security",
    content: `No single control covers content-level protection, network exfiltration, and key custody — each requires a distinct mechanism.

Cloud DLP De-identification:
- Detects and transforms sensitive data (SSNs, names, credit card numbers) via tokenization, masking, or redaction
- Can be applied to data at rest (batch de-identify a BigQuery table/column) or in transit (Dataflow DLP transform)
- Solves: "authorized users should never see raw sensitive values," even though they can still run aggregate/analytical queries over the de-identified data

VPC Service Controls (VPC-SC):
- Defines a service perimeter around GCP resources (projects, APIs)
- Blocks data from being copied to or accessed from outside the perimeter, even by a principal with valid IAM credentials — this specifically stops credential-based exfiltration to an external bucket/project
- Solves: "a compromised or malicious credential should not be able to move data outside the trust boundary"
- Distinct from firewall rules, which control network traffic paths, not API-level data egress across projects/services

CMEK vs. CSEK for Key Custody:
- CMEK (Cloud KMS-backed): supported broadly across BigQuery, Cloud Storage, Dataflow, Pub/Sub, Cloud SQL, Spanner; the customer holds the key and can disable/destroy a key version to render data permanently unreadable, independent of Google
- CSEK (customer-supplied): the customer provides raw key material with each request; supported only on Cloud Storage and Compute Engine — NOT BigQuery — and requires the customer to manage key transport and storage themselves
- Solves: "prove the organization, not the cloud provider, controls ultimate data destructibility"

Common Mismatches to Avoid:
- Expecting IAM roles alone to mask column-level content (they control table/dataset access, not per-value redaction)
- Expecting CSEK to work on BigQuery (it doesn't — use CMEK there)
- Expecting firewall rules to stop authenticated API-level exfiltration (that's VPC-SC's job)
- Expecting policy tags alone to provide a network boundary or key destruction capability (they control column-level access only)`,
    keyPoints: [
      "Cloud DLP de-identification masks/tokenizes sensitive column values while preserving aggregate query utility",
      "VPC Service Controls blocks credential-authenticated data movement outside a defined perimeter — firewalls do not",
      "CMEK gives the customer key destruction; CSEK is Cloud Storage/Compute Engine only and unsupported on BigQuery",
      "Content masking, network exfiltration boundaries, and key custody are three separate problems needing three separate controls"
    ],
    externalLink: "https://cloud.google.com/vpc-service-controls/docs/overview"
  }
];
