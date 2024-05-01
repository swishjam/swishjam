'use client';

import { useState } from 'react';
import DataVisualizationSettingsContext from '@/contexts/DataVisualizationSettingsContext';

const DataVisualizationSettingsProvider = ({ children, settings: initialSettings }) => {
  const [settings, setSettings] = useState(initialSettings || []);

  (initialSettings || []).forEach(setting => {
    if (!setting.id) throw new Error('Setting item must have an `id` defined', setting);
    if (!setting.label && !setting.value) throw new Error('Setting item must have either a `label` or `value` defined', setting);
    (setting.options || []).forEach(option => {
      if (option.value === undefined) throw new Error('Setting item\'s sub option must have a `value` defined', option);
    });
  });

  const getSetting = id => {
    const setting = settings.find(setting => setting.id === id);
    return setting?.selectedValue || setting?.enabled;
  };

  const updateSettings = newSettings => {
    setSettings(prevSettings => {
      const updatedSettings = prevSettings.map(setting => {
        const newSetting = newSettings.find(newSetting => newSetting.id === setting.id);
        if (newSetting) {
          if (setting.options) {
            return { ...setting, selectedValue: newSetting.value };
          } else {
            return { ...setting, enabled: newSetting.value };
          }
        }
        return setting;
      });
      return updatedSettings;
    });
  }

  const updateSetting = (id, value) => {
    setSettings(prevSettings => {
      let hasSetting = false;
      const newSettings = prevSettings.map(setting => {
        if (setting.id === id) {
          hasSetting = true;
          if (setting.options) {
            return { ...setting, selectedValue: value };
          } else {
            return { ...setting, enabled: value };
          }
        }
        return setting;
      });
      if (!hasSetting) throw new Error(`Setting with id ${id} not found, defined settings are: ${prevSettings.map(s => s.id).join(', ')}`);
      return newSettings;
    });
  };

  return (
    <DataVisualizationSettingsContext.Provider value={{
      settings,
      getSetting,
      updateSetting,
      updateSettings,
      defineSettings: setSettings,
    }}>
      {children}
    </DataVisualizationSettingsContext.Provider>
  );
}

export { DataVisualizationSettingsProvider };
export default DataVisualizationSettingsProvider;