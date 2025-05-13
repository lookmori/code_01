import { Problem, ProblemTag } from '@/types/practice';

export const problemTags: ProblemTag[] = [
  { id: '1', name: '数组', color: 'blue' },
  { id: '2', name: '字符串', color: 'green' },
  { id: '3', name: '动态规划', color: 'red' },
  { id: '4', name: '数学', color: 'purple' },
  { id: '5', name: '贪心算法', color: 'orange' },
  { id: '6', name: '排序', color: 'cyan' },
  { id: '7', name: '树', color: 'teal' },
  { id: '8', name: '图', color: 'pink' },
  { id: '9', name: '链表', color: 'indigo' },
  { id: '10', name: '二分搜索', color: 'yellow' },
];

export const mockProblems: Problem[] = [
  {
    id: '1',
    title: '两数之和',
    problemName: '两数之和',
    description: '给定一个整数数组 nums 和一个目标值 target，请你在该数组中找出和为目标值的那两个整数，并返回他们的数组下标。\n\n你可以假设每种输入只会对应一个答案。但是，你不能重复利用这个数组中同样的元素。',
    problemDescription: '给定一个整数数组 nums 和一个目标值 target，请你在该数组中找出和为目标值的那两个整数，并返回他们的数组下标。\n\n你可以假设每种输入只会对应一个答案。但是，你不能重复利用这个数组中同样的元素。',
    difficulty: 'easy',
    tags: [problemTags[0], problemTags[3]],
    sampleInput: 'nums = [2, 7, 11, 15], target = 9',
    sampleOutput: '[0, 1]',
    exampleInput: 'nums = [2, 7, 11, 15], target = 9',
    exampleOutput: '[0, 1]',
    publishedAt: new Date().toISOString()
  },
  {
    id: '2',
    title: '两数相加',
    problemName: '两数相加',
    description: '给你两个非空的链表，表示两个非负的整数。它们每位数字都是按照逆序的方式存储的，并且每个节点只能存储一位数字。\n\n请你将两个数相加，并以相同形式返回一个表示和的链表。\n\n你可以假设除了数字 0 之外，这两个数都不会以 0 开头。',
    problemDescription: '给你两个非空的链表，表示两个非负的整数。它们每位数字都是按照逆序的方式存储的，并且每个节点只能存储一位数字。\n\n请你将两个数相加，并以相同形式返回一个表示和的链表。\n\n你可以假设除了数字 0 之外，这两个数都不会以 0 开头。',
    difficulty: 'medium',
    tags: [problemTags[8], problemTags[3]],
    sampleInput: 'l1 = [2,4,3], l2 = [5,6,4]',
    sampleOutput: '[7,0,8]',
    exampleInput: 'l1 = [2,4,3], l2 = [5,6,4]',
    exampleOutput: '[7,0,8]',
    publishedAt: new Date().toISOString()
  },
  {
    id: '3',
    title: '无重复字符的最长子串',
    problemName: '无重复字符的最长子串',
    description: '给定一个字符串，请你找出其中不含有重复字符的最长子串的长度。',
    problemDescription: '给定一个字符串，请你找出其中不含有重复字符的最长子串的长度。',
    difficulty: 'medium',
    tags: [problemTags[1], problemTags[5]],
    sampleInput: '"abcabcbb"',
    sampleOutput: '3',
    exampleInput: '"abcabcbb"',
    exampleOutput: '3',
    publishedAt: new Date().toISOString()
  },
  {
    id: '4',
    title: '寻找两个正序数组的中位数',
    problemName: '寻找两个正序数组的中位数',
    description: '给定两个大小为 m 和 n 的正序（从小到大）数组 nums1 和 nums2。请你找出这两个正序数组的中位数，并且要求算法的时间复杂度为 O(log(m + n))。',
    problemDescription: '给定两个大小为 m 和 n 的正序（从小到大）数组 nums1 和 nums2。请你找出这两个正序数组的中位数，并且要求算法的时间复杂度为 O(log(m + n))。',
    difficulty: 'hard',
    tags: [problemTags[0], problemTags[9]],
    sampleInput: 'nums1 = [1,3], nums2 = [2]',
    sampleOutput: '2.0',
    exampleInput: 'nums1 = [1,3], nums2 = [2]',
    exampleOutput: '2.0',
    publishedAt: new Date().toISOString()
  },
  {
    id: '5',
    title: '最长回文子串',
    problemName: '最长回文子串',
    description: '给你一个字符串 s，找到 s 中最长的回文子串。',
    problemDescription: '给你一个字符串 s，找到 s 中最长的回文子串。',
    difficulty: 'medium',
    tags: [problemTags[1], problemTags[2]],
    sampleInput: '"babad"',
    sampleOutput: '"bab" 或 "aba"',
    exampleInput: '"babad"',
    exampleOutput: '"bab" 或 "aba"',
    publishedAt: new Date().toISOString()
  },
  {
    id: '6',
    title: 'Z 字形变换',
    problemName: 'Z 字形变换',
    description: '将一个给定字符串 s 根据给定的行数 numRows ，以从上往下、从左到右进行 Z 字形排列。\n\n比如输入字符串为 "PAYPALISHIRING" 行数为 3 时，排列如下：\n\nP   A   H   N\nA P L S I I G\nY   I   R\n\n之后，你的输出需要从左往右逐行读取，产生出一个新的字符串，比如："PAHNAPLSIIGYIR"。',
    problemDescription: '将一个给定字符串 s 根据给定的行数 numRows ，以从上往下、从左到右进行 Z 字形排列。\n\n比如输入字符串为 "PAYPALISHIRING" 行数为 3 时，排列如下：\n\nP   A   H   N\nA P L S I I G\nY   I   R\n\n之后，你的输出需要从左往右逐行读取，产生出一个新的字符串，比如："PAHNAPLSIIGYIR"。',
    difficulty: 'medium',
    tags: [problemTags[1]],
    sampleInput: 's = "PAYPALISHIRING", numRows = 3',
    sampleOutput: '"PAHNAPLSIIGYIR"',
    exampleInput: 's = "PAYPALISHIRING", numRows = 3',
    exampleOutput: '"PAHNAPLSIIGYIR"',
    publishedAt: new Date().toISOString()
  },
  {
    id: '7',
    title: '整数反转',
    problemName: '整数反转',
    description: '给你一个 32 位的有符号整数 x ，返回将 x 中的数字部分反转后的结果。\n\n如果反转后整数超过 32 位的有符号整数的范围 [−2^31,  2^31 − 1] ，就返回 0。\n\n假设环境不允许存储 64 位整数（有符号或无符号）。',
    problemDescription: '给你一个 32 位的有符号整数 x ，返回将 x 中的数字部分反转后的结果。\n\n如果反转后整数超过 32 位的有符号整数的范围 [−2^31,  2^31 − 1] ，就返回 0。\n\n假设环境不允许存储 64 位整数（有符号或无符号）。',
    difficulty: 'easy',
    tags: [problemTags[3]],
    sampleInput: 'x = 123',
    sampleOutput: '321',
    exampleInput: 'x = 123',
    exampleOutput: '321',
    publishedAt: new Date().toISOString()
  },
  {
    id: '8',
    title: '字符串转换整数 (atoi)',
    problemName: '字符串转换整数 (atoi)',
    description: '请你来实现一个 myAtoi(string s) 函数，使其能将字符串转换成一个 32 位有符号整数（类似 C/C++ 中的 atoi 函数）。',
    problemDescription: '请你来实现一个 myAtoi(string s) 函数，使其能将字符串转换成一个 32 位有符号整数（类似 C/C++ 中的 atoi 函数）。',
    difficulty: 'medium',
    tags: [problemTags[1], problemTags[3]],
    sampleInput: '"42"',
    sampleOutput: '42',
    exampleInput: '"42"',
    exampleOutput: '42',
    publishedAt: new Date().toISOString()
  },
  {
    id: '9',
    title: '回文数',
    problemName: '回文数',
    description: '给你一个整数 x ，如果 x 是一个回文整数，返回 true ；否则，返回 false 。\n\n回文数是指正序（从左向右）和倒序（从右向左）读都是一样的整数。例如，121 是回文，而 123 不是。',
    problemDescription: '给你一个整数 x ，如果 x 是一个回文整数，返回 true ；否则，返回 false 。\n\n回文数是指正序（从左向右）和倒序（从右向左）读都是一样的整数。例如，121 是回文，而 123 不是。',
    difficulty: 'easy',
    tags: [problemTags[3]],
    sampleInput: 'x = 121',
    sampleOutput: 'true',
    exampleInput: 'x = 121',
    exampleOutput: 'true',
    publishedAt: new Date().toISOString()
  },
  {
    id: '10',
    title: '正则表达式匹配',
    problemName: '正则表达式匹配',
    description: '给你一个字符串 s 和一个字符规律 p，请你来实现一个支持 \'.\' 和 \'*\' 的正则表达式匹配。\n\n\'.\' 匹配任意单个字符\n\'*\' 匹配零个或多个前面的那一个元素\n所谓匹配，是要涵盖 整个 字符串 s的，而不是部分字符串。',
    problemDescription: '给你一个字符串 s 和一个字符规律 p，请你来实现一个支持 \'.\' 和 \'*\' 的正则表达式匹配。\n\n\'.\' 匹配任意单个字符\n\'*\' 匹配零个或多个前面的那一个元素\n所谓匹配，是要涵盖 整个 字符串 s的，而不是部分字符串。',
    difficulty: 'hard',
    tags: [problemTags[1], problemTags[2], problemTags[9]],
    sampleInput: 's = "aa", p = "a"',
    sampleOutput: 'false',
    exampleInput: 's = "aa", p = "a"',
    exampleOutput: 'false',
    publishedAt: new Date().toISOString()
  },
];

