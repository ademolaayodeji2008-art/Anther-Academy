#!/usr/bin/env node

/**
 * Quick test for word count validation logic
 * This tests the countWords and validateMotivationWordCount functions
 */

// Word counting function (same as in applications.js)
const countWords = (text) => {
  if (!text || typeof text !== 'string') return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

// Validation function (same as in applications.js)
const validateMotivationWordCount = (text, fieldName = 'motivation') => {
  const wordCount = countWords(text);
  
  if (wordCount < 150) {
    return {
      valid: false,
      wordCount,
      error: `${fieldName} must be at least 150 words (you have ${wordCount} words)`,
    };
  }
  
  if (wordCount > 200) {
    return {
      valid: false,
      wordCount,
      error: `${fieldName} must not exceed 200 words (you have ${wordCount} words)`,
    };
  }
  
  return {
    valid: true,
    wordCount,
  };
};

// Test cases
console.log('📋 WORD COUNT VALIDATION TEST SUITE\n');
console.log('='.repeat(60));

// Test 1: Too short (50 words)
console.log('\n✅ TEST 1: Too Few Words (50 words)');
const shortText = "I want to learn accounting because it interests me and I think it will help my career a lot. I am excited about this opportunity.";
const result1 = validateMotivationWordCount(shortText, 'motivation_why_enrol');
console.log(`Input: "${shortText}"`);
console.log(`Word Count: ${result1.wordCount}`);
console.log(`Valid: ${result1.valid}`);
console.log(`Error: ${result1.error || 'N/A'}`);

// Test 2: Valid (165 words)
console.log('\n✅ TEST 2: Valid Submission (165 words)');
const validText = "I am deeply passionate about accounting and financial management. Throughout my career in finance, I have consistently witnessed the critical importance of strong accounting knowledge and practices. This programme will significantly enhance my technical skills and deepen my understanding of accounting principles, international standards, and best practices in the field. I am particularly interested in the comprehensive curriculum offered and the modern accounting methodologies taught here. The hybrid format is ideal for my schedule, allowing me to pursue rigorous academic study while maintaining my current professional commitments. I am committed to achieving excellence and believe this programme will substantially advance my career trajectory in the accounting profession and open new opportunities for growth.";
const result2 = validateMotivationWordCount(validText, 'motivation_why_enrol');
console.log(`Word Count: ${result2.wordCount}`);
console.log(`Valid: ${result2.valid}`);
console.log(`Error: ${result2.error || 'N/A'}`);

// Test 3: Too long (225 words)
console.log('\n✅ TEST 3: Too Many Words (225 words)');
const longText = "I am deeply passionate about accounting and financial management. Throughout my entire career in finance, I have consistently witnessed the critical importance of strong accounting knowledge and practices. This programme will significantly enhance my technical skills and deepen my understanding of accounting principles, international standards, and best practices in the field. I am particularly interested in the comprehensive curriculum offered and the modern accounting methodologies taught here. The hybrid format is ideal for my schedule, allowing me to pursue rigorous academic study while maintaining my current professional commitments. I am committed to achieving excellence and believe this programme will substantially advance my career trajectory in the accounting profession and open new opportunities for growth and development. Additionally, I look forward to networking with other professionals and gaining insights from experienced instructors.";
const result3 = validateMotivationWordCount(longText, 'motivation_why_enrol');
console.log(`Word Count: ${result3.wordCount}`);
console.log(`Valid: ${result3.valid}`);
console.log(`Error: ${result3.error || 'N/A'}`);

// Test 4: Edge case - exactly 150 words (minimum valid)
console.log('\n✅ TEST 4: Exactly 150 Words (Edge Case - Minimum Valid)');
const exactly150 = "I want to enroll in this programme because I am passionate about accounting and financial management. Throughout my career, I have seen how important accounting knowledge is. This programme will help me develop skills in accounting principles and practices. The curriculum is comprehensive and modern. I appreciate the hybrid format because it allows me to study while working. I am committed to learning and believe this will advance my career. The instructors seem experienced and knowledgeable. I am excited about this opportunity to grow professionally. Networking with other students will be valuable. I look forward to completing this programme successfully and earning my qualification. Thank you for considering my application.";
const result4 = validateMotivationWordCount(exactly150, 'motivation_why_enrol');
console.log(`Word Count: ${result4.wordCount}`);
console.log(`Valid: ${result4.valid}`);
console.log(`Error: ${result4.error || 'N/A'}`);

// Test 5: Edge case - exactly 200 words (maximum valid)
console.log('\n✅ TEST 5: Exactly 200 Words (Edge Case - Maximum Valid)');
const exactly200 = "I want to enroll in this programme because I am passionate about accounting and financial management. Throughout my career, I have seen how important accounting knowledge is. This programme will help me develop skills in accounting principles and practices. The curriculum is comprehensive and modern. I appreciate the hybrid format because it allows me to study while working. I am committed to learning and believe this will advance my career. The instructors seem experienced and knowledgeable. I am excited about this opportunity to grow professionally. Networking with other students will be valuable. I look forward to completing this programme successfully and earning my qualification. I plan to apply my knowledge immediately. Thank you for this opportunity.";
const result5 = validateMotivationWordCount(exactly200, 'motivation_why_enrol');
console.log(`Word Count: ${result5.wordCount}`);
console.log(`Valid: ${result5.valid}`);
console.log(`Error: ${result5.error || 'N/A'}`);

// Test 6: Empty string
console.log('\n✅ TEST 6: Empty String');
const emptyText = "";
const result6 = validateMotivationWordCount(emptyText, 'motivation_why_enrol');
console.log(`Word Count: ${result6.wordCount}`);
console.log(`Valid: ${result6.valid}`);
console.log(`Error: ${result6.error || 'N/A'}`);

// Test 7: NULL/undefined
console.log('\n✅ TEST 7: NULL/Undefined');
const result7 = validateMotivationWordCount(null, 'motivation_why_enrol');
console.log(`Word Count: ${result7.wordCount}`);
console.log(`Valid: ${result7.valid}`);
console.log(`Error: ${result7.error || 'N/A'}`);

// Test 8: Multiple spaces and newlines
console.log('\n✅ TEST 8: Multiple Spaces and Newlines');
const weirdText = "Hello   world\n\n\nthis   is   a   test\n\t\ttabs   too. ".repeat(20);
const result8 = validateMotivationWordCount(weirdText, 'motivation_why_enrol');
console.log(`Word Count: ${result8.wordCount}`);
console.log(`Valid: ${result8.valid}`);
console.log(`Error: ${result8.error || 'N/A'}`);

// Summary
console.log('\n' + '='.repeat(60));
console.log('\n📊 TEST SUMMARY\n');
const tests = [
  { name: 'Too Few Words (50)', expected: 'FAIL', actual: result1.valid ? 'PASS' : 'FAIL', match: !result1.valid },
  { name: 'Valid (165)', expected: 'PASS', actual: result2.valid ? 'PASS' : 'FAIL', match: result2.valid },
  { name: 'Too Many Words (225)', expected: 'FAIL', actual: result3.valid ? 'PASS' : 'FAIL', match: !result3.valid },
  { name: 'Exactly 150 (min)', expected: 'PASS', actual: result4.valid ? 'PASS' : 'FAIL', match: result4.valid },
  { name: 'Exactly 200 (max)', expected: 'PASS', actual: result5.valid ? 'PASS' : 'FAIL', match: result5.valid },
  { name: 'Empty string', expected: 'FAIL', actual: result6.valid ? 'PASS' : 'FAIL', match: !result6.valid },
  { name: 'NULL', expected: 'FAIL', actual: result7.valid ? 'PASS' : 'FAIL', match: !result7.valid },
  { name: 'Spaces & newlines', expected: 'PASS', actual: result8.valid ? 'PASS' : 'FAIL', match: result8.wordCount >= 150 && result8.wordCount <= 200 },
];

tests.forEach((test, i) => {
  const icon = test.match ? '✅' : '❌';
  console.log(`${icon} Test ${i + 1}: ${test.name.padEnd(30)} Expected: ${test.expected.padEnd(5)} Actual: ${test.actual}`);
});

const allPassed = tests.every(t => t.match);
console.log('\n' + '='.repeat(60));
console.log(`\n${allPassed ? '✅ ALL TESTS PASSED!' : '❌ SOME TESTS FAILED!'}\n`);

process.exit(allPassed ? 0 : 1);
