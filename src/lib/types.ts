export type UserRole = 'ADMIN' | 'MANAGER' | 'TEAM_MEMBER' | 'VIEWER';
export type UserStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DISABLED' | 'INVITED';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  invitedBy?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  avatar?: string;
  title?: string;
  department?: string;
}

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';

export interface Invitation {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  passcode?: string;
  department?: string;
  invitedBy: string;
  invitedByName?: string;
  tokenHash?: string;
  status: InvitationStatus;
  expiresAt: string;
  acceptedAt?: string;
  createdAt: string;
  message?: string | null;
}

export interface User {
  id: string;
  uid?: string;
  name: string;
  email: string;
  username?: string;
  role: UserRole;
  status?: UserStatus;
  emailVerified?: boolean;
  avatar: string;
  title: string;
  department?: string;
}

export interface Client {
  id: string;
  name: string;
  businessName: string;
  clientCode?: string;
  githubRepo?: string;
  deploymentUrl?: string;
  status?: string;
  website: string;
  industry: string;
  country: string;
  province: string;
  city: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  description: string;
  brandTone: string;
  logoUrl: string;
  createdAt: string;
}

export type TaskPriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedToId: string;
  assignedToName: string;
  assignedToEmail: string;
  assignedById: string;
  assignedByName: string;
  clientId?: string;
  clientName?: string;
  campaignId?: string;
  campaignName?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type CampaignStatus = 
  | 'DRAFT'
  | 'AI_PROCESSING'
  | 'READY_FOR_REVIEW'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'CREATING'
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'FAILED'
  | 'REJECTED';

export interface CampaignBrief {
  clientId: string;
  objective: string;
  productService: string;
  serviceDescription: string;
  websiteUrl: string;
  landingPageUrl: string;
  offer: string;
  cta: string;
  targetCountry: string;
  targetProvince: string;
  targetCity: string;
  targetLanguage: string;
  aiRequirements: string[];
  dailyBudget: number;
  totalBudget: number;
  currency: string;
  startDate: string;
  endDate: string;
  platform: string;
}

export interface ResearchSource {
  text: string;
  type: 'USER_PROVIDED' | 'AI_INFERENCE' | 'EXTERNALLY_RESEARCHED';
}

export interface StructuredResearch {
  marketContext: string[];
  audienceInsights: string[];
  painPoints: string[];
  searchIntent: string[];
  keywordIdeas: string[];
  messagingOpportunities: string[];
  risks: string[];
  sources: ResearchSource[];
}

export interface StructuredAudience {
  primaryAudience?: string;
  secondaryAudience?: string;
  demographics?: {
    ageRange: string;
    gender: string;
    incomeBracket: string;
    occupations: string[];
  };
  location?: {
    country: string;
    province: string;
    city: string;
  };
  language?: string;
  intentSignals?: string[];
  painPoints?: string[];
  exclusions?: string[];
  interests?: string[];
  primary?: string;
  secondary?: string;
  searchIntent?: string[];
  buyingIntentScore?: number;
}

export interface StructuredStrategy {
  campaignGoal?: string;
  coreMessage?: string;
  valueProposition?: string;
  creativeAngles?: string[];
  recommendedPlatforms?: string[];
  recommendedCampaignStructure?: {
    campaignType?: string;
    adGroups?: string[];
    biddingStrategy?: string;
  };
  recommendedBudget?: {
    currency?: string;
    dailyBudget?: number;
    targetCpa?: number;
  };
  cta?: string;
  risks?: string[];
  angle?: string;
  messagingStrategy?: string;
  funnelStage?: string;
  recommendedChannel?: string;
  biddingStrategy?: string;
  recommendedDailyBudgetCAD?: number;
}

export interface StructuredAdCopy {
  headlines: string[];
  descriptions: string[];
  primaryTexts?: string[];
  ctas?: string[];
  hooks?: string[];
  healthcareClaimWarnings?: string[];
  shortVariations?: string[];
}

