// Test script to verify GitHub integration
// Run this in browser console after setting up environment variables

async function testGitHubUpload() {
  // This is a test function - only use in development
  console.log('Testing GitHub integration...');
  
  // Check if environment variables are set
  const requiredVars = [
    'NEXT_PUBLIC_GITHUB_TOKEN',
    'NEXT_PUBLIC_GITHUB_REPO_OWNER', 
    'NEXT_PUBLIC_GITHUB_REPO_NAME'
  ];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      console.error(`Missing environment variable: ${varName}`);
      return false;
    }
  }
  
  console.log('✅ All environment variables are set');
  
  // Test GitHub API access
  try {
    const response = await fetch(`https://api.github.com/repos/${process.env.NEXT_PUBLIC_GITHUB_REPO_OWNER}/${process.env.NEXT_PUBLIC_GITHUB_REPO_NAME}`, {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (response.ok) {
      console.log('✅ GitHub repository is accessible');
      return true;
    } else {
      console.error('❌ Cannot access GitHub repository:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ GitHub API error:', error);
    return false;
  }
}

export { testGitHubUpload };