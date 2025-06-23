import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const SocialLinksSection = () => {
  const { control } = useFormContext();

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-800">Redes Sociales</h3>
      <FormField
        control={control}
        name="facebook"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Facebook</FormLabel>
            <FormControl>
              <Input placeholder="URL de tu perfil de Facebook" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="twitter"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Twitter</FormLabel>
            <FormControl>
              <Input placeholder="URL de tu perfil de Twitter" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="youtube"
        render={({ field }) => (
          <FormItem>
            <FormLabel>YouTube</FormLabel>
            <FormControl>
              <Input placeholder="URL de tu canal de YouTube" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default SocialLinksSection;