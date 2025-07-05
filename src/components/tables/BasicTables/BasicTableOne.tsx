import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

import Badge from "../../ui/badge/Badge";
import Switch from "../../form/switch/Switch";
import Button from "../../ui/button/Button";
import { User } from "../../../api/user.service";

// Props del componente
interface BasicTableOneProps {
  tableData: User[];
  onStatusChange?: (user: User) => void;
  onEditClick?: (user: User) => void;
}

export default function BasicTableOne({ tableData, onStatusChange, onEditClick }: BasicTableOneProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Nombre / Identificación
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Correo
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Teléfono
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Estado
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Rol
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Acciones
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {tableData.map((user) => (
              <TableRow key={user.id}>
                {/* Nombre / Identificación */}
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-600 dark:text-gray-300 font-medium text-sm">
                        {user.nombre_completo.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {user.nombre_completo}
                      </span>
                      <span className="text-gray-500 text-xs dark:text-gray-400">
                        ID: {user.id}
                      </span>
                    </div>
                  </div>
                </TableCell>
                
                {/* Correo */}
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {user.correo}
                </TableCell>
                
                {/* Teléfono */}
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {user.telefono || 'No especificado'}
                </TableCell>
                
                {/* Estado con Switch */}
                <TableCell className="px-4 py-3 text-start">
                  <Switch
                    label=""
                    defaultChecked={user.estado}
                    onChange={() => onStatusChange?.(user)}
                    color="blue"
                  />
                </TableCell>
                
                {/* Rol */}
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <Badge
                    size="sm"
                    color="info"
                  >
                    {user.nombre_rol || 'Sin rol asignado'}
                  </Badge>
                </TableCell>
                
                {/* Acciones */}
                <TableCell className="px-4 py-3 text-start">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditClick?.(user)}
                    className="px-3 py-1 text-xs"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
