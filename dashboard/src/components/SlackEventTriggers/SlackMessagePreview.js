import Image from 'next/image'
import MarkdownIt from 'markdown-it'
import SwishjamLogo from '@public/logos/swishjam.png'
import { useState } from 'react';

const markdown = new MarkdownIt();

function customHighlight(md) {
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

    state.pos += match[0].length;

    return true;
  }

  md.inline.ruler.before('emphasis', 'highlight', tokenize);
}

markdown.use(customHighlight);

// Overwrite the default renderer for 'highlight' tokens
markdown.renderer.rules.highlight = function (tokens, idx) {
  return `<span class="bg-gray-200 font-semibold italic text-gray-700 px-1 py-0.5 rounded-md">${markdown.utils.escapeHtml(tokens[idx].content)}</span>`;
};

const Reaction = ({ emoji, likeCount = 1 }) => {
  const [hasLiked, setHasLiked] = useState(false)
  return (
    <button
      className={`${hasLiked ? 'bg-blue-100 border-blue-400' : 'bg-gray-200 border-transparent hover:bg-gray-300 hover:border-gray-400'} active:scale-90 border rounded-full w-fit px-2 py-0.5 flex items-center cursor-pointer transition-all`}
      onClick={e => {
        e.preventDefault();
        setHasLiked(!hasLiked);
      }}
    >
      <div>
        <>{emoji}</> <span style={{ fontSize: '0.6rem' }}>{hasLiked ? likeCount + 1 : likeCount}</span>
      </div>
    </button>
  )
}

export default function SlackMessagePreview({ header, body, renderBodyAsMarkdown = true, className }) {
  return (
    <div className={`border border-gray-200 rounded-md p-4 flex gap-x-4 hover:bg-gray-100 ${className}`}>
      <div className='flex-shrink-0'>
        <Image src={SwishjamLogo} className='h-12 w-12' />
      </div>
      <div className='flex-grow'>
        <div className='flex items-end'>
          <span className='font-medium text-sm cursor-pointer hover:underline'>
            Swishjam
          </span>
          <span className='ml-1 bg-gray-200 text-gray-700 rounded px-1 py-0.5' style={{ fontSize: '0.6rem ' }}>
            APP
          </span>
          <span className='ml-1 text-gray-700 text-xs cursor-pointer hover:underline'>
            {new Date().toLocaleTimeString('en-us', { hour: 'numeric', minute: '2-digit' })}
          </span>
        </div>
        <div>
          <h2 className='text-md font-medium'>{header}</h2>
          <div className='mt-1'>
            {renderBodyAsMarkdown
              ? <div dangerouslySetInnerHTML={{ __html: markdown.render(body || '') }} />
              : <p className='text-sm'>{body}</p>
            }
          </div>
        </div>
        <div className='flex items-center gap-x-2 mt-2'>
          <Reaction emoji={<>👍🏼</>} />
          <Reaction emoji={<>🔥</>} />
        </div>
      </div>
    </div>
  )
}