import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, FormItem, FormControl, FormMessage, FormLabel, FormDescription } from '@/components/ui/form';
import { useFormContext, Controller } from "react-hook-form";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import es from 'react-phone-number-input/locale/es.json';
import { SkillsSection } from "./SkillsSection";

interface GeneralInformationSectionProps {
  skills: string[];
  setSkills: React.Dispatch<React.SetStateAction<string[]>>;
}

const GeneralInformationSection = ({ skills, setSkills }: GeneralInformationSectionProps) => {
  const { control, watch } = useFormContext();
  // Log para depuración de los valores actuales
  console.log('Valores actuales:', watch('birthDay'), watch('birthMonth'), watch('birthYear'));
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre (requerido)</FormLabel>
              <FormControl><Input placeholder="Tu nombre" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Apellido (requerido)</FormLabel>
              <FormControl><Input placeholder="Tu apellido" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="username"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Apodo (requerido)</FormLabel>
            <FormControl><Input placeholder="Tu apodo" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div>
        <FormLabel>Fecha de Nacimiento (requerido)</FormLabel>
        <div className="grid grid-cols-3 gap-4 mt-2">
          <FormField
            control={control}
            name="birthDay"
            render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Día" /></SelectTrigger></FormControl>
                  <SelectContent>{Array.from({length: 31}, (_, i) => <SelectItem key={i+1} value={String(i+1)}>{i+1}</SelectItem>)}</SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="birthMonth"
            render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Mes" /></SelectTrigger></FormControl>
                  <SelectContent>{[
                    { value: '1', label: 'Enero' }, { value: '2', label: 'Febrero' },
                    { value: '3', label: 'Marzo' }, { value: '4', label: 'Abril' },
                    { value: '5', label: 'Mayo' }, { value: '6', label: 'Junio' },
                    { value: '7', label: 'Julio' }, { value: '8', label: 'Agosto' },
                    { value: '9', label: 'Septiembre' }, { value: '10', label: 'Octubre' },
                    { value: '11', label: 'Noviembre' }, { value: '12', label: 'Diciembre' }
                  ].map((month) => <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>)}</SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="birthYear"
            render={({ field }) => (
              <FormItem>
                 <FormControl>
                    <Input type="number" placeholder="Año" {...field} />
                  </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>
      
      <FormField
        control={control}
        name="gender"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Género (requerido)</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Selecciona tu género" /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="male">Masculino</SelectItem>
                <SelectItem value="female">Femenino</SelectItem>
                <SelectItem value="other">Otro</SelectItem>
                <SelectItem value="prefer_not_to_say">Prefiero no decirlo</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Teléfono</FormLabel>
            <FormControl>
              <div className="flex items-center h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <Controller
                  name="phone"
                  control={control}
                  render={({ field: controllerField }) => (
                    <PhoneInput
                      {...controllerField}
                      labels={es}
                      international
                      defaultCountry="ES"
                      countryCallingCodeEditable={false}
                      className="phone-input-custom"
                    />
                  )}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <hr className="my-6" />

      <SkillsSection skills={skills} setSkills={setSkills} />
    </div>
  );
};

export default GeneralInformationSection;