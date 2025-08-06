import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { options } from '../../auth/[...nextauth]';
import { prisma } from '@/utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, options);
  const { q, teamId } = req.query;

  console.log('Session in search API:', session); // Debug log

  if (!session?.user?.id) {
    console.log('No session or user ID found in search API'); // Debug log
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check if user is admin
  try {
    const isAdmin = await prisma.userTeam.findFirst({
      where: {
        userId: session.user.id,
        role: 'ADMIN'
      }
    });

    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
  } catch (error) {
    console.error('Error checking admin status in search API:', error);
    return res.status(500).json({ error: 'Database error' });
  }

  if (req.method === 'GET') {
    try {
      // Search users not in the specified team
      const users = await prisma.user.findMany({
        where: {
          AND: [
            {
              OR: [
                { name: { contains: q as string, mode: 'insensitive' } },
                { email: { contains: q as string, mode: 'insensitive' } }
              ]
            },
            {
              userTeams: {
                none: {
                  teamId: parseInt(teamId as string)
                }
              }
            }
          ]
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        },
        take: 10
      });

      return res.status(200).json(users);
    } catch (error) {
      console.error('Error searching users:', error);
      return res.status(500).json({ error: 'Failed to search users' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}