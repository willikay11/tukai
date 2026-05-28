import type { SerializedEditorState } from 'lexical';

export const toSerializedEditorState = (content: string = ''): SerializedEditorState => {
  const textContent =
    content && content.includes('<') && content.includes('>')
      ? content.replace(/<[^>]*>/g, '').trim()
      : content || '';

  return {
    root: {
      children: [
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: textContent,
              type: 'text',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  } as unknown as SerializedEditorState;
};

export const serializeEditorStateToHtml = (state: SerializedEditorState): string => {
  if (!state?.root?.children) return '';

  const nodes = state.root.children;
  let html = '';

  const serializeTextNode = (node: any): string => {
    let text = node.text || '';
    if (!text) return '';

    if (node.format & 1) text = `<strong>${text}</strong>`;
    if (node.format & 2) text = `<em>${text}</em>`;
    if (node.format & 8) text = `<u>${text}</u>`;
    if (node.format & 16) text = `<s>${text}</s>`;
    if (node.format & 32) text = `<code>${text}</code>`;

    return text;
  };

  const getNodeStyle = (node: any): string => {
    const styles: string[] = [];

    if (node.format === 'center') styles.push('text-align: center;');
    if (node.format === 'right') styles.push('text-align: right;');
    if (node.format === 'justify') styles.push('text-align: justify;');

    if (node.indent) {
      const marginLeft = (node.indent || 0) * 40;
      styles.push(`margin-left: ${marginLeft}px;`);
    }

    return styles.length > 0 ? ` style="${styles.join(' ')}"` : '';
  };

  const serializeNode = (node: any): string => {
    let nodeHtml = '';

    if (node.type === 'paragraph') {
      let paragraphContent = '';
      if (node.children && Array.isArray(node.children)) {
        node.children.forEach((child: any) => {
          if (child.type === 'text') {
            paragraphContent += serializeTextNode(child);
          }
        });
      }
      if (paragraphContent || !paragraphContent) {
        const style = getNodeStyle(node);
        nodeHtml = `<p${style}>${paragraphContent || '&nbsp;'}</p>`;
      }
    } else if (node.type === 'list') {
      const listTag = node.listType === 'number' ? 'ol' : 'ul';
      let listContent = '';

      if (node.children && Array.isArray(node.children)) {
        node.children.forEach((child: any) => {
          if (child.type === 'listitem') {
            let itemContent = '';
            if (child.children && Array.isArray(child.children)) {
              child.children.forEach((grandchild: any) => {
                if (grandchild.type === 'text') {
                  itemContent += serializeTextNode(grandchild);
                }
              });
            }
            const style = getNodeStyle(child);
            listContent += `<li${style}>${itemContent || '&nbsp;'}</li>`;
          }
        });
      }

      if (listContent) {
        const style = getNodeStyle(node);
        nodeHtml = `<${listTag}${style}>${listContent}</${listTag}>`;
      }
    } else if (node.type === 'listitem') {
      let itemContent = '';
      if (node.children && Array.isArray(node.children)) {
        node.children.forEach((child: any) => {
          if (child.type === 'text') {
            itemContent += serializeTextNode(child);
          }
        });
      }
      const style = getNodeStyle(node);
      nodeHtml = `<li${style}>${itemContent || '&nbsp;'}</li>`;
    } else if (node.type === 'heading') {
      const level = node.tag?.replace('h', '') || '1';
      let headingContent = '';
      if (node.children && Array.isArray(node.children)) {
        node.children.forEach((child: any) => {
          if (child.type === 'text') {
            headingContent += serializeTextNode(child);
          }
        });
      }
      const style = getNodeStyle(node);
      nodeHtml = `<h${level}${style}>${headingContent || '&nbsp;'}</h${level}>`;
    } else if (node.type === 'quote') {
      let quoteContent = '';
      if (node.children && Array.isArray(node.children)) {
        node.children.forEach((child: any) => {
          if (child.type === 'text') {
            quoteContent += serializeTextNode(child);
          }
        });
      }
      const style = getNodeStyle(node);
      nodeHtml = `<blockquote${style}>${quoteContent || '&nbsp;'}</blockquote>`;
    }

    return nodeHtml;
  };

  nodes.forEach((node: any) => {
    html += serializeNode(node);
  });

  return html || '';
};
