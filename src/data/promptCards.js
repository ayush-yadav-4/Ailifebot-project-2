/**
 * Prompt Cards Data
 * Contains all prompt card definitions for the welcome screen
 */
export const globalPromptCards = [
  {
    id: 'drug-consumable-payments',
    type: 'main',
    icon: '💊',
    title: 'Drug/Consumable Cards',
    description: 'Track payment statuses for drug/consumable files and recent QC-approved POs',
    prompts: [
      'Fit Files Payment Pending at Section',
      'UnFit Files Payment Pending at Section',
      'Paid field payment status this month',
      'Paid field payment status from 01/01/25 to 02/02/25',
      'How many POs are unpaid with most recent last QC passed date'
    ]
  },
  {
    id: 'tender-tracking-main',
    type: 'main',
    icon: '📋',
    title: 'Tender Tracking',
    description: 'Track tenders, rate contracts, and performance KPIs',
    prompts: [
      'Show items whose RC expires soon (<90 days)',
      'Give me all of the items which have valid rate contracts',
      'Average bids per tender?',
      'Categories with best RC coverage',
      'Categories with best RC coverage, also give me the Pareto chart for this as well',
      'EDL 2025 items vs non-EDL bids?',
      'List the worst performing tenders',
      'What is the average time taken for a tender from start to finish',
      'Which tenders are due for publication this month?'
    ]
  },
  {
    id: 'po-tracking-main',
    type: 'main',
    icon: '📦',
    title: 'PO Tracking',
    description: 'Analyze purchase orders, supplier KPIs, and delivery performance',
    prompts: [
      'Which POs have partial supply (<50%)?',
      'For Item Oxytocin Injection IP , has PO been issued to the vendor?',
      'What is the PO execution status of Item Oxytocin Injection IP?',
      'What is the supply status of PO for Item Multivitamin + Multimineral Syrup 200 ml ?',
      'PO-wise supply status (drug, quantity, percentage supplied).',
      'Vendors who have defaulted in timely supply.',
      'Which POs are nearing expiry of delivery period?',
    ]
  },
  {
    id: 'tender-level-monitoring-main',
    type: 'main',
    icon: '🔍',
    title: 'Tender-level Monitoring',
    description: 'Monitor tender status, delays, vendor participation, and award status',
    prompts: [
      'What is the current status of Tender No. XYZ (stage-wise)?',
      'Which tenders are delayed and may impact supply?',
      'Vendor participation summary item-wise for this tender, tender no. 164',
      'For Item Oxytocin Injection IP, has PO been issued to the vendor?'
    ]
  },
  {
    id: 'rate-contract-critical-main',
    type: 'main',
    icon: '⏰',
    title: 'Rate Contract (RC) – Critical Questions',
    description: 'Monitor RC expiry, extensions, vendor watch, and transition requirements',
    prompts: [
      'When does the RC for Item X expire?',
      'Which RCs expire within 30/60/90 days?',
      'Items requiring immediate RC extension or fresh tendering.',
      'Which items need transition from old RC to new tender?',
      'Which RC items have repeated supply delays?',
      'Items needing emergency procurement due to RC-Tender gap.'
    ]
  },
  {
    id: 'quality_control_bucket',
    type: 'main',
    icon: '🧪',
    title: 'Quality Control Bucket',
    description: 'Insights and tracking related to QC delays, pending samples, PO-wise status, and supplier-wise QC performance',
    prompts: [
      'Which suppliers have maximum delayed QC samples?',
      'What is the current number of QC pending in warehouse',
      'What is the current number of pending in courier from warehouse',
      'List POs with pending QC reports',
      'What is the average QC time per supplier?'
    ]
  },
  {
    id: 'high-priority-exceptions-main',
    type: 'main',
    icon: '🚨',
    title: 'High-Priority Exception & Alert Questions',
    description: 'Identify critical shortages, stockout risks, and urgent procurement needs',
    prompts: [
      'Which items are in critical shortage despite an active tender/RC?',
      'Which items are stuck due to tender delay + RC expiry overlap?'
    ]
  }
];

