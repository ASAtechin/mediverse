"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, MapPin, Upload, X, ImageIcon } from "lucide-react";
import { SPECIALTIES, CLINIC_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { RegistrationData } from "@/app/(register)/register/signup/page";

interface Step3Props {
  data: RegistrationData;
  updateData: (updates: Partial<RegistrationData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Chandigarh",
];

export function Step3Clinic({ data, updateData, onNext, onBack }: Step3Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!data.clinicName.trim()) newErrors.clinicName = "Clinic name is required";
    if (!data.clinicType) newErrors.clinicType = "Please select a clinic type";
    if (data.specialties.length === 0) newErrors.specialties = "Select at least one specialty";
    if (!data.city.trim()) newErrors.city = "City is required";
    if (!data.state) newErrors.state = "State is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext();
    }
  };

  const toggleSpecialty = (id: string) => {
    const current = data.specialties;
    updateData({
      specialties: current.includes(id)
        ? current.filter((s) => s !== id)
        : [...current, id],
    });
  };

  const handleLogoFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, logo: "Please upload an image file" }));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, logo: "Image must be under 2 MB" }));
      return;
    }
    setErrors((prev) => {
      const { logo, ...rest } = prev;
      return rest;
    });
    const reader = new FileReader();
    reader.onloadend = () => {
      updateData({ clinicLogo: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleLogoFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-1">Set up your clinic</h2>
      <p className="text-slate-500 text-sm mb-6">
        Tell us about your practice so we can customize your experience.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Clinic Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Clinic Name *</label>
          <Input
            placeholder="e.g. City Health Clinic"
            value={data.clinicName}
            onChange={(e) => updateData({ clinicName: e.target.value })}
            className={cn("h-12 bg-slate-50 border-slate-200 rounded-xl", errors.clinicName && "border-red-300")}
          />
          {errors.clinicName && <p className="text-xs text-red-500">{errors.clinicName}</p>}
        </div>

        {/* Clinic Logo Upload */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">
            Clinic Logo <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          {data.clinicLogo ? (
            <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="h-16 w-16 rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center shrink-0">
                <Image
                  src={data.clinicLogo}
                  alt="Clinic logo"
                  width={64}
                  height={64}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">Logo uploaded</p>
                <p className="text-xs text-slate-400">Click remove to change</p>
              </div>
              <button
                type="button"
                onClick={() => updateData({ clinicLogo: "" })}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "relative flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all",
                dragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
              )}
            >
              <div className={cn(
                "p-2 rounded-lg transition-colors",
                dragActive ? "bg-blue-100" : "bg-slate-100"
              )}>
                {dragActive ? (
                  <Upload className="h-5 w-5 text-blue-600" />
                ) : (
                  <ImageIcon className="h-5 w-5 text-slate-400" />
                )}
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-600">
                  <span className="text-blue-600 font-semibold">Click to upload</span> or drag & drop
                </p>
                <p className="text-xs text-slate-400 mt-0.5">PNG, JPG or SVG (max 2 MB)</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleLogoFile(file);
                }}
              />
            </div>
          )}
          {errors.logo && <p className="text-xs text-red-500">{errors.logo}</p>}
        </div>

        {/* Clinic Type */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Clinic Type *</label>
          <div className="grid grid-cols-2 gap-2">
            {CLINIC_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => updateData({ clinicType: type.id })}
                className={cn(
                  "p-3 border rounded-xl text-left transition-all text-sm",
                  data.clinicType === type.id
                    ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                    : "border-slate-200 hover:border-blue-200 bg-white"
                )}
              >
                <div className="font-semibold text-slate-900">{type.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{type.description}</div>
              </button>
            ))}
          </div>
          {errors.clinicType && <p className="text-xs text-red-500">{errors.clinicType}</p>}
        </div>

        {/* Specialties */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">
            Specialties * <span className="text-slate-400 font-normal">(select multiple)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {SPECIALTIES.map((spec) => (
              <button
                key={spec.id}
                type="button"
                onClick={() => toggleSpecialty(spec.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
                  data.specialties.includes(spec.id)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"
                )}
              >
                {spec.label}
              </button>
            ))}
          </div>
          {errors.specialties && <p className="text-xs text-red-500">{errors.specialties}</p>}
        </div>

        {/* Address */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Address</label>
          <div className="relative">
            <Input
              placeholder="Clinic address"
              value={data.address}
              onChange={(e) => updateData({ address: e.target.value })}
              className="h-12 bg-slate-50 border-slate-200 rounded-xl pr-10"
            />
            <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* City, State, Pincode */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">City *</label>
            <Input
              placeholder="Mumbai"
              value={data.city}
              onChange={(e) => updateData({ city: e.target.value })}
              className={cn("h-12 bg-slate-50 border-slate-200 rounded-xl", errors.city && "border-red-300")}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">State *</label>
            <select
              value={data.state}
              onChange={(e) => updateData({ state: e.target.value })}
              className={cn(
                "h-12 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 text-sm",
                errors.state && "border-red-300"
              )}
            >
              <option value="">Select</option>
              {INDIAN_STATES.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Pincode</label>
            <Input
              placeholder="400001"
              value={data.pincode}
              onChange={(e) => updateData({ pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
              className="h-12 bg-slate-50 border-slate-200 rounded-xl"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            onClick={onBack}
            variant="outline"
            className="h-12 px-6 rounded-xl"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <Button
            type="submit"
            className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
          >
            Continue <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </form>
    </div>
  );
}
