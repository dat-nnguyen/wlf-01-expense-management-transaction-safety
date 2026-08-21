export type AppMode = 'user_copilot' | 'ops_console';
export type Language = 'vi' | 'en';

export interface EvidenceCard {
  title: string;
  icon_type: 'card' | 'mail' | 'bank';
  time?: string;
  amount?: string;
  card_info?: string;
  sender?: string;
  status_note?: string;
}

export interface TimelineStep {
  title: string;
  time: string;
  sub?: string;
  color: string;
}

export interface SecurityVerificationInfo {
  claimed_amount: number;
  claimed_ref: string;
  claimed_status: string;
  source_type: string;
  conflict_score: number;
  security_tag: string;
  ledger_match: boolean;
  wallet_match: boolean;
  email_match: boolean;
  ref_match: boolean;
}

export interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  intent?: string;
  classification?: string;
  confidence?: number;
  evidence_cards?: EvidenceCard[];
  timeline_steps?: TimelineStep[];
  suggested_chips?: string[];
  security_verification?: SecurityVerificationInfo;
  image_preview?: string;
  image_name?: string;
  isStreaming?: boolean;
  current_thought_step?: string;
  thought_steps_history?: string[];
}

export interface SecurityCaseItem {
  id: string;
  title: string;
  amount: string;
  ref: string;
  score: number;
  status: string;
  badge: string;
}

export interface BotPerformance {
  name: string;
  count: string;
  rate: number;
  color: string;
}

export interface RecentBot {
  name: string;
  status: string;
  total: string;
  succ: string;
  latency: string;
}

export interface NewUser {
  email: string;
  bot: string;
  time: string;
  channel: string;
}

export interface EmailModalState {
  isOpen: boolean;
  to: string;
  subject: string;
  body: string;
}

export interface RelatedTransaction {
  merchant: string;
  time: string;
  amount: string;
  badge: string;
  badgeStyle: string;
  isAlert?: boolean;
}

export interface BotMetricItem {
  id: string;
  name: string;
  engine: string;
  category: string;
  requests: number;
  successRate: number;
  groundingRate: number;
  avgLatency: number;
  p95Latency: number;
  tokensUsed: string;
  blockedMutations: number;
  status: 'optimal' | 'good' | 'warning';
  description: string;
}

export interface IntentAnalyticsItem {
  intent: string;
  label: string;
  percentage: number;
  count: number;
  color: string;
  tool: string;
}

export interface ExecutionLogItem {
  id: string;
  timestamp: string;
  userPrompt: string;
  intent: string;
  toolCalled: string;
  latencyMs: number;
  groundingVerified: boolean;
  policyDecision: 'ALLOW' | 'DENY';
}

export interface EmailNotificationLogItem {
  id: string;
  recipient_email: string;
  recipient_role: string;
  subject: string;
  alert_type: string;
  severity: string;
  html_content: string;
  summary: string;
  sent_at: string;
  status: string;
}