export const getPaginatedProblems = (
  page: number = 1, 
  pageSize: number = 10, 
  search: string = '',
  difficulty?: string,
  tags?: string[]
) => {
  let filteredProblems = [...mockProblems];
  
  // 搜索过滤
  if (search) {
    const searchLower = search.toLowerCase();
    filteredProblems = filteredProblems.filter(problem => 
      (problem.title?.toLowerCase() || '').includes(searchLower) || 
      (problem.description?.toLowerCase() || '').includes(searchLower) ||
      (problem.problemName?.toLowerCase() || '').includes(searchLower) ||
      (problem.problemDescription?.toLowerCase() || '').includes(searchLower)
    );
  }
  
  // 难度过滤 (可选)
  if (difficulty) {
    filteredProblems = filteredProblems.filter(problem => 
      problem.difficulty === difficulty
    );
  }
  
  // 标签过滤 (可选)
  if (tags && tags.length > 0) {
    filteredProblems = filteredProblems.filter(problem => 
      problem.tags && Array.isArray(problem.tags) && 
      problem.tags.some(tag => typeof tag === 'object' && tag !== null && 'id' in tag && tags.includes(tag.id))
    );
  }
  
  // 计算分页
  const totalCount = filteredProblems.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProblems = filteredProblems.slice(startIndex, endIndex);
  
  return {
    problems: paginatedProblems,
    totalCount,
    page,
    pageSize
  };
}; 