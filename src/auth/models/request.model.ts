import { Payload } from './payload.model';

export interface RequestWithUser extends Request {
  user: Payload;
  email: string;
  roles: string[];
}