export interface CreativeConcept {
  id: string;
  title: string;
  visualDirection: string;
  imagePrompt: string;
  videoPrompt: string;
  storyboard: string[];
  generatedImageUrl?: string;
  generatedVideoUrl?: string;
  hookText: string;
}

export interface QualityCheckResult {
  status: 'PASS' | 'WARNING' | 'FAIL';
  warnings?: string[];
  errors?: string[];
  brandConsistency?: boolean;
  locationConsistency?: boolean;
  copyQuality?: boolean;
  policyRisk?: 'LOW' | 'MEDIUM' | 'HIGH';
  overallScore?: number;
  missingInfo?: string[];
  brandAlignment?: boolean;
  healthcareComplianceWarnings?: string[];
  grammarPass?: boolean;
  locationMatch?: boolean;
  currencyMatch?: boolean;
}

export interface ConnectionStatus {
  openAiConnected: boolean;
  geminiConnected: boolean;
  googleAdsConnected: boolean;
  googleAdsCustomerId?: string;
  googleAdsAccountName?: string;
}

export interface AgentRunState {
  id: string;
  campaignId: string;
  agentName: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  outputJson?: string;
  error?: string;
  startedAt: string;
  completedAt?: string;
}

export interface CampaignProposal {
  id: string;
  campaignId: string;
  clientId: string;
  clientName: string;
  objective: string;
  location: string;
  recommendedBudgetCAD: number;
  platform: string;
  research?: StructuredResearch;
  audience: StructuredAudience;
  strategy: StructuredStrategy;
  copy: StructuredAdCopy;
  creatives: CreativeConcept[];
  qualityCheck: QualityCheckResult;
  createdAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  objective: string;
  platform: string;
  location: string;
  dailyBudget: number;
  totalBudget: number;
  currency: string;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  proposalId?: string;
  approvedBy?: string;
  approvedAt?: string;
  googleAdsCampaignId?: string;
  metrics?: {
    spend: number;
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
    conversions: number;
    cpa: number;
    conversionRate: number;
  };
  aiInsight?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  agentName?: string;
  action: string;
  campaignId?: string;
  campaignName?: string;
  apiOperation?: string;
  status: 'SUCCESS' | 'WARNING' | 'ERROR';
  details: string;
}

export interface AISettings {
  strategyProvider: 'OpenAI' | 'Gemini';
  researchProvider: 'OpenAI' | 'Gemini';
  copyProvider: 'OpenAI' | 'Gemini';
  imageProvider: 'OpenAI' | 'Gemini';
  videoProvider: 'OpenAI' | 'Gemini';
  validationProvider: 'OpenAI' | 'Gemini';
  demoMode: boolean;
}

export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL_SENT' | 'WON' | 'LOST' | 'INTERESTED' | 'REQUIREMENT' | 'QUOTATION' | 'NEGOTIATION' | string;

