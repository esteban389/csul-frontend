import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ChangeEvent, ReactNode, useState } from 'react';
import { getInitials } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import env from '@/lib/env';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  EmployeeEmailSchema,
  EmployeeNameSchema,
  OptionalEmployeeAvatarSchema,
} from '@/Schemas/UniversitySchema';
import { safeParse } from 'valibot';
import { useAuthorize } from '@/lib/authorizations';
import ErrorText from '@/components/ui/ErrorText';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import useProcesses from '@/app/(app)/procesos/useProcesses';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Employee } from '@/types/employee';
import { Check, CirclePlus, CircleX, LoaderCircle, X } from 'lucide-react';
import { Service } from '@/types/service';
import useUpdateService from './useUpdateEmployee';
import useDeleteEmployee from './useDeleteEmployee';
import useRestoreEmployee from './useRestoreEmployee';
import useServices from '../servicios/useServices';
import useAddServiceToEmployee from './useAddServiceToEmployee';
import useRemoveServiceToEmployee from './useRemoveServiceToEmployee';

export default function EmployeeDetailsSheet({
  employee,
  children,
}: Readonly<{
  employee: Employee;
  children: ReactNode;
}>) {
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex h-full flex-col">
        <EmployeeSheetContent employee={employee} />
      </SheetContent>
    </Sheet>
  );
}

