    import express, { Application, Request, Response } from 'express';

    const app: Application = express();
    const port: number = 4000;

    app.get('/', (req: Request, res: Response) => {
        res.send('Hello from Express with TypeScript!');
    });

    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
