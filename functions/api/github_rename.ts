export const onRequestPost = async (context: { request: Request }) => {
  const { request } = context;
  const pat = request.headers.get('x-github-token');
  
  if (!pat) {
    return new Response(JSON.stringify({ error: 'No GitHub PAT found' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { repo, path, branch, oldName, newName, sha } = await request.json();
    const cleanPath = path.replace(/^\/+|\/+$/g, '');
    
    // 1. Fetch the original file content (Base64)
    const getUrl = `https://api.github.com/repos/${repo}/contents/${cleanPath}/${oldName}?ref=${branch}`;
    const getRes = await fetch(getUrl, {
      headers: {
        'Authorization': `Bearer ${pat.trim()}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Potato-CMS'
      }
    });

    if (!getRes.ok) throw new Error("Could not retrieve original file content");
    const fileData = await getRes.json();
    const content = fileData.content; // Already base64 from GitHub

    // 2. Create the new file
    const putUrl = `https://api.github.com/repos/${repo}/contents/${cleanPath}/${newName}`;
    const putRes = await fetch(putUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${pat.trim()}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Potato-CMS'
      },
      body: JSON.stringify({
        message: `Rename ${oldName} to ${newName} via Potato CMS`,
        content: content,
        branch: branch
      })
    });

    if (!putRes.ok) throw new Error("Failed to create new file during rename");

    // 3. Delete the old file
    const delUrl = `https://api.github.com/repos/${repo}/contents/${cleanPath}/${oldName}`;
    const delRes = await fetch(delUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${pat.trim()}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Potato-CMS'
      },
      body: JSON.stringify({
        message: `Cleanup after renaming to ${newName}`,
        sha: sha,
        branch: branch
      })
    });

    if (!delRes.ok) throw new Error("New file created but failed to remove old file");

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
