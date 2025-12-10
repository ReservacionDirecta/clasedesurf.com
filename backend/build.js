/**
 * Build script for TypeScript compilation
 */

const { execSync } = require('child_process');

try {
    console.log('🔨 Building TypeScript code...');

    // Execute tsc
    execSync('node node_modules/typescript/bin/tsc', {
        stdio: 'inherit',
        shell: 'cmd.exe'
    });

    console.log('✅ Build completed successfully!');
} catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
}
