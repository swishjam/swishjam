import MarkdownIt from "markdown-it"

export default function MarkdownText({ text, className }) {
  const markdown = new MarkdownIt();
  return (
    <div className='markdown'>
      <style>{`
        .markdown a {
          color: blue;
          text-decoration: underline;
        }
        .markdown code {
          background-color: #f5f5f5;
          padding: 0.2rem 0.4rem;
          border-radius: 0.2rem;
          font-style: italic;
          font-weight: 800;
        }
      `}</style>
      <p className={className} dangerouslySetInnerHTML={{ __html: markdown.render(text) }} />
    </div>
  )
}