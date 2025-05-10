'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { UserProfileData } from '@/lib/types';
import { useAuth } from '@/components/auth/auth-provider';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { FileUp, Image as ImageIcon, Loader2 } from 'lucide-react';
import React from 'react';

const profileFormSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters.' }).max(50),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters.' }).max(50),
  idNumber: z.string().optional(),
  vehicleMake: z.string().min(2, { message: 'Vehicle make is required.' }).max(50),
  vehicleModel: z.string().min(1, { message: 'Vehicle model is required.' }).max(50),
  vehicleLicensePlate: z.string().min(3, { message: 'License plate is required.' }).max(10),
  vehicleColor: z.string().min(2, { message: 'Vehicle color is required.' }).max(30),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function DriverProfileForm() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Initialize form with userProfile data or defaults
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      idNumber: '',
      vehicleMake: '',
      vehicleModel: '',
      vehicleLicensePlate: '',
      vehicleColor: '',
    },
  });

  React.useEffect(() => {
    if (userProfile) {
      form.reset({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        idNumber: userProfile.idNumber || '',
        vehicleMake: userProfile.vehicleMake || '',
        vehicleModel: userProfile.vehicleModel || '',
        vehicleLicensePlate: userProfile.vehicleLicensePlate || '',
        vehicleColor: userProfile.vehicleColor || '',
      });
    }
  }, [userProfile, form]);


  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in to update your profile.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, data, { merge: true });
      toast({
        title: 'Profile Updated',
        description: 'Your driver profile has been successfully updated.',
      });
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message || 'Could not update your profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Mock file upload handler
  const handleFileUpload = (fieldName: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toast({
        title: "File Selected",
        description: `${file.name} ready for upload (mock). In a real app, this would upload to storage.`,
      });
      // Mock: In a real app, upload file to Firebase Storage and save URL in Firestore.
      // For example: userProfile.driverLicensePhotoUrl = await uploadFileAndGetURL(file);
      // Then update the state or refetch profile to show the uploaded image/status.
    }
  };


  if (authLoading) {
    return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Driver Profile</CardTitle>
        <CardDescription>Manage your personal and vehicle information.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl><Input placeholder="Your first name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl><Input placeholder="Your last name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
                control={form.control}
                name="idNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID Number (Optional)</FormLabel>
                    <FormControl><Input placeholder="Your ID number" {...field} /></FormControl>
                    <FormDescription>Required according to local regulations.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

            <h3 className="text-lg font-semibold pt-4 border-t mt-6">Vehicle Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="vehicleMake"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Make</FormLabel>
                    <FormControl><Input placeholder="e.g., Toyota" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vehicleModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Model</FormLabel>
                    <FormControl><Input placeholder="e.g., Camry" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vehicleLicensePlate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Plate</FormLabel>
                    <FormControl><Input placeholder="e.g., ABC-123" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vehicleColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Color</FormLabel>
                    <FormControl><Input placeholder="e.g., Blue" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <h3 className="text-lg font-semibold pt-4 border-t mt-6">Document Uploads</h3>
            <p className="text-sm text-muted-foreground">Upload photos of your documents. Ensure they are clear and legible.</p>
            <div className="space-y-4">
              {(['Driver\'s License', 'ID Card', 'Vehicle Insurance (Recommended)'] as const).map((docType) => {
                 const fieldName = docType.toLowerCase().replace(/[\s()']/g, '') as keyof UserProfileData;
                 const currentPhotoUrl = userProfile?.[fieldName] as string | undefined;
                 return (
                    <FormItem key={docType}>
                        <FormLabel>{docType}</FormLabel>
                        <div className="flex items-center gap-4">
                        {currentPhotoUrl ? (
                            <div className="w-24 h-16 rounded border overflow-hidden flex items-center justify-center bg-muted">
                                <ImageIcon data-ai-hint="document icon" className="w-8 h-8 text-muted-foreground" />
                            </div>
                        ) : (
                            <div className="w-24 h-16 rounded border border-dashed flex items-center justify-center bg-muted">
                                <ImageIcon data-ai-hint="document placeholder" className="w-8 h-8 text-muted-foreground opacity-50" />
                            </div>
                        )}
                        <FormControl>
                            <Button type="button" variant="outline" asChild>
                            <label className="cursor-pointer">
                                <FileUp className="mr-2 h-4 w-4" /> Upload File
                                <Input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(docType, e)} />
                            </label>
                            </Button>
                        </FormControl>
                        </div>
                        {currentPhotoUrl && <FormDescription>Current document uploaded. Replace if needed.</FormDescription>}
                        {!currentPhotoUrl && <FormDescription>No document uploaded yet.</FormDescription>}
                    </FormItem>
                 );
              })}
            </div>


            <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Profile
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
