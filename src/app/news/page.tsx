import Layout from "../../components/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Clock, ArrowUpRight, BarChart2, ExternalLink } from "lucide-react";
import Link from "next/link";

interface NewsItem {
  id: number;
  title: string;
  description: string;
  source: string;
  date: string;
  category: string;
  impact: "High" | "Medium" | "Low";
  url: string;
}

const newsItems: NewsItem[] = [
  {
    id: 1,
    title: "China's tech stocks enter bull market after DeepSeek breakthrough",
    description:
      "Budget AI model triggers global reappraisal of Chinese technology companies. ",
    source: "Financial Times",
    date: "2025-02-12",
    category: "Chinese Equities",
    impact: "High",
    url: "https://www.ft.com/content/af0636d6-59af-453c-9d75-6f6a3d9f11ce",
  },
  {
    id: 2,
    title:
      "America's most famous stock-market measure is more broken than usual",
    description:
      "Dow Jones Industrial Average draws outside attention, presenting a distorted picture of their on-going stocks market.",
    source: "Wall Street Journal",
    date: "2025-02-12",
    category: "Markets&Finance",
    impact: "Medium",
    url: "https://www.wsj.com/finance/stocks/americas-most-famous-stock-market-measure-is-more-broken-than-usual-5d44b4b6?mod=finance_lead_story",
  },
  {
    id: 3,
    title: "AI regulation act passes in EU, impacts tech stocks",
    description:
      "The announcement underscores efforts from the EU to position itself as a key player in the AI race.",
    source: "Wall Street Journal",
    date: "2025-02-11",
    category: "Technology",
    impact: "High",
    url: "https://www.wsj.com/tech/ai/eu-pledges-200-billion-in-ai-spending-in-bid-to-catch-up-with-u-s-china-7bf82ab5?mod=tech_lead_pos2",
  },
  {
    id: 4,
    title: "Oil prices retreat after report of U.S. crude stockpile rise",
    description:
      "Oil prices declined following a report indicating a 4.1 million barrel increase in U.S. crude inventories, raising concerns about supply and demand balance.",
    source: "Reuters",
    date: "2025-02-12",
    category: "Energy",
    impact: "Low",
    url: "https://www.reuters.com/business/energy/oil-prices-retreat-after-report-us-crude-stockpile-rise-2025-02-12/",
  },
  {
    id: 5,
    title: "Space mining company secures first asteroid resource rights",
    description:
      "A private space mining company obtains rights to mine an asteroid, opening new frontiers in resource extraction and impacting traditional mining stocks.",
    source: "Bloomberg",
    date: "2025-02-12",
    category: "Space Economy",
    impact: "Medium",
    url: "https://www.bloomberg.com/news/articles/2025-02-12/space-mining-company-secures-asteroid-resource-rights",
  },
  {
    id: 6,
    title: "Global carbon tax agreement reached at climate summit",
    description:
      "World leaders agreed on a standardized global carbon tax price, significantly impacting industries and accelerating the transition to green technologies.",
    source: "The Economist",
    date: "2025-02-11",
    category: "Environment",
    impact: "Low",
    url: "https://www.economist.com/international/2025/02/11/global-carbon-tax-agreement-reached-at-climate-summit",
  },
];

const getImpactColor = (impact: string) => {
  switch (impact) {
    case "High":
      return "bg-red-500 hover:bg-red-600";
    case "Medium":
      return "bg-yellow-500 hover:bg-yellow-600";
    case "Low":
      return "bg-green-500 hover:bg-green-600";
    default:
      return "bg-blue-500 hover:bg-blue-600";
  }
};

const newsSourceLinks = [
  { name: "Financial Times", url: "https://www.ft.com" },
  { name: "Wall Street Journal", url: "https://www.wsj.com" },
  { name: "Reuters", url: "https://www.reuters.com" },
  { name: "Bloomberg", url: "https://www.bloomberg.com" },
  { name: "CNBC", url: "https://www.cnbc.com" },
  { name: "MarketWatch", url: "https://www.marketwatch.com" },
];

export default function NewsPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 ml-4 text-3xl font-bold text-white">Market News</h1>
        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {newsItems.map((item) => (
            <Card
              key={item.id}
              className="flex flex-col border-blue-500/30 bg-[rgba(10,15,30,0.8)] shadow-lg shadow-blue-500/20 transition duration-300 hover:shadow-blue-400/30"
            >
              <CardHeader className="flex-1">
                <div className="mb-3 flex items-center gap-2 text-sm text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>
                    {item.date} | {item.source}
                  </span>
                </div>
                <h2 className="mb-4 text-xl font-bold text-white">
                  {item.title}
                </h2>
                <p className="mb-4 text-gray-300">{item.description}</p>
              </CardHeader>

              <CardContent className="mt-auto">
                <div className="mb-4 flex items-center justify-between">
                  <Badge variant="secondary" className="bg-[#0d1829]">
                    {item.category}
                  </Badge>

                  <Badge className={getImpactColor(item.impact)}>
                    {item.impact} Impact
                  </Badge>
                </div>
                <Button
                  asChild
                  className="flex w-full items-center justify-center bg-blue-500 hover:bg-blue-600"
                >
                  <Link
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Read More <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-8 rounded-lg border border-blue-500/30 bg-[rgba(10,15,30,0.8)] p-6 shadow-lg shadow-blue-500/20 transition duration-300 hover:shadow-blue-400/30">
          <h2 className="mb-4 text-2xl font-bold text-white">
            More Financial News Sources
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {newsSourceLinks.map((source, index) => (
              <a
                key={index}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-400 transition-colors hover:text-blue-300"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                {source.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
