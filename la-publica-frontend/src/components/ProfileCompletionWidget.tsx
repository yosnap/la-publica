import { CheckCircle, Circle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUser";

export function ProfileCompletionWidget() {
  const { user } = useUserProfile();
  const navigate = useNavigate();

  if (!user) return null;

  const profileSteps = [
    {
      label: "Informació general",
      complete: [user?.firstName, user?.lastName, user?.email, user?.bio, user?.gender, user?.birthDate].filter(Boolean).length >= 5,
      total: 6,
      done: [user?.firstName, user?.lastName, user?.email, user?.bio, user?.gender, user?.birthDate].filter(Boolean).length,
    },
    {
      label: "Experiència laboral",
      complete: Boolean(user?.workExperience && user?.workExperience.length > 0),
      total: 3,
      done: user?.workExperience ? Math.min(user?.workExperience.length, 3) : 0,
    },
    {
      label: "Foto de perfil",
      complete: Boolean(user?.profilePicture),
      total: 1,
      done: user?.profilePicture ? 1 : 0,
    },
    {
      label: "Foto de portada",
      complete: Boolean(user?.coverPhoto),
      total: 1,
      done: user?.coverPhoto ? 1 : 0,
    },
    {
      label: "Xarxes socials",
      complete: Boolean(user?.socialLinks && (user?.socialLinks.facebook || user?.socialLinks.twitter || user?.socialLinks.youtube)),
      total: 1,
      done: user?.socialLinks && (user?.socialLinks.facebook || user?.socialLinks.twitter || user?.socialLinks.youtube) ? 1 : 0,
    },
  ];
  const stepsCompleted = profileSteps.filter(s => s.complete).length;
  const stepsTotal = profileSteps.length;
  const percent = Math.round((stepsCompleted / stepsTotal) * 100);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Completa el teu Perfil</CardTitle>
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
                strokeDasharray={`${percent}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-gray-900">
                {percent}
                <span className="text-sm text-gray-500">%</span>
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600">Completat</p>
        </div>
        {/* Progress items */}
        <div className="space-y-3">
          {profileSteps.map((step, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {step.complete ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Circle className="h-4 w-4 text-gray-400" />
                )}
                <span className={`text-sm ${step.complete ? 'text-gray-900' : 'text-gray-600'}`}>
                  {step.label}
                </span>
              </div>
              <span className="text-sm font-medium text-green-600">
                {step.done}/{step.total}
              </span>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full" onClick={() => navigate('/editar-perfil')}>
          Completar Perfil
        </Button>
      </CardContent>
    </Card>
  );
}