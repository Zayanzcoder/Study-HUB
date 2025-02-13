
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { googleConfig } from './config/google';

export interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
  googleId?: string;
}

// In-memory user store (replace with your database)
const users = new Map<string, User>();

passport.use(new GoogleStrategy({
  clientID: googleConfig.clientID,
  clientSecret: googleConfig.clientSecret,
  callbackURL: googleConfig.callbackURL,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = Array.from(users.values()).find(u => u.googleId === profile.id);
    
    if (!user) {
      user = {
        id: profile.id,
        name: profile.displayName,
        email: profile.emails?.[0]?.value || '',
        picture: profile.photos?.[0]?.value,
        googleId: profile.id
      };
      users.set(user.id, user);
    }
    
    return done(null, user);
  } catch (error) {
    return done(error as Error);
  }
}));

passport.serializeUser((user, done) => {
  done(null, (user as User).id);
});

passport.deserializeUser((id: string, done) => {
  const user = users.get(id);
  done(null, user || null);
});

export function getUserFromRequest(req: any): User | null {
  return req.user || null;
}
