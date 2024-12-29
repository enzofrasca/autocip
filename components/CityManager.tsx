'use client'

import { useState, useEffect } from 'react'
import { City, fetchCities, addCity, deleteCity } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface CityManagerProps {
  onCityChange: () => void;
}

export function CityManager({ onCityChange }: CityManagerProps) {
  const [cities, setCities] = useState<City[]>([])
  const [newCity, setNewCity] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [cityToDelete, setCityToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  const loadCities = async () => {
    setIsLoading(true)
    try {
      const fetchedCities = await fetchCities()
      setCities(fetchedCities)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch cities',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCities()
  }, [])

  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCity.trim()) {
      toast({
        title: 'Error',
        description: 'City name cannot be empty',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      await addCity(newCity)
      toast({
        title: 'Success',
        description: `${newCity} has been added`,
      })
      setNewCity('')
      await loadCities()
      onCityChange()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add city',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCity = async (cityName: string) => {
    setIsLoading(true)
    try {
      await deleteCity(cityName)
      toast({
        title: 'Success',
        description: `${cityName} has been deleted`,
      })
      await loadCities()
      onCityChange()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete city',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
      setCityToDelete(null)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAddCity} className="flex gap-2">
        <Input
          type="text"
          value={newCity}
          onChange={(e) => setNewCity(e.target.value)}
          placeholder="Enter city name"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading}>
          Add City
        </Button>
      </form>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <ul className="space-y-2">
          {cities.map((city) => (
            <li key={city.city} className="flex justify-between items-center">
              <span>{city.city}</span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setCityToDelete(city.city)}
                disabled={isLoading}
              >
                Delete
              </Button>
            </li>
          ))}
        </ul>
      )}

      <AlertDialog open={!!cityToDelete} onOpenChange={() => setCityToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the city {cityToDelete}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => cityToDelete && handleDeleteCity(cityToDelete)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

