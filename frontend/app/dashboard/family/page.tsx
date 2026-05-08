'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  Phone,
  Mail,
  Bell,
  BellOff,
  Edit2,
  Trash2,
  X,
  User,
  Heart,
} from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GlassCard } from '@/components/ui/glass-card';
import { GlowButton } from '@/components/ui/glow-button';
import { PhoneInput } from '@/components/ui/phone-input';
import { useUser } from '@/lib/user-context';
import { FamilyMember, RELATIONS } from '@/lib/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const familyMemberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  relation: z.string().min(1, 'Please select a relation'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(12, 'Please enter a valid phone number'),
});

type FamilyMemberFormData = z.infer<typeof familyMemberSchema>;

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

export default function FamilySpacePage() {
  const { 
    familyMembers: contextFamilyMembers, 
    addFamilyMember, 
    updateFamilyMember, 
    removeFamilyMember,
    selectedAlertRecipients,
    toggleAlertRecipient,
  } = useUser();
  
  // Use context family members or fallback to mock data for demo
  const [members, setMembers] = useState<FamilyMember[]>(contextFamilyMembers || []);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [selectedForAlert, setSelectedForAlert] = useState<string[]>(selectedAlertRecipients || []);

  // Sync with context
  useEffect(() => {
  setMembers(contextFamilyMembers || []);
}, [contextFamilyMembers]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FamilyMemberFormData>({
    resolver: zodResolver(familyMemberSchema),
    defaultValues: {
      phone: '+91',
    },
  });

  const handleAddMember = async (data: FamilyMemberFormData) => {
    const newMember: FamilyMember = {
      id: Date.now().toString(),
      ...data,
    };
    setMembers([...members, newMember]);
    addFamilyMember(data);
    setIsAddingMember(false);
    reset({ phone: '+91' });
    toast.success('Family member added successfully');
  };

  const handleEditMember = async (data: FamilyMemberFormData) => {
    if (!editingMember) return;
    setMembers(members.map((m) => (m.id === editingMember.id ? { ...m, ...data } : m)));
    updateFamilyMember(editingMember.id, data);
    setEditingMember(null);
    reset({ phone: '+91' });
    toast.success('Family member updated successfully');
  };

  const handleDeleteMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
    removeFamilyMember(id);
    setSelectedForAlert(selectedForAlert.filter((s) => s !== id));
    toast.success('Family member removed');
  };

  const handleToggleAlertSelection = (id: string) => {
    if (selectedForAlert.includes(id)) {
      setSelectedForAlert(selectedForAlert.filter((s) => s !== id));
    } else {
      setSelectedForAlert([...selectedForAlert, id]);
    }
    toggleAlertRecipient(id);
  };

  const startEditing = (member: FamilyMember) => {
    setEditingMember(member);
    setValue('name', member.name);
    setValue('relation', member.relation);
    setValue('email', member.email);
    setValue('phone', member.phone);
  };

  const cancelForm = () => {
    setIsAddingMember(false);
    setEditingMember(null);
    reset({ phone: '+91' });
  };

  const isFormOpen = isAddingMember || editingMember !== null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Family Space</h1>
          <p className="text-muted-foreground">Manage family members for health alerts</p>
        </div>
        <GlowButton
          variant="primary"
          onClick={() => setIsAddingMember(true)}
          icon={<Plus className="w-5 h-5" />}
          disabled={isFormOpen}
        >
          Add Member
        </GlowButton>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{members.length}</p>
                <p className="text-sm text-muted-foreground">Family Members</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{selectedForAlert.length}</p>
                <p className="text-sm text-muted-foreground">Alert Recipients</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">Active</p>
                <p className="text-sm text-muted-foreground">Monitoring Status</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </motion.div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard className="p-6 gradient-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">
                  {editingMember ? 'Edit Family Member' : 'Add Family Member'}
                </h3>
                <button
                  onClick={cancelForm}
                  className="p-2 rounded-lg hover:bg-glass transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <form onSubmit={handleSubmit(editingMember ? handleEditMember : handleAddMember)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        {...register('name')}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="Enter name"
                      />
                    </div>
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Relation */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Relation</label>
                    <div className="relative">
                      <Heart className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <select
                        {...register('relation')}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                      >
                        <option value="">Select relation</option>
                        {RELATIONS.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                    {errors.relation && (
                      <p className="text-sm text-destructive">{errors.relation.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        {...register('email')}
                        type="email"
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="Enter email"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Phone with Country Code */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Phone</label>
                    <Controller
                      name="phone"
                      control={control}
                      render={({ field }) => (
                        <PhoneInput
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          placeholder="Enter phone number"
                          error={errors.phone?.message}
                          defaultCountry="IN"
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <GlowButton type="button" variant="ghost" onClick={cancelForm}>
                    Cancel
                  </GlowButton>
                  <GlowButton type="submit" variant="primary" loading={isSubmitting}>
                    {editingMember ? 'Update Member' : 'Add Member'}
                  </GlowButton>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Family Members Grid */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {members.map((member) => {
              const isSelectedForAlert = selectedForAlert.includes(member.id);
              return (
                <motion.div
                  key={member.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <GlassCard
                    className={cn(
                      'p-6 relative overflow-hidden',
                      isSelectedForAlert && 'ring-2 ring-success'
                    )}
                  >
                    {/* Alert indicator */}
                    {isSelectedForAlert && (
                      <div className="absolute top-4 right-4">
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-success/20 text-success">
                          <Bell className="w-3 h-3" />
                          Alert Recipient
                        </span>
                      </div>
                    )}

                    {/* Avatar */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-primary">
                          {member.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-semibold text-foreground truncate">
                          {member.name}
                        </h4>
                        <p className="text-sm text-primary">{member.relation}</p>
                      </div>
                    </div>

                    {/* Contact info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>{member.phone}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-4 border-t border-glass-border">
                      <GlowButton
                        variant={isSelectedForAlert ? 'secondary' : 'ghost'}
                        size="sm"
                        className="flex-1"
                        onClick={() => handleToggleAlertSelection(member.id)}
                        icon={isSelectedForAlert ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                      >
                        {isSelectedForAlert ? 'Remove Alert' : 'Add to Alert'}
                      </GlowButton>
                      <button
                        onClick={() => startEditing(member)}
                        className="p-2 rounded-lg hover:bg-glass transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMember(member.id)}
                        className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Empty state */}
          {members.length === 0 && (
            <div className="col-span-full">
              <GlassCard className="p-12 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Family Members</h3>
                <p className="text-muted-foreground mb-6">
                  Add family members to receive health alerts
                </p>
                <GlowButton
                  variant="primary"
                  onClick={() => setIsAddingMember(true)}
                  icon={<Plus className="w-5 h-5" />}
                >
                  Add First Member
                </GlowButton>
              </GlassCard>
            </div>
          )}
        </div>
      </motion.div>

      {/* Alert Configuration */}
      {selectedForAlert.length > 0 && (
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Alert Configuration</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedForAlert.length} member(s) will receive health alerts
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedForAlert.map((id) => {
                const member = members.find((m) => m.id === id);
                if (!member) return null;
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/20 text-success text-sm"
                  >
                    {member.name}
                    <button
                      onClick={() => handleToggleAlertSelection(id)}
                      className="hover:bg-success/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>
      )}
    </motion.div>
  );
}
