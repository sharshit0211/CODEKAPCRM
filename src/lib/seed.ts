import { prisma } from './prisma';

const SQLITE_INIT_TABLES = [
  `CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'TEAM',
    "avatar" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "department" TEXT DEFAULT 'Development',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");`,
  
  `CREATE TABLE IF NOT EXISTS "Department" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "headId" TEXT,
    "headName" TEXT,
    "description" TEXT,
    "icon" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Department_name_key" ON "Department"("name");`,

  `CREATE TABLE IF NOT EXISTS "Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "department" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'EMPLOYEE',
    "managerId" TEXT,
    "managerName" TEXT,
    "joiningDate" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "avatar" TEXT,
    "workloadScore" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Employee_employeeId_key" ON "Employee"("employeeId");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Employee_email_key" ON "Employee"("email");`,

  `CREATE TABLE IF NOT EXISTS "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadCode" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'Website',
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "assignedToId" TEXT,
    "assignedToName" TEXT,
    "lastContactDate" TEXT,
    "nextFollowUpDate" TEXT,
    "estimatedValue" REAL NOT NULL DEFAULT 0,
    "requirementNotes" TEXT,
    "convertedClientId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Lead_leadCode_key" ON "Lead"("leadCode");`,

  `CREATE TABLE IF NOT EXISTS "Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT DEFAULT '',
    "clientCode" TEXT DEFAULT '',
    "githubRepo" TEXT DEFAULT '',
    "deploymentUrl" TEXT DEFAULT '',
    "status" TEXT DEFAULT 'ACTIVE',
    "description" TEXT NOT NULL,
    "brandTone" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "department" TEXT NOT NULL DEFAULT 'Development',
    "managerId" TEXT,
    "managerName" TEXT,
    "teamMembersJson" TEXT DEFAULT '[]',
    "startDate" TEXT NOT NULL,
    "deadline" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "health" TEXT NOT NULL DEFAULT 'ON_TRACK',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "description" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "billingTotal" REAL NOT NULL DEFAULT 0,
    "billingPaid" REAL NOT NULL DEFAULT 0,
    "gitRepoUrl" TEXT,
    "liveUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Project_projectCode_key" ON "Project"("projectCode");`,

  `CREATE TABLE IF NOT EXISTS "Milestone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 1,
    "dueDate" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "assignedToId" TEXT NOT NULL,
    "assignedToName" TEXT NOT NULL,
    "assignedToEmail" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "assignedByName" TEXT NOT NULL,
    "clientId" TEXT,
    "clientName" TEXT,
    "campaignId" TEXT,
    "campaignName" TEXT,
    "projectId" TEXT,
    "projectName" TEXT,
    "sopRef" TEXT,
    "proofUrl" TEXT,
    "githubLink" TEXT,
    "estimatedHours" REAL,
    "dueDate" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS "WorkLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "employeeName" TEXT NOT NULL,
    "employeeEmail" TEXT NOT NULL,
    "projectId" TEXT,
    "projectName" TEXT,
    "taskId" TEXT,
    "taskTitle" TEXT,
    "date" TEXT NOT NULL,
    "workCompleted" TEXT NOT NULL,
    "timeSpentHours" REAL NOT NULL DEFAULT 0,
    "proofUrl" TEXT,
    "blocker" TEXT,
    "tomorrowPlan" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS "SOP" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "checklistJson" TEXT NOT NULL DEFAULT '[]',
    "requiredProof" TEXT,
    "expectedDurationHours" REAL NOT NULL DEFAULT 0,
    "responsibleRole" TEXT NOT NULL DEFAULT 'EMPLOYEE',
    "version" TEXT NOT NULL DEFAULT '1.0',
    "active" BOOLEAN NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "SOP_code_key" ON "SOP"("code");`,

  `CREATE TABLE IF NOT EXISTS "Quotation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quotationNumber" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "validUntil" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientGstin" TEXT,
    "billingAddress" TEXT,
    "itemsJson" TEXT NOT NULL DEFAULT '[]',
    "subtotal" REAL NOT NULL DEFAULT 0,
    "taxAmount" REAL NOT NULL DEFAULT 0,
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "bankDetails" TEXT,
    "terms" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Quotation_quotationNumber_key" ON "Quotation"("quotationNumber");`,

  `CREATE TABLE IF NOT EXISTS "Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceNumber" TEXT NOT NULL,
    "quotationId" TEXT,
    "date" TEXT NOT NULL,
    "dueDate" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientGstin" TEXT,
    "billingAddress" TEXT,
    "itemsJson" TEXT NOT NULL DEFAULT '[]',
    "subtotal" REAL NOT NULL DEFAULT 0,
    "cgst" REAL NOT NULL DEFAULT 0,
    "sgst" REAL NOT NULL DEFAULT 0,
    "igst" REAL NOT NULL DEFAULT 0,
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "amountPaid" REAL NOT NULL DEFAULT 0,
    "balanceDue" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "paymentMethod" TEXT,
    "razorpayPaymentLinkId" TEXT,
    "razorpayPaymentId" TEXT,
    "notes" TEXT,
    "terms" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");`,

  `CREATE TABLE IF NOT EXISTS "Vendor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "contactPerson" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "gstin" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "category" TEXT DEFAULT 'SERVICE',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS "PurchaseOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "poNumber" TEXT NOT NULL,
    "orderDate" TEXT NOT NULL,
    "expectedDeliveryDate" TEXT,
    "paymentTerms" TEXT DEFAULT 'Net 15 Days',
    "poValidity" TEXT DEFAULT '30 Days',
    "projectRefNo" TEXT,
    "deliveryTerms" TEXT DEFAULT 'As per agreed schedule',
    "modeOfTransport" TEXT DEFAULT 'By Courier / Transport',
    "remarks" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "vendorId" TEXT,
    "vendorName" TEXT NOT NULL,
    "vendorAddress" TEXT,
    "vendorGstin" TEXT,
    "vendorEmail" TEXT,
    "vendorPhone" TEXT,
    "buyerName" TEXT NOT NULL DEFAULT 'CODEKAPS DIGITAL INNOVATIONS PVT. LTD.',
    "buyerAddress" TEXT NOT NULL DEFAULT 'A-12, Sector 4, Noida, Uttar Pradesh – 201301\nIndia',
    "buyerGstin" TEXT NOT NULL DEFAULT '03AAMCC6345B1Z0',
    "buyerPhone" TEXT NOT NULL DEFAULT '7528835379',
    "buyerEmail" TEXT NOT NULL DEFAULT 'info@codekap.in',
    "itemsJson" TEXT NOT NULL DEFAULT '[]',
    "isInterState" BOOLEAN NOT NULL DEFAULT 1,
    "subtotal" REAL NOT NULL DEFAULT 0,
    "totalDiscount" REAL NOT NULL DEFAULT 0,
    "taxableAmount" REAL NOT NULL DEFAULT 0,
    "cgstTotal" REAL NOT NULL DEFAULT 0,
    "sgstTotal" REAL NOT NULL DEFAULT 0,
    "igstTotal" REAL NOT NULL DEFAULT 0,
    "grandTotal" REAL NOT NULL DEFAULT 0,
    "amountInWords" TEXT,
    "showBankDetails" BOOLEAN NOT NULL DEFAULT 1,
    "bankDetailsJson" TEXT,
    "terms" TEXT,
    "signatoryName" TEXT DEFAULT 'Authorized Signatory',
    "signatoryCompany" TEXT DEFAULT 'CODEKAPS DIGITAL INNOVATIONS PRIVATE LIMITED',
    "signatureUrl" TEXT DEFAULT '/images/aman-signature.png',
    "notes" TEXT,
    "createdById" TEXT,
    "createdByName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "PurchaseOrder_poNumber_key" ON "PurchaseOrder"("poNumber");`,

  `CREATE TABLE IF NOT EXISTS "Expense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "vendor" TEXT NOT NULL,
    "amount" REAL NOT NULL DEFAULT 0,
    "gstAmount" REAL NOT NULL DEFAULT 0,
    "paymentMethod" TEXT NOT NULL DEFAULT 'Bank Transfer',
    "description" TEXT NOT NULL,
    "attachmentUrl" TEXT,
    "department" TEXT NOT NULL DEFAULT 'Management',
    "projectId" TEXT,
    "projectName" TEXT,
    "createdById" TEXT,
    "createdByName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS "MarketingContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "campaignId" TEXT,
    "platform" TEXT NOT NULL DEFAULT 'Instagram',
    "contentType" TEXT NOT NULL DEFAULT 'Post',
    "title" TEXT NOT NULL,
    "caption" TEXT,
    "creativeUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "publishDate" TEXT NOT NULL,
    "resultsJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS "Campaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'Google Ads',
    "location" TEXT NOT NULL,
    "dailyBudget" REAL NOT NULL,
    "totalBudget" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CAD',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "googleAdsCampaignId" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TEXT,
    "metricsSpend" REAL NOT NULL DEFAULT 0,
    "metricsImpressions" INTEGER NOT NULL DEFAULT 0,
    "metricsClicks" INTEGER NOT NULL DEFAULT 0,
    "metricsCtr" REAL NOT NULL DEFAULT 0,
    "metricsCpc" REAL NOT NULL DEFAULT 0,
    "metricsConversions" INTEGER NOT NULL DEFAULT 0,
    "metricsCpa" REAL NOT NULL DEFAULT 0,
    "metricsConvRate" REAL NOT NULL DEFAULT 0,
    "aiInsight" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS "Creative" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'IMAGE',
    "provider" TEXT NOT NULL DEFAULT 'Gemini',
    "model" TEXT NOT NULL DEFAULT 'gemini-3.6-flash',
    "prompt" TEXT NOT NULL,
    "aspectRatio" TEXT NOT NULL DEFAULT '1:1',
    "imageUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'FINAL',
    "metadataJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS "Invitation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'TEAM_MEMBER',
    "department" TEXT DEFAULT 'Development',
    "passcode" TEXT NOT NULL,
    "tokenHash" TEXT,
    "invitedBy" TEXT,
    "invitedByName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Invitation_passcode_key" ON "Invitation"("passcode");`,

  `CREATE TABLE IF NOT EXISTS "SocialAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "accountType" TEXT NOT NULL DEFAULT 'PROFESSIONAL',
    "accountId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "pageName" TEXT,
    "profilePictureUrl" TEXT,
    "encryptedToken" TEXT,
    "tokenExpiresAt" DATETIME,
    "isConnected" BOOLEAN NOT NULL DEFAULT 1,
    "connectionHealth" TEXT NOT NULL DEFAULT 'HEALTHY',
    "healthMessage" TEXT,
    "connectedById" TEXT,
    "connectedByName" TEXT,
    "lastSyncAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "SocialAccount_clientId_platform_accountId_key" ON "SocialAccount"("clientId", "platform", "accountId");`,

  `CREATE TABLE IF NOT EXISTS "SocialPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdByEmail" TEXT,
    "platformsJson" TEXT NOT NULL DEFAULT '["INSTAGRAM","FACEBOOK"]',
    "caption" TEXT NOT NULL,
    "hashtagsJson" TEXT NOT NULL DEFAULT '[]',
    "location" TEXT,
    "locationJson" TEXT,
    "mediaJson" TEXT NOT NULL DEFAULT '[]',
    "musicJson" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "scheduledAt" DATETIME,
    "publishedAt" DATETIME,
    "failureReason" TEXT,
    "lastEditedById" TEXT,
    "lastEditedByName" TEXT,
    "lastEditedAt" DATETIME,
    "isLocked" BOOLEAN NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,

  `CREATE TABLE IF NOT EXISTS "SocialPublishAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL,
    "responsePayload" TEXT,
    "errorMessage" TEXT,
    "platformPostId" TEXT,
    "platformPostUrl" TEXT,
    "attemptedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("postId") REFERENCES "SocialPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,

  `CREATE TABLE IF NOT EXISTS "SocialActivityLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "postId" TEXT,
    "action" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "details" TEXT,
    "platform" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,

  `CREATE TABLE IF NOT EXISTS "SocialClientConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "defaultLocation" TEXT NOT NULL DEFAULT 'Aura Vital Star, Brampton',
    "defaultTimezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "brandTone" TEXT NOT NULL DEFAULT 'Inspiring, Engaging, Professional',
    "defaultHashtagsJson" TEXT NOT NULL DEFAULT '[]',
    "autoHashtags" BOOLEAN NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "SocialClientConfig_clientId_key" ON "SocialClientConfig"("clientId");`,

  `CREATE TABLE IF NOT EXISTS "Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT,
    "clientName" TEXT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'GROUP',
    "avatarUrl" TEXT,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "lastMessage" TEXT,
    "lastMessageAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,

  `CREATE TABLE IF NOT EXISTS "ConversationMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "userAvatar" TEXT,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "ConversationMember_conversationId_userId_key" ON "ConversationMember"("conversationId", "userId");`,

  `CREATE TABLE IF NOT EXISTS "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "senderEmail" TEXT,
    "senderAvatar" TEXT,
    "content" TEXT NOT NULL,
    "messageType" TEXT NOT NULL DEFAULT 'TEXT',
    "attachmentUrl" TEXT,
    "attachmentName" TEXT,
    "attachmentSize" INTEGER,
    "isEdited" BOOLEAN NOT NULL DEFAULT 0,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,

  `CREATE TABLE IF NOT EXISTS "MessageRead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("messageId") REFERENCES "Message" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "MessageRead_messageId_userId_key" ON "MessageRead"("messageId", "userId");`
];

