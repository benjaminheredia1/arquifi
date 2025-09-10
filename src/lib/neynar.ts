// Simplified Neynar integration for demo purposes
export interface FarcasterUser {
  fid: number
  username: string
  display_name: string
  pfp_url: string
  verified_addresses: {
    eth_addresses: string[]
    sol_addresses: string[]
  }
  follower_count: number
  following_count: number
  bio: {
    text: string
  }
}

export interface FarcasterCast {
  hash: string
  text: string
  author: FarcasterUser
  timestamp: string
  replies: {
    count: number
  }
  reactions: {
    likes: {
      count: number
    }
    recasts: {
      count: number
    }
  }
}

// Demo client - simulates Neynar API calls
export const neynarClient = {
  async lookupUserByFid(fid: number) {
    return {
      result: {
        user: {
          fid,
          username: `user_${fid}`,
          display_name: `User ${fid}`,
          pfp_url: '',
          verified_addresses: {
            eth_addresses: [`0x${Math.random().toString(16).substr(2, 40)}`],
            sol_addresses: []
          },
          follower_count: Math.floor(Math.random() * 1000),
          following_count: Math.floor(Math.random() * 500),
          bio: {
            text: 'Demo user for KoquiFI Lottery'
          }
        }
      }
    }
  },
  
  async lookupUserByUsername(username: string) {
    return {
      result: {
        user: {
          fid: Math.floor(Math.random() * 100000),
          username,
          display_name: username,
          pfp_url: '',
          verified_addresses: {
            eth_addresses: [`0x${Math.random().toString(16).substr(2, 40)}`],
            sol_addresses: []
          },
          follower_count: Math.floor(Math.random() * 1000),
          following_count: Math.floor(Math.random() * 500),
          bio: {
            text: 'Demo user for KoquiFI Lottery'
          }
        }
      }
    }
  },
  
  async fetchCastsForUser(fid: number, options: { limit: number }) {
    return {
      result: {
        casts: []
      }
    }
  },
  
  async publishCast(signerUuid: string, text: string) {
    return {
      result: {
        cast: {
          hash: `0x${Math.random().toString(16).substr(2, 64)}`,
          text,
          author: {
            fid: Math.floor(Math.random() * 100000),
            username: 'demo_user',
            display_name: 'Demo User',
            pfp_url: '',
            verified_addresses: { eth_addresses: [], sol_addresses: [] },
            follower_count: 0,
            following_count: 0,
            bio: { text: '' }
          },
          timestamp: new Date().toISOString(),
          replies: { count: 0 },
          reactions: { likes: { count: 0 }, recasts: { count: 0 } }
        }
      }
    }
  },
  
  async validateFrameAction(messageBytes: string, options: { castHash?: string; buttonIndex?: number }) {
    return {
      valid: true
    }
  }
}

export async function getUserByFid(fid: number): Promise<FarcasterUser | null> {
  try {
    const user = await neynarClient.lookupUserByFid(fid)
    return user.result.user
  } catch (error) {
    console.error('Error fetching user by FID:', error)
    return null
  }
}

export async function getUserByUsername(username: string): Promise<FarcasterUser | null> {
  try {
    const user = await neynarClient.lookupUserByUsername(username)
    return user.result.user
  } catch (error) {
    console.error('Error fetching user by username:', error)
    return null
  }
}

export async function getCastsByUser(fid: number, limit: number = 10): Promise<FarcasterCast[]> {
  try {
    const casts = await neynarClient.fetchCastsForUser(fid, { limit })
    return casts.result.casts
  } catch (error) {
    console.error('Error fetching casts:', error)
    return []
  }
}

export async function publishCast(text: string, signerUuid: string): Promise<FarcasterCast | null> {
  try {
    const cast = await neynarClient.publishCast(signerUuid, text)
    return cast.result.cast
  } catch (error) {
    console.error('Error publishing cast:', error)
    return null
  }
}

export async function validateFrameAction(
  messageBytes: string,
  castHash?: string,
  buttonIndex?: number
): Promise<boolean> {
  try {
    const validation = await neynarClient.validateFrameAction(messageBytes, {
      castHash,
      buttonIndex,
    })
    return validation.valid
  } catch (error) {
    console.error('Error validating frame action:', error)
    return false
  }
}