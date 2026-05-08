'use client';

import { motion } from 'framer-motion';
import { Phone, Mail, Droplets, Ruler, Scale, Calendar, Heart } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { useUser } from '@/lib/user-context';
import { Skeleton } from '@/components/ui/skeleton';

export function PatientCard() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <Skeleton className="w-16 h-16 rounded-2xl" />
          <div className="flex-1">
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </GlassCard>
    );
  }

  if (!user) {
    return (
      <GlassCard className="p-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">No user data available</p>
        </div>
      </GlassCard>
    );
  }

  const infoItems = [
    { icon: Calendar, label: 'Age', value: `${user.age} years` },
    { icon: Droplets, label: 'Blood Group', value: user.bloodGroup },
    { icon: Ruler, label: 'Height', value: `${user.height} cm` },
    { icon: Scale, label: 'Weight', value: `${user.weight} kg` },
    { icon: Phone, label: 'Phone', value: user.phone },
    { icon: Mail, label: 'Email', value: user.email },
  ];

  return (
    <GlassCard className="p-6">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <motion.div
          className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0"
          whileHover={{ scale: 1.05 }}
        >
          <span className="text-xl font-bold text-primary">
            {user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </span>
        </motion.div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-foreground truncate">{user.fullName}</h3>
          <p className="text-sm text-muted-foreground">@{user.username}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2 py-0.5 rounded-full text-xs bg-success/20 text-success">
              Active
            </span>
            <span className="text-xs text-muted-foreground">
              Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-3">
        {infoItems.map((item, index) => (
          <motion.div
            key={item.label}
            className="flex items-center gap-3 p-3 rounded-xl bg-glass/50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <item.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-sm font-medium text-foreground truncate">{item.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Emergency Contact */}
      <div className="mt-4 p-4 rounded-xl bg-primary/10 border border-primary/20">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="w-4 h-4 text-primary" />
          <h4 className="text-sm font-medium text-foreground">Emergency Contact</h4>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Name</span>
            <span className="text-sm font-medium text-foreground">{user.caretakerName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Phone</span>
            <span className="text-sm font-medium text-foreground">{user.caretakerPhone}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Email</span>
            <span className="text-sm font-medium text-foreground truncate ml-4">{user.caretakerEmail}</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
