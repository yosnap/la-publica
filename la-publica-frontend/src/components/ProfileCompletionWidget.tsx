import { CheckCircle, Circle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUser";

interface ProfileItem {
  id: string;
  label: string;
  completed: boolean;
  maxItems?: number;
  currentItems?: number;
}

export function ProfileCompletionWidget() {
  const { user } = useUserProfile();

  if (!user) return null;

  const profileItems: ProfileItem[] = [
    {
      id: 'general',
      label: 'General Information',
      completed: !!(user.firstName && user.lastName && user.email && user.username && user.bio && user.location),
      maxItems: 6,
      currentItems: [user.firstName, user.lastName, user.email, user.username, user.bio, user.location].filter(Boolean).length
    },
    {
      id: 'experience',
      label: 'Work Experience',
      completed: !!(user.workExperience && user.workExperience.length > 0),
      maxItems: 3,
      currentItems: Math.min(user.workExperience?.length || 0, 3)
    },
    {
      id: 'profile',
      label: 'Profile Photo',
      completed: !!user.profilePicture,
      maxItems: 1,
      currentItems: user.profilePicture ? 1 : 0
    },
    {
      id: 'cover',
      label: 'Cover Photo',
      completed: !!user.coverPhoto,
      maxItems: 1,
      currentItems: user.coverPhoto ? 1 : 0
    }
  ];

  const completedItems = profileItems.filter(item => item.completed).length;
  const totalItems = profileItems.length;
  const completionPercentage = Math.round((completedItems / totalItems) * 100);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Complete Your Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress circle */}
        <div className="flex flex-col items-center space-y-2">
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="stroke-gray-200"
                fill="none"
                strokeWidth="3"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="stroke-green-500"
                fill="none"
                strokeWidth="3"
                strokeDasharray={`${completionPercentage}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-gray-900">
                {completionPercentage}
                <span className="text-sm text-gray-500">%</span>
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600">Complete</p>
        </div>

        {/* Progress items */}
        <div className="space-y-3">
          {profileItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {item.completed ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Circle className="h-4 w-4 text-gray-400" />
                )}
                <span className={`text-sm ${item.completed ? 'text-gray-900' : 'text-gray-600'}`}>
                  {item.label}
                </span>
              </div>
              <span className="text-sm font-medium text-green-600">
                {item.currentItems}/{item.maxItems}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}