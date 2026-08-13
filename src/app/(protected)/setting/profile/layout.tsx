import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>사용자 정보</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
