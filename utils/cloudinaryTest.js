import { cloudinary } from '../config/cloudinary.js';

// Test function to verify Cloudinary connection
export const testCloudinaryConnection = async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connection successful:', result);
    return true;
  } catch (error) {
    console.error('❌ Cloudinary connection failed:', error.message);
    return false;
  }
};

// Test function to get cloudinary configuration details
export const getCloudinaryConfig = () => {
  const config = cloudinary.config();
  console.log('📋 Cloudinary Configuration:');
  console.log(`   Cloud Name: ${config.cloud_name || 'Not set'}`);
  console.log(`   API Key: ${config.api_key ? '***' + config.api_key.slice(-4) : 'Not set'}`);
  console.log(`   API Secret: ${config.api_secret ? 'Set' : 'Not set'}`);
};

// You can uncomment these lines to test the connection
// testCloudinaryConnection();
// getCloudinaryConfig();
