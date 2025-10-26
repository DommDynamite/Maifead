import bcrypt from 'bcrypt';
import { db } from '../config/database.js';

async function resetPassword() {
  const email = 'test@maifead.com';
  const newPassword = 'password123';

  // Hash the new password
  const passwordHash = await bcrypt.hash(newPassword, 10);

  // Update the user's password
  db.prepare('UPDATE users SET password_hash = ? WHERE email = ?')
    .run(passwordHash, email);

  console.log(`Password reset successfully for ${email}`);
  console.log(`New password: ${newPassword}`);
  process.exit(0);
}

resetPassword().catch(err => {
  console.error('Error resetting password:', err);
  process.exit(1);
});
