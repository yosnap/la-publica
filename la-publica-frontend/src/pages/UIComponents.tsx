import { useState } from "react";
import { Moon, Sun, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { toast } from "sonner";

interface ComponentShowcaseProps {
  title: string;
  description: string;
  children: React.ReactNode;
  code?: string;
}

const ComponentShowcase = ({ title, description, children, code }: ComponentShowcaseProps) => {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center">
            {children}
          </div>
        </CardContent>
        {code && (
          <CardFooter className="bg-gray-50 dark:bg-gray-800/50 border-t">
            <div className="w-full flex justify-between items-start gap-4">
              <pre className="flex-1 text-xs overflow-x-auto">
                <code className="text-gray-700 dark:text-gray-300">{code}</code>
              </pre>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyCode}
                className="flex-shrink-0"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

const UIComponents = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen bg-white dark:bg-gray-950 ${darkMode ? 'dark' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Components UI
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Biblioteca de components de la plataforma La Pública
            </p>
          </div>
          <Button
            onClick={toggleDarkMode}
            variant="outline"
            size="icon"
            className="rounded-full"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>

        <div className="space-y-12">
          {/* Buttons Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Botons</h2>

            <ComponentShowcase
              title="Button - Variants"
              description="Diferents variants de botons disponibles"
              code='<Button variant="default">Default</Button>\n<Button variant="secondary">Secondary</Button>\n<Button variant="destructive">Destructive</Button>\n<Button variant="outline">Outline</Button>\n<Button variant="ghost">Ghost</Button>\n<Button variant="link">Link</Button>'
            >
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </ComponentShowcase>

            <ComponentShowcase
              title="Button - Sizes"
              description="Diferents mides de botons"
              code='<Button size="sm">Small</Button>\n<Button size="default">Default</Button>\n<Button size="lg">Large</Button>\n<Button size="icon">Icon</Button>'
            >
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon">
                <Sun className="h-4 w-4" />
              </Button>
            </ComponentShowcase>
          </section>

          {/* Form Inputs Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Formularis</h2>

            <ComponentShowcase
              title="Input"
              description="Camp d'entrada de text"
              code='<Input type="email" placeholder="Email" />'
            >
              <div className="w-full max-w-sm space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input type="email" id="email" placeholder="email@example.com" />
              </div>
            </ComponentShowcase>

            <ComponentShowcase
              title="Textarea"
              description="Àrea de text multilínia"
              code='<Textarea placeholder="Escriu el teu missatge aquí..." />'
            >
              <div className="w-full max-w-sm space-y-2">
                <Label htmlFor="message">Missatge</Label>
                <Textarea id="message" placeholder="Escriu el teu missatge aquí..." />
              </div>
            </ComponentShowcase>

            <ComponentShowcase
              title="Select"
              description="Selector desplegable"
              code='<Select>\n  <SelectTrigger>\n    <SelectValue placeholder="Selecciona una opció" />\n  </SelectTrigger>\n  <SelectContent>\n    <SelectItem value="1">Opció 1</SelectItem>\n    <SelectItem value="2">Opció 2</SelectItem>\n  </SelectContent>\n</Select>'
            >
              <div className="w-full max-w-sm space-y-2">
                <Label>Selector</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una opció" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Opció 1</SelectItem>
                    <SelectItem value="2">Opció 2</SelectItem>
                    <SelectItem value="3">Opció 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </ComponentShowcase>

            <ComponentShowcase
              title="Checkbox"
              description="Casella de verificació"
              code='<div className="flex items-center space-x-2">\n  <Checkbox id="terms" />\n  <label htmlFor="terms">Accepto els termes i condicions</label>\n</div>'
            >
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" />
                <label htmlFor="terms" className="text-sm text-gray-700 dark:text-gray-300">
                  Accepto els termes i condicions
                </label>
              </div>
            </ComponentShowcase>

            <ComponentShowcase
              title="Radio Group"
              description="Grup de botons de ràdio"
              code='<RadioGroup defaultValue="option-1">\n  <div className="flex items-center space-x-2">\n    <RadioGroupItem value="option-1" id="option-1" />\n    <Label htmlFor="option-1">Opció 1</Label>\n  </div>\n</RadioGroup>'
            >
              <RadioGroup defaultValue="option-1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="option-1" id="option-1" />
                  <Label htmlFor="option-1">Opció 1</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="option-2" id="option-2" />
                  <Label htmlFor="option-2">Opció 2</Label>
                </div>
              </RadioGroup>
            </ComponentShowcase>

            <ComponentShowcase
              title="Switch"
              description="Interruptor de alternança"
              code='<div className="flex items-center space-x-2">\n  <Switch id="airplane-mode" />\n  <Label htmlFor="airplane-mode">Mode avió</Label>\n</div>'
            >
              <div className="flex items-center space-x-2">
                <Switch id="airplane-mode" />
                <Label htmlFor="airplane-mode">Mode avió</Label>
              </div>
            </ComponentShowcase>

            <ComponentShowcase
              title="Slider"
              description="Control lliscant"
              code='<Slider defaultValue={[50]} max={100} step={1} />'
            >
              <div className="w-full max-w-sm space-y-2">
                <Label>Volum</Label>
                <Slider defaultValue={[50]} max={100} step={1} />
              </div>
            </ComponentShowcase>
          </section>

          {/* Display Components */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Components de Visualització</h2>

            <ComponentShowcase
              title="Card"
              description="Targeta de contingut"
              code='<Card>\n  <CardHeader>\n    <CardTitle>Títol de la targeta</CardTitle>\n    <CardDescription>Descripció de la targeta</CardDescription>\n  </CardHeader>\n  <CardContent>Contingut</CardContent>\n</Card>'
            >
              <Card className="w-full max-w-sm">
                <CardHeader>
                  <CardTitle>Títol de la targeta</CardTitle>
                  <CardDescription>Descripció de la targeta</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Aquest és el contingut de la targeta. Aquí pots posar qualsevol cosa.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button>Acció</Button>
                </CardFooter>
              </Card>
            </ComponentShowcase>

            <ComponentShowcase
              title="Badge"
              description="Etiqueta de estat o categoria"
              code='<Badge>Default</Badge>\n<Badge variant="secondary">Secondary</Badge>\n<Badge variant="destructive">Destructive</Badge>\n<Badge variant="outline">Outline</Badge>'
            >
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </ComponentShowcase>

            <ComponentShowcase
              title="Avatar"
              description="Imatge de perfil"
              code='<Avatar>\n  <AvatarImage src="https://github.com/shadcn.png" />\n  <AvatarFallback>CN</AvatarFallback>\n</Avatar>'
            >
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>JP</AvatarFallback>
              </Avatar>
            </ComponentShowcase>

            <ComponentShowcase
              title="Alert"
              description="Missatge d'alerta"
              code={`<Alert>
  <AlertTitle>Títol de l'alerta</AlertTitle>
  <AlertDescription>Descripció de l'alerta</AlertDescription>
</Alert>`}
            >
              <Alert className="w-full">
                <AlertTitle>Informació important</AlertTitle>
                <AlertDescription>
                  Aquest és un missatge d'alerta per informar l'usuari.
                </AlertDescription>
              </Alert>
            </ComponentShowcase>

            <ComponentShowcase
              title="Progress"
              description="Barra de progrés"
              code='<Progress value={66} />'
            >
              <div className="w-full max-w-sm space-y-2">
                <Label>Progrés de càrrega</Label>
                <Progress value={66} />
              </div>
            </ComponentShowcase>

            <ComponentShowcase
              title="Separator"
              description="Línia divisòria"
              code='<div>\n  <p>Contingut superior</p>\n  <Separator />\n  <p>Contingut inferior</p>\n</div>'
            >
              <div className="w-full max-w-sm space-y-2">
                <p className="text-sm text-gray-700 dark:text-gray-300">Contingut superior</p>
                <Separator />
                <p className="text-sm text-gray-700 dark:text-gray-300">Contingut inferior</p>
              </div>
            </ComponentShowcase>

            <ComponentShowcase
              title="Skeleton"
              description="Placeholder de càrrega"
              code='<div className="space-y-2">\n  <Skeleton className="h-4 w-full" />\n  <Skeleton className="h-4 w-3/4" />\n</div>'
            >
              <div className="w-full max-w-sm space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </ComponentShowcase>
          </section>

          {/* Navigation Components */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Navegació</h2>

            <ComponentShowcase
              title="Tabs"
              description="Pestanyes de navegació"
              code='<Tabs defaultValue="tab1">\n  <TabsList>\n    <TabsTrigger value="tab1">Pestanya 1</TabsTrigger>\n    <TabsTrigger value="tab2">Pestanya 2</TabsTrigger>\n  </TabsList>\n  <TabsContent value="tab1">Contingut 1</TabsContent>\n</Tabs>'
            >
              <Tabs defaultValue="tab1" className="w-full max-w-sm">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="tab1">Pestanya 1</TabsTrigger>
                  <TabsTrigger value="tab2">Pestanya 2</TabsTrigger>
                  <TabsTrigger value="tab3">Pestanya 3</TabsTrigger>
                </TabsList>
                <TabsContent value="tab1">
                  <p className="text-sm text-gray-700 dark:text-gray-300">Contingut de la pestanya 1</p>
                </TabsContent>
                <TabsContent value="tab2">
                  <p className="text-sm text-gray-700 dark:text-gray-300">Contingut de la pestanya 2</p>
                </TabsContent>
                <TabsContent value="tab3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">Contingut de la pestanya 3</p>
                </TabsContent>
              </Tabs>
            </ComponentShowcase>

            <ComponentShowcase
              title="Breadcrumb"
              description="Ruta de navegació"
              code='<Breadcrumb>\n  <BreadcrumbList>\n    <BreadcrumbItem>\n      <BreadcrumbLink href="/">Inici</BreadcrumbLink>\n    </BreadcrumbItem>\n    <BreadcrumbSeparator />\n    <BreadcrumbItem>\n      <BreadcrumbPage>Pàgina actual</BreadcrumbPage>\n    </BreadcrumbItem>\n  </BreadcrumbList>\n</Breadcrumb>'
            >
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/">Inici</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/docs">Documentació</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Components</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </ComponentShowcase>

            <ComponentShowcase
              title="Accordion"
              description="Panell desplegable"
              code='<Accordion type="single" collapsible>\n  <AccordionItem value="item-1">\n    <AccordionTrigger>Pregunta 1</AccordionTrigger>\n    <AccordionContent>Resposta 1</AccordionContent>\n  </AccordionItem>\n</Accordion>'
            >
              <Accordion type="single" collapsible className="w-full max-w-sm">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Què és La Pública?</AccordionTrigger>
                  <AccordionContent>
                    La Pública és una xarxa social empresarial per connectar professionals.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Com puc registrar-me?</AccordionTrigger>
                  <AccordionContent>
                    Pots registrar-te fent clic al botó de registre a la pàgina principal.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </ComponentShowcase>
          </section>

          {/* Overlays */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Overlays i Diàlegs</h2>

            <ComponentShowcase
              title="Dialog"
              description="Finestra modal"
              code='<Dialog>\n  <DialogTrigger asChild>\n    <Button>Obrir diàleg</Button>\n  </DialogTrigger>\n  <DialogContent>\n    <DialogHeader>\n      <DialogTitle>Títol del diàleg</DialogTitle>\n      <DialogDescription>Descripció del diàleg</DialogDescription>\n    </DialogHeader>\n  </DialogContent>\n</Dialog>'
            >
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Obrir diàleg</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Títol del diàleg</DialogTitle>
                    <DialogDescription>
                      Aquesta és la descripció del diàleg modal.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button>Acceptar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </ComponentShowcase>

            <ComponentShowcase
              title="Alert Dialog"
              description="Diàleg de confirmació"
              code='<AlertDialog>\n  <AlertDialogTrigger asChild>\n    <Button variant="destructive">Eliminar</Button>\n  </AlertDialogTrigger>\n  <AlertDialogContent>\n    <AlertDialogHeader>\n      <AlertDialogTitle>Estàs segur?</AlertDialogTitle>\n      <AlertDialogDescription>Aquesta acció no es pot desfer.</AlertDialogDescription>\n    </AlertDialogHeader>\n    <AlertDialogFooter>\n      <AlertDialogCancel>Cancel·lar</AlertDialogCancel>\n      <AlertDialogAction>Continuar</AlertDialogAction>\n    </AlertDialogFooter>\n  </AlertDialogContent>\n</AlertDialog>'
            >
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Eliminar</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Estàs absolutament segur?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Aquesta acció no es pot desfer. Això eliminarà permanentment el teu compte.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel·lar</AlertDialogCancel>
                    <AlertDialogAction>Continuar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </ComponentShowcase>

            <ComponentShowcase
              title="Sheet"
              description="Panell lateral lliscant"
              code='<Sheet>\n  <SheetTrigger asChild>\n    <Button>Obrir panell</Button>\n  </SheetTrigger>\n  <SheetContent>\n    <SheetHeader>\n      <SheetTitle>Títol del panell</SheetTitle>\n      <SheetDescription>Descripció del panell</SheetDescription>\n    </SheetHeader>\n  </SheetContent>\n</Sheet>'
            >
              <Sheet>
                <SheetTrigger asChild>
                  <Button>Obrir panell lateral</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Configuració</SheetTitle>
                    <SheetDescription>
                      Configura les teves preferències aquí.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="py-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Notificacions</Label>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Mode fosc</Label>
                      <Switch />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </ComponentShowcase>

            <ComponentShowcase
              title="Popover"
              description="Finestra emergent"
              code='<Popover>\n  <PopoverTrigger asChild>\n    <Button variant="outline">Obrir popover</Button>\n  </PopoverTrigger>\n  <PopoverContent>\n    <p>Contingut del popover</p>\n  </PopoverContent>\n</Popover>'
            >
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">Obrir popover</Button>
                </PopoverTrigger>
                <PopoverContent>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Dimensions</h4>
                    <p className="text-sm text-muted-foreground">
                      Ajusta les dimensions aquí.
                    </p>
                    <div className="grid gap-2">
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="width">Amplada</Label>
                        <Input id="width" defaultValue="100%" className="col-span-2 h-8" />
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </ComponentShowcase>

            <ComponentShowcase
              title="Tooltip"
              description="Consell emergent"
              code='<TooltipProvider>\n  <Tooltip>\n    <TooltipTrigger asChild>\n      <Button variant="outline">Passa per sobre</Button>\n    </TooltipTrigger>\n    <TooltipContent>\n      <p>Informació addicional</p>\n    </TooltipContent>\n  </Tooltip>\n</TooltipProvider>'
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline">Passa el ratolí per sobre</Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Aquesta és informació addicional</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </ComponentShowcase>

            <ComponentShowcase
              title="Hover Card"
              description="Targeta emergent en hover"
              code={`<HoverCard>
  <HoverCardTrigger asChild>
    <Button variant="link">@username</Button>
  </HoverCardTrigger>
  <HoverCardContent>
    <div className="space-y-2">
      <h4 className="text-sm font-semibold">@username</h4>
      <p className="text-sm">Informació de l'usuari</p>
    </div>
  </HoverCardContent>
</HoverCard>`}
            >
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="link">@lapublica</Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="flex justify-between space-x-4">
                    <Avatar>
                      <AvatarFallback>LP</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold">@lapublica</h4>
                      <p className="text-sm">
                        Xarxa social empresarial per connectar professionals.
                      </p>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </ComponentShowcase>

            <ComponentShowcase
              title="Calendar"
              description="Selector de data"
              code='<Calendar mode="single" selected={date} onSelect={setDate} />'
            >
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </ComponentShowcase>
          </section>

          {/* Data Display */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Visualització de Dades</h2>

            <ComponentShowcase
              title="Table"
              description="Taula de dades"
              code='<Table>\n  <TableHeader>\n    <TableRow>\n      <TableHead>Nom</TableHead>\n      <TableHead>Email</TableHead>\n    </TableRow>\n  </TableHeader>\n  <TableBody>\n    <TableRow>\n      <TableCell>John Doe</TableCell>\n      <TableCell>john@example.com</TableCell>\n    </TableRow>\n  </TableBody>\n</Table>'
            >
              <div className="w-full rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rol</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Maria Garcia</TableCell>
                      <TableCell>maria@example.com</TableCell>
                      <TableCell>
                        <Badge>Admin</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Joan Martínez</TableCell>
                      <TableCell>joan@example.com</TableCell>
                      <TableCell>
                        <Badge variant="secondary">User</Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </ComponentShowcase>
          </section>

          {/* Feedback */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Feedback</h2>

            <ComponentShowcase
              title="Toast"
              description="Notificació temporal"
              code={`import { toast } from "sonner";

toast("Missatge enviat!", {
  description: "El teu missatge s'ha enviat correctament.",
});`}
            >
              <Button
                onClick={() =>
                  toast("Missatge enviat!", {
                    description: "El teu missatge s'ha enviat correctament.",
                  })
                }
              >
                Mostrar notificació
              </Button>
            </ComponentShowcase>
          </section>
        </div>
      </div>
    </div>
  );
};

export default UIComponents;
