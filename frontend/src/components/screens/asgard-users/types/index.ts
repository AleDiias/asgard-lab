export type AsgardUserStatus = "active" | "inactive";

export interface AsgardUserFormValues {
  name: string;
  email: string;
}

export interface AsgardUserListRow {
  id: string;
  name: string;
  email: string;
  status: AsgardUserStatus;
}

export interface AsgardUserFormFieldErrors {
  name?: string;
  email?: string;
}