export const extendedPromptCards = [
  {
    id: 'item_accepted_rc_pending_bucket',
    type: 'main',
    icon: '📋',
    title: 'Item Accepted – RC Pending',
    description: 'Track items accepted but pending RC approval, supplier delays, tender-wise and item-wise RC status',
    prompts: [
      'Which supplier has the highest number of accepted items pending approval?',
      'Which supplier takes the maximum number of days in RC approval / supplies?',
      'Which item took the maximum number of days to be supplied?',
      'Which item was accepted most recently?',
      'Show RC acceptance and pending details of (Item Name).',
      'List all EDL items present in RC Pending data.',
      'List all Non-EDL items present in RC Pending data.',
      'What is the total stock available for EDL items in RC Pending?',
      'Which tender has the highest number of RC pending accepted items?',
      'How many suppliers are involved in RC for (Item Name)?',
      'List all RC pending items under tender (Tender Number).',
      'Show RC pending items accepted in the last 30 days.'
    ]
  },
  {
    id: 'near_expiry_data_bucket',
    type: 'main',
    icon: '⏳',
    title: 'Near Expiry Data',
    description: 'Monitor near-expiry inventory, supplier exposure, stock risk, and expiry-driven performance insights',
    prompts: [
      'Which items will expire within the next 90 days?',
      'Which suppliers have maximum near-expiry stock exposure?',
      'Which supplier is associated with the highest number of near-expiry items?',
      'Which item has the earliest expiry date?',
      'Show expiry details of (Item Name).',
      'What is the total stock of near-expiry items?',
      'List near-expiry items with stock greater than (X units).',
      'Which warehouses / locations have near-expiry stock?',
      'Item-wise near-expiry status summary.',
      'Supplier performance summary based on near-expiry stock.',
      'Which items are both near expiry and high stock?',
      'List EDL items present in Near-Expiry data.',
      'List Non-EDL items present in Near-Expiry data.',
      'Show near-expiry items received in the last 3 months.'
    ]
  },
  {
    id: 'pipeline_supplies_bucket',
    type: 'main',
    icon: '🚚',
    title: 'Pipeline Supplies',
    description: 'Track items in supply pipeline, delays, supplier performance, tender-wise pipeline status, and follow-ups',
    prompts: [
      'Which suppliers have items stuck in pipeline?',
      'Which supplier has the maximum number of pipeline items pending?',
      'Which item has the highest quantity in pipeline?',
      'Which item has been in pipeline for the maximum number of days?',
      'Show pipeline details of (Item Name).',
      'How many pipeline items are pending for (Supplier Name)?',
      'What is the total quantity of items currently in pipeline?',
      'List pipeline items expected to arrive within the next 30 days.',
      'List pipeline items delayed beyond expected delivery date.',
      'Supplier performance based on pipeline delays.',
      'Item-wise pipeline quantity summary.',
      'Which tenders currently have pipeline items?',
      'Which pipeline items require urgent follow-up?',
      'Which suppliers have not generated barcodes for pipeline consignments?',
      'Which pipeline consignment has the least number of boxes?'
    ]
  },
  {
    id: 'yearwise_po_itemwise_expired_items_bucket',
    type: 'main',
    icon: '📆',
    title: 'Year-wise & PO-wise Expired Items',
    description: 'Analyze expired stock across years, POs, suppliers, items, quantity, and financial impact',
    prompts: [
      'Which year has the highest number of expired items?',
      'Which item has the highest expired quantity?',
      'Show expired details of (Item Name).',
      'Which suppliers are associated with maximum expired stock?',
      'Expiry analysis based on supplier performance.',
      'PO-wise list of expired items.',
      'Which PO has the maximum expired quantity?',
      'Show expiry details of (PO Number).',
      'Item-wise expired quantity summary.',
      'What is the total expired quantity across all years?',
      'Year-wise trend of expired items.',
      'Which item has the maximum value of expired stock?',
      'Which Purchase Order (PO) has the highest value of expired stock?'
    ]
  },
  // {
  //   id: 'visual-analytics',
  //   type: 'extended',
  //   icon: '📅',
  //   title: 'Visual Analytics',
  //   description: 'Visualize data with charts and graphs',
  //   prompts: [
  //     'show me a bar chart of medicines expiring by month in 2025',
  //     'create a bar chart showing expiring medicines by category in 2025',
  //     'generate a pareto chart for medicines expiring in 2025 by stock value'
  //   ]
  // },
  // {
  //   id: 'data-summarization',
  //   type: 'extended',
  //   icon: '📈',
  //   title: 'Data Summarization and Reporting',
  //   description: 'Generate comprehensive data summaries',
  //   prompts: [
  //     'show me summary of expiring medicines: count by category, total stock value, and average stock per medicine for 2025',
  //     'show me medicines expiring in 2025 with their batch numbers, stock levels, and days until expiry',
  //     'which products have multiple batches expiring in 2025 and what is the total stock across all batches'
  //   ]
  // }
];

export const suggestionPills = [
  'Show me more details about this data',
  'What are the trends over time?',
  'Compare this with other equipment'
];

