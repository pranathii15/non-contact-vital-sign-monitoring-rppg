'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft,
  User,
  Droplets,
  Ruler,
  Scale,
  Calendar,
  Heart,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GlassCard } from '@/components/ui/glass-card';
import { GlowButton } from '@/components/ui/glow-button';
import { ParticleBackground } from '@/components/ui/particle-background';
import { PhoneInput } from '@/components/ui/phone-input';
import { BLOOD_GROUPS } from '@/lib/types';
import { useUser } from '@/lib/user-context';
import { toast } from 'sonner';

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  fullName: z.string().min(2, 'Please enter your full name'),
  age: z.string().refine((val) => {
    const num = parseInt(val);
    return num >= 1 && num <= 120;
  }, 'Please enter a valid age'),
  bloodGroup: z.string().min(1, 'Please select your blood group'),
  height: z.string().refine((val) => {
    const num = parseInt(val);
    return num >= 50 && num <= 300;
  }, 'Please enter valid height in cm'),
  weight: z.string().refine((val) => {
    const num = parseInt(val);
    return num >= 10 && num <= 500;
  }, 'Please enter valid weight in kg'),
  phone: z.string().min(12, 'Please enter a valid phone number'),
  caretakerName: z.string().min(2, 'Please enter caretaker name'),
  caretakerEmail: z.string().email('Please enter valid caretaker email'),
  caretakerPhone: z.string().min(12, 'Please enter valid caretaker phone'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const steps = [
  { id: 1, title: 'Account', description: 'Basic details' },
  { id: 2, title: 'Personal', description: 'Health info' },
  { id: 3, title: 'Caretaker', description: 'Emergency contact' },
];

function PasswordStrength({ password }: { password: string }) {
  const getStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^A-Za-z0-9]/)) strength++;
    return strength;
  };

  const strength = getStrength();
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['bg-destructive', 'bg-warning', 'bg-chart-3', 'bg-success'];

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-2"
    >
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-all ${
              level <= strength ? colors[strength - 1] : 'bg-muted'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Password strength: <span className="font-medium">{labels[strength - 1] || 'Too weak'}</span>
      </p>
    </motion.div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    control,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      phone: '+91',
      caretakerPhone: '+91',
    },
  });

  const password = watch('password', '');

  const validateStep = async () => {
    let fieldsToValidate: (keyof RegisterFormData)[] = [];
    
    switch (currentStep) {
      case 1:
        fieldsToValidate = ['username', 'email', 'password'];
        break;
      case 2:
        fieldsToValidate = ['fullName', 'age', 'bloodGroup', 'height', 'weight', 'phone'];
        break;
      case 3:
        fieldsToValidate = ['caretakerName', 'caretakerEmail', 'caretakerPhone'];
        break;
    }

    const result = await trigger(fieldsToValidate);
    return result;
  };

  const nextStep = async () => {
    const isValid = await validateStep();
    if (isValid && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    
    try {
      // Register user with context
      await registerUser({
        username: data.username,
        email: data.email,
        fullName: data.fullName,
        age: parseInt(data.age),
        bloodGroup: data.bloodGroup,
        height: parseInt(data.height),
        weight: parseInt(data.weight),
        phone: data.phone,
        caretakerName: data.caretakerName,
        caretakerEmail: data.caretakerEmail,
        caretakerPhone: data.caretakerPhone,
      });
      // ✅ THIS PART
localStorage.setItem("user", JSON.stringify({
  name: data.fullName,
  email: data.email,
}));
    toast.success('Account created successfully!');

      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    } catch (error) {
      toast.error('Registration failed', {
        description: 'Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const InputField = ({ 
    name, 
    label, 
    type = 'text', 
    icon: Icon, 
    placeholder,
    options
  }: { 
    name: keyof RegisterFormData; 
    label: string; 
    type?: string; 
    icon: React.ElementType; 
    placeholder: string;
    options?: readonly string[];
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        {options ? (
          <select
            {...register(name)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none"
          >
            <option value="">Select {label}</option>
            {options.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        ) : name === 'password' ? (
          <>
            <input
              type={showPassword ? 'text' : 'password'}
              {...register(name)}
              className="w-full pl-12 pr-12 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              placeholder={placeholder}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </>
        ) : (
          <input
            type={type}
            {...register(name)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            placeholder={placeholder}
          />
        )}
      </div>
      <AnimatePresence mode="wait">
        {errors[name] && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-destructive"
          >
            {errors[name]?.message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-6">
      <ParticleBackground />

      {/* Back button */}
      <motion.div
        className="fixed top-6 left-6 z-50"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link href="/">
          <GlowButton variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </GlowButton>
        </Link>
      </motion.div>

      <motion.div
        className="w-full max-w-lg relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <GlassCard className="p-8 gradient-border">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Activity className="w-7 h-7 text-primary" />
            </div>
            <span className="text-2xl font-bold text-foreground">VitalAI</span>
          </div>

          {/* Steps indicator */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <motion.div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      currentStep > step.id
                        ? 'bg-success text-success-foreground'
                        : currentStep === step.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                    animate={{ scale: currentStep === step.id ? 1.1 : 1 }}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </motion.div>
                  <span className="text-xs text-muted-foreground mt-1 hidden sm:block">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 sm:w-20 h-0.5 mx-2 ${
                    currentStep > step.id ? 'bg-success' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              {/* Step 1: Account Details */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-6">
                    <h1 className="text-xl font-bold text-foreground">Create Account</h1>
                    <p className="text-sm text-muted-foreground">Enter your account details</p>
                  </div>
                  <InputField name="username" label="Username" icon={User} placeholder="Choose a username" />
                  <InputField name="email" label="Email" type="email" icon={Mail} placeholder="Enter your email" />
                  <InputField name="password" label="Password" type="password" icon={Lock} placeholder="Create a password" />
                  <PasswordStrength password={password} />
                </motion.div>
              )}

              {/* Step 2: Personal Details */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-6">
                    <h1 className="text-xl font-bold text-foreground">Personal Information</h1>
                    <p className="text-sm text-muted-foreground">Your health profile details</p>
                  </div>
                  <InputField name="fullName" label="Full Name" icon={User} placeholder="Enter your full name" />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField name="age" label="Age" type="number" icon={Calendar} placeholder="Age" />
                    <InputField name="bloodGroup" label="Blood Group" icon={Droplets} placeholder="Select" options={BLOOD_GROUPS} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField name="height" label="Height (cm)" type="number" icon={Ruler} placeholder="Height" />
                    <InputField name="weight" label="Weight (kg)" type="number" icon={Scale} placeholder="Weight" />
                  </div>
                  
                  {/* Phone with country code */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Phone Number</label>
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
                </motion.div>
              )}

              {/* Step 3: Caretaker Details */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-6">
                    <h1 className="text-xl font-bold text-foreground">Emergency Contact</h1>
                    <p className="text-sm text-muted-foreground">Caretaker will be notified in emergencies</p>
                  </div>
                  <InputField name="caretakerName" label="Caretaker Name" icon={Heart} placeholder="Caretaker full name" />
                  <InputField name="caretakerEmail" label="Caretaker Email" type="email" icon={Mail} placeholder="Caretaker email" />
                  
                  {/* Caretaker Phone with country code */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Caretaker Phone</label>
                    <Controller
                      name="caretakerPhone"
                      control={control}
                      render={({ field }) => (
                        <PhoneInput
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          placeholder="Enter phone number"
                          error={errors.caretakerPhone?.message}
                          defaultCountry="IN"
                        />
                      )}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8">
              {currentStep > 1 && (
                <GlowButton
                  type="button"
                  variant="secondary"
                  size="lg"
                  className="flex-1"
                  onClick={prevStep}
                  icon={<ArrowLeft className="w-5 h-5" />}
                >
                  Previous
                </GlowButton>
              )}
              {currentStep < 3 ? (
                <GlowButton
                  type="button"
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  onClick={nextStep}
                  icon={<ArrowRight className="w-5 h-5" />}
                >
                  Continue
                </GlowButton>
              ) : (
                <GlowButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  loading={isLoading}
                  icon={!isLoading ? <CheckCircle2 className="w-5 h-5" /> : undefined}
                >
                  Create Account
                </GlowButton>
              )}
            </div>
          </form>

          {/* Sign In Link */}
          <p className="text-center text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link 
              href="/login" 
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}
