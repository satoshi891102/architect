import Link from "next/link";
import Image from "next/image";

interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  categoryLabel: string;
  date: string;
  readingTime: number;
  featuredImage: string;
  author?: string;
}

export function ArticleCardFeatured({ article }: { article: Article }) {
  return (
    <Link href={`/${article.category}/${article.slug}`} className="group block">
      <article className="overflow-hidden rounded-xl" style={{ background: "var(--style-card-bg)", border: "var(--style-card-border)" }}>
        <div className="md:grid md:grid-cols-2">
          <div className="relative h-64 md:h-full overflow-hidden">
            <Image src={article.featuredImage} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white rounded-full" style={{ backgroundColor: "var(--color-primary)" }}>
                {article.categoryLabel}
              </span>
            </div>
          </div>
          <div className="p-8 md:p-10 flex flex-col justify-center">
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-3 group-hover:opacity-80 transition-opacity" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}>
              {article.title}
            </h2>
            <p className="text-base leading-relaxed mb-4" style={{ color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)" }}>
              {article.excerpt}
            </p>
            <div className="flex items-center gap-3 text-xs" style={{ color: "var(--color-text-muted)" }}>
              {article.author && <span className="font-medium">{article.author}</span>}
              <span>{article.date}</span>
              <span>·</span>
              <span>{article.readingTime} min read</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link href={`/${article.category}/${article.slug}`} className="group block">
      <article className="overflow-hidden rounded-lg hover:shadow-lg transition-all duration-300" style={{ background: "var(--style-card-bg)", border: "var(--style-card-border)" }}>
        <div className="relative h-52 overflow-hidden">
          <Image src={article.featuredImage} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white rounded-full" style={{ backgroundColor: "var(--color-primary)" }}>
              {article.categoryLabel}
            </span>
          </div>
        </div>
        <div style={{ padding: "var(--style-card-padding)" }}>
          <h3 className="text-lg font-bold leading-snug mb-2 group-hover:opacity-70 transition-opacity" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}>
            {article.title}
          </h3>
          <p className="text-sm leading-relaxed mb-3 line-clamp-2" style={{ color: "var(--color-text-secondary)" }}>
            {article.excerpt}
          </p>
          <div className="flex items-center gap-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
            <span>{article.date}</span>
            <span>·</span>
            <span>{article.readingTime} min read</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function ProductRecommendation({ name, price, verdict, pros, cons, buyUrl }: { name: string; price: string; verdict: string; pros: string[]; cons: string[]; buyUrl?: string }) {
  return (
    <div className="rounded-xl p-6 my-8" style={{ backgroundColor: "var(--color-primary-50)", border: "2px solid var(--color-primary-200)" }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-primary-700)" }}>Our Pick</span>
          <h3 className="text-xl font-bold mt-1" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}>{name}</h3>
        </div>
        <span className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>{price}</span>
      </div>
      <p className="text-sm mb-4" style={{ color: "var(--color-text-secondary)", fontStyle: "italic" }}>{verdict}</p>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-semibold" style={{ color: "var(--color-success)" }}>Pros</span>
          <ul className="mt-1 space-y-1">{pros.map((p, i) => <li key={i} style={{ color: "var(--color-text-secondary)" }}>+ {p}</li>)}</ul>
        </div>
        <div>
          <span className="font-semibold" style={{ color: "var(--color-error)" }}>Cons</span>
          <ul className="mt-1 space-y-1">{cons.map((c, i) => <li key={i} style={{ color: "var(--color-text-secondary)" }}>− {c}</li>)}</ul>
        </div>
      </div>
      {buyUrl && <a href={buyUrl} className="inline-block mt-4 px-5 py-2.5 text-sm font-semibold text-white rounded-lg" style={{ backgroundColor: "var(--color-primary)" }}>Buy Now →</a>}
    </div>
  );
}

export function Newsletter({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "rounded-xl p-6" : "rounded-2xl p-8 md:p-12 text-center"} style={{ backgroundColor: "var(--color-primary-50)", border: "1px solid var(--color-primary-100)" }}>
      <h3 className={`font-bold ${compact ? "text-lg mb-2" : "text-2xl md:text-3xl mb-3"}`} style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}>
        {compact ? "Stay in the loop" : "Get the best picks, weekly"}
      </h3>
      <p className="text-sm mb-4" style={{ color: "var(--color-text-secondary)" }}>
        No spam. Just the top product finds, deals, and reviews delivered every Sunday.
      </p>
      <div className={compact ? "" : "max-w-md mx-auto"}>
        <div className="flex gap-2">
          <input type="email" placeholder="your@email.com" className="flex-1 px-4 py-2.5 text-sm rounded-lg border outline-none" style={{ borderColor: "var(--color-border)", background: "var(--style-card-bg)" }} />
          <button className="px-5 py-2.5 text-sm font-semibold text-white rounded-lg whitespace-nowrap" style={{ backgroundColor: "var(--color-primary)" }}>Subscribe</button>
        </div>
      </div>
    </div>
  );
}
