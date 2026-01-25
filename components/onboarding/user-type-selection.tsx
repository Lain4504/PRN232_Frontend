"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Building2, Check, ArrowRight, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface UserTypeSelectionProps {
    onSelect: (type: 'individual' | 'agency') => void
    isLoading?: boolean
}

export function UserTypeSelection({ onSelect, isLoading }: UserTypeSelectionProps) {
    const [selected, setSelected] = React.useState<'individual' | 'agency' | null>('individual')

    const types = [
        {
            id: 'individual',
            title: 'Individual Store / Creator',
            description: 'The easiest way to start. Perfect for local shops, individuals, or single brand owners.',
            recommended: true,
            icon: User,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            features: [
                'Quick brand setup',
                'Direct social linking',
                'Personal content workspace'
            ]
        },
        {
            id: 'agency',
            title: 'Marketing Agency',
            description: 'Manage multiple brands and teams with advanced collaboration.',
            icon: Building2,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10',
            features: [
                'Multiple workspaces',
                'Team member assignment',
                'Client brand management'
            ]
        }
    ]

    return (
        <div className="w-full max-w-4xl mx-auto p-6 font-fira-sans animate-in fade-in duration-700">
            <div className="text-center space-y-4 mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                    <Sparkles className="size-3" />
                    Welcome to omniadly
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground uppercase italic leading-none">
                    How will you use <span className="text-primary">omniadly</span>?
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium italic">
                    Select the path that best fits your workflow. You can always change this later.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
                {types.map((type) => (
                    <Card
                        key={type.id}
                        className={cn(
                            "group relative overflow-hidden rounded-[32px] border-2 transition-all duration-500 cursor-pointer",
                            selected === type.id
                                ? "border-primary bg-primary/5 shadow-2xl shadow-primary/10 translate-y-[-4px]"
                                : "border-white/5 bg-muted/20 hover:border-primary/30 hover:bg-primary/[0.02]"
                        )}
                        onClick={() => setSelected(type.id as 'individual' | 'agency')}
                    >
                        {type.recommended && (
                            <div className="absolute top-0 left-0 px-4 py-1.5 bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-[0.2em] rounded-br-2xl shadow-lg z-20">
                                Recommended
                            </div>
                        )}

                        {selected === type.id && (
                            <div className="absolute top-6 right-6 size-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground animate-in zoom-in duration-300">
                                <Check className="size-4 stroke-[3]" />
                            </div>
                        )}

                        <CardContent className="p-8 md:p-10 space-y-8">
                            <div className={cn(
                                "size-20 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 shadow-inner",
                                type.bg, type.color
                            )}>
                                <type.icon className="size-10" />
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-2xl font-black uppercase tracking-tight italic">{type.title}</h3>
                                <p className="text-muted-foreground font-medium italic leading-relaxed text-sm">
                                    {type.description}
                                </p>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-white/5">
                                {type.features.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Check className="size-3 text-primary stroke-[3]" />
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-wide text-foreground/70">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex justify-center">
                <Button
                    size="lg"
                    className="rounded-2xl h-16 px-12 font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    disabled={!selected || isLoading}
                    onClick={() => selected && onSelect(selected)}
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <div className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            Configuring...
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            Launch Console
                            <ArrowRight className="size-5 ml-2" />
                        </div>
                    )}
                </Button>
            </div>
        </div>
    )
}
