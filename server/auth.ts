
export interface User {
  id: string;
  name: string;
  bio?: string;
  url?: string;
  profileImage?: string;
}

export function getUserFromRequest(req: Request): User | null {
  const userId = req.headers['x-replit-user-id'];
  const userName = req.headers['x-replit-user-name'];
  
  if (!userId || !userName) {
    return null;
  }

  return {
    id: userId as string,
    name: userName as string,
    bio: req.headers['x-replit-user-bio'] as string,
    url: req.headers['x-replit-user-url'] as string,
    profileImage: req.headers['x-replit-user-profile-image'] as string,
  };
}
