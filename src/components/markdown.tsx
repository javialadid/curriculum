import type { ComponentProps, ReactNode } from 'react'

/** True when ReactMarkdown children contain any non-whitespace text. */
export function hasVisibleText(children: ReactNode): boolean {
  if (children == null || children === false || children === true) return false
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children).trim().length > 0
  }
  if (Array.isArray(children)) return children.some(hasVisibleText)
  if (typeof children === 'object' && children !== null && 'props' in children) {
    const props = (children as { props?: { children?: ReactNode } }).props
    return hasVisibleText(props?.children)
  }
  return false
}

/**
 * Skip markdown links with empty label text (`[](url)`), which otherwise
 * render as invisible/empty anchors in both screen and print.
 */
export function MarkdownLink({
  href,
  children,
  className,
  ...props
}: ComponentProps<'a'>) {
  if (!hasVisibleText(children)) return null

  return (
    <a
      {...props}
      href={href}
      className={className}
      target={props.target ?? '_blank'}
      rel={props.rel ?? 'noopener noreferrer'}
    >
      {children}
    </a>
  )
}
