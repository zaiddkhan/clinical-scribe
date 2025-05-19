'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  DropdownMenu, 
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Search,
  Filter,
  X,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  MoreHorizontal,
  Mail,
  Phone,
  Globe,
  MapPin,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import ToggleEmailButton from "./toogle-email-button"
import { bulkUpdateDoctorEmailStatus } from "@/app/actions/doctor"

// Type definitions
interface Doctor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  address: string;
  website: string;
  email_sent: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  totalDoctors: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ApiResponse {
  success: boolean;
  data: Doctor[];
  pagination: PaginationInfo;
  message?: string;
}

// Utility functions for caching
const CACHE_KEY = 'doctors_data_cache';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

interface CachedData {
  data: ApiResponse;
  timestamp: number;
  queryParams: Record<string, string>;
}

const saveToCacheStorage = (data: ApiResponse, queryParams: Record<string, string>) => {
  const cacheData: CachedData = {
    data,
    timestamp: Date.now(),
    queryParams
  };
  localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
};

const getFromCacheStorage = (queryParams: Record<string, string>): ApiResponse | null => {
  try {
    const cacheData = localStorage.getItem(CACHE_KEY);
    if (!cacheData) return null;
    
    const parsedCache: CachedData = JSON.parse(cacheData);
    
    // Check if cache is expired
    if (Date.now() - parsedCache.timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    // Check if query params match
    const currentParamsKeys = Object.keys(queryParams).sort();
    const cachedParamsKeys = Object.keys(parsedCache.queryParams).sort();
    
    if (currentParamsKeys.length !== cachedParamsKeys.length) return null;
    
    for (const key of currentParamsKeys) {
      if (queryParams[key] !== parsedCache.queryParams[key]) return null;
    }
    
    return parsedCache.data;
  } catch (error) {
    console.error('Error retrieving cache:', error);
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
};

const buildQueryString = (params: Record<string, string | number | boolean | null | undefined>) => {
  const query = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });
  
  return query.toString();
};

