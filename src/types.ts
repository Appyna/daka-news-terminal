export type Article = {
  id: string
  title: string
  summary?: string
  content?: string
  source: string
  country: string
  url?: string
  publishedAt?: string
  translated?: boolean
}

export type Feed = {
  id: string
  name: string
  country: string
  source: string
  articles: Article[]
}
