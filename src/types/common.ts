export interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}

export interface Option {
  name: string;
  value: any;
  [key: string]: any;
}

export interface Group {
  id: string;
  label: string;
  options: Option[];
}

export interface GroupedClubOption {
  label: string;
  code: string;
  items: Array<Option>;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

export interface ClubRole {
  clubName: string;
  ageGroupName?: string;
  teamName: string;
  roles: string[];
}

export interface UserWithDetails {
  id: number;
  name: string;
  email?: string;
  phoneNumber?: string;
  gender?: string;
  clubRoles?: ClubRole[];
  profileImageUrl?: string;
  status: number;
}

export interface UsersSummary {
  activeTrainers?: number;
  inactiveTrainers?: number;
  totalTrainers?: number;
  trainersThisWeek?: number;
  activeCoaches?: number;
  inactiveCoaches?: number;
  totalCoaches?: number;
  coachesThisWeek?: number;
  activePlayers?: number;
  inactivePlayers?: number;
  totalPlayers?: number;
  playersThisWeek?: number;
}

export interface Federation {
  id: number;
  name: string;
  code: string;
  country: string;
}

export interface Supplier {
  id: number;
  name: string;
  federationId: number;
  federation: string;
  federationName: string;
}

export interface AgeCategory {
  ageGroupId: number;
  name: string;
  isYoungestYouth?: boolean;
  ageCategory?: number;
}

export interface TableDataRef {
  id: number;
  name: string;
  [key: string]: any;
}

export interface LearningLine {
  id: number;
  name: string;
  startDate?: string;
  endDate?: string;
  isClubAdmin?: boolean;
  code?: string;
  description?: string;
  targetGroups?: TableDataRef[];
  ageGroups?: TableDataRef[];
  clubs?: TableDataRef[];
  weekCount?: number;
  totalWeeks?: number;
  totalContent?: number;
  status?: number;
  seasonId?: number;
  seasonName?: string;
  isRecurring?: boolean;
}

export interface Team {
  id: number;
  name: string;
  ageGroupId: number;
  ageGroupName: string;
  clubId: number;
  clubName: string;
}

export interface Club {
  id: number;
  name: string;
  code: string;
  country: string;
  isActive?: boolean;
  logoUrl?: string;
  documentName?: string;
  documentUrl?: string;
  contractStatus?: number;
  contractExpiry?: string;
  activeModules?: string[];
}

export interface ClubDetailsFormData {
  Id?: number;
  Logo?: File | null;
  ClubName: string;
  Country: string;
  FederationId: number;
  BondNumber?: string;
  EmailOrMemberId: string;
  SupplierId: number;
  LabelType?: number;
  logoUrl?: string;
  isLogoUpdated?: boolean;
}

export interface ClubContact {
  id?: number;
  name: string;
  roleId: number;
  email: string;
  phone?: string;
  isAdminAccess: boolean;
  isPrimaryContact: boolean;
}

export interface ClubContactApiFormat {
  id?: number;
  uniqueId?: string;
  name: string;
  roleTypeId: number;
  email: string;
  phone: string;
  isPrimary: boolean;
  hasAdminAccess: boolean;
}

export interface ContractDocument {
  id?: number;
  uniqueId?: string;
  documentCategory: string;
  file: File | null;
  fileIndex?: number;
  documentUrl?: string;
  documentName?: string;
  startDate: Date | null;
  endDate: Date | null;
  autoRenewal: boolean;
  autoRenewalTill?: number;
  numberOfMembers?: number;
  price: number;
}

export interface ContractDocumentApiFormat {
  id?: number;
  fileIndex?: number;
  documentCategory: string;
  startDate?: string;
  endDate?: string;
  autoRenewal?: boolean;
  autoRenewalPeriod?: number;
  pricingModel?: number;
  numberOfMembers?: number;
}
export interface FileFormData {
  id?: number;
  title: string;
  description: string;
  files?: File[];
  fileType?: number;
  exerciseId?: number;
}

export interface FileData {
  id?: number;
  title?: string;
  description?: string;
  type?: number;
  fileType?: number;
  position?: number;
  files?: Array<{
    id: number;
    url: string;
    publicId: string;
    thumbnail: string;
    fileName: string;
    size: number;
    duration: number | null;
    width: number;
    height: number;
  }>;
}

export interface DashboardData {
  id: number;
  name: string;
  code: string;
  country: string | null;
  logoUrl: string | null;
  labelType: string;
  isActive: boolean;
  contractDetails: {
    expiryDate: string;
    expiryText: string;
    autoRenewal: boolean;
    autoRenewalPeriod: string;
    pricingModel: string;
    annualPrice: number | null;
    daysUntilExpiry: number;
    status: string;
  };
  kpis: {
    activeTrainers: number;
    inactiveTrainers: number;
    totalTrainers: number;
    trainersPercentage: number;
    trainersThisWeek?: number;
    activePlayers: number;
    inactivePlayers: number;
    totalPlayers: number;
    playersPercentage: number;
    playersThisWeek?: number;
    activeCoaches: number;
    inactiveCoaches: number;
    totalCoaches: number;
    coachesPercentage: number;
    coachesThisWeek?: number;
    modulesActive: number;
    modulesText: string;
    trainersWeeklyAdditions: number;
    playersWeeklyAdditions: number;
    coachesWeeklyAdditions: number;
  };
  contactPersons: Array<{
    id?: number;
    name: string;
    roleId?: number;
    phone?: string;
    email: string;
    isPrimary?: boolean;
    hasAdminAccess?: boolean;
  }>;
  documents: Array<{
    id: number;
    name: string;
    category: string;
    url: string;
    uploadedDate: string;
    size: string;
  }>;
  usageSummary: {
    lastAdminLogin: string | null;
    lastAdminLoginText: string;
    activeUsersToday: number;
    activeUsersText: string;
    peakUsageTime: string;
    peakUsageDay: string;
    mostUsedModule: string;
    teamsConfigured: number;
  };
  recentActivities: Array<any>;
  modules?: Array<any>;
}

export interface ContentFile {
  id: number;
  title: string;
  url: string;
  publicId: string;
  thumbnail: string;
  type: number;
  fileName: string;
  size: number;
  duration: number;
  width: number;
  height: number;
  position: number;
}

export interface ContentData {
  id?: number;
  contentType?: number;
  title?: string;
  description?: string;
  easierExercise?: string | null;
  difficultExercise?: string | null;
  categoryId?: number;
  themeIds?: number[];
  levelId?: number;
  ageGroupIds?: number[];
  tags?: string[];
  tagNames?: string[];
  linkedSkills?: TableDataRef[];
  linkedSkillIds?: number[];
  labels?: number[];
  media?: FileData[];
  isDraft?: boolean;
  isPublished?: boolean;
}

export interface Content {
  id: number;
  contentType: number;
  title: string;
  description: string;
  categoryId?: number;
  clubId: number;
  clubName: string;
  thumbnailUrl: string;
  fileUrl: string;
  mediaCount: number;
  tagNames: string[];
  federationNames: string[];
  isLinked: boolean;
  internalTitle: string | null;
  text: string | null;
  organisation: string | null;
  rules: string | null;
  easierExercise: string | null;
  difficultExercise: string | null;
  moduleCount: number | null;
  lessonCount: number | null;
  courseName: string | null;
  moduleName: string | null;
  modules: any[] | null;
  files: ContentFile[];
  isDraft: boolean;
  isPublished: boolean;
}
