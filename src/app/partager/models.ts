export interface pageSelection {
  skip: number;
  limit: number;
}
export interface apiResultFormat {
  data: Array<any>;
  count: number;
  status: boolean;
  statuscode: number;
  message: string;
}

export interface apiResult {
  data: Array<any>;
  totalData: number
  message: string;
}

export interface httpJsonResponse {
  status: boolean;
  data: Array<any>;
  dataAll?: Array<any>;
  message: string;
  error: boolean;
  count: number;
  page: number;
}
