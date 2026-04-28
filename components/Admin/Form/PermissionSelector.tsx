'use client'

import { permissionModules } from '@/lib/constant';
import { useState, useEffect } from 'react';

interface Props {
    initialPermissions?: string[];
}

export default function PermissionSelector({ initialPermissions = [] }: Props) {
    // Initialize state with the permissions passed from the server
    const [selected, setSelected] = useState<string[]>(initialPermissions);

    // Update state if the initialPermissions prop changes (useful for transitions)
    useEffect(() => {
        if (initialPermissions.length > 0) {
            setSelected(initialPermissions);
        }
    }, [initialPermissions]);

    const allAvailablePermissions = permissionModules.flatMap(m => m.permissions);

    const isEverythingSelected = allAvailablePermissions.length > 0 &&
        allAvailablePermissions.every(p => selected.includes(p));

    const toggleAll = () => {
        if (isEverythingSelected) {
            setSelected([]);
        } else {
            setSelected(allAvailablePermissions);
        }
    };

    const togglePermission = (perm: string) => {
        setSelected(prev =>
            prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
        );
    };

    const toggleModule = (modulePerms: string[]) => {
        const allSelected = modulePerms.every(p => selected.includes(p));
        if (allSelected) {
            setSelected(prev => prev.filter(p => !modulePerms.includes(p)));
        } else {
            setSelected(prev => Array.from(new Set([...prev, ...modulePerms])));
        }
    };

    const activeModules = permissionModules
        .filter(m => m.permissions.some(p => selected.includes(p)))
        .map(m => m.module);

    return (
        <div className="space-y-6 mt-4">
            <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-semibold text-gray-700">Permissions Configuration</h3>
                <button
                    type="button"
                    onClick={toggleAll}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors font-bold uppercase tracking-tight ${isEverythingSelected
                            ? 'bg-red-50 text-red-600 border-red-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                >
                    {isEverythingSelected ? 'Deselect Everything' : 'Select Everything'}
                </button>
            </div>

            {/* These inputs send the data to your Server Action */}
            {selected.map(p => <input key={p} type="hidden" name="permissions" value={p} />)}
            {activeModules.map(m => <input key={m} type="hidden" name="modules" value={m} />)}

            <div className="grid gap-4">
                {permissionModules.map((item) => {
                    const isAllModuleSelected = item.permissions.every(p => selected.includes(p));
                    return (
                        <div key={item.module} className="border rounded-lg p-4 bg-gray-50/50">
                            <div className="flex justify-between items-center mb-3">
                                <span className="font-bold text-blue-700 text-sm uppercase tracking-wider">{item.module}</span>
                                <button
                                    type="button"
                                    onClick={() => toggleModule(item.permissions)}
                                    className="text-xs text-blue-600 hover:underline font-medium"
                                >
                                    {isAllModuleSelected ? 'Deselect Module' : 'Select Module'}
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                {item.permissions.map((perm) => (
                                    <label key={perm} className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(perm)}
                                            onChange={() => togglePermission(perm)}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-600 group-hover:text-gray-900 capitalize">
                                            {perm.split('_')[1] || perm}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}