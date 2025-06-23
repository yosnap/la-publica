import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Trash2, Pencil, Check, X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Definición de tipo para experiencia laboral
interface Experience {
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  isCurrentJob: boolean;
  description: string;
}

const WorkExperienceSection = () => {
  const { setValue, watch } = useFormContext();
  const allExperiences = watch("workExperience") || [];

  const [newExperience, setNewExperience] = useState({
    jobTitle: "",
    company: "",
    startDate: "",
    endDate: "",
    isCurrentJob: false,
    description: "",
  });

  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editExperience, setEditExperience] = useState<Experience | null>(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewExperience((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddExperience = () => {
    // Add validation before adding
    if (!newExperience.jobTitle || !newExperience.company) {
      // Maybe show an error
      return;
    }
    const updatedExperiences = [...allExperiences, newExperience];
    setValue("workExperience", updatedExperiences, { shouldDirty: true });
    // Reset form
    setNewExperience({
      jobTitle: "",
      company: "",
      startDate: "",
      endDate: "",
      isCurrentJob: false,
      description: "",
    });
  };

  const handleRemoveExperience = (index) => {
    const updatedExperiences = allExperiences.filter((_, i) => i !== index);
    setValue("workExperience", updatedExperiences, { shouldDirty: true });
  };

  const handleEditClick = (index: number) => {
    setEditIndex(index);
    setEditExperience({ ...allExperiences[index] });
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditExperience((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveEdit = () => {
    if (!editExperience.jobTitle || !editExperience.company) return;
    const updatedExperiences = allExperiences.map((exp, i) =>
      i === editIndex ? editExperience : exp
    );
    setValue("workExperience", updatedExperiences, { shouldDirty: true });
    setEditIndex(null);
    setEditExperience(null);
  };

  const handleCancelEdit = () => {
    setEditIndex(null);
    setEditExperience(null);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-800">Experiencia Laboral</h3>
      
      {/* Lista de experiencias en formato Acordeón */}
      <Accordion type="single" collapsible className="w-full">
        {allExperiences.map((exp, index) => (
          <AccordionItem value={`item-${index}`} key={index}>
            <AccordionTrigger>
              <div className="flex justify-between w-full pr-4 items-center">
                <span>{exp.jobTitle} en {exp.company}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEditClick(index); }} className="h-8 w-8">
                    <Pencil className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleRemoveExperience(index); }} className="h-8 w-8">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-2">
              {editIndex === index ? (
                <div className="space-y-2 border p-3 rounded-md bg-gray-50">
                  <div>
                    <Label htmlFor="edit-jobTitle">Cargo</Label>
                    <Input id="edit-jobTitle" name="jobTitle" value={editExperience.jobTitle} onChange={handleEditInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="edit-company">Empresa</Label>
                    <Input id="edit-company" name="company" value={editExperience.company} onChange={handleEditInputChange} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-startDate">Fecha de Inicio</Label>
                      <Input id="edit-startDate" name="startDate" type="date" value={editExperience.startDate} onChange={handleEditInputChange} />
                    </div>
                    <div>
                      <Label htmlFor="edit-endDate">Fecha de Fin</Label>
                      <Input id="edit-endDate" name="endDate" type="date" value={editExperience.endDate} onChange={handleEditInputChange} disabled={editExperience.isCurrentJob} />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="edit-isCurrentJob" name="isCurrentJob" checked={editExperience.isCurrentJob} onCheckedChange={(checked) => handleEditInputChange({ target: { name: 'isCurrentJob', type: 'checkbox', checked } })} />
                    <Label htmlFor="edit-isCurrentJob">Trabajo aquí actualmente</Label>
                  </div>
                  <div>
                    <Label htmlFor="edit-description">Descripción</Label>
                    <Textarea id="edit-description" name="description" value={editExperience.description} onChange={handleEditInputChange} />
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <Button type="button" size="sm" variant="outline" onClick={handleCancelEdit}>
                      <X className="h-4 w-4 mr-1" /> Cancelar
                    </Button>
                    <Button type="button" size="sm" onClick={handleSaveEdit}>
                      <Check className="h-4 w-4 mr-1" /> Guardar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p><strong>Desde:</strong> {exp.startDate}</p>
                  <p><strong>Hasta:</strong> {exp.isCurrentJob ? 'Actualidad' : exp.endDate}</p>
                  <p>{exp.description}</p>
                </>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      
      {/* Formulario para añadir nueva experiencia */}
      <div className="p-4 border border-gray-200 rounded-lg space-y-4">
        <h4 className="font-medium">Añadir Nueva Experiencia</h4>
        
        {/* Formulario de nueva experiencia */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="jobTitle">Cargo</Label>
            <Input id="jobTitle" name="jobTitle" value={newExperience.jobTitle} onChange={handleInputChange} placeholder="Ej: Desarrollador Frontend" />
          </div>
          <div>
            <Label htmlFor="company">Empresa</Label>
            <Input id="company" name="company" value={newExperience.company} onChange={handleInputChange} placeholder="Ej: Google" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Fecha de Inicio</Label>
              <Input id="startDate" name="startDate" type="date" value={newExperience.startDate} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="endDate">Fecha de Fin</Label>
              <Input id="endDate" name="endDate" type="date" value={newExperience.endDate} onChange={handleInputChange} disabled={newExperience.isCurrentJob} />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="isCurrentJob" name="isCurrentJob" checked={newExperience.isCurrentJob} onCheckedChange={(checked) => handleInputChange({ target: { name: 'isCurrentJob', type: 'checkbox', checked } })} />
            <Label htmlFor="isCurrentJob">Trabajo aquí actualmente</Label>
          </div>
          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" name="description" value={newExperience.description} onChange={handleInputChange} placeholder="Describe tus responsabilidades..." />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="button" onClick={handleAddExperience}>Añadir</Button>
        </div>
      </div>
    </div>
  );
};

export default WorkExperienceSection;