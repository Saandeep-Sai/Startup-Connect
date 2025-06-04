import { User } from 'firebase/auth';

   export interface UserRole extends User {
     role?: string;
   }