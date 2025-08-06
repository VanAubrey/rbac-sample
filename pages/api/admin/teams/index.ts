import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { prisma } from '@/utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check if user is admin of any team
  const isAdmin = await prisma.userTeam.findFirst({
    where: {
      userId: session.user.id,
      role: 'ADMIN'
    }
  });

  if (!isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  if (req.method === 'GET') {
    try {
      // Get all teams with their members
      const teams = await prisma.team.findMany({
        include: {
          userTeams: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true
                }
              }
            }
          },
          _count: {
            select: {
              tasks: true,
              userTeams: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });

      return res.status(200).json(teams);
    } catch (error) {
      console.error('Error fetching teams:', error);
      return res.status(500).json({ error: 'Failed to fetch teams' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}