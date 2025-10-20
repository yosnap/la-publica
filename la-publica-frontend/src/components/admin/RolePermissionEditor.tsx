import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Search, CheckCircle2, XCircle } from 'lucide-react';

interface Permission {
  _id: string;
  resource: string;
  resourceGroup: string;
  label: string;
  description: string;
  availableActions: Array<{
    action: string;
    label: string;
    description: string;
  }>;
}

interface ResourcePermission {
  resource: string;
  actions: {
    create?: boolean;
    read?: boolean;
    update?: boolean;
    delete?: boolean;
    publish?: boolean;
    moderate?: boolean;
    export?: boolean;
    import?: boolean;
    approve?: boolean;
  };
  scope: 'none' | 'own' | 'department' | 'all';
}

interface RolePermissionEditorProps {
  availablePermissions: Permission[];
  currentPermissions: ResourcePermission[];
  onChange: (permissions: ResourcePermission[]) => void;
}

const groupColors: Record<string, string> = {
  content: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  business: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  users: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  system: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const groupLabels: Record<string, string> = {
  content: 'Gestió de Contingut',
  business: 'Gestió Empresarial',
  users: 'Gestió d\'Usuaris',
  system: 'Configuració del Sistema',
  admin: 'Administració',
};

const scopeLabels: Record<string, string> = {
  none: 'Cap',
  own: 'Propis',
  department: 'Departament',
  all: 'Tots',
};

const scopeDescriptions: Record<string, string> = {
  none: 'No té accés a aquest recurs',
  own: 'Només els seus propis recursos',
  department: 'Recursos del seu departament',
  all: 'Tots els recursos del sistema',
};

export const RolePermissionEditor: React.FC<RolePermissionEditorProps> = ({
  availablePermissions,
  currentPermissions,
  onChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [permissions, setPermissions] = useState<ResourcePermission[]>(currentPermissions);

  useEffect(() => {
    setPermissions(currentPermissions);
  }, [currentPermissions]);

  // Agrupar permisos por resourceGroup
  const groupedPermissions = availablePermissions.reduce((acc, perm) => {
    if (!acc[perm.resourceGroup]) {
      acc[perm.resourceGroup] = [];
    }
    acc[perm.resourceGroup].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  // Filtrar por término de búsqueda
  const filteredGroups = Object.entries(groupedPermissions).reduce((acc, [group, perms]) => {
    const filtered = perms.filter(
      (p) =>
        p.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.resource.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[group] = filtered;
    }
    return acc;
  }, {} as Record<string, Permission[]>);

  const getPermissionForResource = (resource: string): ResourcePermission | undefined => {
    return permissions.find((p) => p.resource === resource);
  };

  const updatePermission = (resource: string, updates: Partial<ResourcePermission>) => {
    const updatedPermissions = [...permissions];
    const existingIndex = updatedPermissions.findIndex((p) => p.resource === resource);

    if (existingIndex >= 0) {
      updatedPermissions[existingIndex] = {
        ...updatedPermissions[existingIndex],
        ...updates,
      };
    } else {
      // Crear nuevo permiso si no existe
      updatedPermissions.push({
        resource,
        actions: {},
        scope: 'none',
        ...updates,
      });
    }

    setPermissions(updatedPermissions);
    onChange(updatedPermissions);
  };

  const toggleAction = (resource: string, action: string) => {
    const permission = getPermissionForResource(resource);
    const currentActions = permission?.actions || {};
    const newValue = !currentActions[action as keyof typeof currentActions];

    updatePermission(resource, {
      actions: {
        ...currentActions,
        [action]: newValue,
      },
    });
  };

  const updateScope = (resource: string, scope: 'none' | 'own' | 'department' | 'all') => {
    updatePermission(resource, { scope });
  };

  const hasAnyAction = (resource: string): boolean => {
    const permission = getPermissionForResource(resource);
    if (!permission) return false;
    return Object.values(permission.actions).some((v) => v === true);
  };

  return (
    <div className="space-y-4">
      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Cerca recursos, accions o grups..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-center">
              {permissions.filter((p) => Object.values(p.actions).some((v) => v)).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 text-center mt-1">
              Recursos amb permisos
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-center">
              {permissions.filter((p) => p.scope === 'all').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 text-center mt-1">
              Accés complet
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-center">
              {permissions.filter((p) => p.scope === 'own').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 text-center mt-1">
              Només propis
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-center">
              {permissions.reduce(
                (acc, p) => acc + Object.values(p.actions).filter((v) => v).length,
                0
              )}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 text-center mt-1">
              Accions totals
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Editor de permisos por grupo */}
      <Accordion type="multiple" className="w-full" defaultValue={Object.keys(filteredGroups)}>
        {Object.entries(filteredGroups).map(([group, perms]) => (
          <AccordionItem key={group} value={group}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Badge className={groupColors[group]}>{groupLabels[group] || group}</Badge>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  ({perms.filter((p) => hasAnyAction(p.resource)).length}/{perms.length})
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-4">
                {perms.map((perm) => {
                  const resourcePerm = getPermissionForResource(perm.resource);
                  const hasActions = hasAnyAction(perm.resource);

                  return (
                    <Card key={perm._id} className={hasActions ? 'border-primary' : ''}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base flex items-center gap-2">
                              {perm.label}
                              {hasActions ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-gray-400" />
                              )}
                            </CardTitle>
                            <CardDescription className="text-sm mt-1">
                              {perm.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Selector de Scope */}
                        <div className="space-y-2">
                          <Label htmlFor={`scope-${perm.resource}`}>Àmbit d'accés</Label>
                          <Select
                            value={resourcePerm?.scope || 'none'}
                            onValueChange={(value) =>
                              updateScope(
                                perm.resource,
                                value as 'none' | 'own' | 'department' | 'all'
                              )
                            }
                          >
                            <SelectTrigger id={`scope-${perm.resource}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(scopeLabels).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  <div>
                                    <div className="font-medium">{label}</div>
                                    <div className="text-xs text-gray-500">
                                      {scopeDescriptions[value]}
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Acciones */}
                        <div className="space-y-2">
                          <Label>Accions permeses</Label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {perm.availableActions.map((action) => (
                              <div
                                key={action.action}
                                className="flex items-center space-x-2 p-2 rounded-md border hover:bg-gray-50 dark:hover:bg-gray-800"
                              >
                                <Switch
                                  id={`${perm.resource}-${action.action}`}
                                  checked={
                                    resourcePerm?.actions[
                                      action.action as keyof typeof resourcePerm.actions
                                    ] || false
                                  }
                                  onCheckedChange={() => toggleAction(perm.resource, action.action)}
                                />
                                <Label
                                  htmlFor={`${perm.resource}-${action.action}`}
                                  className="cursor-pointer flex-1"
                                >
                                  <div className="font-medium text-sm">{action.label}</div>
                                  <div className="text-xs text-gray-500">{action.description}</div>
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {Object.keys(filteredGroups).length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No s'han trobat recursos que coincideixin amb la cerca.
        </div>
      )}
    </div>
  );
};