let tablesEnsured = false;
let isSeeded = false;
let seedPromise: Promise<void> | null = null;

export async function ensureSeedData() {
  if (isSeeded) return;
  if (seedPromise) return seedPromise;

  seedPromise = (async () => {
    try {
      if (!tablesEnsured) {
        for (const query of SQLITE_INIT_TABLES) {
          try {
            await prisma.$executeRawUnsafe(query);
          } catch {}
        }
        // Ensure department column exists in User and Invitation
        try {
          await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN "department" TEXT DEFAULT 'Development';`);
        } catch {}
        try {
          await prisma.$executeRawUnsafe(`ALTER TABLE "Invitation" ADD COLUMN "department" TEXT DEFAULT 'Development';`);
        } catch {}
        tablesEnsured = true;
      }

    // 1. Ensure Super Admin (Aman Sir)
    const existingAman = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'aman@codekap.com' },
          { id: 'usr_aman' }
        ]
      },
    });

    if (!existingAman) {
      await prisma.user.create({
        data: {
          id: 'usr_aman',
          name: 'Aman Sir',
          email: 'aman@codekap.com',
          role: 'ADMIN',
          title: 'Super Admin / Founder & CEO',
          department: 'Administration & Management',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        },
      });
    } else if (!existingAman.department) {
      await prisma.user.update({
        where: { id: existingAman.id },
        data: { department: 'Administration & Management' }
      }).catch(() => null);
    }

    // 2. Ensure Active Super Admin Passcode (AGENT-7788) & Developer Passcode (AGENT-5829)
    try {
      const existingInvite = await prisma.invitation.findFirst({
        where: { passcode: 'AGENT-7788' },
      });
      if (!existingInvite) {
        const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days
        await prisma.invitation.create({
          data: {
            email: 'admin@codekap.com',
            name: 'Workspace Joining Invite',
            role: 'ADMIN',
            department: 'Administration & Management',
            passcode: 'AGENT-7788',
            status: 'PENDING',
            invitedBy: 'usr_aman',
            invitedByName: 'Aman Sir',
            message: 'Official joining passcode for Codekap marketing workspace.',
            expiresAt,
          },
        });
      }

      const existingHarshit8517 = await prisma.invitation.findFirst({
        where: { passcode: 'AGENT-8517' },
      });
      if (!existingHarshit8517) {
        const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
        await prisma.invitation.create({
          data: {
            email: 'sharshit.0211@gmail.com',
            name: 'Harshit Singh',
            role: 'DEVELOPER',
            department: 'Development',
            passcode: 'AGENT-8517',
            status: 'PENDING',
            invitedBy: 'usr_aman',
            invitedByName: 'Aman Sir (Super Admin)',
            message: 'Welcome to CodeKap OS workspace! Use this passcode to register and activate your account.',
            expiresAt,
          },
        });
      }

      const existingHarshitInvite = await prisma.invitation.findFirst({
        where: { passcode: 'AGENT-5829' },
      });
      if (!existingHarshitInvite) {
        const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days
        await prisma.invitation.create({
          data: {
            email: 'sharshit.0211@gmail.com',
            name: 'Harshit',
            role: 'DEVELOPER',
            department: 'Development',
            passcode: 'AGENT-5829',
            status: 'PENDING',
            invitedBy: 'usr_aman',
            invitedByName: 'Aman Sir (Super Admin)',
            message: 'Welcome to CodeKap OS workspace! Use this passcode to register and activate your account.',
            expiresAt,
          },
        });
      }
    } catch (inviteSeedErr) {
      console.warn('[Seed Invites Warning]:', inviteSeedErr);
    }

    // 3. Ensure Core Departments
    const deptCount = await prisma.department.count();
    if (deptCount === 0) {
      await prisma.department.createMany({
        data: [
          { name: 'Sales & Business Development', headName: 'Aman Sir', description: 'Lead generation, sales pipeline, quotation negotiation & client onboarding' },
          { name: 'Development', headName: 'Lead Architect', description: 'Web app development, Next.js architecture, frontend/backend engineering & QA' },
          { name: 'Digital Marketing', headName: 'Marketing Lead', description: 'SEO, Google Ads, Meta Reels/Banners, performance marketing & creative campaigns' },
          { name: 'Administration & Management', headName: 'Aman Sir', description: 'Finance, GST invoicing, employee management, SOPs and business reporting' },
        ],
      });
    }

    // 3b. Ensure Initial Employees in SQLite Employee Table (Persistent DB Records)
    const empCount = await prisma.employee.count();
    if (empCount === 0) {
      const dbAman = await prisma.user.findFirst({
        where: { email: 'aman@codekap.com' },
      });
      await prisma.employee.createMany({
        data: [
          {
            id: 'emp_01',
            employeeId: 'CK-EMP-001',
            name: 'Aman Sir',
            email: 'aman@codekap.com',
            phone: '+91 98765 43210',
            department: 'Administration & Management',
            designation: 'Founder & CEO',
            role: 'SUPER_ADMIN',
            joiningDate: '2025-01-01',
            status: 'ACTIVE',
            workloadScore: 40,
            avatar: dbAman?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          },
          {
            id: 'emp_02',
            employeeId: 'CK-EMP-002',
            name: 'Harshit Singh',
            email: 'harshitsingh19622@gmail.com',
            phone: '+91 91234 56789',
            department: 'Development',
            designation: 'Lead Architect / Senior Engineer',
            role: 'DEPT_HEAD',
            managerName: 'Aman Sir',
            joiningDate: '2025-06-15',
            status: 'ACTIVE',
            workloadScore: 85,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=harshit',
          },
          {
            id: 'emp_03',
            employeeId: 'CK-EMP-003',
            name: 'Pooja Sharma',
            email: 'pooja.sharma@codekap.com',
            phone: '+91 98111 22334',
            department: 'Digital Marketing',
            designation: 'Performance Marketing Strategist',
            role: 'EMPLOYEE',
            managerName: 'Aman Sir',
            joiningDate: '2025-08-01',
            status: 'ACTIVE',
            workloadScore: 60,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pooja',
          },
        ],
      });
    }

    // 4. Ensure Core SOP Templates
    const sopCount = await prisma.sOP.count();
    if (sopCount === 0) {
      await prisma.sOP.createMany({
        data: [
          {
            code: 'SOP-DEV-01',
            title: 'Fullstack Web Application Development SOP',
            department: 'Development',
            service: 'Custom Web Application',
            purpose: 'Standardize end-to-end web engineering from requirement SRS to deployment.',
            instructions: 'Follow standard Next.js + Tailwind + PostgreSQL architecture. Validate responsive layouts, write API tests, and secure role authorizations.',
            checklistJson: JSON.stringify([
              '1. Requirement Gathering & SRS Review',
              '2. UI/UX Wireframing & Design Signoff',
              '3. Database Schema & Prisma Migration',
              '4. API Endpoints & Server-Side Security Guard',
              '5. Frontend Component Assembly & Responsive Layout QA',
              '6. Client Demo & Feedback Iteration',
              '7. Production Deployment & Monitoring Setup'
            ]),
            requiredProof: 'Live deployment URL + GitHub PR Link + QA Checklist Signoff',
            expectedDurationHours: 40,
            responsibleRole: 'EMPLOYEE',
          },
          {
            code: 'SOP-MKT-01',
            title: 'Performance Digital Marketing & Google/Meta Ads SOP',
            department: 'Digital Marketing',
            service: 'Performance Marketing',
            purpose: 'Drive predictable lead generation and brand awareness with measurable ROAS.',
            instructions: 'Create conversion-focused visual creatives, setup UTM campaign tracking, configure conversion pixels, and monitor daily spend vs CPA.',
            checklistJson: JSON.stringify([
              '1. Audience Research & Competitor Benchmark',
              '2. Creative Visual Direction & Copywriting',
              '3. Conversion Pixel & Conversion Tracking Setup',
              '4. Campaign Setup in Ads Manager with Daily Budget',
              '5. A/B Testing Headings and Creatives',
              '6. Weekly Performance Optimization & CPA Audit',
              '7. Monthly Client Performance Report'
            ]),
            requiredProof: 'Ads Manager Screenshot + Lead Export Sheet + Monthly ROI Dashboard',
            expectedDurationHours: 20,
            responsibleRole: 'EMPLOYEE',
          }
        ],
      });
    }

    // 5. Ensure Premier Clients (Aura Vital Star & Jeevansphere) for KAIRO Social
    const existingAura = await prisma.client.findFirst({
      where: {
        OR: [
          { name: 'Aura Vital Star' },
          { id: 'cli_auravitalstar_01' }
        ]
      }
    });

    let auraId = existingAura?.id || 'cli_auravitalstar_01';

    if (!existingAura) {
      const createdAura = await prisma.client.create({
        data: {
          id: 'cli_auravitalstar_01',
          name: 'Aura Vital Star',
          businessName: 'Aura Vital Star Wellness & Aesthetics',
          website: 'https://auravitalstar.com',
          industry: 'Holistic Wellness & Luxury Aesthetic Care',
          country: 'Canada',
          province: 'Ontario',
          city: 'Brampton',
          contactName: 'Aura Vital Management',
          contactEmail: 'contact@auravitalstar.com',
          contactPhone: '+1 (905) 555-0199',
          clientCode: 'CK-AURA-8821',
          githubRepo: 'https://github.com/codekap/aura-vital-star',
          deploymentUrl: 'https://auravitalstar.com',
          status: 'ACTIVE',
          description: 'Aura Vital Star provides premium holistic wellness, vitality treatments, restorative therapies, and aesthetic rejuvenation in the Greater Toronto Area.',
          brandTone: 'Sophisticated, Calming, Inspiring, High-End Wellness',
          logoUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=150&auto=format&fit=crop&q=80',
        }
      });
      auraId = createdAura.id;
    }

    // Ensure Aura Vital Star Social Client Config
    const existingAuraConfig = await prisma.socialClientConfig.findFirst({
      where: { clientId: auraId }
    });
    if (!existingAuraConfig) {
      await prisma.socialClientConfig.create({
        data: {
          clientId: auraId,
          defaultLocation: 'Aura Vital Star, Brampton',
          defaultTimezone: 'America/Toronto',
          brandTone: 'Sophisticated, Calming, Inspiring, High-End Wellness',
          defaultHashtagsJson: JSON.stringify(['#AuraVitalStar', '#BramptonWellness', '#LuxurySpaBrampton', '#OntarioHealth', '#HolisticVitality']),
          autoHashtags: true,
        }
      });
    }

    // Ensure Aura Vital Star Social Accounts (Instagram & Facebook)
    const existingAuraIG = await prisma.socialAccount.findFirst({
      where: { clientId: auraId, platform: 'INSTAGRAM' }
    });
    if (!existingAuraIG) {
      await prisma.socialAccount.create({
        data: {
          clientId: auraId,
          platform: 'INSTAGRAM',
          accountType: 'PROFESSIONAL',
          accountId: 'ig_auravitalstar_991',
          username: '@auravitalstar',
          pageName: 'Aura Vital Star Official',
          profilePictureUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=150&auto=format&fit=crop&q=80',
          isConnected: true,
          connectionHealth: 'HEALTHY',
          healthMessage: 'Meta Graph API v20.0 token active & healthy',
          connectedById: 'usr_aman',
          connectedByName: 'Aman Sir',
          lastSyncAt: new Date(),
        }
      });
    }

    const existingAuraFB = await prisma.socialAccount.findFirst({
      where: { clientId: auraId, platform: 'FACEBOOK' }
    });
    if (!existingAuraFB) {
      await prisma.socialAccount.create({
        data: {
          clientId: auraId,
          platform: 'FACEBOOK',
          accountType: 'PAGE',
          accountId: 'fb_page_auravitalstar_882',
          username: 'Aura Vital Star',
          pageName: 'Aura Vital Star Brampton',
          profilePictureUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=150&auto=format&fit=crop&q=80',
          isConnected: true,
          connectionHealth: 'HEALTHY',
          healthMessage: 'Meta Page Publishing permissions granted',
          connectedById: 'usr_aman',
          connectedByName: 'Aman Sir',
          lastSyncAt: new Date(),
        }
      });
    }

    // Ensure Jeevansphere client and config
    const existingJeevan = await prisma.client.findFirst({
      where: {
        OR: [
          { name: 'Jeevansphere' },
          { id: 'cli_jeevansphere_default' }
        ]
      }
    });

    let jeevanId = existingJeevan?.id || 'cli_jeevansphere_default';
    if (!existingJeevan) {
      const createdJeevan = await prisma.client.create({
        data: {
          id: 'cli_jeevansphere_default',
          name: 'Jeevansphere',
          businessName: 'Jeevansphere Eye Care & Healthcare',
          website: 'http://jeevansphere.com/',
          industry: 'Eye Care / Healthcare Platform',
          country: 'India',
          province: 'Delhi',
          city: 'Connaught Place, New Delhi',
          contactName: 'Deepak Yadav',
          contactEmail: 'jeevansphere@com.in',
          contactPhone: '9690922001',
          clientCode: 'CK-JEEV-2001',
          githubRepo: 'https://github.com/harshito0/AIMarketing',
          deploymentUrl: 'http://jeevansphere.com/',
          status: 'ACTIVE',
          description: 'JeevanSphere connects patients with premier eye surgery, laser vision correction, and specialized healthcare treatments across Delhi NCR.',
          brandTone: 'Compassionate, Authoritative, High-Converting Medical',
          logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=Jeevansphere',
        }
      });
      jeevanId = createdJeevan.id;
    }

    const existingJeevanConfig = await prisma.socialClientConfig.findFirst({
      where: { clientId: jeevanId }
    });
    if (!existingJeevanConfig) {
      await prisma.socialClientConfig.create({
        data: {
          clientId: jeevanId,
          defaultLocation: 'Jeevansphere Clinic, CP New Delhi',
          defaultTimezone: 'Asia/Kolkata',
          brandTone: 'Compassionate, Authoritative, High-Converting Medical',
          defaultHashtagsJson: JSON.stringify(['#Jeevansphere', '#DelhiEyeCare', '#LasikDelhi', '#ClearVision']),
          autoHashtags: true,
        }
      });
    }

    // -------------------------------------------------------------
    // Seed Real Procurement Vendors
    // -------------------------------------------------------------
    const seedVendors = [
      {
        id: 'ven_abc_tech_01',
        name: 'ABC Technologies Pvt. Ltd.',
        contactPerson: 'Rajesh Sharma',
        email: 'sales@abctech.in',
        phone: '+91-9876543210',
        gstin: '09ABCDE1234F1Z5',
        address: '123 Business Park, Sector 62, Noida, Uttar Pradesh - 201309\nIndia',
        city: 'Noida',
        state: 'Uttar Pradesh',
        pincode: '201309',
        category: 'SERVICE',
        status: 'ACTIVE',
        notes: 'Primary IT infrastructure & web development vendor partner',
      },
      {
        id: 'ven_aws_india_02',
        name: 'Amazon Web Services India Pvt Ltd',
        contactPerson: 'Enterprise Cloud Accounts',
        email: 'aws-india-billing@amazon.com',
        phone: '+91 80 4040 0000',
        gstin: '29AABCA9876C1Z1',
        address: 'Bagmane World Technology Center, Outer Ring Road, Mahadevapura, Bengaluru, Karnataka - 560048',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560048',
        category: 'CLOUD',
        status: 'ACTIVE',
        notes: 'Cloud hosting, compute clusters, CDN & cloud database infrastructure',
      },
      {
        id: 'ven_google_cloud_03',
        name: 'Google Cloud India Pvt Ltd',
        contactPerson: 'Enterprise Billing & Workspace',
        email: 'gsuite-billing-in@google.com',
        phone: '+91 124 451 2900',
        gstin: '06AAACG8466J1ZQ',
        address: 'Unitech Signature Tower, Sector 30, Gurugram, Haryana - 122001',
        city: 'Gurugram',
        state: 'Haryana',
        pincode: '122001',
        category: 'SOFTWARE',
        status: 'ACTIVE',
        notes: 'Google Workspace business suite, Gemini AI APIs & cloud infrastructure',
      },
      {
        id: 'ven_razorpay_04',
        name: 'Razorpay Software Private Limited',
        contactPerson: 'Payment Gateway Partner Desk',
        email: 'procurement@razorpay.com',
        phone: '+91 80 6828 3838',
        gstin: '29AABCR8007F1Z6',
        address: 'SJR Cyber, 1st Floor, 22 Laskar-Hosur Road, Adugodi, Bengaluru, Karnataka - 560030',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560030',
        category: 'FINTECH',
        status: 'ACTIVE',
        notes: 'Payment gateway API, payment links and merchant settlement services',
      },
    ];

    for (const v of seedVendors) {
      const existingVendor = await prisma.vendor.findFirst({
        where: { OR: [{ id: v.id }, { name: v.name }] },
      });
      if (!existingVendor) {
        await prisma.vendor.create({ data: v });
      }
    }

    // -------------------------------------------------------------
    // Seed Reference Sample Purchase Order (CK-PO-2025-001)
    // Matches the visual reference mockup exactly
    // -------------------------------------------------------------
    const existingRefPO = await prisma.purchaseOrder.findUnique({
      where: { poNumber: 'CK-PO-2025-001' },
    });

    if (!existingRefPO) {
      const sampleItems = [
        {
          srNo: 1,
          description: 'Web Development Services',
          deliverables: [
            '(Website Design & Development)',
            '- UI/UX Design',
            '- Frontend & Backend Development',
            '- Testing & Deployment',
          ],
          hsn: '998365',
          qty: 1,
          unit: 'NOS',
          unitPrice: 50000,
          discount: 0,
          taxableAmount: 50000,
          gstRate: 18,
          cgstRate: 0,
          cgstAmount: 0,
          sgstRate: 0,
          sgstAmount: 0,
          igstRate: 18,
          igstAmount: 9000,
          totalAmount: 59000,
        },
        {
          srNo: 2,
          description: 'Domain Registration',
          deliverables: ['(1 Year)'],
          hsn: '998313',
          qty: 1,
          unit: 'NOS',
          unitPrice: 1200,
          discount: 0,
          taxableAmount: 1200,
          gstRate: 18,
          cgstRate: 0,
          cgstAmount: 0,
          sgstRate: 0,
          sgstAmount: 0,
          igstRate: 18,
          igstAmount: 216,
          totalAmount: 1416,
        },
        {
          srNo: 3,
          description: 'Hosting Setup & Configuration',
          deliverables: ['(1 Year)'],
          hsn: '998313',
          qty: 1,
          unit: 'NOS',
          unitPrice: 3000,
          discount: 0,
          taxableAmount: 3000,
          gstRate: 18,
          cgstRate: 0,
          cgstAmount: 0,
          sgstRate: 0,
          sgstAmount: 0,
          igstRate: 18,
          igstAmount: 540,
          totalAmount: 3540,
        },
      ];

      await prisma.purchaseOrder.create({
        data: {
          poNumber: 'CK-PO-2025-001',
          orderDate: '10-10-2025',
          expectedDeliveryDate: '15-10-2025',
          paymentTerms: 'Net 15 Days',
          poValidity: '30 Days',
          projectRefNo: 'PRJ-CK-2025-08',
          deliveryTerms: 'As per agreed schedule',
          modeOfTransport: 'By Courier / Transport',
          remarks: 'Please confirm the order and share the tracking details.',
          status: 'ISSUED',
          vendorId: 'ven_abc_tech_01',
          vendorName: 'ABC Technologies Pvt. Ltd.',
          vendorAddress: '123 Business Park, Sector 62,\nNoida, Uttar Pradesh - 201309\nIndia',
          vendorGstin: '09ABCDE1234F1Z5',
          vendorEmail: 'sales@abctech.in',
          vendorPhone: '+91-9876543210',
          buyerName: 'CODEKAPS DIGITAL INNOVATIONS PVT. LTD.',
          buyerAddress: 'A-12, Sector 4, Noida, Uttar Pradesh – 201301\nIndia',
          buyerGstin: '03AAMCC6345B1Z0',
          buyerPhone: '7528835379',
          buyerEmail: 'info@codekap.in',
          itemsJson: JSON.stringify(sampleItems),
          isInterState: true,
          subtotal: 54200,
          totalDiscount: 0,
          taxableAmount: 54200,
          cgstTotal: 0,
          sgstTotal: 0,
          igstTotal: 9756,
          grandTotal: 63956,
          amountInWords: 'Sixty Three Thousand Nine Hundred Fifty Six Rupees Only',
          showBankDetails: true,
          terms: `1. Payment Terms: Net 15 Days from the date of invoice.
2. Delivery Timeline: As per agreed schedule mentioned above.
3. Scope of Work: As per the agreed quotation / project details.
4. GST: Currently unregistered for GST. No GST is charged on this purchase order.
5. Warranty: As per vendor terms and conditions.
6. Validity: This PO is valid for 30 days from the date of issue.`,
          signatoryName: 'Authorized Signatory',
          signatoryCompany: 'CODEKAPS DIGITAL INNOVATIONS PRIVATE LIMITED',
          signatureUrl: '/images/aman-signature.png',
          createdById: 'usr_aman',
          createdByName: 'Aman Sir',
        },
      });
    }

    isSeeded = true;
  } catch (err) {
    console.warn('[Seed Data Warning]:', err);
  } finally {
    seedPromise = null;
  }
})();

  return seedPromise;
}
