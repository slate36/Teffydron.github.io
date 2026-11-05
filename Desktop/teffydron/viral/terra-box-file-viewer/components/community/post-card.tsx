import { ExternalLink, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { LikeButton } from '@/components/community/like-button'
import { RichText } from '@/components/community/rich-text'
import { hostOf, kindLabel, timeAgo } from '@/lib/community'
import type { FeedPost } from '@/lib/queries'

export function PostCard({ post, signedIn, full = false }: { post: FeedPost; signedIn: boolean; full?: boolean }) {
  const initials = (post.authorName ?? '?').slice(0, 2).toUpperCase()

  return (
    <article className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/30">
      <header className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground" aria-hidden="true">
          {initials}
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <Link href={`/u/${post.authorHandle}`} className="truncate text-sm font-semibold hover:underline">
            {post.authorName}
          </Link>
          <span className="text-xs text-muted-foreground">
            @{post.authorHandle} · <time dateTime={post.createdAt.toISOString()}>{timeAgo(post.createdAt)}</time>
          </span>
        </div>
        <Link
          href={`/comunidad?kind=${post.kind}`}
          className="rounded-full bg-accent/25 px-2.5 py-0.5 text-xs font-semibold text-accent-foreground hover:bg-accent/40"
        >
          {kindLabel(post.kind)}
        </Link>
      </header>

      <h2 className="font-serif text-xl font-bold leading-snug text-balance">
        {full ? post.title : <Link href={`/comunidad/${post.id}`} className="hover:text-primary">{post.title}</Link>}
      </h2>

      {post.url && (
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="flex items-center gap-2 self-start rounded-md border border-border bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground hover:border-primary"
        >
          <ExternalLink className="size-4" aria-hidden="true" />
          {hostOf(post.url)}
        </a>
      )}

      {post.body && (
        <RichText
          text={post.body}
          className={full ? 'whitespace-pre-line text-pretty leading-relaxed' : 'line-clamp-4 whitespace-pre-line text-pretty text-sm leading-relaxed text-foreground/85'}
        />
      )}

      {post.tags.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Hashtags">
          {post.tags.map((tag) => (
            <li key={tag}>
              <Link href={`/comunidad?tag=${encodeURIComponent(tag)}`} className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary hover:bg-primary/20">
                #{tag}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <footer className="flex items-center gap-2 border-t border-border pt-3">
        <LikeButton postId={post.id} liked={post.likedByMe} count={post.likeCount} signedIn={signedIn} />
        <Link
          href={`/comunidad/${post.id}#comentarios`}
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <MessageSquare className="size-4" aria-hidden="true" />
          {post.commentCount}
          <span className="sr-only">comentarios</span>
        </Link>
      </footer>
    </article>
  )
}
