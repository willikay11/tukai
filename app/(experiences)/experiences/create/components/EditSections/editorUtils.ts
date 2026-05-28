import type { SerializedEditorState } from 'lexical';

const parseHtmlToChildren = (html: string): any[] => {
  const children: any[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const nodes = Array.from(doc.body.childNodes);

  nodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        children.push({
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text,
              type: 'text',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
        });
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const tagName = element.tagName.toLowerCase();

      if (tagName === 'p' || tagName === 'div') {
        const textNodes: any[] = [];
        parseNodeContent(element, textNodes);
        if (textNodes.length > 0) {
          children.push({
            children: textNodes,
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'paragraph',
            version: 1,
          });
        }
      } else if (tagName === 'ul' || tagName === 'ol') {
        const listItems = Array.from(element.querySelectorAll(':scope > li'));
        const listChildren: any[] = [];

        listItems.forEach((li) => {
          const textNodes: any[] = [];
          parseNodeContent(li as HTMLElement, textNodes);
          if (textNodes.length > 0) {
            listChildren.push({
              children: textNodes,
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'listitem',
              version: 1,
            });
          }
        });

        if (listChildren.length > 0) {
          children.push({
            children: listChildren,
            direction: 'ltr',
            format: '',
            indent: 0,
            listType: tagName === 'ol' ? 'number' : 'bullet',
            tag: tagName,
            type: 'list',
            version: 1,
          });
        }
      }
    }
  });

  return children.length > 0
    ? children
    : [
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: html ? html.replace(/<[^>]*>/g, '') : '',
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
      ];
};

const parseNodeContent = (element: HTMLElement, textNodes: any[]): void => {
  Array.from(element.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        textNodes.push({
          detail: 0,
          format: 0,
          mode: 'normal',
          style: '',
          text,
          type: 'text',
          version: 1,
        });
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const elem = node as HTMLElement;
      const tag = elem.tagName.toLowerCase();

      const text = elem.textContent?.trim() || '';
      if (text) {
        let format = 0;
        if (tag === 'strong' || tag === 'b') format |= 1;
        if (tag === 'em' || tag === 'i') format |= 2;
        if (tag === 'u') format |= 8;
        if (tag === 's' || tag === 'del') format |= 16;
        if (tag === 'code') format |= 32;

        textNodes.push({
          detail: 0,
          format,
          mode: 'normal',
          style: '',
          text,
          type: 'text',
          version: 1,
        });
      }
    }
  });
};

export const toSerializedEditorState = (content: string = ''): SerializedEditorState => {
  if (!content) {
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
                text: '',
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
  }

  const hasHtml = content.includes('<') && content.includes('>');
  const children = hasHtml ? parseHtmlToChildren(content) : [
    {
      children: [
        {
          detail: 0,
          format: 0,
          mode: 'normal',
          style: '',
          text: content,
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
  ];

  return {
    root: {
      children,
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
