'use client'

import { useState } from 'react'
import { parseExcel, uploadData } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'

interface UploadFormProps {
  cities: string[];
  onUploadSuccess: () => void;
}

export function UploadForm({ cities, onUploadSuccess }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !selectedCity) {
      toast({
        title: 'Error',
        description: 'Please select a file and a city',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      const parsedData = await parseExcel(file)
      const dataToUpload = parsedData.map(item => ({ ...item, city: selectedCity }))
      await uploadData(dataToUpload)
      toast({
        title: 'Success',
        description: 'Data uploaded successfully',
      })
      onUploadSuccess()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred while uploading the data',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input type="file" accept=".xlsx" onChange={handleFileChange} />
      </div>
      <div>
        <Select onValueChange={setSelectedCity}>
          <SelectTrigger>
            <SelectValue placeholder="Select a city" />
          </SelectTrigger>
          <SelectContent>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Uploading...' : 'Upload Data'}
      </Button>
    </form>
  )
}

