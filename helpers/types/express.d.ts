import { UserPayload } from '../../models/user-payload'

export {}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload
    }
  }
}
