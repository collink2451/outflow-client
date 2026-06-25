export interface VendorResponse {
  vendorId: number;
  name: string;
  matchPattern: string;
  expenseCategoryId: number | null;
  categoryName: string | null;
  autoDismiss: boolean;
}

export interface CreateVendorRequest {
  name: string;
  matchPattern: string;
  expenseCategoryId: number | null;
  autoDismiss: boolean;
}

export interface UpdateVendorRequest {
  name: string;
  matchPattern: string;
  expenseCategoryId: number | null;
  autoDismiss: boolean;
}
