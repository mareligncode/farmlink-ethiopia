import React from 'react';
import { Search, Filter, X, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export interface OrderFiltersState {
  search: string;
  status: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
}

interface OrderFiltersProps {
  filters: OrderFiltersState;
  onFiltersChange: (filters: OrderFiltersState) => void;
  onClearFilters: () => void;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({ filters, onFiltersChange, onClearFilters }) => {
  const { language } = useLanguage();

  const hasActiveFilters = filters.search || filters.status !== 'all' || filters.dateFrom || filters.dateTo;

  const statusOptions = [
    { value: 'all', label: language === 'am' ? 'ሁሉም' : 'All Status' },
    { value: 'pending', label: language === 'am' ? 'በመጠባበቅ ላይ' : 'Pending' },
    { value: 'confirmed', label: language === 'am' ? 'የተረጋገጠ' : 'Confirmed' },
    { value: 'processing', label: language === 'am' ? 'በሂደት ላይ' : 'Processing' },
    { value: 'shipped', label: language === 'am' ? 'ተልኳል' : 'Shipped' },
    { value: 'delivered', label: language === 'am' ? 'ደርሷል' : 'Delivered' },
    { value: 'cancelled', label: language === 'am' ? 'ተሰርዟል' : 'Cancelled' },
  ];

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={language === 'am' ? 'በምርት ስም ወይም የትዕዛዝ መለያ ፈልግ...' : 'Search by product name or order ID...'}
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="pl-10 bg-card"
        />
        {filters.search && (
          <button
            onClick={() => onFiltersChange({ ...filters, search: '' })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap gap-2">
        {/* Status Filter */}
        <Select
          value={filters.status}
          onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
        >
          <SelectTrigger className="w-[140px] bg-card">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder={language === 'am' ? 'ሁኔታ' : 'Status'} />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date From */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal bg-card",
                !filters.dateFrom && "text-muted-foreground"
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {filters.dateFrom ? format(filters.dateFrom, 'PP') : (language === 'am' ? 'ከ ቀን' : 'From')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={filters.dateFrom}
              onSelect={(date) => onFiltersChange({ ...filters, dateFrom: date })}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        {/* Date To */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal bg-card",
                !filters.dateTo && "text-muted-foreground"
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {filters.dateTo ? format(filters.dateTo, 'PP') : (language === 'am' ? 'እስከ ቀን' : 'To')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={filters.dateTo}
              onSelect={(date) => onFiltersChange({ ...filters, dateTo: date })}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-muted-foreground">
            <X className="h-4 w-4 mr-1" />
            {language === 'am' ? 'ማጽዳት' : 'Clear'}
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 text-sm">
          {filters.search && (
            <span className="bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1">
              "{filters.search}"
              <button onClick={() => onFiltersChange({ ...filters, search: '' })}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.status !== 'all' && (
            <span className="bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1">
              {statusOptions.find(s => s.value === filters.status)?.label}
              <button onClick={() => onFiltersChange({ ...filters, status: 'all' })}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.dateFrom && (
            <span className="bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1">
              {language === 'am' ? 'ከ' : 'From'}: {format(filters.dateFrom, 'PP')}
              <button onClick={() => onFiltersChange({ ...filters, dateFrom: undefined })}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.dateTo && (
            <span className="bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1">
              {language === 'am' ? 'እስከ' : 'To'}: {format(filters.dateTo, 'PP')}
              <button onClick={() => onFiltersChange({ ...filters, dateTo: undefined })}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderFilters;
