import supabase from '../src/config/supabase.js';
import bcrypt from 'bcryptjs';

const ADMIN_PASSWORD = 'AdminPassword123!'; // Change this in production

async function seed() {
  console.log('🌱 Starting database seed...\n');

  try {
    // 1. Create admin user
    console.log('📝 Creating admin user...');
    const adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .insert([
        {
          full_name: 'Admin User',
          email: 'admin@antheracademy.com',
          phone: '+234 (0) 123 456 7890',
          password_hash: adminPasswordHash,
          role: 'admin',
          email_verified: true,
        }
      ])
      .select()
      .single();

    if (adminError) throw adminError;
    console.log(`✅ Admin user created: ${adminUser.email}\n`);

    // 2. Create sample courses
    console.log('📚 Creating sample courses...');

    const courses = [
      {
        title: 'Financial Accounting Fundamentals',
        slug: 'financial-accounting-fundamentals',
        description: 'Master the core principles of financial accounting. Learn how to record transactions, prepare financial statements, and understand accounting concepts that form the foundation of professional accounting practice.',
        price: 49.99,
        duration_weeks: 8,
        level: 'new_to_practice',
        is_published: true,
        created_by: adminUser.id,
      },
      {
        title: 'Taxation & Auditing Basics',
        slug: 'taxation-auditing-basics',
        description: 'Comprehensive introduction to tax principles and auditing procedures. Understand tax compliance, deductions, and the audit process essential for practicing accountants.',
        price: 59.99,
        duration_weeks: 10,
        level: 'practicing_accountant',
        is_published: true,
        created_by: adminUser.id,
      }
    ];

    const courseInserts = await Promise.all(
      courses.map(async (course) => {
        const { data, error } = await supabase
          .from('courses')
          .insert([course])
          .select()
          .single();
        
        if (error) throw error;
        return data;
      })
    );

    console.log(`✅ Created ${courseInserts.length} courses\n`);

    // 3. Create modules and lessons for Financial Accounting
    console.log('📖 Creating modules and lessons for Financial Accounting...');
    
    const financialCourse = courseInserts[0];
    
    const financialModules = [
      {
        title: 'Introduction to Accounting Concepts',
        description: 'Learn the fundamental concepts and principles of accounting',
        order_index: 1,
        lessons: [
          { title: 'What is Accounting?', content_type: 'video', order_index: 1, duration_minutes: 12 },
          { title: 'The Accounting Equation', content_type: 'text', order_index: 2, duration_minutes: 8 },
          { title: 'GAAP Principles', content_type: 'pdf', order_index: 3, duration_minutes: 15 },
        ]
      },
      {
        title: 'Recording Transactions',
        description: 'Master the journal and ledger system',
        order_index: 2,
        lessons: [
          { title: 'Debits and Credits', content_type: 'video', order_index: 1, duration_minutes: 18 },
          { title: 'Journal Entries', content_type: 'text', order_index: 2, duration_minutes: 10 },
          { title: 'T-Accounts', content_type: 'video', order_index: 3, duration_minutes: 14 },
          { title: 'Practice Problems', content_type: 'pdf', order_index: 4, duration_minutes: 20 },
        ]
      },
      {
        title: 'Financial Statements',
        description: 'Prepare and interpret financial statements',
        order_index: 3,
        lessons: [
          { title: 'Income Statement', content_type: 'video', order_index: 1, duration_minutes: 16 },
          { title: 'Balance Sheet', content_type: 'video', order_index: 2, duration_minutes: 14 },
          { title: 'Statement of Cash Flows', content_type: 'text', order_index: 3, duration_minutes: 12 },
          { title: 'Financial Analysis', content_type: 'pdf', order_index: 4, duration_minutes: 18 },
        ]
      }
    ];

    for (const moduleData of financialModules) {
      const { lessons, ...module } = moduleData;
      
      const { data: createdModule, error: moduleError } = await supabase
        .from('modules')
        .insert([{ ...module, course_id: financialCourse.id }])
        .select()
        .single();

      if (moduleError) throw moduleError;

      // Insert lessons for this module
      const lessonInserts = lessons.map(lesson => ({
        ...lesson,
        module_id: createdModule.id,
        content_url: `https://example.com/content/${lesson.title.replace(/\s+/g, '-').toLowerCase()}`,
      }));

      const { error: lessonsError } = await supabase
        .from('lessons')
        .insert(lessonInserts);

      if (lessonsError) throw lessonsError;

      console.log(`  ✅ Module: ${moduleData.title} (${lessons.length} lessons)`);
    }

    console.log();

    // 4. Create modules and lessons for Taxation & Auditing
    console.log('📖 Creating modules and lessons for Taxation & Auditing...');
    
    const taxationCourse = courseInserts[1];

    const taxationModules = [
      {
        title: 'Tax Fundamentals',
        description: 'Understanding tax basics and structures',
        order_index: 1,
        lessons: [
          { title: 'Types of Taxes', content_type: 'video', order_index: 1, duration_minutes: 14 },
          { title: 'Tax Compliance Overview', content_type: 'text', order_index: 2, duration_minutes: 11 },
          { title: 'Corporate vs Personal Taxes', content_type: 'video', order_index: 3, duration_minutes: 16 },
        ]
      },
      {
        title: 'Income Tax Planning',
        description: 'Strategic tax planning for individuals and businesses',
        order_index: 2,
        lessons: [
          { title: 'Deductions and Credits', content_type: 'video', order_index: 1, duration_minutes: 20 },
          { title: 'Tax Planning Strategies', content_type: 'text', order_index: 2, duration_minutes: 15 },
          { title: 'Record Keeping', content_type: 'pdf', order_index: 3, duration_minutes: 12 },
        ]
      },
      {
        title: 'Audit Procedures',
        description: 'Learn the audit process and procedures',
        order_index: 3,
        lessons: [
          { title: 'Audit Planning', content_type: 'video', order_index: 1, duration_minutes: 18 },
          { title: 'Audit Evidence', content_type: 'text', order_index: 2, duration_minutes: 14 },
          { title: 'Audit Reports', content_type: 'pdf', order_index: 3, duration_minutes: 16 },
        ]
      },
      {
        title: 'Advanced Audit Topics',
        description: 'Deep dive into complex audit scenarios',
        order_index: 4,
        lessons: [
          { title: 'Fraud Detection', content_type: 'video', order_index: 1, duration_minutes: 22 },
          { title: 'Internal Controls', content_type: 'text', order_index: 2, duration_minutes: 17 },
        ]
      }
    ];

    for (const moduleData of taxationModules) {
      const { lessons, ...module } = moduleData;

      const { data: createdModule, error: moduleError } = await supabase
        .from('modules')
        .insert([{ ...module, course_id: taxationCourse.id }])
        .select()
        .single();

      if (moduleError) throw moduleError;

      // Insert lessons for this module
      const lessonInserts = lessons.map(lesson => ({
        ...lesson,
        module_id: createdModule.id,
        content_url: `https://example.com/content/${lesson.title.replace(/\s+/g, '-').toLowerCase()}`,
      }));

      const { error: lessonsError } = await supabase
        .from('lessons')
        .insert(lessonInserts);

      if (lessonsError) throw lessonsError;

      console.log(`  ✅ Module: ${moduleData.title} (${lessons.length} lessons)`);
    }

    console.log();

    // 5. Create sample quiz for Financial Accounting
    console.log('🎯 Creating sample quizzes...');

    const financialModule1 = await supabase
      .from('modules')
      .select('id')
      .eq('course_id', financialCourse.id)
      .eq('order_index', 1)
      .single();

    const { data: quiz1, error: quiz1Error } = await supabase
      .from('quizzes')
      .insert([{
        module_id: financialModule1.data.id,
        title: 'Accounting Concepts Quiz',
        description: 'Test your understanding of fundamental accounting concepts',
        pass_mark: 70,
        is_required: true,
      }])
      .select()
      .single();

    if (quiz1Error) throw quiz1Error;

    const quiz1Questions = [
      {
        question_text: 'What is the basic accounting equation?',
        option_a: 'Assets = Liabilities + Equity',
        option_b: 'Assets = Liabilities - Equity',
        option_c: 'Income = Assets + Liabilities',
        option_d: 'Equity = Assets - Income',
        correct_option: 'A',
        explanation: 'The fundamental accounting equation states that Assets equal Liabilities plus Equity.',
        order_index: 1,
      },
      {
        question_text: 'In a debit entry, which account types increase?',
        option_a: 'Only Assets',
        option_b: 'Assets and Expenses',
        option_c: 'Liabilities and Income',
        option_d: 'Only Equity',
        correct_option: 'B',
        explanation: 'Debit entries increase Assets and Expenses, and decrease Liabilities, Equity, and Income.',
        order_index: 2,
      },
      {
        question_text: 'What does GAAP stand for?',
        option_a: 'General Accounting and Audit Principles',
        option_b: 'Generally Accepted Accounting Principles',
        option_c: 'General Assets and Accounting Practices',
        option_d: 'Government Approved Accounting Practices',
        correct_option: 'B',
        explanation: 'GAAP stands for Generally Accepted Accounting Principles.',
        order_index: 3,
      },
    ];

    const { error: quizQError } = await supabase
      .from('quiz_questions')
      .insert(quiz1Questions.map(q => ({ ...q, quiz_id: quiz1.id })));

    if (quizQError) throw quizQError;

    console.log(`✅ Created quiz: ${quiz1.title} (${quiz1Questions.length} questions)\n`);

    // Summary
    console.log('✨ Database seed completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`  • Admin user: admin@antheracademy.com (password: ${ADMIN_PASSWORD})`);
    console.log(`  • Courses created: ${courseInserts.length}`);
    console.log(`  • Total modules: ${financialModules.length + taxationModules.length}`);
    console.log(`  • Total lessons: ${(financialModules.reduce((sum, m) => sum + m.lessons.length, 0) + taxationModules.reduce((sum, m) => sum + m.lessons.length, 0))}`);
    console.log(`  • Quizzes created: 1`);
    console.log('\n🚀 Ready to test the application!\n');

  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
}

seed();
