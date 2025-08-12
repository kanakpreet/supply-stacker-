import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { storage } from "./storage";
import type { User } from "@shared/schema";

// Configure passport local strategy
passport.use(new LocalStrategy(
  {
    usernameField: 'username',
    passwordField: 'password'
  },
  async (username: string, password: string, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return done(null, false, { message: 'Invalid username or password' });
      }

      // Simple password check (in production, use proper hashing)
      if (user.password !== password) {
        return done(null, false, { message: 'Invalid username or password' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;