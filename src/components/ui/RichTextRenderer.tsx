/* eslint-disable @typescript-eslint/no-explicit-any */

interface RichTextRendererProps {
  content: any
  className?: string
}

function renderNode(node: any, index: number): React.ReactNode {
  if (!node) return null

  if (node.type === 'text' || !node.type) {
    let text: React.ReactNode = node.text || ''
    if (node.format & 1) text = <strong key={index}>{text}</strong>
    if (node.format & 2) text = <em key={index}>{text}</em>
    if (node.format & 4) text = <s key={index}>{text}</s>
    if (node.format & 8) text = <u key={index}>{text}</u>
    if (node.format & 16) text = <code key={index}>{text}</code>
    return text
  }

  const children = node.children?.map((child: any, i: number) => renderNode(child, i))

  switch (node.type) {
    case 'paragraph':
      return <p key={index}>{children}</p>
    case 'heading': {
      const level = node.tag?.replace('h', '') || '2'
      if (level === '1') return <h1 key={index}>{children}</h1>
      if (level === '2') return <h2 key={index}>{children}</h2>
      if (level === '3') return <h3 key={index}>{children}</h3>
      if (level === '4') return <h4 key={index}>{children}</h4>
      if (level === '5') return <h5 key={index}>{children}</h5>
      return <h6 key={index}>{children}</h6>
    }
    case 'list':
      if (node.listType === 'bullet' || node.tag === 'ul') {
        return <ul key={index}>{children}</ul>
      }
      return <ol key={index}>{children}</ol>
    case 'listitem':
      return <li key={index}>{children}</li>
    case 'link':
    case 'autolink':
      return (
        <a key={index} href={node.fields?.url || node.url || '#'} target={node.fields?.newTab ? '_blank' : undefined} rel={node.fields?.newTab ? 'noopener noreferrer' : undefined}>
          {children}
        </a>
      )
    case 'table':
      return (
        <table key={index} className="w-full text-sm border-collapse my-4">
          <tbody>{children}</tbody>
        </table>
      )
    case 'tablerow':
      return <tr key={index} className="border-b border-gray-200">{children}</tr>
    case 'tablecell': {
      const cellClasses = 'px-4 py-2.5 text-left'
      if (node.headerState) {
        return (
          <th key={index} className={`${cellClasses} font-heading tracking-wide text-xs uppercase text-gray-500 bg-gray-50`}>
            {children}
          </th>
        )
      }
      return <td key={index} className={cellClasses}>{children}</td>
    }
    case 'quote':
      return <blockquote key={index}>{children}</blockquote>
    case 'upload':
      if (node.value?.url) {
        return <img key={index} src={node.value.url} alt={node.value.alt || ''} className="my-4 rounded" />
      }
      return null
    default:
      if (children) return <div key={index}>{children}</div>
      return null
  }
}

export function RichTextRenderer({ content, className }: RichTextRendererProps) {
  if (!content) return null

  const root = typeof content === 'object' && 'root' in content ? content.root : content

  if (!root?.children) {
    if (typeof content === 'string') {
      return <div className={className} dangerouslySetInnerHTML={{ __html: content }} />
    }
    return null
  }

  return (
    <div className={className}>
      {root.children.map((node: any, i: number) => renderNode(node, i))}
    </div>
  )
}
