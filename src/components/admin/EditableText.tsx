import { memo } from 'react';
import { useEditableContent } from '@/hooks/useEditableContent';

interface EditableTextProps {
  pageKey: string;
  sectionKey: string;
  field: 'title' | 'subtitle' | 'description' | 'button_text' | 'badge_text';
  fallback: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Component that renders text from editable_content table
 * Falls back to provided text if no DB content exists
 */
const EditableTextComponent = ({
  pageKey,
  sectionKey,
  field,
  fallback,
  className,
  as: Component = 'span',
}: EditableTextProps) => {
  const { content, isLoading } = useEditableContent(pageKey, sectionKey);

  // Return fallback during loading or if no content
  const text = content?.[field] || fallback;

  return (
    <Component className={className}>
      {text}
    </Component>
  );
};

export const EditableText = memo(EditableTextComponent);
