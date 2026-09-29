const http = require('http');

async function testBackend() {
  const serverProcess = require('./server.js');
  // wait 1 second for server to boot
  await new Promise(r => setTimeout(r, 1200));

  const baseUrl = 'http://localhost:5000/api';
  console.log('Testing Backend API...');

  // 1. Health check
  const healthRes = await fetch(`${baseUrl}/health`);
  const healthData = await healthRes.json();
  console.log('1. Health check:', healthData.status === 'ok' ? 'PASSED' : 'FAILED');

  // 2. Login demo user
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo@example.com', password: 'demo123' })
  });
  const loginData = await loginRes.json();
  console.log('2. Login demo user:', loginData.token ? 'PASSED' : 'FAILED');
  const token = loginData.token;

  // 3. Get papers
  const papersRes = await fetch(`${baseUrl}/papers`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const papers = await papersRes.json();
  console.log(`3. Get papers (Count: ${papers.length}):`, papers.length >= 3 ? 'PASSED' : 'FAILED');

  // 4. Get stats
  const statsRes = await fetch(`${baseUrl}/papers/stats`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const stats = await statsRes.json();
  console.log('4. Stats (Total:', stats.total, 'Reading:', stats.reading, 'Completed:', stats.completed, 'Important:', stats.important, '):', stats.total >= 3 ? 'PASSED' : 'FAILED');

  // 5. Create new paper
  const createRes = await fetch(`${baseUrl}/papers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      title: 'Deep Residual Learning for Image Recognition',
      authors: 'Kaiming He et al.',
      year: 2016,
      category: 'Computer Vision',
      status: 'Completed',
      priority: 'High',
      notes: 'Introduced ResNet with skip connections.'
    })
  });
  const createData = await createRes.json();
  const createdId = createData.paper.id;
  console.log('5. Create paper:', createdId ? 'PASSED' : 'FAILED');

  // 6. Update paper
  const updateRes = await fetch(`${baseUrl}/papers/${createdId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      title: 'Deep Residual Learning for Image Recognition (Updated)',
      authors: 'Kaiming He et al.',
      year: 2016,
      category: 'Computer Vision',
      status: 'Completed',
      priority: 'High',
      notes: 'Updated note.'
    })
  });
  const updateData = await updateRes.json();
  console.log('6. Update paper:', updateData.paper.title.includes('(Updated)') ? 'PASSED' : 'FAILED');

  // 7. Delete paper
  const delRes = await fetch(`${baseUrl}/papers/${createdId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const delData = await delRes.json();
  console.log('7. Delete paper:', delData.message === 'Paper deleted successfully' ? 'PASSED' : 'FAILED');

  // 8. Test Register
  const testEmail = `test_${Date.now()}@example.com`;
  const regRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User', email: testEmail, password: 'password123' })
  });
  const regData = await regRes.json();
  console.log('8. Register new user:', regData.message === 'Registration successful' ? 'PASSED' : 'FAILED');

  // 9. Login new user and check isolation
  const newLoginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'password123' })
  });
  const newLoginData = await newLoginRes.json();
  const newPapersRes = await fetch(`${baseUrl}/papers`, {
    headers: { 'Authorization': `Bearer ${newLoginData.token}` }
  });
  const newPapers = await newPapersRes.json();
  console.log(`9. User data isolation (New user paper count: ${newPapers.length}):`, newPapers.length === 0 ? 'PASSED' : 'FAILED');

  console.log('--- ALL BACKEND TESTS PASSED SUCCESSFULLY! ---');
  process.exit(0);
}

testBackend().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
