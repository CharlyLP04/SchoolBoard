import { getDbConnection } from './db.js';

async function cleanDb() {
  const db = await getDbConnection();
  
  try {
    console.log('Cleaning database...');
    
    // Delete from all tables except users
    await db.exec('DELETE FROM tasks');
    await db.exec('DELETE FROM subtasks');
    await db.exec('DELETE FROM comments');
    await db.exec('DELETE FROM evidences');
    await db.exec('DELETE FROM workspaces');
    await db.exec('DELETE FROM workspace_members');
    await db.exec('DELETE FROM lists');
    await db.exec('DELETE FROM list_cards');
    await db.exec('DELETE FROM password_reset_tokens');
    await db.exec('DELETE FROM activity_logs');
    await db.exec('DELETE FROM registration_verifications');
    
    // Delete users except admin
    await db.run("DELETE FROM users WHERE email != 'admin@schoolboard.com'");
    
    console.log('Database cleaned successfully.');
  } catch (error) {
    console.error('Error cleaning database:', error);
  } finally {
    await db.close();
  }
}

cleanDb();
