import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import MarkdownIt from 'markdown-it'
import { useMemo } from 'react';

const initializeMarkdownParser = acceptableHighlightValues => {
  const markdown = new MarkdownIt();

  function customHighlight(md, acceptableHighlightValues) {
    const pattern = /\{([^}]+)\}/;

    function tokenize(state, silent) {
      const start = state.pos;
      const match = pattern.exec(state.src.slice(start));

      if (!match || match.index !== 0) {
        return false;
      }

      if (silent) {
        return true;
      }

      const token = state.push('highlight', '', 0);
      token.content = match[1];
      token.meta = { isValidHighlight: acceptableHighlightValues.includes(match[1]) }

      state.pos += match[0].length;

      return true;
    }

    md.inline.ruler.before('emphasis', 'highlight', tokenize);
  }

  markdown.use(customHighlight, acceptableHighlightValues);

  // Overwrite the default renderer for 'highlight' tokens
  markdown.renderer.rules.highlight = function (tokens, idx) {
    const content = markdown.utils.escapeHtml(tokens[idx].content);
    const isValidHighlight = tokens[idx].meta.isValidHighlight;
    if (isValidHighlight) {
      return `<span class="bg-gray-200 italic text-emerald-400 px-1 py-0.5 rounded-md">{ ${content} }</span>`;
    } else {
      const warningIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 inline">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>`;
      return (
        `<span class="bg-red-200 italic text-red-700 px-1 py-0.5 rounded-md inline-flex items-center w-fit gap-x-1">
          { ${content} }
          ${warningIcon}
        </span>`
      )
    }
  };

  return markdown;
}


export default function MessageBodyMarkdownRenderer({ body, availableEventOptions }) {
  const markdown = useMemo(() => initializeMarkdownParser(availableEventOptions), [availableEventOptions]);
  const __html = markdown.render(body || '');
  return <div dangerouslySetInnerHTML={{ __html }} />
}