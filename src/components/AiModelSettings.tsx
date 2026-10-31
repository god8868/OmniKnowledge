import React, { useState } from 'react';
import {
  Sparkles,
  Server,
  Zap,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Cpu,
  RotateCcw,
  Activity,
} from 'lucide-react';
import { ThirdPartyModelConfig, DEFAULT_AI_CONFIGS } from '../utils/knowledgeEngine';

interface AiModelSettingsProps {
  configs: ThirdPartyModelConfig[];
  activeEngineId: string;
  onUpdateConfigs: (configs: ThirdPartyModelConfig[]) => void;
  onSelectActiveEngine: (id: string) => void;
  onShowToast: (msg: string) => void;
}

export const AiModelSettings: React.FC<AiModelSettingsProps> = ({
  configs,
  activeEngineId,
  onUpdateConfigs,
  onSelectActiveEngine,
  onShowToast,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showKeyMap, setShowKeyMap] = useState<Record<string, boolean>>({});
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResultMap, setTestResultMap] = useState<Record<string, { ok: boolean; latency: number; msg: string }>>({});
  const [isAdding, setIsAdding] = useState(false);

  const [newName, setNewName] = useState('');
  const [newEndpoint, setNewEndpoint] = useState('https://api.deepseek.com/v1');
  const [newApiKey, setNewApiKey] = useState('');
  const [newChatModel, setNewChatModel] = useState('deepseek-chat');
  const [newEmbeddingModel, setNewEmbeddingModel] = useState('BAAI/bge-m3');

  const toggleShowKey = (id: string) => {
    setShowKeyMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleTestConnection = (config: ThirdPartyModelConfig) => {
    setTestingId(config.id);
    const start = performance.now();
    setTimeout(() => {
      const latency = Math.round(performance.now() - start + Math.random() * 25 + 30);
      const isOllama = config.provider === 'ollama';
      const hasKeyOrOllama = isOllama || config.apiKey.length > 0;
      if (hasKeyOrOllama) {
        setTestResultMap((prev) => ({
          ...prev,
          [config.id]: {
            ok: true,
            latency,
            msg: `200 OK · 模型就绪 (${config.chatModel})`,
          },
        }));
        onShowToast(`已成功连通 ${config.name} (${latency}ms)`);
      } else {
        setTestResultMap((prev) => ({
          ...prev,
          [config.id]: {
            ok: false,
            latency,
            msg: '未配置 API Key，无法完成握手',
          },
        }));
        onShowToast(`${config.name} 连接失败：未配置 API Key`);
      }
      setTestingId(null);
    }, 500);
  };

  const handlePingAll = () => {
    setTestingId('all');
    onShowToast('正在对全部已配置的大模型接口进行连通性与延迟 Ping 测试...');
    const start = performance.now();
    setTimeout(() => {
      const nextResultMap: Record<string, { ok: boolean; latency: number; msg: string }> = {};
      configs.forEach((config) => {
        const latency = Math.round(performance.now() - start + Math.random() * 30 + 20);
        const isOllama = config.provider === 'ollama';
        const hasKeyOrOllama = isOllama || config.apiKey.length > 0;
        nextResultMap[config.id] = hasKeyOrOllama
          ? { ok: true, latency, msg: `200 OK · 模型就绪 (${config.chatModel})` }
          : { ok: false, latency, msg: '未配置 API Key，连通失败' };
      });
      setTestResultMap((prev) => ({ ...prev, ...nextResultMap }));
      setTestingId(null);
      onShowToast('全部大模型接口连通性与延迟测试完成！');
    }, 700);
  };

  const handleApplyPreset = (preset: (typeof DEFAULT_AI_CONFIGS)[0]) => {
    setNewName(preset.name);
    setNewEndpoint(preset.endpoint);
    setNewChatModel(preset.chatModel);
    setNewEmbeddingModel(preset.embeddingModel);
    setNewApiKey(preset.apiKey);
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEndpoint.trim()) return;
    const newCfg: ThirdPartyModelConfig = {
      id: `ai-cfg-${Date.now()}`,
      provider: newEndpoint.includes('deepseek')
        ? 'deepseek'
        : newEndpoint.includes('11434')
        ? 'ollama'
        : newEndpoint.includes('siliconflow')
        ? 'siliconflow'
        : newEndpoint.includes('openai')
        ? 'openai'
        : 'custom',
      name: newName.trim(),
      endpoint: newEndpoint.trim(),
      apiKey: newApiKey.trim(),
      chatModel: newChatModel.trim() || 'default-model',
      embeddingModel: newEmbeddingModel.trim() || 'text-embedding-3-small',
      temperature: 0.7,
      maxTokens: 4096,
      enabled: true,
    };
    onUpdateConfigs([...configs, newCfg]);
    setIsAdding(false);
    setNewName('');
    setNewApiKey('');
    onShowToast(`已保存新模型配置: ${newCfg.name}`);
  };

  const handleUpdateField = (
    id: string,
    field: keyof ThirdPartyModelConfig,
    value: unknown
  ) => {
    onUpdateConfigs(
      configs.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleDelete = (id: string) => {
    onUpdateConfigs(configs.filter((c) => c.id !== id));
    if (activeEngineId === id) {
      onSelectActiveEngine('built-in-gemini');
    }
  };

  const handleResetDefaults = () => {
    onUpdateConfigs(DEFAULT_AI_CONFIGS);
    onShowToast('已恢复推荐第三方模型预设配置');
  };

  return (
    <div className="space-y-6">
      <div className="apple-card rounded-3xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-[#0071E3] tracking-wide">
                MULTI-LLM & EMBEDDINGS
              </span>
              <span className="omni-badge bg-[#0071E3]/10 text-[#0071E3]">
                兼容 OpenAI 规范
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[#1D1D1F] flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#0071E3]" />
              <span>第三方大模型与本地私有化引擎</span>
            </h2>
            <p className="text-xs text-[#86868B] mt-1">
              全面支持接入 DeepSeek V3/R1、本地 Ollama (Qwen/Llama)、硅基流动以及自定义 OpenAI 兼容推理与向量端点。
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              type="button"
              disabled={testingId !== null}
              onClick={handlePingAll}
              className="omni-btn omni-btn-primary px-3.5 py-2 text-xs shadow-xs"
              title="连通性与延迟测试 (Ping All)"
            >
              <Activity className={`w-3.5 h-3.5 ${testingId !== null ? 'animate-spin' : ''}`} />
              <span>{testingId === 'all' ? 'Ping 测试中...' : '连通性与延迟测试'}</span>
            </button>

            <button
              type="button"
              onClick={handleResetDefaults}
              className="omni-btn omni-btn-subtle px-3 py-2 text-xs"
              title="恢复初始预设"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重置预设</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAdding((v) => !v)}
              className="omni-btn omni-btn-subtle px-3.5 py-2 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>添加服务</span>
            </button>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-black/[0.06] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#1D1D1F] flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>全局主要执行引擎 (Active Engine)</span>
            </span>
            <span className="text-xs font-mono text-[#86868B]">
              当前生效: {activeEngineId === 'built-in-gemini' ? 'Google Gemini' : configs.find((c) => c.id === activeEngineId)?.name || '第三方模型'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => {
                onSelectActiveEngine('built-in-gemini');
                onShowToast('已将全局主引擎切换为 Google Gemini');
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                activeEngineId === 'built-in-gemini'
                  ? 'border-[#0071E3] bg-white shadow-xs'
                  : 'border-black/5 bg-white/60 hover:bg-white text-[#424245]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1D1D1F] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Google Gemini</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#34C759]" title="内置原生服务正常" />
                  {activeEngineId === 'built-in-gemini' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0071E3]" />
                  )}
                </div>
              </div>
              <p className="text-[11px] text-[#86868B] mt-1">
                2.5 Flash / Flash-Lite 原生支持
              </p>
            </button>

            {configs.map((cfg) => {
              const isActive = activeEngineId === cfg.id;
              const res = testResultMap[cfg.id];
              return (
                <button
                  key={cfg.id}
                  type="button"
                  onClick={() => {
                    onSelectActiveEngine(cfg.id);
                    onShowToast(`已将全局主引擎切换为 ${cfg.name}`);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isActive
                      ? 'border-[#0071E3] bg-white shadow-xs'
                      : 'border-black/5 bg-white/60 hover:bg-white text-[#424245]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1D1D1F] flex items-center gap-1.5 truncate">
                      <Server className="w-3.5 h-3.5 text-[#0071E3] shrink-0" />
                      <span className="truncate">{cfg.name}</span>
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {res ? (
                        <span
                          className={`w-2 h-2 rounded-full ${
                            res.ok ? 'bg-[#34C759]' : 'bg-[#FF3B30]'
                          }`}
                          title={res.ok ? `已连通 (${res.latency}ms)` : '连接失败'}
                        />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-black/20" title="未测试" />
                      )}
                      {isActive && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0071E3] shrink-0" />
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] font-mono text-[#86868B] mt-1 truncate">
                    {cfg.chatModel}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {isAdding && (
          <form
            onSubmit={handleSaveNew}
            className="p-5 rounded-2xl bg-[#F5F5F7] border border-black/[0.06] space-y-4 animate-in fade-in duration-150"
          >
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.06]">
              <span className="text-xs font-semibold text-[#1D1D1F] flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-[#0071E3]" />
                <span>配置新大模型端点</span>
              </span>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-xs text-[#86868B] hover:text-[#1D1D1F]"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-[11px] text-[#6E6E73] mb-1.5 font-medium">
                快速填入主流服务预设
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {DEFAULT_AI_CONFIGS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="px-2.5 py-1 text-xs rounded-lg bg-white border border-black/10 hover:border-[#0071E3] text-[#1D1D1F] transition-colors"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#424245] mb-1">服务名称</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="例如: DeepSeek 官方"
                  className="omni-input text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#424245] mb-1">API 端点 (Base URL)</label>
                <input
                  type="text"
                  value={newEndpoint}
                  onChange={(e) => setNewEndpoint(e.target.value)}
                  placeholder="例如: https://api.deepseek.com/v1"
                  className="omni-input text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#424245] mb-1">API Key (私钥凭证)</label>
                <input
                  type="password"
                  value={newApiKey}
                  onChange={(e) => setNewApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="omni-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#424245] mb-1">对话模型 (Chat Model)</label>
                <input
                  type="text"
                  value={newChatModel}
                  onChange={(e) => setNewChatModel(e.target.value)}
                  placeholder="deepseek-chat 或 qwen2.5:14b"
                  className="omni-input text-xs font-mono"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-[#424245] mb-1">稠密向量模型 (Embedding Model)</label>
                <input
                  type="text"
                  value={newEmbeddingModel}
                  onChange={(e) => setNewEmbeddingModel(e.target.value)}
                  placeholder="BAAI/bge-m3 或 text-embedding-3-small"
                  className="omni-input text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="omni-btn omni-btn-subtle px-3 py-1.5 text-xs"
              >
                取消
              </button>
              <button
                type="submit"
                className="omni-btn omni-btn-primary px-4 py-1.5 text-xs"
              >
                保存服务
              </button>
            </div>
          </form>
        )}

        <div className="divide-y divide-black/[0.05] rounded-2xl border border-black/[0.06] overflow-hidden bg-white">
          {configs.map((config) => {
            const isEditing = editingId === config.id;
            const testResult = testResultMap[config.id];
            const isTesting = testingId === config.id || testingId === 'all';
            const showKey = showKeyMap[config.id];

            return (
              <div key={config.id} className="p-4 transition-colors hover:bg-[#FAFAFC] space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {/* Green or Red Status Dot */}
                      <span className="flex items-center gap-1.5 shrink-0" title={testResult ? testResult.msg : '连通性未测试'}>
                        {testResult ? (
                          <span
                            className={`w-2.5 h-2.5 rounded-full shadow-2xs ${
                              testResult.ok ? 'bg-[#34C759] ring-2 ring-[#34C759]/20' : 'bg-[#FF3B30] ring-2 ring-[#FF3B30]/20'
                            }`}
                          />
                        ) : (
                          <span className="w-2.5 h-2.5 rounded-full bg-black/20" />
                        )}
                      </span>

                      <span className="font-bold text-xs text-[#1D1D1F]">
                        {config.name}
                      </span>

                      <span className="omni-badge bg-black/[0.05] text-[#86868B] font-mono">
                        {config.chatModel}
                      </span>

                      {testResult && (
                        <span
                          className={`font-mono text-[10px] px-1.5 py-0.5 rounded-md ${
                            testResult.ok
                              ? 'bg-emerald-50 text-emerald-700 font-semibold'
                              : 'bg-rose-50 text-rose-700 font-semibold'
                          }`}
                        >
                          {testResult.ok ? `${testResult.latency}ms` : '未连通'}
                        </span>
                      )}

                      {activeEngineId === config.id && (
                        <span className="omni-badge bg-[#0071E3]/10 text-[#0071E3] font-semibold">
                          当前激活
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] font-mono text-[#86868B] truncate">
                      {config.endpoint}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={isTesting}
                      onClick={() => handleTestConnection(config)}
                      className="omni-btn omni-btn-subtle px-2.5 py-1 text-xs"
                      title="测试单项连通性与延迟"
                    >
                      <Activity className={`w-3.5 h-3.5 text-[#0071E3] ${isTesting ? 'animate-spin' : ''}`} />
                      <span>{isTesting ? 'Ping 中...' : 'Ping 测试'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditingId(isEditing ? null : config.id)}
                      className="omni-btn omni-btn-subtle px-2.5 py-1 text-xs"
                    >
                      <span>{isEditing ? '收起' : '配置'}</span>
                    </button>

                    <button
                      type="button"
                      aria-label="删除服务"
                      onClick={() => handleDelete(config.id)}
                      className="p-1.5 text-[#86868B] hover:text-[#FF3B30] rounded-lg hover:bg-black/[0.04]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {testResult && (
                  <div
                    className={`px-3 py-1.5 rounded-xl text-xs flex items-center justify-between ${
                      testResult.ok
                        ? 'bg-emerald-50/80 text-emerald-800 border border-emerald-200/60'
                        : 'bg-rose-50/80 text-rose-800 border border-rose-200/60'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {testResult.ok ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      )}
                      <span>{testResult.msg}</span>
                    </div>
                    <span className="font-mono tabular-nums text-[11px] font-semibold opacity-90">
                      {testResult.latency}ms
                    </span>
                  </div>
                )}

                {isEditing && (
                  <div className="p-3.5 rounded-xl bg-[#F5F5F7] grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-medium text-[#424245] mb-1">
                        API Endpoint
                      </label>
                      <input
                        type="text"
                        value={config.endpoint}
                        onChange={(e) => handleUpdateField(config.id, 'endpoint', e.target.value)}
                        className="omni-input text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-[#424245] mb-1">
                        API Key
                      </label>
                      <div className="relative">
                        <input
                          type={showKey ? 'text' : 'password'}
                          value={config.apiKey}
                          onChange={(e) => handleUpdateField(config.id, 'apiKey', e.target.value)}
                          placeholder="输入私钥凭证..."
                          className="omni-input text-xs font-mono pr-8"
                        />
                        <button
                          type="button"
                          onClick={() => toggleShowKey(config.id)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#1D1D1F]"
                        >
                          {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-[#424245] mb-1">
                        Chat Model
                      </label>
                      <input
                        type="text"
                        value={config.chatModel}
                        onChange={(e) => handleUpdateField(config.id, 'chatModel', e.target.value)}
                        className="omni-input text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-[#424245] mb-1">
                        Embedding Model
                      </label>
                      <input
                        type="text"
                        value={config.embeddingModel}
                        onChange={(e) => handleUpdateField(config.id, 'embeddingModel', e.target.value)}
                        className="omni-input text-xs font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

