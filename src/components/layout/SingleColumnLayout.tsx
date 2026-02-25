/**
 * Single Column Layout Component
 * Renders modules in a single column layout (mobile-friendly)
 */

import { ModuleConfig } from '../../types/recipe';
import { ModuleRenderer } from './ModuleRenderer';
import { calculateLayout } from '../../utils/layoutCalculator';

interface SingleColumnLayoutProps {
  modules: ModuleConfig[];
  useLiveData?: boolean;
}

export function SingleColumnLayout({ modules, useLiveData = false }: SingleColumnLayoutProps) {
  const layoutModules = calculateLayout(modules, 'single-column');

  return (
    <div className="single-column-layout">
      {layoutModules.map(module => (
        <div key={module.id} className="single-column-layout__item">
          <ModuleRenderer module={module} useLiveData={useLiveData} />
        </div>
      ))}
    </div>
  );
}