function EmployeeSheetContent({ employee }: Readonly<{ employee: Employee }>) {
  const imgSrc = employee.avatar ? env('API_URL') + employee.avatar : '/';
  const [avatar, setAvatar] = useState<File | null>();
  const [name, setName] = useState(employee.name);
  const [email, setEmail] = useState(employee.email);
  const [process, setProcess] = useState<number>(employee.process_id);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const can = useAuthorize();
  const {
    data: processes,
    isSuccess: isProcessesSuccess,
    isPending: isProcessesPending,
  } = useProcesses({
    deleted_at: 'null',
  });
  const updateMutation = useUpdateService(employee.id, {
    avatar,
    name,
    email,
    process_id: process,
  });

  const deleteMutation = useDeleteEmployee(employee.id);
  const restoreMutation = useRestoreEmployee(employee.id);

  const onUpdate = () => {
    const avatarResult = safeParse(OptionalEmployeeAvatarSchema, avatar);
    const nameResult = safeParse(EmployeeNameSchema, name);
    const emailResult = safeParse(EmployeeEmailSchema, email);
    if (!avatarResult.success || !nameResult.success || !emailResult.success) {
      setErrors({
        avatar: avatarResult.success
          ? undefined
          : avatarResult.issues[0].message,
        name: nameResult.success ? undefined : nameResult.issues[0].message,
        email: emailResult.success ? undefined : emailResult.issues[0].message,
      });
      return;
    }
    toast.promise(updateMutation.mutateAsync(), {
      loading: `Actualizando a ${employee.name}`,
      success: `${employee.name} ha sido actualizado`,
      error: error => {
        if (error instanceof AxiosError) {
          const body = error.response?.data;
          if (body && 'message' in body) {
            return body.message;
          }
          return `Ocurrió un error inesperado: ${error.message}`;
        }
        return `Error al actualizar a ${employee.name}`;
      },
    });
  };

  const onDelete = () => {
    toast.promise(deleteMutation.mutateAsync(), {
      loading: `Eliminando a ${employee.name}`,
      success: `${employee.name} ha sido eliminado`,
      error: error => {
        if (error instanceof AxiosError) {
          const body = error.response?.data;
          if (body && 'message' in body) {
            return body.message;
          }
          return `Ocurrió un error inesperado: ${error.message}`;
        }
        return `Error al eliminar a ${employee.name}`;
      },
    });
  };

  const onRestore = () => {
    toast.promise(restoreMutation.mutateAsync(), {
      loading: `Restaurando a ${employee.name}`,
      success: `${employee.name} ha sido restaurado`,
      error: `Error al restaurar a ${employee.name}`,
    });
  };

  const onAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    const file = files && files[0];
    setAvatar(file);
    const result = safeParse(OptionalEmployeeAvatarSchema, file);
    if (result.success) {
      setErrors({
        ...errors,
        avatar: undefined,
      });
      return;
    }
    setErrors({
      ...errors,
      avatar: result.issues[0].message,
    });
  };

  const onNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setName(value);
    const result = safeParse(EmployeeNameSchema, value);
    if (result.success) {
      setErrors({
        ...errors,
        name: undefined,
      });
      return;
    }
    setErrors({
      ...errors,
      name: result.issues[0].message,
    });
  };

  const onEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setEmail(value);
    const result = safeParse(EmployeeEmailSchema, value);
    if (result.success) {
      setErrors({
        ...errors,
        email: undefined,
      });
      return;
    }
    setErrors({
      ...errors,
      email: result.issues[0].message,
    });
  };

  const onProcessChange = (value: string) => {
    setProcess(Number(value));
    setErrors({
      ...errors,
      parent: undefined,
    });
  };

  return (
    <>
      <SheetTitle>Detalles: {employee.name}</SheetTitle>
      <ScrollArea className="h-full">
        <div className="grow space-y-4 p-4">
          <div className="flex items-center justify-center space-x-4">
            <Avatar>
              <AvatarImage
                src={avatar ? URL.createObjectURL(avatar) : imgSrc}
                alt={employee.name}
              />
              <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
            </Avatar>
            {can('update', 'employee') && (
              <div>
                <Input name="avatar" onChange={onAvatarChange} type="file" />
                {errors?.avatar && <ErrorText>{errors.avatar}</ErrorText>}
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input
              value={name}
              name="name"
              onChange={onNameChange}
              disabled={!can('update', 'employee')}
            />
            {errors?.name && <ErrorText>{errors.name}</ErrorText>}
          </div>
          <div>
            <Label htmlFor="name">Correo electrónico</Label>
            <Input
              value={email}
              name="email"
              onChange={onEmailChange}
              disabled={!can('update', 'employee')}
            />
            {errors?.email && <ErrorText>{errors.email}</ErrorText>}
          </div>
          {isProcessesPending && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-14 w-full" />
            </div>
          )}
          {isProcessesSuccess && (
            <div>
              <Label htmlFor="parent">Proceso padre</Label>
              <Select
                name="parent"
                onValueChange={onProcessChange}
                disabled={!can('update', 'employee')}
                value={process ? String(process) : undefined}>
                <SelectTrigger className="h-fit">
                  <SelectValue placeholder="Asociar con un proceso" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectGroup>
                    {processes.map(process => (
                      <SelectItem value={String(process.id)} key={process.id}>
                        <div className="flex flex-row items-center gap-4">
                          <Avatar>
                            <AvatarImage
                              src={
                                process.icon
                                  ? env('API_URL') + process.icon
                                  : undefined
                              }
                            />
                            <AvatarFallback>
                              {getInitials(process.name)}
                            </AvatarFallback>
                          </Avatar>
                          {process.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors?.parent && <ErrorText>{errors.parent}</ErrorText>}
            </div>
          )}
        </div>
        <Services
          services={employee.services}
          employeeId={employee.id}
          processId={employee.process_id}
        />
      </ScrollArea>
      <SheetFooter>
        {can('delete', 'employee') && (
          <SheetClose asChild>
            {employee.deleted_at ? (
              <Button variant="ghost" onClick={onRestore}>
                Restaurar
              </Button>
            ) : (
              <DeleteProcessAlert name={employee.name} action={onDelete}>
                <Button variant="destructive">Eliminar</Button>
              </DeleteProcessAlert>
            )}
          </SheetClose>
        )}
        {can('update', 'employee') && (
          <SheetClose asChild>
            <Button onClick={onUpdate}>Actualizar</Button>
          </SheetClose>
        )}
      </SheetFooter>
    </>
  );
}

function DeleteProcessAlert({
  children,
  name,
  action,
}: Readonly<{
  children: ReactNode;
  name: string;
  action: () => void;
}>) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar proceso {name}</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que deseas eliminar el proceso {name}?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={action}>Eliminar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function Services({
  services,
  employeeId,
  processId,
}: Readonly<{
  services: Service[] | undefined;
  employeeId: number;
  processId: number;
}>) {
  const [addingService, setAddingService] = useState(false);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const {
    isSuccess,
    isPending,
    data: allServices,
  } = useServices(
    { deleted_at: 'null', process_id: processId },
    {
      select: data =>
        data.filter(service => !services?.some(s => s.id === service.id)),
    },
  );

  const addServiceMutation = useAddServiceToEmployee({
    employeeId,
    serviceId: selectedService as number,
  });

  if (!processId) {
    return null;
  }

  const onAddService = () => {
    if (!selectedService) {
      return;
    }
    toast.promise(addServiceMutation.mutateAsync(), {
      loading: 'Agregando servicio',
      success: () => {
        setAddingService(false);
        return 'Servicio agregado';
      },
      error: 'Error al agregar servicio',
    });
  };

  return (
    <div className="p-4">
      <Label>Servicios</Label>
      {services && services.length > 0 && (
        <ul className="w-full space-y-4">
          {services.map(service => (
            <ServiceItem
              key={service.id}
              service={service}
              employeeId={employeeId}
            />
          ))}
        </ul>
      )}
      {addingService ? (
        <div className="mt-4 flex h-fit w-full flex-col md:flex-row">
          {isPending && <Skeleton className="h-4 w-24" />}
          {isSuccess && allServices && (
            <>
              <Select
                onValueChange={value => setSelectedService(Number(value))}>
                <SelectTrigger className="h-fit max-w-[60%]">
                  <SelectValue placeholder="Seleccionar servicio" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectGroup>
                    {allServices.map(service => (
                      <SelectItem key={service.id} value={String(service.id)}>
                        <div className="flex flex-row items-center gap-4 truncate">
                          <Avatar>
                            <AvatarImage
                              src={
                                service.icon
                                  ? env('API_URL') + service.icon
                                  : undefined
                              }
                            />
                            <AvatarFallback>
                              {getInitials(service.name)}
                            </AvatarFallback>
                          </Avatar>
                          {service.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <div className="mt-4 flex w-full flex-row items-center justify-center gap-2 md:mt-0">
                <Button
                  variant="default"
                  className="bg-emerald-600 hover:bg-emerald-800"
                  onClick={() => onAddService()}>
                  <Check />
                </Button>
                <Button
                  variant="default"
                  className="bg-red-600 hover:bg-red-800"
                  onClick={() => setAddingService(false)}>
                  <X />
                </Button>
              </div>
            </>
          )}
        </div>
      ) : (
        <Button
          variant="ghost"
          className="mt-4 w-full"
          onClick={() => setAddingService(true)}>
          <CirclePlus /> Agregar servicio
        </Button>
      )}
    </div>
  );
}

function ServiceItem({
  service,
  employeeId,
}: Readonly<{ service: Service; employeeId: number }>) {
  const removeServiceMutation = useRemoveServiceToEmployee({
    employeeId,
    serviceId: service.id,
  });

  return (
    <li
      key={service.id}
      className="flex w-full flex-row items-center gap-4 rounded border border-input p-2">
      <div className="flex w-full flex-row items-center gap-4">
        <Avatar>
          <AvatarImage
            src={service.icon ? env('API_URL') + service.icon : undefined}
          />
          <AvatarFallback>{getInitials(service.name)}</AvatarFallback>
        </Avatar>
        {service.name}
      </div>
      {removeServiceMutation.isPending ? (
        <LoaderCircle className="animate-spin" />
      ) : (
        <Button
          onClick={() => removeServiceMutation.mutate()}
          variant="outline"
          className="border-0 p-0 text-red-500 transition-transform hover:scale-125 hover:bg-transparent hover:text-red-500">
          <CircleX />
        </Button>
      )}
    </li>
  );
}