import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { email, password } = req.body;

        // Read the data.json file
        const filePath = path.join(process.cwd(), 'data', 'data.json');
        const fileContents = fs.readFileSync(filePath, 'utf-8');
        const { users } = JSON.parse(fileContents);

        // Check if the user exists and the password matches
        const user = users.find((u: any) => u.email === email && u.password === password);

        if (user) {
            res.status(200).json({ message: 'Login successful', user });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
