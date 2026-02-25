/**
 * Two Column Layout Component
 * Renders modules in a two-column layout
 */

import { ModuleConfig } from '../../types/recipe';
import { ModuleRenderer } from './ModuleRenderer';
import { calculateLayout } from '../../utils/layoutCalculator';

interface TwoColumnLayoutProps {
  modules: ModuleConfig[];
  useLiveData?: boolean;
}

export function TwoColumnLayout({ modules, useLiveData = false }: TwoColumnLayoutProps) {
  const layoutModules = calculateLayout(modules, 'two-column');

  return (
    <div className="two-column-layout">
      {layoutModules.map(module => (
        <div
          key={module.id}
          className="two-column-layout__item"
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
