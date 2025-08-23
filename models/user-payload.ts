/**
 * User data that is passed from auth middleware to request handlers
 */
export interface UserPayload {
  userid: string
  roles: string[]
}
