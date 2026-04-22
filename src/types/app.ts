// App-specific types

export interface HomeItem {
  home: string;
  title: string;
  url: string;
}

export interface BreadcrumbItem {
  name: string;
  icon?: string;
  title?: string;
  url?: string;
}

// Composables types
export interface AppLoader {
  loading: import("vue").Ref<boolean>;
  setLoading: (value: boolean, message?: string) => void;
  message: import("vue").Ref<string>;
}

export interface TeamFormItem {
  id?: number;
  name: string;
}

export interface TeamData {
  clubId?: number;
  ageGroupId?: number;
  teams?: TeamFormItem[];
}
