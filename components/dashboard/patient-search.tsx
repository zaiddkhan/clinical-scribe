"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { MOCK_PATIENTS } from "@/lib/constants";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

export function PatientSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof MOCK_PATIENTS>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      const results = MOCK_PATIENTS.filter(patient => 
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
      setIsSearching(false);
    }, 500);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Patient Search</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2">
          <Input
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button type="submit" size="icon" onClick={handleSearch}>
            {isSearching ? <Icons.spinner className="h-4 w-4 animate-spin" /> : <Icons.search className="h-4 w-4" />}
          </Button>
        </div>
        
        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2">
            {searchResults.slice(0, 3).map((patient) => (
              <Link 
                href={`/patients/${patient.id}`}
                key={patient.id} 
                className="flex items-center p-2 hover:bg-accent rounded-md transition-colors"
              >
                <Avatar className="h-8 w-8 mr-3">
                  <AvatarFallback>{patient.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{patient.name}</p>
                  <p className="text-xs text-muted-foreground">{patient.id}</p>
                </div>
              </Link>
            ))}
            
            {searchResults.length > 3 && (
              <Button variant="ghost" className="w-full text-xs" asChild>
                <Link href={`/patients?search=${searchQuery}`}>
                  View all {searchResults.length} results
                </Link>
              </Button>
            )}
          </div>
        )}
        
        {searchQuery && searchResults.length === 0 && !isSearching && (
          <p className="mt-4 text-sm text-muted-foreground text-center">
            No patients found matching "{searchQuery}"
          </p>
        )}
      </CardContent>
    </Card>
  );
}