import MarkdownIt from 'markdown-it'

const markdown = new MarkdownIt();

export default function MarkdownRenderer({ markdown: markdownContent }) {
  const __html = markdown.render(markdownContent || '');
  return <div dangerouslySetInnerHTML={{ __html }} />
}