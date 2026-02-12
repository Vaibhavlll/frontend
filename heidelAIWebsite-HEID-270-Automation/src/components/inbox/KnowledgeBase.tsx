import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, Book, Plus, Send } from "lucide-react";

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
}

interface KnowledgeBaseProps {
  articles?: Article[];
  onArticleSelect?: (article: Article) => void;
}

const KnowledgeBase = ({
  articles = [
    {
      id: "1",
      title: "Getting Started Guide",
      content: "Step by step guide to get started with our product...",
      category: "Onboarding",
      tags: ["beginner", "setup"],
    },
    {
      id: "2",
      title: "Troubleshooting Common Issues",
      content: "Solutions to common problems users might encounter...",
      category: "Support",
      tags: ["help", "issues"],
    },
  ],
  onArticleSelect = () => {},
}: KnowledgeBaseProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["all", "Onboarding", "Support", "Billing", "Technical"];

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Card className="w-[400px] h-full bg-white">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-4">
          <Book className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-semibold">Knowledge Base</h2>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search articles..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <ScrollArea className="h-10 mt-4">
          <div className="flex gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)] p-4">
        <div className="space-y-4">
          {filteredArticles.map((article) => (
            <Card
              key={article.id}
              className="p-4 cursor-pointer hover:bg-gray-50"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium mb-1">{article.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {article.content}
                  </p>
                  <div className="flex gap-2 mt-2">
                    {article.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onArticleSelect(article)}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <Button className="w-full" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add New Article
        </Button>
      </div>
    </Card>
  );
};

export default KnowledgeBase;
