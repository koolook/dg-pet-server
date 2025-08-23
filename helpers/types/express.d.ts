import { UserPayload } from '../../models/user-payload'

export {}

/**
 * Extends the definition of express.Request object.
 * Resolves type issues when user data is passed from middleware to request handler
 */
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload
    }
  }
}
