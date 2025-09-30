"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ExternalLink } from "lucide-react";

export default function NewOrganizationPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        type: 'Personal',
        plan: 'Free - $0/month'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Handle form submission
        console.log('Creating organization:', formData);
        router.push('/dashboard/organizations');
    };

    const handleCancel = () => {
        router.push('/dashboard/organizations');
    };

    return (
        <div className="flex-1 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Organization</h1>
                <p className="text-sm text-gray-600 mt-1">Create a new organization within AISAM</p>
            </div>

            <div className="max-w-2xl">
                <Card className="border border-gray-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium text-gray-900">Organization Details</CardTitle>
                        <CardDescription className="text-gray-600">
                            Provide the basic information for your new organization.
                            For example, you can use the name of your company or department.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Name Field */}
                                <div className="space-y-2">
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-900">
                                        Name
                                    </label>
                                    <Input
                                        id="name"
                                        placeholder="Organization name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full"
                                    />
                                    <p className="text-xs sm:text-sm text-gray-500">What&apos;s the name of your company or team?</p>
                                </div>

                                {/* Type Field */}
                                <div className="space-y-2">
                                    <label htmlFor="type" className="block text-sm font-medium text-gray-900">
                                        Type
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="type"
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full p-3 border border-gray-300 rounded-md bg-white appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base"
                                        >
                                            <option value="Personal">Personal</option>
                                            <option value="Team">Team</option>
                                            <option value="Company">Company</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-500">What would best describe your organization?</p>
                                </div>

                                {/* Plan Field */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <label htmlFor="plan" className="text-sm font-medium text-gray-900">
                                            Plan
                                        </label>
                                        <Button variant="ghost" size="sm" className="h-auto p-0 text-xs sm:text-sm text-gray-600 hover:text-gray-800">
                                            Pricing
                                            <ExternalLink className="h-3 w-3 ml-1" />
                                        </Button>
                                    </div>
                                    <div className="relative">
                                        <select
                                            id="plan"
                                            value={formData.plan}
                                            onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                                            className="w-full p-3 border border-gray-300 rounded-md bg-white appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base"
                                        >
                                            <option value="Free - $0/month">Free - $0/month</option>
                                            <option value="Pro - $25/month">Pro - $25/month</option>
                                            <option value="Team - $125/month">Team - $125/month</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-500">The Plan applies to your new organization.</p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 gap-4">
                                    <div className="order-2 sm:order-1">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleCancel}
                                            className="w-full sm:w-auto px-4 py-2"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 order-1 sm:order-2">
                                        <span className="text-xs sm:text-sm text-gray-500 text-center sm:text-right">
                                            You can rename your organization later
                                        </span>
                                        <Button
                                            type="submit"
                                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 w-full sm:w-auto"
                                            disabled={!formData.name.trim()}
                                        >
                                            Create organization
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
    );
}