import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Tutorial } from '@/types/learn';

/**
 * 获取所有Python教程文件
 * @returns 排序后的教程列表
 */
export function getPythonTutorials(): Tutorial[] {
  const contentDir = path.join(process.cwd(), 'src/content/python');
  const files = fs.readdirSync(contentDir);
  
  const tutorials = files.map(filename => {
    const filePath = path.join(contentDir, filename);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(fileContent);
    
    return {
      slug: filename.replace('.mdx', ''),
      ...data,
    } as Tutorial;
  });
  
  // 按照order属性排序
  return tutorials.sort((a, b) => a.order - b.order);
} 