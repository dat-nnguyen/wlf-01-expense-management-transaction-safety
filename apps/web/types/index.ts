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
