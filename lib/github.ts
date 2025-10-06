import { Octokit } from '@octokit/rest';

const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN!;
const REPO_OWNER = process.env.NEXT_PUBLIC_GITHUB_REPO_OWNER!;
const REPO_NAME = process.env.NEXT_PUBLIC_GITHUB_REPO_NAME!;

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

export async function uploadImageToGitHub(
  file: File,
  ticketId: string
): Promise<string> {
  try {
    // Convert file to base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    
    // Create unique filename
    const fileName = `payment-screenshots/${ticketId}-${Date.now()}.${file.name.split('.').pop()}`;
    
    // Upload to GitHub
    const response = await octokit.rest.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: fileName,
      message: `Upload payment screenshot for ticket ${ticketId}`,
      content: base64,
    });
    
    // Return raw URL - using main branch since it's usually the default
    const rawUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${fileName}`;
    return rawUrl;
  } catch (error) {
    console.error('Error uploading to GitHub:', error);
    throw new Error('Failed to upload payment screenshot');
  }
}