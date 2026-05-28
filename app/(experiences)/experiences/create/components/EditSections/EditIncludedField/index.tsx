'use client';

import { useCallback, useState } from 'react';
import type { SerializedEditorState } from 'lexical';

import { Button } from '@/components/ui/button';
import { useUpdateExperience } from '@/app/shared/hooks/useExperiences';
import { useToast } from '@/app/shared/hooks/useToast';
import { Editor } from '@/components/blocks/editor-00/editor';

interface EditIncludedFieldProps {
  experienceId: string;
  currentIncluded?: string;
  onSave: () => void;
  onCancel: () => void;
}

const toSerializedEditorState = (content: string): SerializedEditorState => {
  const textContent =
    content.includes('<') && content.includes('>')
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

export const EditIncludedField = ({
  experienceId,
  currentIncluded = '',
  onSave,
  onCancel,
}: EditIncludedFieldProps) => {
  const [included, setIncluded] = useState(currentIncluded);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: updateExperienceAsync } = useUpdateExperience(experienceId);
  const { toast } = useToast();

  const handleSave = useCallback(async () => {
    if (!included.trim()) {
      setError('At least one item is required');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      await updateExperienceAsync({
        whatsIncluded: included,
      } as any);

      toast({
        title: 'Success',
        description: 'Included items updated successfully',
        variant: 'success',
      });
      onSave();
    } catch (err: any) {
      const message = err?.message || 'Failed to update included items';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [included, experienceId, updateExperienceAsync, onSave, toast]);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-800">What's included</label>
        <Editor
          className="text-xs"
          placeholderClassName="pointer-events-none absolute left-0 top-0 select-none overflow-hidden text-ellipsis px-3 py-[18px] text-xs text-gray-400"
          editorSerializedState={toSerializedEditorState(included)}
          onSerializedChange={(state) => {
            const html = serializeEditorStateToHtml(state);
            setIncluded(html || '');
            setError(null);
          }}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
          className="rounded-[50px]"
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="gradient"
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-[50px]"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};
