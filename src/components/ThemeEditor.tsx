import { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Plus, Trash2, Download, Upload } from 'lucide-react';
import { useGameStore, defaultThemes, Theme } from '../store/gameStore';

export function ThemeEditor() {
  const { theme, customThemes, setTheme, addCustomTheme, removeCustomTheme } = useGameStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newTheme, setNewTheme] = useState<Theme>({
    id: '',
    name: '',
    colors: { ...theme.colors },
  });

  const allThemes = [...defaultThemes, ...customThemes];

  const handleCreateTheme = () => {
    if (!newTheme.name.trim()) {
      alert('Digite um nome para o tema');
      return;
    }

    const themeToSave = {
      ...newTheme,
      id: `custom-${Date.now()}`,
    };

    addCustomTheme(themeToSave);
    setTheme(themeToSave);
    setIsCreating(false);
    setNewTheme({
      id: '',
      name: '',
      colors: { ...theme.colors },
    });
  };

  const handleColorChange = (key: string, value: string) => {
    setNewTheme({
      ...newTheme,
      colors: {
        ...newTheme.colors,
        [key]: value,
      },
    });
  };

  const handleExportTheme = (themeToExport: Theme) => {
    const blob = new Blob([JSON.stringify(themeToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `theme-${themeToExport.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportTheme = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importedTheme = JSON.parse(text);
      importedTheme.id = `custom-${Date.now()}`;
      addCustomTheme(importedTheme);
      setTheme(importedTheme);
    } catch (error) {
      console.error('Failed to import theme:', error);
      alert('Erro ao importar tema. Verifique o arquivo.');
    }
  };

  const colorFields = [
    { key: 'background', label: 'Fundo Principal' },
    { key: 'card', label: 'Fundo dos Cards' },
    { key: 'primary', label: 'Cor Primária' },
    { key: 'secondary', label: 'Cor Secundária' },
    { key: 'accent', label: 'Cor de Destaque' },
    { key: 'text', label: 'Texto Principal' },
    { key: 'textMuted', label: 'Texto Secundário' },
    { key: 'border', label: 'Bordas' },
    { key: 'playerX', label: 'Jogador X' },
    { key: 'playerO', label: 'Jogador O' },
    { key: 'winLine', label: 'Linha de Vitória' },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl"
        style={{
          backgroundColor: theme.colors.card,
          border: `2px solid ${theme.colors.border}`,
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Palette size={24} style={{ color: theme.colors.primary }} />
            <h2 className="text-2xl font-bold" style={{ color: theme.colors.text }}>
              Temas
            </h2>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold"
            style={{
              backgroundColor: isCreating ? theme.colors.playerO : theme.colors.primary,
              color: '#ffffff',
            }}
          >
            <Plus size={20} />
            {isCreating ? 'Cancelar' : 'Criar Tema'}
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {allThemes.map(t => (
            <motion.div
              key={t.id}
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-xl cursor-pointer relative"
              onClick={() => setTheme(t)}
              style={{
                backgroundColor: t.colors.background,
                border: `3px solid ${theme.id === t.id ? theme.colors.primary : t.colors.border}`,
              }}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold" style={{ color: t.colors.text }}>
                  {t.name}
                </h3>
                {t.id.startsWith('custom-') && (
                  <div className="flex gap-1">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleExportTheme(t);
                      }}
                      className="p-1 rounded hover:opacity-70"
                      style={{ color: t.colors.primary }}
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        if (confirm('Deseja remover este tema?')) {
                          removeCustomTheme(t.id);
                          if (theme.id === t.id) {
                            setTheme(defaultThemes[0]);
                          }
                        }
                      }}
                      className="p-1 rounded hover:opacity-70"
                      style={{ color: t.colors.playerO }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex gap-1 flex-wrap">
                {Object.values(t.colors).slice(0, 6).map((color, idx) => (
                  <div
                    key={idx}
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <label className="block">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold cursor-pointer"
            style={{
              backgroundColor: theme.colors.background,
              color: theme.colors.text,
              border: `2px solid ${theme.colors.border}`,
            }}
          >
            <Upload size={20} />
            Importar Tema
          </motion.div>
          <input
            type="file"
            accept=".json"
            onChange={handleImportTheme}
            className="hidden"
          />
        </label>
      </motion.div>

      {isCreating && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl"
          style={{
            backgroundColor: theme.colors.card,
            border: `2px solid ${theme.colors.border}`,
          }}
        >
          <h3 className="text-xl font-bold mb-4" style={{ color: theme.colors.text }}>
            Criar Novo Tema
          </h3>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textMuted }}>
              Nome do Tema
            </label>
            <input
              type="text"
              value={newTheme.name}
              onChange={e => setNewTheme({ ...newTheme, name: e.target.value })}
              placeholder="Meu Tema Personalizado"
              className="w-full px-4 py-2 rounded-lg"
              style={{
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                border: `2px solid ${theme.colors.border}`,
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {colorFields.map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textMuted }}>
                  {field.label}
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={newTheme.colors[field.key as keyof typeof newTheme.colors]}
                    onChange={e => handleColorChange(field.key, e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newTheme.colors[field.key as keyof typeof newTheme.colors]}
                    onChange={e => handleColorChange(field.key, e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg font-mono text-sm"
                    style={{
                      backgroundColor: theme.colors.background,
                      color: theme.colors.text,
                      border: `2px solid ${theme.colors.border}`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreateTheme}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold"
            style={{
              backgroundColor: theme.colors.primary,
              color: '#ffffff',
            }}
          >
            <Plus size={20} />
            Criar e Aplicar Tema
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
