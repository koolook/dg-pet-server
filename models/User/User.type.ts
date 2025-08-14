// export type UserRole = 'user' | 'admin';

export type User = {
  login: string
  hash: string
  roles: string[]
}
