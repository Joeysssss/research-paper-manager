const bcrypt = require('bcryptjs');
const { db, initDb } = require('./db');

async function seed() {
  try {
    console.log('Initializing database schema before seeding...');
    await initDb();

    // Check if demo user already exists
    const demoEmail = 'demo@example.com';
    let user = await db.getAsync('SELECT * FROM users WHERE email = ?', [demoEmail]);

    if (!user) {
      console.log('Creating demo user: demo@example.com / demo123');
      const hashedPassword = await bcrypt.hash('demo123', 10);
      const res = await db.runAsync(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        ['Demo Researcher', demoEmail, hashedPassword]
      );
      user = { id: res.lastID, name: 'Demo Researcher', email: demoEmail };
    } else {
      console.log('Demo user already exists (id:', user.id, ')');
    }

    // Check papers for demo user
    const existingPapers = await db.allAsync('SELECT * FROM papers WHERE user_id = ?', [user.id]);
    if (existingPapers.length === 0) {
      console.log('Seeding initial research papers...');

      const seedPapers = [
        {
          title: 'Attention Is All You Need',
          authors: 'Ashish Vaswani et al.',
          year: 2017,
          category: 'NLP',
          status: 'Completed',
          priority: 'High',
          notes: 'The landmark paper introducing the Transformer architecture, replacing recurrent layers with multi-head self-attention mechanisms.'
        },
        {
          title: 'A Unified Approach to Interpreting Model Predictions',
          authors: 'Scott Lundberg, Su-In Lee',
          year: 2017,
          category: 'Explainable AI',
          status: 'Reading',
          priority: 'High',
          notes: 'Presents SHAP (SHapley Additive exPlanations), connecting cooperative game theory with optimal credit allocation for model interpretability.'
        },
        {
          title: 'Grad-CAM: Visual Explanations from Deep Networks',
          authors: 'Ramprasaath Selvaraju et al.',
          year: 2017,
          category: 'Explainable AI',
          status: 'To Read',
          priority: 'Medium',
          notes: 'Uses the gradients of any target concept flowing into the final convolutional layer to produce a coarse localization map highlighting important regions.'
        }
      ];

      for (const p of seedPapers) {
        await db.runAsync(
          `INSERT INTO papers (user_id, title, authors, year, category, status, priority, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [user.id, p.title, p.authors, p.year, p.category, p.status, p.priority, p.notes]
        );
      }
      console.log('Successfully seeded 3 demo papers.');
    } else {
      console.log(`Demo user already has ${existingPapers.length} papers. Skipping paper seed.`);
    }

    console.log('Seeding completed successfully!');
  } catch (err) {
    console.error('Seeding error:', err);
  }
}

// Run if called directly
if (require.main === module) {
  seed().then(() => {
    setTimeout(() => process.exit(0), 500);
  });
}

module.exports = seed;
