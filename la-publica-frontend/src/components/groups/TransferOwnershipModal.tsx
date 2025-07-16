import { useState } from "react";
import { Crown, AlertTriangle, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { getImageUrl } from "@/utils/getImageUrl";
import type { Group } from "@/api/groups";

interface TransferOwnershipModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group;
  onTransfer: (newOwnerId: string) => Promise<void>;
}

export const TransferOwnershipModal = ({
  open,
  onOpenChange,
  group,
  onTransfer
}: TransferOwnershipModalProps) => {
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [confirmationChecked, setConfirmationChecked] = useState(false);
  const [transferring, setTransferring] = useState(false);

   // Solo admins pueden recibir la propiedad
  const eligibleMembers = group.members.filter(member => 
    member.role === 'admin' && member.user._id !== group.creator._id
  );

  const selectedMember = eligibleMembers.find(member => member.user._id === selectedMemberId);

  const handleTransfer = async () => {
    if (!selectedMemberId || !confirmationChecked) return;

    try {
      setTransferring(true);
      await onTransfer(selectedMemberId);
      
       // Reset and close
      setSelectedMemberId("");
      setConfirmationChecked(false);
      onOpenChange(false);
    } catch (error) {
       // Error handling is done in parent component
    } finally {
      setTransferring(false);
    }
  };

  const handleClose = () => {
    setSelectedMemberId("");
    setConfirmationChecked(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            <span>Transferir Propiedad del Grupo</span>
          </DialogTitle>
          <DialogDescription>
            Esta acción transferirá completamente la propiedad del grupo a otro administrador.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          { /* Warning */}
          <div className="flex items-start space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">¡Atención! Esta acción es irreversible</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Perderás el control total del grupo</li>
                <li>El nuevo propietario podrá removerte como admin</li>
                <li>Solo podrás recuperar la propiedad si el nuevo dueño te la transfiere</li>
              </ul>
            </div>
          </div>

          { /* Current owner */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Propietario actual
            </label>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Avatar className="h-10 w-10">
                <AvatarImage src={getImageUrl(group.creator.profilePicture)} />
                <AvatarFallback>
                  {group.creator.firstName[0]}{group.creator.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-gray-900">
                  {group.creator.firstName} {group.creator.lastName}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-yellow-100 text-yellow-800">Fundador</Badge>
                  <Badge className="bg-yellow-100 text-yellow-800">Admin</Badge>
                </div>
              </div>
            </div>
          </div>

          { /* Select new owner */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Nuevo propietario
            </label>
            
            {eligibleMembers.length === 0 ? (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <p className="text-sm text-gray-600">
                  No hay administradores disponibles para recibir la propiedad.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Primero asigna el rol de administrador a un miembro.
                </p>
              </div>
            ) : (
              <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar nuevo propietario" />
                </SelectTrigger>
                <SelectContent>
                  {eligibleMembers.map((member) => (
                    <SelectItem key={member.user._id} value={member.user._id}>
                      <div className="flex items-center space-x-3 w-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={getImageUrl(member.user.profilePicture)} />
                          <AvatarFallback>
                            {member.user.firstName[0]}{member.user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {member.user.firstName} {member.user.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            Administrador desde {new Date(member.joinedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          { /* Preview transfer */}
          {selectedMember && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-center space-x-4 mb-3">
                <div className="text-center">
                  <Avatar className="h-12 w-12 mx-auto mb-2">
                    <AvatarImage src={getImageUrl(group.creator.profilePicture)} />
                    <AvatarFallback>
                      {group.creator.firstName[0]}{group.creator.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm font-medium">Tú</div>
                  <Badge variant="outline" className="text-xs">Admin</Badge>
                </div>
                
                <ArrowRight className="h-6 w-6 text-blue-500" />
                
                <div className="text-center">
                  <Avatar className="h-12 w-12 mx-auto mb-2">
                    <AvatarImage src={getImageUrl(selectedMember.user.profilePicture)} />
                    <AvatarFallback>
                      {selectedMember.user.firstName[0]}{selectedMember.user.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm font-medium">
                    {selectedMember.user.firstName} {selectedMember.user.lastName}
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">Propietario</Badge>
                </div>
              </div>
              <p className="text-xs text-blue-700 text-center">
                {selectedMember.user.firstName} se convertirá en el nuevo propietario del grupo
              </p>
            </div>
          )}

          { /* Confirmation checkbox */}
          {selectedMember && (
            <div className="flex items-start space-x-3">
              <Checkbox
                id="confirm-transfer"
                checked={confirmationChecked}
                onCheckedChange={setConfirmationChecked}
              />
              <label 
                htmlFor="confirm-transfer" 
                className="text-sm text-gray-700 leading-relaxed cursor-pointer"
              >
                Entiendo que esta acción es irreversible y que{" "}
                <strong>{selectedMember.user.firstName} {selectedMember.user.lastName}</strong>{" "}
                tendrá control total sobre el grupo, incluyendo la capacidad de removerme como administrador.
              </label>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={!selectedMemberId || !confirmationChecked || transferring || eligibleMembers.length === 0}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            {transferring ? "Transfiriendo..." : "Transferir Propiedad"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};