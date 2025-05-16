import { promises as fs } from "fs";
import path from "path";
import { Metadata } from "next";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import ReactMarkdown from "react-markdown";
import { getTranslations } from "next-intl/server";
import { customMetaDataGenerator } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("privacy");

  return customMetaDataGenerator({
    title: t("meta.title"),
    description: t("meta.description"),
  });
}

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  const fileName = `privacy.${locale}.md`;
  const privacyPath = path.join(process.cwd(), "public", fileName);
  let content: string;

  try {
    content = await fs.readFile(privacyPath, "utf8");
  } catch (error) {
    // If file doesn't exist in current language, load English by default
    const defaultPrivacyPath = path.join(
      process.cwd(),
      "public",
      "privacy.en.md",
    );
    content = await fs.readFile(defaultPrivacyPath, "utf8");
  }

  return (
    <MaxWidthWrapper className="mb-8 mt-24">
      <article className="mx-auto max-w-4xl">
        <ReactMarkdown
          components={{
            h1: ({ node, children, ...props }) => (
              <h1
                className="text-4xl font-extrabold mb-6 text-white"
                {...props}
              >
                {children}
              </h1>
            ),
            h2: ({ node, children, ...props }) => (
              <h2
                className="text-2xl font-bold mt-8 mb-4 text-green-400"
                {...props}
              >
                {children}
              </h2>
            ),
            h3: ({ node, children, ...props }) => (
              <h3
                className="text-xl font-semibold mt-6 mb-3 text-gray-200"
                {...props}
              >
                {children}
              </h3>
            ),
            p: ({ node, children, ...props }) => (
              <p className="text-gray-300 text-lg mb-4" {...props}>
                {children}
              </p>
            ),
            ul: ({ node, children, ...props }) => (
              <ul className="my-4 space-y-2" {...props}>
                {children}
              </ul>
            ),
            li: ({ node, children, ...props }) => (
              <li className="text-gray-300 text-lg flex items-start">
                <span className="mr-2">•</span>
                <span {...props}>{children}</span>
              </li>
            ),
            strong: ({ node, children, ...props }) => (
              <strong className="font-bold text-white" {...props}>
                {children}
              </strong>
            ),
            em: ({ node, children, ...props }) => (
              <em className="text-gray-400 italic" {...props}>
                {children}
              </em>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </article>
    </MaxWidthWrapper>
  );
}
