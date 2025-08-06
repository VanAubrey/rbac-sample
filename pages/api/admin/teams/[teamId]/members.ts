import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { options } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get session using getServerSession instead of getSession
  const session = await getServerSession(req, res, options);
  const { teamId } = req.query;

  console.log('Session in members API:', session); // Debug log

  if (!session?.user?.id) {
    console.log('No session or user ID found'); // Debug log
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

    console.log('Admin check result:', isAdmin); // Debug log

    if (!isAdmin) {
      console.log('User is not admin'); // Debug log
      return res.status(403).json({ error: 'Admin access required' });
    }
  } catch (error) {
    console.error('Error checking admin status:', error);
    return res.status(500).json({ error: 'Database error' });
  }

  if (req.method === 'POST') {
    // Add user to team
    try {
      const { userId, role = 'MEMBER' } = req.body;

      console.log('Adding user to team:', { userId, teamId, role }); // Debug log

      const userTeam = await prisma.userTeam.upsert({
        where: {
          userId_teamId: {
            userId,
            teamId: parseInt(teamId as string)
          }
        },
        update: {
          role: role as 'ADMIN' | 'MEMBER'
        },
        create: {
          userId,
          teamId: parseInt(teamId as string),
          role: role as 'ADMIN' | 'MEMBER'
        },
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
      });

      console.log('User added successfully:', userTeam); // Debug log
      return res.status(200).json(userTeam);
    } catch (error) {
      console.error('Error adding team member:', error);
      return res.status(500).json({ error: 'Failed to add team member' });
    }
  }

  if (req.method === 'DELETE') {
    // Remove user from team
    try {
      const { userId } = req.body;

      await prisma.userTeam.delete({
        where: {
          userId_teamId: {
            userId,
            teamId: parseInt(teamId as string)
          }
        }
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error removing team member:', error);
      return res.status(500).json({ error: 'Failed to remove team member' });
    }
  }

  if (req.method === 'PATCH') {
    // Update user role in team
    try {
      const { userId, role } = req.body;

      const userTeam = await prisma.userTeam.update({
        where: {
          userId_teamId: {
            userId,
            teamId: parseInt(teamId as string)
          }
        },
        data: {
          role: role as 'ADMIN' | 'MEMBER'
        },
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
      });

      return res.status(200).json(userTeam);
    } catch (error) {
      console.error('Error updating team member role:', error);
      return res.status(500).json({ error: 'Failed to update team member role' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}