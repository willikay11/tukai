'use client';

import { SerializedEditorState } from 'lexical';
import { Editor } from '@/components/blocks/editor-00/editor';

interface DescriptionFieldsProps {
  description: string;
  whatsIncluded: string;
  whatsNotIncluded: string;
  onDescriptionChange: (value: string) => void;
  onWhatsIncludedChange: (value: string) => void;
  onWhatsNotIncludedChange: (value: string) => void;
  descriptionError?: string;
}

const toSerializedEditorState = (content: string): SerializedEditorState => {
  // If content is HTML, extract text; otherwise use as-is
  const textContent = content.includes('<') && content.includes('>')
    ? content.replace(/<[^>]*>/g, '').trim()
    : content;

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

const serializeEditorStateToHtml = (state: SerializedEditorState): string => {
  if (!state?.root?.children) return '';

  const nodes = state.root.children;
  let html = '';

  const serializeTextNode = (node: any): string => {
    let text = node.text || '';
    if (!text) return '';

    // Apply text formatting: bold, italic, underline, strikethrough, code
    if (node.format & 1) text = `<strong>${text}</strong>`; // Bold
    if (node.format & 2) text = `<em>${text}</em>`; // Italic
    if (node.format & 8) text = `<u>${text}</u>`; // Underline
    if (node.format & 16) text = `<s>${text}</s>`; // Strikethrough
    if (node.format & 32) text = `<code>${text}</code>`; // Code

    return text;
  };

  const getNodeStyle = (node: any): string => {
    const styles: string[] = [];

    // Handle alignment
    if (node.format === 'center') styles.push('text-align: center;');
    if (node.format === 'right') styles.push('text-align: right;');
    if (node.format === 'justify') styles.push('text-align: justify;');

    // Handle indentation
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
      // Handle list items that might be directly in the tree
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

export const DescriptionFields = ({
  description,
  whatsIncluded,
  whatsNotIncluded,
  onDescriptionChange,
  onWhatsIncludedChange,
  onWhatsNotIncludedChange,
  descriptionError,
}: DescriptionFieldsProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-800">
          Add your experience description
        </label>
        <Editor
          editorSerializedState={toSerializedEditorState(description)}
          onSerializedChange={(state) => {
            const html = serializeEditorStateToHtml(state);
            if (html) {
              onDescriptionChange(html);
            }
          }}
        />
        {descriptionError && <p className="text-xs text-red-500">{descriptionError}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-800">
          What's included
        </label>
        <Editor
          editorSerializedState={toSerializedEditorState(whatsIncluded)}
          onSerializedChange={(state) => {
            const html = serializeEditorStateToHtml(state);
            if (html) {
              onWhatsIncludedChange(html);
            }
          }}
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-800">
          What's NOT included
        </label>
        <Editor
          editorSerializedState={toSerializedEditorState(whatsNotIncluded)}
          onSerializedChange={(state) => {
            const html = serializeEditorStateToHtml(state);
            if (html) {
              onWhatsNotIncludedChange(html);
            }
          }}
        />
      </div>
    </div>
  );
};
