import { createAuth } from '@gi4nks/ant';
import bcrypt from 'bcryptjs';

export const auth = createAuth({
  secret: process.env.ANT_JWT_SECRET || 'atlas-secret-key-12345-very-long-and-secure-default',
  
  // Custom provider to fetch users dynamically from environment variables
  provider: async (username: string) => {
    const adminUser = process.env.CONAN_AUTH_USER;
    const adminPassword = process.env.CONAN_AUTH_PASSWORD;

    if (adminUser && username === adminUser && adminPassword) {
      // Ant will handle the password verification using the hash.
      // We generate a hash from the password in .env so it can be verified by Ant.
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
