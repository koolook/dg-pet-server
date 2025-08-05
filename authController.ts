import { Request, Response } from 'express'
class AuthController {
  signUp = async (req: Request, res: Response) => {}

  login = async (req: Request, res: Response) => {}

  test = async (req: Request, res: Response) => {
    res.json('All fine')
  }
}

export default new AuthController()
