import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { getPythonTutorials } from '@/utils/tutorials';
import Link from 'next/link';
import { Tutorial } from '@/types/learn';

// 定义组件
const components = {
  h1: (props: any) => <h1 className="text-3xl font-bold mt-8 mb-4 text-gray-900 dark:text-white" {...props} />,
  h2: (props: any) => <h2 className="text-2xl font-bold mt-6 mb-3 text-gray-900 dark:text-white" {...props} />,
  h3: (props: any) => <h3 className="text-xl font-bold mt-5 mb-2 text-gray-900 dark:text-white" {...props} />,
  p: (props: any) => <p className="mb-4 text-gray-700 dark:text-gray-300" {...props} />,
  ul: (props: any) => <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300" {...props} />,
  ol: (props: any) => <ol className="list-decimal pl-6 mb-4 text-gray-700 dark:text-gray-300" {...props} />,
  li: (props: any) => <li className="mb-1" {...props} />,
  a: (props: any) => <a className="text-blue-600 hover:underline dark:text-blue-400" {...props} />,
  code: (props: any) => {
    const { className, ...rest } = props;
    return className ? (
      <code className={`${className} p-1 rounded text-sm font-mono`} {...rest} />
    ) : (
      <code className="bg-gray-100 dark:bg-gray-800 p-1 rounded text-sm font-mono" {...rest} />
    );
  },
  pre: (props: any) => <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto mb-4 text-sm" {...props} />,
  blockquote: (props: any) => <blockquote className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 italic my-4" {...props} />,
  table: (props: any) => <div className="overflow-x-auto mb-4"><table className="min-w-full border-collapse" {...props} /></div>,
  th: (props: any) => <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left font-semibold bg-gray-100 dark:bg-gray-800" {...props} />,
  td: (props: any) => <td className="border border-gray-300 dark:border-gray-700 px-4 py-2" {...props} />,
};

// 获取静态路径
export async function generateStaticParams() {
  const tutorials = getPythonTutorials();
  return tutorials.map((tutorial) => ({
    slug: tutorial.slug,
  }));
}

export default function TutorialPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const contentDir = path.join(process.cwd(), 'src/content/python');
  const filePath = path.join(contentDir, `${slug}.mdx`);
  
  // 读取文件内容
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { content, data } = matter(fileContent);
  
  // 获取所有教程以显示导航
  const allTutorials = getPythonTutorials();
  
  // 获取前一个和下一个教程的链接
  const currentIndex = allTutorials.findIndex(tutorial => tutorial.slug === slug);
  const prevTutorial = currentIndex > 0 ? allTutorials[currentIndex - 1] : null;
  const nextTutorial = currentIndex < allTutorials.length - 1 ? allTutorials[currentIndex + 1] : null;
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* 面包屑导航 */}
        <nav className="flex mb-8 text-sm">
          <Link href="/learn" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">学习</Link>
          <span className="mx-2 text-gray-500 dark:text-gray-400">/</span>
          <span className="text-gray-900 dark:text-gray-200">{data.title}</span>
        </nav>
        
        {/* 教程标题和信息 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">{data.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>发布日期: {new Date(data.date).toLocaleDateString('zh-CN')}</span>
            <span>难度: {data.level}</span>
            <div className="flex flex-wrap gap-2">
              {data.tags.map((tag: string, index: number) => (
                <span key={index} className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        {/* 教程内容 */}
        <div className="prose prose-blue max-w-none dark:prose-invert">
          <MDXRemote
            source={content}
            components={components}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [rehypeHighlight],
              },
            }}
          />
        </div>
        
        {/* 前后导航 */}
        <div className="flex justify-between mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          {prevTutorial ? (
            <Link
              href={`/learn/${prevTutorial.slug}`}
              className="flex items-center text-blue-600 hover:underline dark:text-blue-400"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              上一课: {prevTutorial.title}
            </Link>
          ) : (
            <div></div>
          )}
          
          {nextTutorial ? (
            <Link
              href={`/learn/${nextTutorial.slug}`}
              className="flex items-center text-blue-600 hover:underline dark:text-blue-400"
            >
              下一课: {nextTutorial.title}
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </Link>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </div>
  );
} 