import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { options } from '../../auth/[...nextauth]';
import { prisma } from '@/utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, options);
  
  console.log('Session in teams API:', session); // Debug log
  
  if (!session?.user?.id) {
    console.log('No session or user ID found in teams API'); // Debug log
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check if user is admin of any team
  try {
    const isAdmin = await prisma.userTeam.findFirst({
      where: {
        userId: session.user.id,
        role: 'ADMIN'
      }
    });

    console.log('Admin check result in teams API:', isAdmin); // Debug log

    if (!isAdmin) {
      console.log('User is not admin in teams API'); // Debug log
      return res.status(403).json({ error: 'Admin access required' });
    }
  } catch (error) {
    console.error('Error checking admin status in teams API:', error);
    return res.status(500).json({ error: 'Database error' });
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