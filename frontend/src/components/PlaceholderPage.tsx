import { Zap, MessageCircle } from "lucide-react";
import Layout from "./Layout";

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export default function PlaceholderPage({
  title,
  description,
}: PlaceholderPageProps) {
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
          <p className="text-muted-foreground mb-8">
            {description ||
              "This page is coming soon! Continue prompting in the chat to fill in this page contents if you want it."}
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <MessageCircle className="w-4 h-4" />
            <span>Ask the assistant to implement this feature</span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
