"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface NewsItem {
  id: number
  title: string
  source: string
  date: string
}

export default function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([
    { id: 1, title: "Tech Stocks Surge Amid Positive Earnings Reports", source: "Financial Times", date: "2023-05-15" },
    { id: 2, title: "Federal Reserve Hints at Potential Rate Hike", source: "Wall Street Journal", date: "2023-05-14" },
    { id: 3, title: "Oil Prices Stabilize Following OPEC+ Meeting", source: "Reuters", date: "2023-05-13" },
  ])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest News</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {news.map((item) => (
            <li key={item.id}>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm text-muted-foreground">
                {item.source} - {item.date}
              </p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

