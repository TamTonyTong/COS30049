import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API route invoked')
  console.log('Current working directory:', process.cwd())

  const { userId } = req.query
  console.log('Received request for userId:', userId)

  if (typeof userId !== 'string') {
    console.error('Invalid user ID:', userId)
    return res.status(400).json({ error: 'Invalid user ID' })
  }

  const filePath = path.join(process.cwd(), 'data', `${userId}.json`)
  console.log('Looking for file at:', filePath)

  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath)
    return res.status(404).json({ error: 'User not found' })
  }

  const userData = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  console.log('User data found:', userData)
  res.status(200).json(userData)
}