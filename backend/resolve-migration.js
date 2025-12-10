/**
 * Script to mark the duplicate avatar migration as resolved
 */

const { execSync } = require('child_process');

try {
    console.log('Marking migration 20251201191207_add_avatar_field as resolved...');

    // Execute prisma migrate resolve
    execSync('npx prisma migrate resolve --applied 20251201191207_add_avatar_field', {
        stdio: 'inherit',
        shell: 'cmd.exe'
    });

    console.log('✅ Migration marked as resolved successfully!');
} catch (error) {
    console.error('❌ Error resolving migration:', error.message);
    process.exit(1);
}
