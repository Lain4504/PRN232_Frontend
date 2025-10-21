import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Target } from "lucide-react";
import type { TargetingConfig } from "@/lib/types/ad-sets";

interface TargetingConfigProps {
  targeting: TargetingConfig;
  className?: string;
}

export function TargetingConfig({ targeting, className }: TargetingConfigProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Targeting Configuration
        </CardTitle>
        <CardDescription>
          Audience targeting settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Age Range */}
        {targeting.ageRange && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Age Range</label>
            <p className="text-sm">
              {targeting.ageRange.min} - {targeting.ageRange.max} years
            </p>
          </div>
        )}
        
        {/* Gender */}
        {targeting.gender && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Gender</label>
            <p className="text-sm">
              {Object.entries(targeting.gender)
                .filter(([, selected]) => selected)
                .map(([gender]) => gender.charAt(0).toUpperCase() + gender.slice(1))
                .join(", ") || "Not specified"}
            </p>
          </div>
        )}

        {/* Interests */}
        {targeting.interests && targeting.interests.length > 0 && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Interests</label>
            <div className="flex flex-wrap gap-1 mt-1">
              {targeting.interests.map((interest) => (
                <Badge key={interest} variant="outline" className="text-xs">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Locations */}
        {targeting.locations && targeting.locations.length > 0 && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Locations</label>
            <div className="space-y-1 mt-1">
              {targeting.locations.map((location, index) => (
                <div key={index} className="flex items-center gap-1 text-sm">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  {location.country || location.region || location.city || "Location"}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Demographics */}
        {targeting.demographics && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Demographics</label>
            <div className="space-y-1 mt-1">
              {targeting.demographics.education && targeting.demographics.education.length > 0 && (
                <p className="text-sm">
                  Education: {targeting.demographics.education.join(", ")}
                </p>
              )}
              {targeting.demographics.relationshipStatus && targeting.demographics.relationshipStatus.length > 0 && (
                <p className="text-sm">
                  Relationship: {targeting.demographics.relationshipStatus.join(", ")}
                </p>
              )}
              {targeting.demographics.workEmployers && targeting.demographics.workEmployers.length > 0 && (
                <p className="text-sm">
                  Employers: {targeting.demographics.workEmployers.join(", ")}
                </p>
              )}
              {targeting.demographics.workPositions && targeting.demographics.workPositions.length > 0 && (
                <p className="text-sm">
                  Positions: {targeting.demographics.workPositions.join(", ")}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Behaviors */}
        {targeting.behaviors && targeting.behaviors.length > 0 && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Behaviors</label>
            <div className="flex flex-wrap gap-1 mt-1">
              {targeting.behaviors.map((behavior) => (
                <Badge key={behavior} variant="outline" className="text-xs">
                  {behavior}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Custom Audiences */}
        {targeting.customAudiences && targeting.customAudiences.length > 0 && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Custom Audiences</label>
            <div className="flex flex-wrap gap-1 mt-1">
              {targeting.customAudiences.map((audience) => (
                <Badge key={audience} variant="secondary" className="text-xs">
                  {audience}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Lookalike Audiences */}
        {targeting.lookalikeAudiences && targeting.lookalikeAudiences.length > 0 && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Lookalike Audiences</label>
            <div className="flex flex-wrap gap-1 mt-1">
              {targeting.lookalikeAudiences.map((audience) => (
                <Badge key={audience} variant="secondary" className="text-xs">
                  {audience}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
