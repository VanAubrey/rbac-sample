import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { options } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, options);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = session.user?.email || session.user?.id;
  const { id } = req.query;

  if (!userId) {
    return res.status(401).json({ error: 'User ID not found' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const task = await prisma.task.findUnique({
          where: { 
            id: parseInt(id as string)
          }
        });

        if (!task) {
          return res.status(404).json({ error: 'Task not found' });
        }

        res.status(200).json(task);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch task' });
      }
      break;

    case 'PUT':
      try {
        const { name, description, progress } = req.body;

        const existingTask = await prisma.task.findUnique({
          where: { 
            id: parseInt(id as string)
          }
        });

        if (!existingTask) {
          return res.status(404).json({ error: 'Task not found' });
        }

        if (progress !== undefined && (progress < 0 || progress > 100)) {
          return res.status(400).json({ error: 'Progress must be between 0 and 100' });
        }

        const updatedTask = await prisma.task.update({
          where: { id: parseInt(id as string) },
          data: {
            name: name || existingTask.name,
            description: description !== undefined ? description : existingTask.description,
            progress: progress !== undefined ? progress : existingTask.progress,
            updated_at: new Date()
          }
        });

        res.status(200).json(updatedTask);
      } catch (error) {
        res.status(500).json({ error: 'Failed to update task' });
      }
      break;

    case 'DELETE':
      try {
        const existingTask = await prisma.task.findUnique({
          where: { 
            id: parseInt(id as string)
          }
        });

        if (!existingTask) {
          return res.status(404).json({ error: 'Task not found' });
        }

        await prisma.task.delete({
          where: { id: parseInt(id as string) }
        });

        res.status(200).json({ message: 'Task deleted successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete task' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}