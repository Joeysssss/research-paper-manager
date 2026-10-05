const baseUrl = process.env.BASE_URL || 'http://localhost:5000/api';

async function runE2ETests() {
  console.log('====================================================');
  console.log('  STARTING COMPREHENSIVE E2E VERIFICATION SUITE     ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Health check
  console.log('--- Step 1: Backend Health Check ---');
  const healthRes = await fetch(`${baseUrl}/health`);
  const health = await healthRes.json();
  assert(healthRes.status === 200 && health.status === 'ok', 'API health endpoint responds with 200 and status: ok');

  // 2. Demo User Login
  console.log('\n--- Step 2: Login Flow with Demo Account ---');
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo@example.com', password: 'demo123' })
  });
  const loginData = await loginRes.json();
  assert(loginRes.status === 200, 'Login returned HTTP 200');
  assert(!!loginData.token, 'Login returned valid JWT token');
  assert(loginData.user?.email === 'demo@example.com', 'User object returned matches demo account');
  const demoToken = loginData.token;

  // 3. Invalid Login Handling
  console.log('\n--- Step 3: Error Handling on Invalid Credentials ---');
  const badLoginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo@example.com', password: 'wrongpassword' })
  });
  const badLoginData = await badLoginRes.json();
  assert(badLoginRes.status === 401, 'Bad password correctly rejected with 401');
  assert(badLoginData.error === 'Invalid email or password', 'Correct error message returned');

  // 4. Dashboard Stats for Demo User
  console.log('\n--- Step 4: Dashboard Statistics ---');
  const statsRes = await fetch(`${baseUrl}/papers/stats`, {
    headers: { 'Authorization': `Bearer ${demoToken}` }
  });
  const stats = await statsRes.json();
  assert(statsRes.status === 200, 'Stats endpoint returns HTTP 200');
  assert(stats.total >= 3, `Total papers count is >= 3 (actual: ${stats.total})`);
  assert(stats.reading >= 1, `Reading count is >= 1 (actual: ${stats.reading})`);
  assert(stats.completed >= 1, `Completed count is >= 1 (actual: ${stats.completed})`);
  assert(stats.important >= 1, `Important count is >= 1 (actual: ${stats.important})`);
  assert(Array.isArray(stats.recent) && stats.recent.length <= 5, 'Recent papers is an array of max 5 items');

  // 5. Paper List Retrieval
  console.log('\n--- Step 5: Paper List Retrieval ---');
  const listRes = await fetch(`${baseUrl}/papers`, {
    headers: { 'Authorization': `Bearer ${demoToken}` }
  });
  const paperList = await listRes.json();
  assert(listRes.status === 200, 'Paper list returns HTTP 200');
  assert(paperList.length >= 3, `Retrieved ${paperList.length} papers`);

  // Verify Seed Papers are present
  const titles = paperList.map(p => p.title);
  assert(titles.includes('Attention Is All You Need'), 'Seed paper "Attention Is All You Need" present');
  assert(titles.includes('A Unified Approach to Interpreting Model Predictions'), 'Seed paper "A Unified Approach..." present');
  assert(titles.includes('Grad-CAM: Visual Explanations from Deep Networks'), 'Seed paper "Grad-CAM..." present');

  // 6. Add Paper Flow
  console.log('\n--- Step 6: Add Paper Flow ---');
  const newPaperPayload = {
    title: 'Language Models are Few-Shot Learners',
    authors: 'Tom B. Brown et al.',
    year: 2020,
    category: 'NLP',
    status: 'To Read',
    priority: 'High',
    notes: 'Introduces GPT-3, exploring in-context learning without fine-tuning.'
  };
  const createRes = await fetch(`${baseUrl}/papers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${demoToken}`
    },
    body: JSON.stringify(newPaperPayload)
  });
  const createData = await createRes.json();
  assert(createRes.status === 201, 'Create paper returns HTTP 201 Created');
  assert(createData.paper?.title === newPaperPayload.title, 'Created paper title matches payload');
  const newPaperId = createData.paper?.id;
  assert(!!newPaperId, `Generated paper ID is valid (${newPaperId})`);

  // Validation failure check: missing title
  const missingTitleRes = await fetch(`${baseUrl}/papers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${demoToken}`
    },
    body: JSON.stringify({ authors: 'Nobody', year: 2024 })
  });
  assert(missingTitleRes.status === 400, 'Missing title correctly rejected with HTTP 400');

  // 7. Paper Detail Flow
  console.log('\n--- Step 7: Paper Detail Flow ---');
  const detailRes = await fetch(`${baseUrl}/papers/${newPaperId}`, {
    headers: { 'Authorization': `Bearer ${demoToken}` }
  });
  const detailData = await detailRes.json();
  assert(detailRes.status === 200, 'Paper detail returns HTTP 200');
  assert(detailData.title === newPaperPayload.title, 'Detail title matches');
  assert(detailData.notes === newPaperPayload.notes, 'Detail notes match');
  assert(detailData.category === 'NLP', 'Detail category matches');

  // 8. Edit Paper Flow
  console.log('\n--- Step 8: Edit Paper Flow ---');
  const updatePayload = {
    title: 'Language Models are Few-Shot Learners (NeurIPS 2020)',
    authors: 'Tom B. Brown, Benjamin Mann, Nick Ryder et al.',
    year: 2020,
    category: 'NLP',
    status: 'Reading',
    priority: 'High',
    notes: 'Extensively analyzed 175B parameter model capabilities and scaling laws.'
  };
  const updateRes = await fetch(`${baseUrl}/papers/${newPaperId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${demoToken}`
    },
    body: JSON.stringify(updatePayload)
  });
  const updateData = await updateRes.json();
  assert(updateRes.status === 200, 'Update paper returns HTTP 200');
  assert(updateData.paper?.title === updatePayload.title, 'Updated title persisted');
  assert(updateData.paper?.status === 'Reading', 'Updated status is "Reading"');

  // 9. Search & Filter Logic Verification (Client Simulation)
  console.log('\n--- Step 9: Search and Filter Verification ---');
  const refreshedListRes = await fetch(`${baseUrl}/papers`, {
    headers: { 'Authorization': `Bearer ${demoToken}` }
  });
  const currentList = await refreshedListRes.json();

  // Search by author "Vaswani"
  const vaswaniSearch = currentList.filter(p =>
    (p.title && p.title.toLowerCase().includes('vaswani')) ||
    (p.authors && p.authors.toLowerCase().includes('vaswani'))
  );
  assert(vaswaniSearch.length === 1 && vaswaniSearch[0].title === 'Attention Is All You Need', 'Search by Author "Vaswani" matches 1 paper');

  // Filter by Category "Explainable AI"
  const xaiFilter = currentList.filter(p => p.category === 'Explainable AI');
  assert(xaiFilter.length === 2, `Category "Explainable AI" matches 2 papers (actual: ${xaiFilter.length})`);

  // Filter by Status "Reading"
  const readingFilter = currentList.filter(p => p.status === 'Reading');
  assert(readingFilter.length >= 2, `Status "Reading" matches expected papers (actual: ${readingFilter.length})`);

  // Combined Search & Filter: Category "NLP" and Search "Few-Shot"
  const combined = currentList.filter(p =>
    p.category === 'NLP' &&
    ((p.title && p.title.toLowerCase().includes('few-shot')) ||
     (p.authors && p.authors.toLowerCase().includes('few-shot')))
  );
  assert(combined.length === 1 && combined[0].id === newPaperId, 'Combined Search + Filter correctly isolates target paper');

  // 10. Delete Paper Flow
  console.log('\n--- Step 10: Delete Paper Flow ---');
  const deleteRes = await fetch(`${baseUrl}/papers/${newPaperId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${demoToken}` }
  });
  const deleteData = await deleteRes.json();
  assert(deleteRes.status === 200, 'Delete paper returns HTTP 200');
  assert(deleteData.message === 'Paper deleted successfully', 'Delete success message confirmed');

  // Verify it is gone
  const checkGoneRes = await fetch(`${baseUrl}/papers/${newPaperId}`, {
    headers: { 'Authorization': `Bearer ${demoToken}` }
  });
  assert(checkGoneRes.status === 404, 'Deleted paper cannot be fetched (HTTP 404)');

  // 11. Register New User & Cross-User Security Isolation Flow
  console.log('\n--- Step 11: Register Flow & Cross-User Security Isolation ---');
  const uniqueEmail = `scholar_${Date.now()}@lab.edu`;
  const regRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Dr. Scholar', email: uniqueEmail, password: 'securePass123' })
  });
  const regData = await regRes.json();
  assert(regRes.status === 201, 'User registration returns HTTP 201');
  assert(!!regData.userId, 'User registration generated user ID');

  // Reject duplicate email registration
  const dupRegRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Dr. Scholar Clone', email: uniqueEmail, password: 'any' })
  });
  assert(dupRegRes.status === 400, 'Duplicate email registration correctly rejected with HTTP 400');

  // Login new user
  const newLoginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: uniqueEmail, password: 'securePass123' })
  });
  const newLoginData = await newLoginRes.json();
  const scholarToken = newLoginData.token;
  assert(!!scholarToken, 'New user logged in successfully and received JWT');

  // Verify empty library for new user
  const scholarPapersRes = await fetch(`${baseUrl}/papers`, {
    headers: { 'Authorization': `Bearer ${scholarToken}` }
  });
  const scholarPapers = await scholarPapersRes.json();
  assert(scholarPapers.length === 0, 'New user sees 0 papers (Isolated from Demo user)');

  // Verify unauthorized access attempt to demo user's paper
  const firstDemoPaperId = paperList[0].id;
  const unauthorizedAccessRes = await fetch(`${baseUrl}/papers/${firstDemoPaperId}`, {
    headers: { 'Authorization': `Bearer ${scholarToken}` }
  });
  assert(unauthorizedAccessRes.status === 404, 'User cannot access another user\'s paper (Returns 404 Not Found)');

  // 12. Logout / Unauthenticated Request Flow
  console.log('\n--- Step 12: Unauthenticated Request Guard ---');
  const unauthRes = await fetch(`${baseUrl}/papers`);
  assert(unauthRes.status === 401, 'Unauthenticated request correctly rejected with HTTP 401');

  console.log('\n====================================================');
  console.log(`  E2E TEST SUMMARY: ${passed} PASSED, ${failed} FAILED `);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runE2ETests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
