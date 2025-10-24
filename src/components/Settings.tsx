import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Download, Upload, Trash2, Save } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { gameStorage } from '../data/storage';

export function Settings() {
  const { ai, theme, saveToStorage } = useGameStore();
  const [params, setParams] = useState(ai.getParams());

  const handleParamChange = (key: string, value: number) => {
    const newParams = { ...params, [key]: value };
    setParams(newParams);
  };

  const handleSaveParams = () => {
    ai.setParams(params);
    saveToStorage();
  };

  const handleExportData = async () => {
    try {
      const data = await gameStorage.exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tictactoe-ai-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Erro ao exportar dados');
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await gameStorage.importAllData(data);
      window.location.reload();
    } catch (error) {
      console.error('Failed to import data:', error);
      alert('Erro ao importar dados. Verifique o arquivo.');
    }
  };

  const handleClearData = async () => {
    if (confirm('Tem certeza que deseja limpar todos os dados de aprendizado? Esta ação não pode ser desfeita.')) {
      try {
        await gameStorage.clearAllData();
        ai.clearQTable();
        window.location.reload();
      } catch (error) {
        console.error('Failed to clear data:', error);
        alert('Erro ao limpar dados');
      }
    }
  };

  const parameterConfigs = [
    {
      key: 'alpha',
      label: 'Taxa de Aprendizado (α)',
      description: 'Controla o quanto a IA aprende com cada partida',
      min: 0,
      max: 1,
      step: 0.01,
    },
    {
      key: 'gamma',
      label: 'Fator de Desconto (γ)',
      description: 'Importância de recompensas futuras',
      min: 0,
      max: 1,
      step: 0.01,
    },
    {
      key: 'epsilon',
      label: 'Taxa de Exploração (ε)',
      description: 'Chance de fazer jogadas aleatórias para explorar',
      min: 0,
      max: 1,
      step: 0.01,
    },
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
        <div className="flex items-center gap-3 mb-6">
          <SettingsIcon size={24} style={{ color: theme.colors.primary }} />
          <h2 className="text-2xl font-bold" style={{ color: theme.colors.text }}>
            Parâmetros da IA
          </h2>
        </div>

        <div className="space-y-6">
          {parameterConfigs.map(config => (
            <div key={config.key}>
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium" style={{ color: theme.colors.text }}>
                  {config.label}
                </label>
                <span className="font-mono font-bold" style={{ color: theme.colors.primary }}>
                  {params[config.key as keyof typeof params].toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={config.min}
                max={config.max}
                step={config.step}
                value={params[config.key as keyof typeof params]}
                onChange={e => handleParamChange(config.key, parseFloat(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${theme.colors.primary} 0%, ${theme.colors.primary} ${params[config.key as keyof typeof params] * 100}%, ${theme.colors.border} ${params[config.key as keyof typeof params] * 100}%, ${theme.colors.border} 100%)`,
                }}
              />
              <p className="text-sm mt-1" style={{ color: theme.colors.textMuted }}>
                {config.description}
              </p>
            </div>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSaveParams}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold mt-6"
          style={{
            backgroundColor: theme.colors.primary,
            color: '#ffffff',
          }}
        >
          <Save size={20} />
          Salvar Parâmetros
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-2xl"
        style={{
          backgroundColor: theme.colors.card,
          border: `2px solid ${theme.colors.border}`,
        }}
      >
        <h3 className="text-xl font-bold mb-4" style={{ color: theme.colors.text }}>
          Gerenciar Dados
        </h3>

        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportData}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold"
            style={{
              backgroundColor: theme.colors.background,
              color: theme.colors.text,
              border: `2px solid ${theme.colors.border}`,
            }}
          >
            <Download size={20} />
            Exportar Dados
          </motion.button>

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
              Importar Dados
            </motion.div>
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
          </label>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClearData}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold"
            style={{
              backgroundColor: theme.colors.playerO,
              color: '#ffffff',
            }}
          >
            <Trash2 size={20} />
            Limpar Todos os Dados
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
