import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { options } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, options);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = session.user?.email || session.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'User ID not found' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const tasks = await prisma.task.findMany({
          orderBy: { created_at: 'desc' }
        });
        res.status(200).json(tasks);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
      }
      break;

    case 'POST':
      try {
        const { name, description, progress = 0 } = req.body;

        if (!name) {
          return res.status(400).json({ error: 'Task name is required' });
        }

        if (progress < 0 || progress > 100) {
          return res.status(400).json({ error: 'Progress must be between 0 and 100' });
        }

        const task = await prisma.task.create({
          data: {
            uuid: uuidv4(),
            name,
            description: description || null,
            progress,
            userId
          }
        });

        res.status(201).json(task);
      } catch (error) {
        res.status(500).json({ error: 'Failed to create task' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}