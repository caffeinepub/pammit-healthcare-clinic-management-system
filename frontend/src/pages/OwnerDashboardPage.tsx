import { useState } from 'react';
import { useGetAllStaffMembers, useGetLocationHistory } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MapPin, Calendar, Filter, ExternalLink } from 'lucide-react';
import type { Location } from '../backend';

export default function OwnerDashboardPage() {
  const { data: staffMembers = [], isLoading: staffLoading } = useGetAllStaffMembers();
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const startTimestamp = startDate ? BigInt(new Date(startDate).getTime() * 1000000) : null;
  const endTimestamp = endDate ? BigInt(new Date(endDate).getTime() * 1000000) : null;

  const { data: locationHistory = [], isLoading: historyLoading } = useGetLocationHistory(
    selectedStaffId,
    startTimestamp,
    endTimestamp
  );

  const handleClearFilters = () => {
    setSelectedStaffId(null);
    setStartDate('');
    setEndDate('');
  };

  const getGoogleMapsUrl = (location: Location) => {
    return `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
  };

  const getStaticMapUrl = (locations: Location[]) => {
    if (locations.length === 0) return '';
    
    const markers = locations
      .slice(0, 10) // Limit to 10 markers to avoid URL length issues
      .map((loc, idx) => `markers=color:red%7Clabel:${idx + 1}%7C${loc.latitude},${loc.longitude}`)
      .join('&');
    
    return `https://maps.googleapis.com/maps/api/staticmap?size=600x400&${markers}&key=YOUR_API_KEY`;
  };

  if (staffLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <img 
          src="/assets/generated/owner-dashboard-icon-transparent.dim_64x64.png" 
          alt="Owner Dashboard" 
          className="h-12 w-12"
        />
        <div>
          <h1 className="text-3xl font-bold">Owner Dashboard</h1>
          <p className="text-muted-foreground">Monitor employee locations and attendance patterns</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Location History
          </CardTitle>
          <CardDescription>Filter employee location data by staff member and date range</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Staff Member</Label>
              <Select 
                value={selectedStaffId || 'all'} 
                onValueChange={(value) => setSelectedStaffId(value === 'all' ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Staff" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Staff</SelectItem>
                  {staffMembers.map(staff => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.name} - {staff.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locationHistory.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Staff Filtered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {selectedStaffId ? staffMembers.find(s => s.id === selectedStaffId)?.name : 'All'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Date Range</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {startDate && endDate ? `${startDate} to ${endDate}` : 'All Time'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location Timeline
          </CardTitle>
          <CardDescription>Chronological view of employee location check-ins</CardDescription>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : locationHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No location data found for the selected filters</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Latitude</TableHead>
                    <TableHead>Longitude</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locationHistory.map((location, idx) => {
                    const timestamp = new Date(Number(location.timestamp) / 1000000);
                    return (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div>{timestamp.toLocaleDateString()}</div>
                              <div className="text-xs text-muted-foreground">
                                {timestamp.toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{location.latitude.toFixed(6)}</TableCell>
                        <TableCell>{location.longitude.toFixed(6)}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(getGoogleMapsUrl(location), '_blank')}
                            className="gap-2"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View on Map
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {locationHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Location Map View</CardTitle>
            <CardDescription>Visual representation of tracked locations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border bg-muted/50 p-8 text-center">
              <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Click on individual locations in the timeline above to view them on Google Maps
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  const firstLocation = locationHistory[0];
                  if (firstLocation) {
                    window.open(getGoogleMapsUrl(firstLocation), '_blank');
                  }
                }}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View First Location
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
