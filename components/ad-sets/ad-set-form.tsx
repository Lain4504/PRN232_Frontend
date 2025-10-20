"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Target, DollarSign, Calendar, Users, MapPin } from "lucide-react";
import { useCreateAdSet, useUpdateAdSet } from "@/hooks/use-ad-sets";
import { createAdSetSchema, updateAdSetSchema } from "@/lib/validators/ad-set-schemas";
import { TARGETING_INTERESTS, GENDER_OPTIONS } from "@/lib/types/ad-sets";
import type { AdSetResponse } from "@/lib/types/ad-sets";
import type { CreateAdSetFormData, UpdateAdSetFormData } from "@/lib/validators/ad-set-schemas";
import { toast } from "sonner";

interface AdSetFormProps {
  campaignId: string;
  adSet?: AdSetResponse;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AdSetForm({ campaignId, adSet, onSuccess, onCancel }: AdSetFormProps) {
  const isEditing = !!adSet;
  const createMutation = useCreateAdSet();
  const updateMutation = useUpdateAdSet();

  const form = useForm<CreateAdSetFormData | UpdateAdSetFormData>({
    resolver: zodResolver(isEditing ? updateAdSetSchema : createAdSetSchema),
    defaultValues: isEditing ? {
      id: adSet.id,
      campaignId: adSet.campaignId,
      name: adSet.name,
      budget: adSet.budget,
      targeting: adSet.targeting,
      schedule: adSet.schedule,
    } : {
      campaignId,
      name: "",
      budget: 0,
      targeting: {
        interests: [],
        locations: [],
        ageRange: { min: 18, max: 65 },
        gender: { male: false, female: false },
      },
    },
  });

  const { formState: { errors }, handleSubmit, watch, setValue, register } = form;
  const watchedTargeting = watch("targeting");

  const onSubmit = async (data: CreateAdSetFormData | UpdateAdSetFormData) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync(data as UpdateAdSetFormData);
        toast.success("Ad set updated successfully");
      } else {
        await createMutation.mutateAsync(data as CreateAdSetFormData);
        toast.success("Ad set created successfully");
      }
      onSuccess?.();
    } catch (error) {
      toast.error(isEditing ? "Failed to update ad set" : "Failed to create ad set");
      console.error("Ad set form error:", error);
    }
  };

  const addInterest = (interest: string) => {
    const currentInterests = watchedTargeting?.interests || [];
    if (!currentInterests.includes(interest)) {
      setValue("targeting.interests", [...currentInterests, interest]);
    }
  };

  const removeInterest = (interest: string) => {
    const currentInterests = watchedTargeting?.interests || [];
    setValue("targeting.interests", currentInterests.filter((i: string) => i !== interest));
  };

  const addLocation = () => {
    const currentLocations = watchedTargeting?.locations || [];
    setValue("targeting.locations", [...currentLocations, { country: "" }]);
  };

  const removeLocation = (index: number) => {
    const currentLocations = watchedTargeting?.locations || [];
    setValue("targeting.locations", currentLocations.filter((_, i: number) => i !== index));
  };

  const updateLocation = (index: number, field: string, value: string) => {
    const currentLocations = watchedTargeting?.locations || [];
    const updatedLocations = [...currentLocations];
    updatedLocations[index] = { ...updatedLocations[index], [field]: value };
    setValue("targeting.locations", updatedLocations);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Set up the basic details for your ad set
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ad Set Name</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter ad set name"
              className="h-10 sm:h-9"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Daily Budget ($)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="budget"
                type="number"
                step="0.01"
                min="0.01"
                max="10000"
                {...register("budget", { valueAsNumber: true })}
                className="pl-10 h-10 sm:h-9"
                placeholder="0.00"
              />
            </div>
            {errors.budget && (
              <p className="text-sm text-destructive">{errors.budget.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Targeting Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Targeting Configuration
          </CardTitle>
          <CardDescription>
            Define who will see your ads
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Age Range */}
          <div className="space-y-2">
            <Label>Age Range</Label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="ageMin" className="text-sm">Min:</Label>
                <Input
                  id="ageMin"
                  type="number"
                  min="13"
                  max="65"
                  {...register("targeting.ageRange.min", { valueAsNumber: true })}
                  className="w-20 h-10 sm:h-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="ageMax" className="text-sm">Max:</Label>
                <Input
                  id="ageMax"
                  type="number"
                  min="13"
                  max="65"
                  {...register("targeting.ageRange.max", { valueAsNumber: true })}
                  className="w-20 h-10 sm:h-9"
                />
              </div>
            </div>
            {errors.targeting?.ageRange && (
              <p className="text-sm text-destructive">{errors.targeting.ageRange.message}</p>
            )}
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label>Gender</Label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {GENDER_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`gender-${option.value}`}
                    checked={watchedTargeting?.gender?.[option.value as keyof typeof watchedTargeting.gender] || false}
                    onCheckedChange={(checked) => {
                      setValue(`targeting.gender.${option.value}`, checked as boolean);
                    }}
                  />
                  <Label htmlFor={`gender-${option.value}`} className="text-sm">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
            {errors.targeting?.gender && (
              <p className="text-sm text-destructive">{errors.targeting.gender.message}</p>
            )}
          </div>

          {/* Interests */}
          <div className="space-y-2">
            <Label>Interests</Label>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {watchedTargeting?.interests?.map((interest: string) => (
                  <Badge key={interest} variant="secondary" className="flex items-center gap-1">
                    {interest}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeInterest(interest)}
                    />
                  </Badge>
                ))}
              </div>
              <Select onValueChange={addInterest}>
                <SelectTrigger>
                  <SelectValue placeholder="Add interest" />
                </SelectTrigger>
                <SelectContent>
                  {TARGETING_INTERESTS.map((interest) => (
                    <SelectItem
                      key={interest}
                      value={interest}
                      disabled={watchedTargeting?.interests?.includes(interest)}
                    >
                      {interest}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {errors.targeting?.interests && (
              <p className="text-sm text-destructive">{errors.targeting.interests.message}</p>
            )}
          </div>

          {/* Locations */}
          <div className="space-y-2">
            <Label>Locations</Label>
            <div className="space-y-3">
              {watchedTargeting?.locations?.map((location: { country?: string }, index: number) => (
                <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Country, region, or city"
                    value={location.country || ""}
                    onChange={(e) => updateLocation(index, "country", e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeLocation(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addLocation}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Location
              </Button>
            </div>
            {errors.targeting?.locations && (
              <p className="text-sm text-destructive">{errors.targeting.locations.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule (Optional)
          </CardTitle>
          <CardDescription>
            Set when your ad set should start and end
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                {...register("schedule.startDate")}
                className="h-10 sm:h-9"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                {...register("schedule.endDate")}
                className="h-10 sm:h-9"
              />
            </div>
          </div>
          {errors.schedule && (
            <p className="text-sm text-destructive">{errors.schedule.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto h-10 sm:h-9">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={createMutation.isPending || updateMutation.isPending}
          className="w-full sm:w-auto h-10 sm:h-9"
        >
          {createMutation.isPending || updateMutation.isPending
            ? "Saving..."
            : isEditing
            ? "Update Ad Set"
            : "Create Ad Set"
          }
        </Button>
      </div>
    </form>
  );
}
