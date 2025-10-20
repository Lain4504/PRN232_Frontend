"use client";

import { useProducts } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProductsDebug() {
  const { data: products, isLoading, error, refetch } = useProducts();

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Products Debug</CardTitle>
        <Button onClick={() => refetch()} disabled={isLoading}>
          {isLoading ? "Loading..." : "Refresh"}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <strong>Loading:</strong> {isLoading ? "Yes" : "No"}
          </div>
          
          {error && (
            <div className="text-red-500">
              <strong>Error:</strong> {error.message}
            </div>
          )}
          
          <div>
            <strong>Products Count:</strong> {products?.length || 0}
          </div>
          
          <div>
            <strong>Raw Data:</strong>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
              {JSON.stringify(products, null, 2)}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}