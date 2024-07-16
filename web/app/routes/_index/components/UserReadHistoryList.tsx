import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import type { UserReadHistoryItem } from "../types";
import { Link } from "@remix-run/react";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";

type UserReadHistoryListProps = {
  userReadHistory: UserReadHistoryItem[];
  targetLanguage: string;
};

export function UserReadHistoryList({ userReadHistory, targetLanguage }: UserReadHistoryListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recently Read</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {userReadHistory.map((item) => {
              const translationInfo = item.pageVersion.pageVersionTranslationInfo[0];
              return (
                <Link
                  key={item.id}
                  to={`/reader/${encodeURIComponent(item.pageVersion.page.url)}`}
                  className="no-underline text-inherit"
                >
                  <Card className="flex flex-col hover:shadow-md transition-shadow duration-200">
                    <CardHeader>
                      <CardTitle className="text-sm truncate">{item.pageVersion.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-xs text-muted-foreground truncate">
                        {item.pageVersion.page.url}
                      </p>
                      <p className="text-xs mt-2">
                        {new Date(item.readAt).toLocaleDateString()}
                      </p>
                      {translationInfo && (
                        <>
                          <Badge className="mt-2" variant={getVariantForStatus(translationInfo.translationStatus)}>
                            {translationInfo.translationStatus}
                          </Badge>
                          <Progress value={translationInfo.translationProgress} className="mt-2" />
                        </>
                      )}
                      {!translationInfo && (
                        <Badge className="mt-2" variant="outline">
                          Not started
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

function getVariantForStatus(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "completed":
      return "default";
    case "processing":
      return "secondary";
    case "failed":
      return "destructive";
    default:
      return "outline";
  }
}