export interface LeadItem {
  id: string;
  name: string;
  contactName: string;
  leadCode: string;
  email: string;
  phone?: string;
  company: string;
  source?: string;
  service?: string;
  status: LeadStatus;
  estimatedValue: number;
  notes?: string;
  nextFollowUpDate?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface DepartmentItem {
  id: string;
  name: string;
  code?: string;
  headName?: string;
  memberCount?: number;
  description?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface EmployeeItem {
  id: string;
  employeeId?: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  department: string;
  designation: string;
  salary?: number;
  workloadScore?: number;
  joiningDate?: string;
  status?: string;
  avatar?: string;
  [key: string]: any;
}

export interface ExpenseItem {
  id: string;
  title?: string;
  category?: string;
  vendor?: string;
  description?: string;
  amount: number;
  gstAmount: number;
  date?: string;
  approvedBy?: string;
  status?: string;
  receiptUrl?: string;
  [key: string]: any;
}



export type ProjectHealth = 'ON_TRACK' | 'AT_RISK' | 'CRITICAL' | 'DELAYED' | string;
export type ProjectStatus = 'ACTIVE' | 'PLANNING' | 'COMPLETED' | 'ON_HOLD' | string;

export interface ProjectItem {
  id: string;
  projectCode: string;
  name: string;
  clientId?: string;
  clientName: string;
  service?: string;
  department: string;
  managerId?: string;
  managerName?: string;
  teamMembers?: string[];
  startDate?: string;
  deadline?: string;
  progress?: number;
  health: ProjectHealth;
  status?: ProjectStatus;
  description?: string;
  priority?: string;
  billingTotal?: number;
  billingPaid?: number;
  gitRepoUrl?: string;
  liveUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface SOPItem {
  id: string;
  code: string;
  service: string;
  title: string;
  department: string;
  version?: string;
  purpose?: string;
  instructions?: string;
  content?: string;
  checklistJson?: string;
  requiredProof?: string;
  expectedDurationHours?: number;
  author?: string;
  lastUpdated?: string;
  [key: string]: any;
}

export interface WorkLogItem {
  id: string;
  userId?: string;
  userName?: string;
  employeeName: string;
  employeeEmail?: string;
  taskId?: string;
  taskTitle?: string;
  projectId?: string;
  projectName?: string;
  timeSpentHours?: number;
  hours?: number;
  workCompleted?: string;
  description?: string;
  proofUrl?: string;
  tomorrowPlan?: string;
  date?: string;
  [key: string]: any;
}

// ==========================================
// KAIRO SOCIAL MODULE TYPES
// ==========================================
export type SocialPlatform = 'INSTAGRAM' | 'FACEBOOK';
export type SocialPostStatus = 'DRAFT' | 'READY' | 'SCHEDULED' | 'PUBLISHING' | 'PUBLISHED' | 'FAILED';
export type SocialConnectionHealth = 'HEALTHY' | 'WARNING' | 'EXPIRED' | 'DISCONNECTED';

export interface SocialAccountItem {
  id: string;
  clientId: string;
  platform: SocialPlatform;
  accountType: string;
  accountId: string;
  username: string;
  pageName?: string | null;
  profilePictureUrl?: string | null;
  tokenExpiresAt?: string | null;
  isConnected: boolean;
  connectionHealth: SocialConnectionHealth;
  healthMessage?: string | null;
  connectedById?: string | null;
  connectedByName?: string | null;
  lastSyncAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SocialMediaItem {
  url: string;
  type: 'image' | 'video';
  name?: string;
  size?: number;
  thumbnailUrl?: string;
  aspectRatio?: string;
}

export interface SocialMusicItem {
  id?: string;
  title: string;
  artist: string;
  genre?: string;
  previewUrl?: string;
  duration?: string;
  isInstagramAudioWarning?: boolean;
}

export interface SocialPostItem {
  id: string;
  clientId: string;
  clientName?: string;
  createdById: string;
  createdByName: string;
  createdByEmail?: string | null;
  platforms: SocialPlatform[];
  caption: string;
  hashtags: string[];
  location?: string | null;
  locationDetails?: {
    name: string;
    city?: string;
    province?: string;
    country?: string;
    placeId?: string;
  } | null;
  media: SocialMediaItem[];
  music?: SocialMusicItem | null;
  status: SocialPostStatus;
  scheduledAt?: string | null;
  publishedAt?: string | null;
  failureReason?: string | null;
  lastEditedById?: string | null;
  lastEditedByName?: string | null;
  lastEditedAt?: string | null;
  isLocked?: boolean;
  createdAt: string;
  updatedAt: string;
  attempts?: SocialPublishAttemptItem[];
}

export interface SocialPublishAttemptItem {
  id: string;
  postId: string;
  platform: SocialPlatform;
  attemptNumber: number;
  status: 'SUCCESS' | 'FAILED' | 'RETRY';
  responsePayload?: string | null;
  errorMessage?: string | null;
  platformPostId?: string | null;
  platformPostUrl?: string | null;
  attemptedAt: string;
}

export interface SocialActivityLogItem {
  id: string;
  clientId: string;
  postId?: string | null;
  action: string;
  userId: string;
  userName: string;
  details?: string | null;
  platform?: string | null;
  timestamp: string;
}

export interface SocialClientConfigItem {
  id: string;
  clientId: string;
  defaultLocation: string;
  defaultTimezone: string;
  brandTone: string;
  defaultHashtags: string[];
  autoHashtags: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// KAIRO CHAT MODULE TYPES
// ==========================================
export type ConversationType = 'DIRECT' | 'GROUP';
export type ChatMessageType = 'TEXT' | 'IMAGE' | 'FILE';
export type MemberRole = 'ADMIN' | 'MEMBER';

export interface ConversationMemberItem {
  id: string;
  conversationId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string | null;
  role: MemberRole;
  joinedAt: string;
}

export interface ChatMessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderEmail?: string | null;
  senderAvatar?: string | null;
  content: string;
  messageType: ChatMessageType;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  attachmentSize?: number | null;
  isEdited: boolean;
  deletedAt?: string | null;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
  reads?: MessageReadItem[];
  isReadByMe?: boolean;
  isReadByAll?: boolean;
}

export interface MessageReadItem {
  id: string;
  messageId: string;
  userId: string;
  readAt: string;
}

export interface ConversationItem {
  id: string;
  clientId?: string | null;
  clientName?: string | null;
  clientLogo?: string | null;
  name: string;
  type: ConversationType;
  avatarUrl?: string | null;
  createdById: string;
  createdByName: string;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  unreadCount?: number;
  members: ConversationMemberItem[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLineItem {
  id?: string;
  srNo?: number;
  desc: string;
  deliverables?: string[];
  hsn: string;
  qty: number;
  unit?: string;
  rate: number;
  rateType?: 'EXCLUSIVE_GST' | 'INCLUSIVE_GST';
  discountPercent?: number;
  discountAmount?: number;
  taxableAmount?: number;
  gstRate: number;
  gstAmount?: number;
  totalAmount: number;
}

export interface InvoiceBankDetails {
  accountHolderName: string;
  bankName: string;
  accountNo: string;
  ifscCode: string;
  accountType?: string;
  branch?: string;
  branchCode?: string;
  outstandingAmount?: number;
}

export interface InvoicePaymentEntry {
  isReceived: boolean;
  paymentMode: string;
  refNo: string;
  depositTo: string;
  amount: number;
  receivedDate?: string;
}

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  seriesName?: string | null;
  invoicePrefix?: string | null;
  invoiceSuffix?: string | null;
  bookName?: string | null;
  date: string;
  dueDate: string;
  clientId: string;
  clientName: string;
  clientGstin?: string | null;
  billingAddress?: string | null;
  shippingAddress?: string | null;
  quotationNo?: string | null;
  placeOfSupply?: string | null;
  itemsJson: string;
  subtotal: number;
  discountType?: 'PERCENTAGE' | 'FIXED' | null;
  discountValue?: number | null;
  discountAmount?: number | null;
  taxableAmount?: number | null;
  cgst: number;
  sgst: number;
  igst: number;
  serviceCharge?: number | null;
  otherCharges?: number | null;
  roundOff?: number | null;
  totalAmount: number;
  amount?: number;
  amountPaid: number;
  balanceDue: number;
  currency: string;
  status: string;
  paymentMethod?: string | null;
  bankDetailsJson?: string | null;
  paymentDetailsJson?: string | null;
  customFieldsJson?: string | null;
  attachmentUrl?: string | null;
  notes?: string | null;
  terms?: string | null;
  razorpayPaymentLinkId?: string | null;
  razorpayPaymentId?: string | null;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface QuotationLineItem {
  id?: string;
  srNo?: number;
  desc: string;
  deliverables?: string[];
  hsn: string;
  mrp?: number;
  qty: number;
  unit?: string;
  rate: number;
  rateType?: 'EXCLUSIVE_GST' | 'INCLUSIVE_GST';
  discountPercent?: number;
  discountAmount?: number;
  taxableAmount?: number;
  gstRate: number;
  gstAmount?: number;
  cessRate?: number;
  cessAmount?: number;
  totalAmount: number;
}

export interface QuotationItem {
  id: string;
  quotationNumber: string;
  prefix?: string | null;
  suffix?: string | null;
  date: string;
  validUntil?: string | null;
  clientId?: string | null;
  clientName: string;
  clientPhone?: string | null;
  clientEmail?: string | null;
  clientGstin?: string | null;
  billingAddress?: string | null;
  itemsJson: string;
  subtotal: number;
  taxableAmount?: number | null;
  cgst?: number | null;
  sgst?: number | null;
  igst?: number | null;
  taxAmount: number;
  discountBeforeTax?: number | null;
  discountAfterTax?: number | null;
  serviceCharge?: number | null;
  otherCharges?: number | null;
  roundOff?: number | null;
  autoRoundOff?: boolean | null;
  totalAmount: number;
  amount?: number;
  currency: string;
  status: string;
  notes?: string | null;
  bankDetails?: string | null;
  terms?: string | null;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface SundryDebtorCustomer {
  id?: string;
  registrationType: string;
  partyType: string;
  legalName?: string;
  accountDisplayName: string;
  shortAliasName?: string;
  email?: string;
  mobileNo?: string;
  contactPersonName?: string;
  panItTanNo?: string;
  creditPeriodDays?: string | number;
  defaultPaymentMode?: string;
  statutoryInfo?: boolean;
  addressLine1: string;
  addressLine2?: string;
  country: string;
  pincode: string;
  city: string;
  state: string;
  bankDetailsProvided?: boolean;
  enableCreditLimit?: boolean;
  openingBalance?: number;
  balanceType?: 'Cr' | 'Dr';
  balanceFormatted?: string;
  gstin?: string;
  // Foreign client support fields
  isForeign?: boolean;
  currency?: string;
  currencySymbol?: string;
  dialCode?: string;
  foreignTaxId?: string;
  province?: string;
  exportType?: string;
  lutNumber?: string;
}

export interface POLineItem {
  id?: string;
  srNo: number;
  description: string;
  deliverables?: string[];
  hsn: string;
  qty: number;
  unit?: string;
  unitPrice: number;
  discount: number;
  taxableAmount: number;
  gstRate: number;
  cgstRate?: number;
  cgstAmount?: number;
  sgstRate?: number;
  sgstAmount?: number;
  igstRate?: number;
  igstAmount?: number;
  totalAmount: number;
}

export interface VendorItem {
  id: string;
  name: string;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  gstin?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  category?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type POStatus = 'DRAFT' | 'ISSUED' | 'APPROVED' | 'CANCELLED';

export interface PurchaseOrderItem {
  id: string;
  poNumber: string;
  orderDate: string;
  expectedDeliveryDate?: string | null;
  paymentTerms?: string | null;
  poValidity?: string | null;
  projectRefNo?: string | null;
  deliveryTerms?: string | null;
  modeOfTransport?: string | null;
  remarks?: string | null;
  status: POStatus;

  // Vendor details
  vendorId?: string | null;
  vendorName: string;
  vendorAddress?: string | null;
  vendorGstin?: string | null;
  vendorEmail?: string | null;
  vendorPhone?: string | null;

  // Buyer details (CodeKap)
  buyerName: string;
  buyerAddress?: string | null;
  buyerGstin?: string | null;
  buyerPhone?: string | null;
  buyerEmail?: string | null;

  // Line items & calculations
  itemsJson: string;
  isInterState: boolean;
  subtotal: number;
  totalDiscount: number;
  taxableAmount: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  grandTotal: number;
  amountInWords?: string | null;

  // Bank & Terms
  showBankDetails: boolean;
  bankDetailsJson?: string | null;
  terms?: string | null;
  signatoryName?: string | null;
  signatoryCompany?: string | null;
  signatureUrl?: string | null;
  notes?: string | null;

  createdById?: string | null;
  createdByName?: string | null;
  createdAt: string;
  updatedAt: string;
}

