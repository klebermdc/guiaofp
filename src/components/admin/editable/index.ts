// Editable Content System Components
// Use these components to make any page content editable by admins

export { EditableWrapper, useEditableText } from '../EditableWrapper';
export { EditButton } from '../EditButton';
export { EditableText } from '../EditableText';
export { InlineContentEditor } from '../InlineContentEditor';

/**
 * EDITABLE CONTENT SYSTEM
 * 
 * This system allows admins/guides to edit text and styles on any page.
 * 
 * USAGE PATTERNS:
 * 
 * 1. EditableWrapper - Wraps a section, adds hover edit button
 *    <EditableWrapper pageKey="landing" sectionKey="hero">
 *      <h1>{title}</h1>
 *      <p>{description}</p>
 *    </EditableWrapper>
 * 
 * 2. EditButton - Floating edit button, position yourself
 *    <div className="relative">
 *      <EditButton pageKey="landing" sectionKey="hero" className="absolute top-2 right-2" />
 *      <h1>Content here</h1>
 *    </div>
 * 
 * 3. EditableText - Inline text replacement
 *    <EditableText 
 *      pageKey="landing" 
 *      sectionKey="hero" 
 *      field="title" 
 *      fallback="Default Title" 
 *      as="h1" 
 *    />
 * 
 * 4. InlineContentEditor - Full overlay editor on hover
 *    <InlineContentEditor pageKey="landing" sectionKey="hero">
 *      <YourComponent />
 *    </InlineContentEditor>
 * 
 * DATABASE FIELDS:
 * - title, subtitle, description, button_text, badge_text, image_url
 * - text_color, bg_color, border_color, accent_color (HSL format: "262 60% 55%")
 * - font_size, font_weight (Tailwind classes)
 * - custom_classes (additional Tailwind classes)
 */