function Page() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  
  // Verify token from query parameter using API route
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = searchParams.get('token')
        
        if (!token) {
          setIsAuthorized(false)
          return
        }
        
        // Call the API route to verify the token
        const response = await fetch(`/api/verify-token?token=${encodeURIComponent(token)}`)
        const data = await response.json()
        
        setIsAuthorized(data.authorized)
      } catch (error) {
        console.error('Token verification failed:', error)
        setIsAuthorized(false)
      }
    }
    
    verifyToken()
  }, [searchParams]);
  const { toast } = useToast();
  
  // State
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    totalDoctors: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 20,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Filter states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [specialization, setSpecialization] = useState('all');
  const [emailSent, setEmailSent] = useState<string>('all');
  const [hasPhone, setHasPhone] = useState<string>('all');
  const [hasWebsite, setHasWebsite] = useState<string>('all');
  const [hasAddress, setHasAddress] = useState<string>('all');
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [searchInputValue, setSearchInputValue] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Extract query params on mount and when URL changes
  useEffect(() => {
    setPage(Number(searchParams.get('page')) || 1);
    setLimit(Number(searchParams.get('limit')) || 20);
    setSearch(searchParams.get('search') || '');
    setSearchInputValue(searchParams.get('search') || '');
    setSortBy(searchParams.get('sortBy') || 'createdAt');
    setSortOrder(searchParams.get('sortOrder') || 'desc');
    setSpecialization(searchParams.get('specialization') || 'all');
    setEmailSent(searchParams.get('emailSent') || 'all');
    setHasPhone(searchParams.get('hasPhone') || 'all');
    setHasWebsite(searchParams.get('hasWebsite') || 'all');
    setHasAddress(searchParams.get('hasAddress') || 'all');
  }, [searchParams]);

  // Set URL with current filter state
  const updateUrl = () => {
    const params: Record<string, string | number | boolean | undefined> = {
      page,
      limit,
      ...(search && { search }),
      ...(sortBy !== 'createdAt' && { sortBy }),
      ...(sortOrder !== 'desc' && { sortOrder }),
      ...(specialization && specialization !== 'all' && { specialization }),
      ...(emailSent !== 'all' && { emailSent }),
      ...(hasPhone !== 'all' && { hasPhone }),
      ...(hasWebsite !== 'all' && { hasWebsite }),
      ...(hasAddress !== 'all' && { hasAddress }),
    };

    const queryString = buildQueryString(params);
    router.push(`/doctors${queryString ? `?${queryString}` : ''}`);
  };

  // Fetch data from API
  const fetchDoctors = async (forceFresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams: Record<string, string> = {
        page: String(page),
        limit: String(limit),
        ...(search && { search }),
        ...(sortBy && { sortBy }),
        ...(sortOrder && { sortOrder }),
        ...(specialization !== 'all' && { specialization }),
        ...(emailSent !== 'all' && { emailSent }),
        ...(hasPhone !== 'all' && { hasPhone }),
        ...(hasWebsite !== 'all' && { hasWebsite }),
        ...(hasAddress !== 'all' && { hasAddress }),
      };
      
      const queryString = buildQueryString(queryParams);
      
      // Check if data is in cache
      if (!forceFresh) {
        const cachedData = getFromCacheStorage(queryParams);
        if (cachedData) {
          setDoctors(cachedData.data);
          setPagination(cachedData.pagination);
          setLoading(false);
          return;
        }
      }
      
      // If no cache or force refresh, fetch from API
      const response = await fetch(`/api/doctors?${queryString}`);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      if (data.success) {
        setDoctors(data.data);
        setPagination(data.pagination);
        saveToCacheStorage(data, queryParams);
        
        // Extract unique specializations for filter dropdown
        const uniqueSpecializations = Array.from(
          new Set(data.data.map(doctor => doctor.specialization))
        ).filter(spec => spec !== 'General');
        
        setSpecializations(uniqueSpecializations);
      } else {
        throw new Error(data.message || 'Failed to fetch data');
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to fetch doctors',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when filter states change
  useEffect(() => {
    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search, sortBy, sortOrder, specialization, emailSent, hasPhone, hasWebsite, hasAddress]);

  // Apply filters
  const applyFilters = () => {
    setPage(1); // Reset to first page when filters change
    updateUrl();
    setIsFilterOpen(false);
  };

  // Reset filters
  const resetFilters = () => {
    setPage(1);
    setSearch('');
    setSearchInputValue('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setSpecialization('all');
    setEmailSent('all');
    setHasPhone('all');
    setHasWebsite('all');
    setHasAddress('all');
    // Update URL after state changes
    setTimeout(() => updateUrl(), 0);
    setIsFilterOpen(false);
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInputValue);
    setPage(1);
    updateUrl();
  };

  // Handle sort
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    updateUrl();
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrl();
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDoctors(doctors.map(doc => doc._id));
    } else {
      setSelectedDoctors([]);
    }
  };

  // Handle select item
  const handleSelectItem = (doctorId: string, checked: boolean) => {
    if (checked) {
      setSelectedDoctors([...selectedDoctors, doctorId]);
    } else {
      setSelectedDoctors(selectedDoctors.filter(id => id !== doctorId));
    }
  };

  // Handle bulk email status update
  const handleBulkEmailStatusUpdate = async (status: boolean, doctorIds?: string[]) => {
    const idsToUpdate = doctorIds || selectedDoctors;
    
    if (idsToUpdate.length === 0) {
      toast({
        title: "No doctors selected",
        description: "Please select at least one doctor to update",
        variant: "destructive",
      });
      return;
    }

    // Optimistic UI update - update the local state immediately
    setDoctors(prevDoctors => {
      return prevDoctors.map(doc => {
        if (idsToUpdate.includes(doc._id)) {
          return { ...doc, email_sent: status };
        }
        return doc;
      });
    });

    try {
      // Use the server action instead of fetch API
      const result = await bulkUpdateDoctorEmailStatus(idsToUpdate, status);

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        
        // Clear selection after successful update
        setSelectedDoctors([]);
        
        // Refresh data in the background to ensure consistency
        fetchDoctors(true);
      } else {
        // Revert optimistic update if the server action fails
        fetchDoctors(true);
        throw new Error(result.message || 'Failed to update records');
      }
    } catch (err) {
      console.error('Error updating contact status:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to update contact status',
        variant: "destructive",
      });
      
      // Revert optimistic update on error
      fetchDoctors(true);
    }
  };

  // Render pagination controls
  const renderPagination = () => {
    const { totalPages, currentPage } = pagination;
    
    if (totalPages <= 1) return null;
    
    // Calculate which page numbers to show
    let pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // If we have less pages than max, show all
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      // Always include first and last page
      pages.push(1);
      
      // Calculate middle pages
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if we're near the start or end
      if (currentPage <= 3) {
        endPage = Math.min(totalPages - 1, 4);
      } else if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - 3);
      }
      
      // Add ellipsis if needed
      if (startPage > 2) {
        pages.push(-1); // -1 represents ellipsis
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        pages.push(-2); // -2 represents ellipsis
      }
      
      // Add last page if not already added
      if (pages[pages.length - 1] !== totalPages) {
        pages.push(totalPages);
      }
    }
    
    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
              className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          
          {pages.map((page, idx) => (
            page < 0 ? (
              <PaginationItem key={`ellipsis-${idx}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={page}>
                <PaginationLink
                  isActive={page === currentPage}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            )
          ))}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
              className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  // Render active filters badges
  const renderActiveFilters = () => {
    const activeFilters = [];
    
    if (search) {
      activeFilters.push(
        <Badge key="search" variant="outline" className="flex items-center gap-1 mr-2 mb-2">
          Search: {search}
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={() => {
              setSearch('');
              setSearchInputValue('');
              updateUrl();
            }} 
          />
        </Badge>
      );
    }
    
    if (specialization && specialization !== 'all') {
      activeFilters.push(
        <Badge key="specialization" variant="outline" className="flex items-center gap-1 mr-2 mb-2">
          Specialization: {specialization}
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={() => {
              setSpecialization('');
              updateUrl();
            }} 
          />
        </Badge>
      );
    }
    
    if (emailSent !== 'all') {
      activeFilters.push(
        <Badge key="emailSent" variant="outline" className="flex items-center gap-1 mr-2 mb-2">
          Contacted: {emailSent === 'true' ? 'Yes' : 'No'}
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={() => {
              setEmailSent('all');
              updateUrl();
            }} 
          />
        </Badge>
      );
    }
    
    if (hasPhone !== 'all') {
      activeFilters.push(
        <Badge key="hasPhone" variant="outline" className="flex items-center gap-1 mr-2 mb-2">
          Has phone: {hasPhone === 'true' ? 'Yes' : 'No'}
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={() => {
              setHasPhone('all');
              updateUrl();
            }} 
          />
        </Badge>
      );
    }
    
    if (hasWebsite !== 'all') {
      activeFilters.push(
        <Badge key="hasWebsite" variant="outline" className="flex items-center gap-1 mr-2 mb-2">
          Has website: {hasWebsite === 'true' ? 'Yes' : 'No'}
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={() => {
              setHasWebsite('all');
              updateUrl();
            }} 
          />
        </Badge>
      );
    }
    
    if (hasAddress !== 'all') {
      activeFilters.push(
        <Badge key="hasAddress" variant="outline" className="flex items-center gap-1 mr-2 mb-2">
          Has address: {hasAddress === 'true' ? 'Yes' : 'No'}
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={() => {
              setHasAddress('all');
              updateUrl();
            }} 
          />
        </Badge>
      );
    }
    
    if (sortBy !== 'createdAt' || sortOrder !== 'desc') {
      activeFilters.push(
        <Badge key="sort" variant="outline" className="flex items-center gap-1 mr-2 mb-2">
          Sort: {sortBy} ({sortOrder === 'asc' ? 'ascending' : 'descending'})
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={() => {
              setSortBy('createdAt');
              setSortOrder('desc');
              updateUrl();
            }} 
          />
        </Badge>
      );
    }
    
    return activeFilters.length > 0 ? (
      <div className="flex flex-wrap mt-4 mb-2">
        {activeFilters}
        {activeFilters.length > 1 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={resetFilters}
            className="mb-2"
          >
            Clear all
          </Button>
        )}
      </div>
    ) : null;
  };

  // Show loading state while verifying token
  if (isAuthorized === null) {
    return (
      <div className="container py-6 space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-12">
              <div className="space-y-4 text-center">
                <Skeleton className="h-8 w-64 mx-auto" />
                <Skeleton className="h-4 w-48 mx-auto" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // Show unauthorized message if token is invalid
  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
          <div className="flex flex-col items-center text-center">
            <XCircle className="h-20 w-20 text-destructive mb-4" />
            <h2 className="text-2xl font-bold tracking-tight">Access Denied</h2>
            <p className="mt-2 text-gray-600">You don't have permission to view this page.</p>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Doctor Management</CardTitle>
              <CardDescription>
                Manage and filter your doctor database
              </CardDescription>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => fetchDoctors(true)}
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </Button>
              
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Filter className="h-4 w-4" />
                    <span>Filters</span>
                  </Button>
                </SheetTrigger>
                <SheetContent className="overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filter Doctors</SheetTitle>
                    <SheetDescription>
                      Apply filters to find doctors matching specific criteria
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="mt-6 space-y-6">
                    <Accordion 
                      type="single" 
                      collapsible 
                      defaultValue="specialization"
                      className="w-full"
                    >
                      <AccordionItem value="specialization">
                        <AccordionTrigger>Specialization</AccordionTrigger>
                        <AccordionContent>
                          <Select 
                            value={specialization} 
                            onValueChange={setSpecialization}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Any specialization" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Any specialization</SelectItem>
                              <SelectItem value="General">General</SelectItem>
                              {specializations.map(spec => (
                                <SelectItem key={spec} value={spec}>
                                  {spec}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="emailStatus">
                        <AccordionTrigger>Contacted Status</AccordionTrigger>
                        <AccordionContent>
                          <Select 
                            value={emailSent} 
                            onValueChange={setEmailSent}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Any status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Any status</SelectItem>
                              <SelectItem value="true">Contacted: Yes</SelectItem>
                              <SelectItem value="false">Contacted: No</SelectItem>
                            </SelectContent>
                          </Select>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="contactInfo">
                        <AccordionTrigger>Contact Information</AccordionTrigger>
                        <AccordionContent className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="hasPhone">Phone Number</Label>
                            <Select 
                              value={hasPhone} 
                              onValueChange={setHasPhone}
                            >
                              <SelectTrigger id="hasPhone">
                                <SelectValue placeholder="Any status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Any status</SelectItem>
                                <SelectItem value="true">Has phone number</SelectItem>
                                <SelectItem value="false">No phone number</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="hasWebsite">Website</Label>
                            <Select 
                              value={hasWebsite} 
                              onValueChange={setHasWebsite}
                            >
                              <SelectTrigger id="hasWebsite">
                                <SelectValue placeholder="Any status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Any status</SelectItem>
                                <SelectItem value="true">Has website</SelectItem>
                                <SelectItem value="false">No website</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="hasAddress">Address</Label>
                            <Select 
                              value={hasAddress} 
                              onValueChange={setHasAddress}
                            >
                              <SelectTrigger id="hasAddress">
                                <SelectValue placeholder="Any status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Any status</SelectItem>
                                <SelectItem value="true">Has address</SelectItem>
                                <SelectItem value="false">No address</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                  
                  <SheetFooter className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
                    <div className="flex justify-between w-full">
                      <SheetClose asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={resetFilters}
                        >
                          Reset
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button 
                          size="sm"
                          onClick={applyFilters}
                        >
                          Apply Filters
                        </Button>
                      </SheetClose>
                    </div>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
              
              {selectedDoctors.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="default" 
                      size="sm"
                    >
                      Actions ({selectedDoctors.length})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => handleBulkEmailStatusUpdate(true)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as contacted
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleBulkEmailStatusUpdate(false)}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Mark as not contacted
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <form onSubmit={handleSearch} className="flex-1 flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name, email, specialization..."
                  className="pl-8"
                  value={searchInputValue}
                  onChange={(e) => setSearchInputValue(e.target.value)}
                />
              </div>
              <Button type="submit" size="sm">
                Search
              </Button>
            </form>
            
            <Select
              value={String(limit)}
              onValueChange={(value) => {
                setLimit(Number(value));
                setPage(1);
                updateUrl();
              }}
            >
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="Page size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="20">20 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
                <SelectItem value="100">100 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {renderActiveFilters()}
        </CardHeader>
        
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <p className="text-destructive">{error}</p>
              <Button 
                onClick={() => fetchDoctors(true)}
                variant="outline"
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-hidden">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10 text-center">
                        <Checkbox 
                          checked={selectedDoctors.length > 0 && selectedDoctors.length === doctors.length}
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all"
                        />
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center">
                          Name
                          {sortBy === 'name' ? (
                            sortOrder === 'asc' ? (
                              <ChevronUp className="ml-1 h-4 w-4" />
                            ) : (
                              <ChevronDown className="ml-1 h-4 w-4" />
                            )
                          ) : (
                            <ArrowUpDown className="ml-1 h-4 w-4 text-muted-foreground opacity-50" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="hidden md:table-cell cursor-pointer"
                        onClick={() => handleSort('specialization')}
                      >
                        <div className="flex items-center">
                          Specialization
                          {sortBy === 'specialization' ? (
                            sortOrder === 'asc' ? (
                              <ChevronUp className="ml-1 h-4 w-4" />
                            ) : (
                              <ChevronDown className="ml-1 h-4 w-4" />
                            )
                          ) : (
                            <ArrowUpDown className="ml-1 h-4 w-4 text-muted-foreground opacity-50" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead>
                        Contact Info
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Address
                      </TableHead>
                      <TableHead 
                        className="hidden md:table-cell cursor-pointer"
                        onClick={() => handleSort('email_sent')}
                      >
                        <div className="flex items-center">
                          Contacted
                          {sortBy === 'email_sent' ? (
                            sortOrder === 'asc' ? (
                              <ChevronUp className="ml-1 h-4 w-4" />
                            ) : (
                              <ChevronDown className="ml-1 h-4 w-4" />
                            )
                          ) : (
                            <ArrowUpDown className="ml-1 h-4 w-4 text-muted-foreground opacity-50" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      // Loading skeleton
                      Array.from({ length: 5 }).map((_, idx) => (
                        <TableRow key={`skeleton-${idx}`}>
                          <TableCell>
                            <Skeleton className="h-4 w-4" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-32" />
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-40" />
                              <Skeleton className="h-4 w-28" />
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Skeleton className="h-4 w-32" />
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Skeleton className="h-6 w-16" />
                          </TableCell>
                          <TableCell className="text-right">
                            <Skeleton className="h-8 w-8 ml-auto" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : doctors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <p className="text-muted-foreground">No doctors found matching your criteria</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      doctors.map((doctor) => (
                        <TableRow key={doctor._id}>
                          <TableCell className="text-center">
                            <Checkbox 
                              checked={selectedDoctors.includes(doctor._id)}
                              onCheckedChange={(checked) => 
                                handleSelectItem(doctor._id, checked === true)
                              }
                              aria-label={`Select ${doctor.name}`}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{doctor.name}</div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant="outline">
                              {doctor.specialization}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center text-sm">
                                <Mail className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-muted-foreground" />
                                <span className="truncate">{doctor.email}</span>
                              </div>
                              {doctor.phone !== '0000000000' && (
                                <div className="flex items-center text-sm">
                                  <Phone className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-muted-foreground" />
                                  <span>{doctor.phone}</span>
                                </div>
                              )}
                              {doctor.website !== 'No Website' && (
                                <div className="hidden xl:flex items-center text-sm">
                                  <Globe className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-muted-foreground" />
                                  <span className="truncate">{doctor.website}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="relative group">
                              <div className="flex items-center text-sm">
                                <MapPin className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-muted-foreground" />
                                <span className="truncate max-w-[200px]">
                                  {doctor.address ? doctor.address : "No Address"}
                                </span>
                              </div>
                              {doctor.address && (
                                <div className="absolute z-50 invisible group-hover:visible bg-black text-white p-2 rounded text-xs max-w-xs whitespace-normal break-words top-full left-0">
                                  {doctor.address}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant={doctor.email_sent ? "success" : "secondary"}>
                              {doctor.email_sent ? "Yes" : "No"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    const newStatus = !doctor.email_sent;
                                    handleBulkEmailStatusUpdate(newStatus, [doctor._id]);
                                  }}
                                >
                                  {doctor.email_sent ? "Mark as not contacted" : "Mark as contacted"}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  {loading ? (
                    <Skeleton className="h-4 w-48" />
                  ) : (
                    `Showing ${(pagination.currentPage - 1) * pagination.pageSize + 1} to ${Math.min(pagination.currentPage * pagination.pageSize, pagination.totalDoctors)} of ${pagination.totalDoctors} doctors`
                  )}
                </div>
                
                {renderPagination()}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Page