import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const filePath = path.join(process.cwd(), 'data', 'data.json')
        const fileContents = fs.readFileSync(filePath, 'utf-8')
        const data = JSON.parse(fileContents)

        res.status(200).json(data)
    } else {
        res.status(405).json({ message: 'Method not allowed' })
    }
}