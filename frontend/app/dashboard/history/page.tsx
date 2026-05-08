'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Calendar,
  ArrowUpDown,
  Heart,
  Wind,
  Droplets,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { GlassCard } from '@/components/ui/glass-card';
import { GlowButton } from '@/components/ui/glow-button';
import { mockVitalHistory } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

type SortField = 'timestamp' | 'heartRate' | 'respiratoryRate' | 'spo2';
type SortOrder = 'asc' | 'desc';
type FilterStatus = 'all' | 'normal' | 'warning' | 'critical';

const statusConfig = {
  normal: {
    icon: CheckCircle2,
    color: 'text-success',
    bg: 'bg-success/20',
    label: 'Normal',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-warning',
    bg: 'bg-warning/20',
    label: 'Warning',
  },
  critical: {
    icon: AlertCircle,
    color: 'text-critical',
    bg: 'bg-critical/20',
    label: 'Critical',
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function VitalHistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter and sort data
  const filteredData = useMemo(() => {
    let data = [...mockVitalHistory];

    // Filter by status
    if (filterStatus !== 'all') {
      data = data.filter((item) => item.status === filterStatus);
    }

    // Search by date
    if (searchQuery) {
      data = data.filter((item) =>
        format(item.timestamp, 'PPp').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    data.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'timestamp':
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
        case 'heartRate':
          comparison = a.heartRate - b.heartRate;
          break;
        case 'respiratoryRate':
          comparison = a.respiratoryRate - b.respiratoryRate;
          break;
        case 'spo2':
          comparison = a.spo2 - b.spo2;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return data;
  }, [searchQuery, filterStatus, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Chart data
  const chartData = useMemo(() => {
    return [...mockVitalHistory]
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map((item) => ({
        date: format(item.timestamp, 'MMM d'),
        heartRate: item.heartRate,
        respiratoryRate: item.respiratoryRate,
        spo2: item.spo2,
      }));
  }, []);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-foreground">Vital History</h1>
        <p className="text-muted-foreground">Track and analyze your historical vital signs</p>
      </motion.div>

      {/* Stats Overview */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Records', value: mockVitalHistory.length, icon: Calendar },
            { label: 'Normal Readings', value: mockVitalHistory.filter((v) => v.status === 'normal').length, icon: CheckCircle2 },
            { label: 'Alerts Triggered', value: mockVitalHistory.filter((v) => v.status !== 'normal').length, icon: AlertTriangle },
          ].map((stat, index) => (
            <GlassCard key={index} className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </motion.div>

      {/* Trend Chart */}
      <motion.div variants={itemVariants}>
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-foreground">Vital Trends</h3>
              <p className="text-sm text-muted-foreground">Historical data visualization</p>
            </div>
            <GlowButton variant="ghost" size="sm" icon={<Download className="w-4 h-4" />}>
              Export
            </GlowButton>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.03 260 / 0.2)" />
                <XAxis dataKey="date" stroke="oklch(0.65 0.02 260)" fontSize={12} />
                <YAxis stroke="oklch(0.65 0.02 260)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'oklch(0.18 0.02 260 / 0.95)',
                    border: '1px solid oklch(0.30 0.03 260 / 0.4)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(20px)',
                  }}
                  labelStyle={{ color: 'oklch(0.97 0.01 260)' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="heartRate"
                  name="Heart Rate"
                  stroke="oklch(0.60 0.22 25)"
                  strokeWidth={2}
                  dot={{ fill: 'oklch(0.60 0.22 25)', strokeWidth: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="respiratoryRate"
                  name="Respiratory Rate"
                  stroke="oklch(0.65 0.18 250)"
                  strokeWidth={2}
                  dot={{ fill: 'oklch(0.65 0.18 250)', strokeWidth: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="spo2"
                  name="SpO2"
                  stroke="oklch(0.70 0.18 160)"
                  strokeWidth={2}
                  dot={{ fill: 'oklch(0.70 0.18 160)', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </motion.div>

      {/* Filters and Search */}
      <motion.div variants={itemVariants}>
        <GlassCard className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="px-4 py-2.5 rounded-xl bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="all">All Status</option>
                <option value="normal">Normal</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Data Table */}
      <motion.div variants={itemVariants}>
        <GlassCard className="overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-5 gap-4 p-4 border-b border-glass-border bg-glass/30">
            <button
              onClick={() => toggleSort('timestamp')}
              className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Date & Time
              <ArrowUpDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => toggleSort('heartRate')}
              className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              <Heart className="w-4 h-4" />
              Heart Rate
              <ArrowUpDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => toggleSort('respiratoryRate')}
              className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              <Wind className="w-4 h-4" />
              Resp. Rate
              <ArrowUpDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => toggleSort('spo2')}
              className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              <Droplets className="w-4 h-4" />
              SpO2
              <ArrowUpDown className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-foreground">Status</span>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-glass-border">
            <AnimatePresence mode="popLayout">
              {paginatedData.map((record, index) => {
                const config = statusConfig[record.status];
                const StatusIcon = config.icon;

                return (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                    className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 hover:bg-glass/30 transition-colors"
                  >
                    <div className="col-span-2 md:col-span-1">
                      <p className="text-sm font-medium text-foreground">
                        {format(record.timestamp, 'MMM d, yyyy')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(record.timestamp, 'h:mm a')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-muted-foreground md:hidden" />
                      <span className="text-sm text-foreground">{record.heartRate} BPM</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind className="w-4 h-4 text-muted-foreground md:hidden" />
                      <span className="text-sm text-foreground">{record.respiratoryRate} br/min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-muted-foreground md:hidden" />
                      <span className="text-sm text-foreground">{record.spo2}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn('flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium', config.bg, config.color)}>
                        <StatusIcon className="w-3 h-3" />
                        {config.label}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {paginatedData.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No records found</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-glass-border">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} records
              </p>
              <div className="flex items-center gap-2">
                <GlowButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  icon={<ChevronLeft className="w-4 h-4" />}
                >
                  Previous
                </GlowButton>
                <span className="px-4 py-2 text-sm text-foreground">
                  {currentPage} / {totalPages}
                </span>
                <GlowButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  icon={<ChevronRight className="w-4 h-4" />}
                >
                  Next
                </GlowButton>
              </div>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
