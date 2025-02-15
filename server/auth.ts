import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { googleConfig } from './config/google';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  name: string;
  avatar?: string | null;
  googleId?: string;
}

// In-memory user store (temporary, will be replaced with database)
const userStore = new Map<string, AuthUser>();

passport.use(new GoogleStrategy({
  clientID: googleConfig.clientID,
  clientSecret: googleConfig.clientSecret,
  callbackURL: googleConfig.callbackURL,
}, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
  try {
    // First check if user exists in database
    let dbUser = await db.query.users.findFirst({
      where: eq(users.email, profile.emails?.[0]?.value)
    });

    if (!dbUser) {
      // Create new user in database
      const username = profile.emails?.[0]?.value.split('@')[0] || profile.id;
      const [newUser] = await db.insert(users).values({
        id: profile.id,
        username: username,
        email: profile.emails?.[0]?.value,
        name: profile.displayName,
        password: '', // OAuth users don't need password
        avatar: profile.photos?.[0]?.value
      }).returning();
      dbUser = newUser;
    }

    const authUser: AuthUser = {
      id: dbUser.id,
      username: dbUser.username,
      email: dbUser.email,
      name: dbUser.name,
      avatar: dbUser.avatar,
      googleId: profile.id
    };

    userStore.set(authUser.id, authUser);
    return done(null, authUser);
  } catch (error) {
    return done(error as Error);
  }
}));

passport.serializeUser((user: AuthUser, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = userStore.get(id);
    if (user) {
      done(null, user);
    } else {
      // If not in memory store, try to fetch from database
      const dbUser = await db.query.users.findFirst({
        where: eq(users.id, id)
      });

      if (dbUser) {
        const authUser: AuthUser = {
          id: dbUser.id,
          username: dbUser.username,
          email: dbUser.email,
          name: dbUser.name,
          avatar: dbUser.avatar
        };
        userStore.set(id, authUser);
        done(null, authUser);
      } else {
        done(null, null);
      }
    }
  } catch (error) {
    done(error, null);
  }
});

export function getUserFromRequest(req: any): AuthUser | null {
  return req.user || null;
}