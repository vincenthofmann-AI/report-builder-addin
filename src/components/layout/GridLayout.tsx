/**
 * Grid Layout Component
 * Renders modules in a 12-column grid layout
 */

import { ModuleConfig } from '../../types/recipe';
import { ModuleRenderer } from './ModuleRenderer';
import { calculateLayout } from '../../utils/layoutCalculator';

interface GridLayoutProps {
  modules: ModuleConfig[];
  useLiveData?: boolean;
}

export function GridLayout({ modules, useLiveData = false }: GridLayoutProps) {
  const layoutModules = calculateLayout(modules, 'grid');

  return (
    <div className="grid-layout">
      {layoutModules.map(module => (
        <div
          key={module.id}
          className="grid-layout__item"
          style={{
            gridRow: module.defaultPosition.row + 1,
            gridColumn: `span ${module.defaultPosition.width}`
          }}
        >
          <ModuleRenderer module={module} useLiveData={useLiveData} />
        </div>
      ))}
    </div>
  );
}
