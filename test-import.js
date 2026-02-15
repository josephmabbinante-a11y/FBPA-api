import { User } from './models.js';

console.log('✅ User imported successfully');
console.log('✅ User model name:', User.modelName);
console.log('✅ User schema fields:', Object.keys(User.schema.paths).join(', '));
console.log('✅ comparePassword method exists:', typeof User.schema.methods.comparePassword === 'function');
console.log('✅ Pre-save hooks configured:', User.schema._pres.get('save').length > 0);

process.exit(0);
