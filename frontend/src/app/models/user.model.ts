import { UserType } from '@models';

export interface User {
  id: number;
  name?: string;
  lastname?: string;
  doc_type?: string;
  doc_nume?: string;
  status?: string;
  date_reg?: Date;
  type?: UserType;
  avatar?: string;
}

export interface UserCreate {
  name: string;
  lastname: string;
  doc_type: string;
  document: string;
  email: string;
  number: string;
  password: string;
}
