
import { spawn } from 'child_process';

async function testFlow() {
  console.log("Starting reproduction script...");

  // 1. Simulate Login
  console.log("\n--- Testing Login ---");
  const loginRes = await fetch('http://localhost:8788/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@admin.com', password: 'admin' }) // Default creds
  });

  console.log(`Login Status: ${loginRes.status}`);
  const loginData = await loginRes.json();
  console.log("Login Body:", loginData);
  
  const cookie = loginRes.headers.get('set-cookie');
  console.log("Set-Cookie:", cookie);

  if (!loginRes.ok || !cookie) {
    console.error("Login failed or no cookie returned. Aborting.");
    return;
  }

  // 2. Simulate Fetch Content (using cookie)
  console.log("\n--- Testing Content Fetch ---");
  const contentRes = await fetch('http://localhost:8788/api/github_contents?repo=batchnode/potato&path=_posts&branch=main', {
    headers: {
        'Cookie': cookie
    }
  });

  console.log(`Content Fetch Status: ${contentRes.status}`);
  const contentData = await contentRes.json();
  if (!contentRes.ok) {
      console.log("Content Fetch Error:", contentData);
  } else {
      console.log(`Fetched ${Array.isArray(contentData) ? contentData.length : 1} items.`);
  }

}

// Note: This script assumes the dev server is running on port 8788. 
// Since I can't easily start the server and keep it running while executing this,
// I will rely on code analysis, but this script serves as a template for what should happen.
console.log("Reproduction script created.");
