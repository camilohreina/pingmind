import { promises as fs } from 'fs';
import path from 'path';
import { Metadata } from 'next';
import MaxWidthWrapper from '@/components/max-width-wrapper';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Términos y Condiciones',
  description: 'Términos y condiciones de uso de RecordAi',
};

interface CustomHeadingProps {
  level: 1 | 2 | 3;
  children: React.ReactNode;
}

const CustomHeading = ({ level, children }: CustomHeadingProps) => {
  const styles = {
    1: 'text-4xl font-extrabold mb-6 text-white',
    2: 'text-2xl font-bold mt-8 mb-4 text-green-400',
    3: 'text-xl font-semibold mt-6 mb-3 text-gray-200',
  };

  const Component = `h${level}` as keyof JSX.IntrinsicElements;
  
  return (
    <Component className={styles[level] || ''}>
      {children}
    </Component>
  );
};

export default async function TermsPage() {
  const termsPath = path.join(process.cwd(), 'public', 'terms.md');
  const content = await fs.readFile(termsPath, 'utf8');

  return (
    <MaxWidthWrapper className="mb-8 mt-24">
      <article className="mx-auto max-w-4xl">
        <ReactMarkdown
          components={{
            h1: ({node, children, ...props}) => <CustomHeading level={1} {...props}>{children}</CustomHeading>,
            h2: ({node, children, ...props}) => <CustomHeading level={2} {...props}>{children}</CustomHeading>,
            h3: ({node, children, ...props}) => <CustomHeading level={3} {...props}>{children}</CustomHeading>,
            p: ({node, children, ...props}) => <p className="text-gray-300 text-lg mb-4" {...props}>{children}</p>,
            ul: ({node, children, ...props}) => <ul className="my-4 space-y-2" {...props}>{children}</ul>,
            li: ({node, children, ...props}) => (
              <li className="text-gray-300 text-lg flex items-start">
                <span className="mr-2">•</span> 
                <span {...props}>{children}</span>
              </li>
            ),
            strong: ({node, children, ...props}) => <strong className="font-bold text-white" {...props}>{children}</strong>,
            em: ({node, children, ...props}) => <em className="text-gray-400 italic" {...props}>{children}</em>,
          }}
        >
          {content}
        </ReactMarkdown>
      </article>
    </MaxWidthWrapper>
  );
}