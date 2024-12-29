'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { fetchData, fetchCities, CityData } from '@/lib/api'
import { CityCard } from '@/components/CityCard'
import { UploadForm } from '@/components/UploadForm'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, RefreshCw, LogOut } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"

export default function Home() {
  const [cityData, setCityData] = useState<CityData>({});
  const [cities, setCities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      loadData();
    }
  }, [router]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchData();
      setCityData(data);
      const cityList = await fetchCities();
      setCities(cityList.map(c => c.city));
    } catch (err) {
      setError('Failed to fetch data. Please try again later.');
      toast({
        title: 'Error',
        description: 'Failed to fetch data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearTable = (city: string) => {
    setCityData(prevData => {
      const newData = { ...prevData };
      newData[city] = [];
      return newData;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    router.push('/login');
  };

  return (
    <main className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Margin Dashboard</h1>
        <div className="flex justify-end items-center space-x-2">
          <Button onClick={loadData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
      <Tabs defaultValue="view" className="mb-6">
        <TabsList>
          <TabsTrigger value="view">View Data</TabsTrigger>
          <TabsTrigger value="upload">Upload Data</TabsTrigger>
        </TabsList>
        <TabsContent value="view">
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : Object.keys(cityData).length === 0 ? (
            <div className="text-center py-8">
              <p>No data available. The table is empty.</p>
              <Button onClick={loadData} className="mt-4">
                Refresh Data
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(cityData).map(([city, people]) => (
                <CityCard key={city} city={city} people={people} onClearTable={handleClearTable} />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="upload">
          <UploadForm cities={cities} onUploadSuccess={loadData} />
        </TabsContent>
      </Tabs>
    </main>
  )
}

