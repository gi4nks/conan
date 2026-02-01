import { createAuth } from '@gi4nks/ant';
import bcrypt from 'bcryptjs';

export const auth = createAuth({
  secret: process.env.ANT_JWT_SECRET || 'conan-secret-key-12345-very-long-and-secure-default',
  sessionCookieName: 'conan_session',
  // @ts-ignore
  sameSite: 'lax',
  
  // Custom provider to fetch users dynamically from environment variables
  provider: async (username: string) => {
    const adminUser = process.env.CONAN_AUTH_USER || process.env.conan_AUTH_USER;
    const adminPassword = process.env.CONAN_AUTH_PASSWORD || process.env.conan_AUTH_PASSWORD;

    if (adminUser && username === adminUser && adminPassword) {
      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(adminPassword, salt);

      return {
        id: 'admin',
        username: adminUser,
        passwordHash: passwordHash,
        role: 'admin',
        name: 'Administrator',
      };
    }
    
    return null;
  }
});

export default auth;
