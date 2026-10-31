import React, { useState } from 'react';
import {
  Archive,
  Calendar,
  Folder,
  HardDrive,
  CheckCircle2,
  Play,
  RotateCcw,
  ShieldCheck,
  Clock,
  Copy,
  Layers,
  FileText,
  Download,
} from 'lucide-react';
import {
  LocalBackupConfig as BackupConfigType,
  BackupSnapshot,
  KnowledgeItem,
  formatBytes,
  exportBackupOperationLogsAsText,
} from '../utils/knowledgeEngine';

interface LocalBackupConfigProps {
  config: BackupConfigType;
  snapshots: BackupSnapshot[];
  items: KnowledgeItem[];
  onUpdateConfig: (updated: BackupConfigType) => void;
  onCreateBackupNow: () => void;
  onShowToast: (msg: string) => void;
}

export const LocalBackupConfig: React.FC<LocalBackupConfigProps> = ({
  config,
  snapshots,
  items,
  onUpdateConfig,
  onCreateBackupNow,
  onShowToast,
}) => {
  const [localConfig, setLocalConfig] = useState<BackupConfigType>(config);
  const [isBackingUp, setIsBackingUp] = useState<boolean>(false);

  const handleToggleEnabled = (enabled: boolean) => {
    const updated = { ...localConfig, enabled };
    setLocalConfig(updated);
    onUpdateConfig(updated);
    onShowToast(enabled ? '已开启本地自动备份保护' : '已暂停本地自动备份');
  };

  const handleFrequencyChange = (frequency: 'daily' | 'weekly' | 'monthly') => {
    const updated = { ...localConfig, frequency };
    setLocalConfig(updated);
    onUpdateConfig(updated);
    const names = { daily: '每日', weekly: '每周', monthly: '每月' };
    onShowToast(`自动备份周期已调整为：${names[frequency]}`);
  };

  const handlePathChange = (backupPath: string) => {
    setLocalConfig((prev) => ({ ...prev, backupPath }));
  };

  const handleSavePathAndSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(localConfig);
    onShowToast(`备份路径与参数已保存: ${localConfig.backupPath}`);
  };

  const handleTriggerBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      onCreateBackupNow();
      setIsBackingUp(false);
    }, 600);
  };

  const handleExportLogs = () => {
    const logText = exportBackupOperationLogsAsText(snapshots, localConfig);
    const blob = new Blob([logText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    link.download = `OmniKnowledge_Backup_Operation_Log_${dateStr}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    onShowToast('已导出系统备份操作运行日志文本文件 (.txt)');
  };

  const handleCopyPath = (path: string) => {
    navigator.clipboard?.writeText(path);
    onShowToast(`已复制备份文件路径到剪贴板`);
  };

  return (
    <div className="space-y-6">
      {/* 核心配置面板 */}
      <div className="apple-card rounded-3xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center shrink-0">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1D1D1F] flex items-center gap-2">
                <span>本地自动备份配置</span>
                <span className="omni-badge bg-[#0071E3]/10 text-[#0071E3]">
                  {localConfig.enabled ? '已启用' : '未开启'}
                </span>
              </h2>
              <p className="text-xs text-[#86868B] mt-0.5">
                定时打包知识库索引、结构化元数据与原始全格式文件，防止硬盘故障与误删。
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <label className="relative inline-flex items-center cursor-pointer select-none mr-1">
              <input
                type="checkbox"
                checked={localConfig.enabled}
                onChange={(e) => handleToggleEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-black/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#34C759]" />
              <span className="ml-2 text-xs font-semibold text-[#1D1D1F]">
                {localConfig.enabled ? '已开启' : '已暂停'}
              </span>
            </label>

            <button
              type="button"
              onClick={handleExportLogs}
              className="omni-btn omni-btn-subtle px-3 py-1.5 text-xs shadow-xs flex items-center gap-1.5"
              title="导出包含备份时间、文件大小及执行结果的操作日志文本"
            >
              <FileText className="w-3.5 h-3.5 text-[#0071E3]" />
              <span>导出操作日志</span>
            </button>

            <button
              type="button"
              disabled={isBackingUp}
              onClick={handleTriggerBackup}
              className="omni-btn omni-btn-primary px-3.5 py-1.5 text-xs shadow-xs"
            >
              <Play className={`w-3.5 h-3.5 ${isBackingUp ? 'animate-spin' : ''}`} />
              <span>{isBackingUp ? '打包中...' : '立即发起增量备份'}</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSavePathAndSettings} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. 备份周期选择 */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1D1D1F] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#0071E3]" />
                <span>自动备份周期 (Interval)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleFrequencyChange('daily')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border text-center ${
                    localConfig.frequency === 'daily'
                      ? 'bg-[#0071E3] text-white border-[#0071E3] shadow-xs'
                      : 'bg-[#F5F5F7] text-[#424245] border-black/[0.06] hover:bg-black/[0.04]'
                  }`}
                >
                  <div>每日备份</div>
                  <div className="text-[10px] opacity-75 font-normal">每天凌晨 03:00</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleFrequencyChange('weekly')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border text-center ${
                    localConfig.frequency === 'weekly'
                      ? 'bg-[#0071E3] text-white border-[#0071E3] shadow-xs'
                      : 'bg-[#F5F5F7] text-[#424245] border-black/[0.06] hover:bg-black/[0.04]'
                  }`}
                >
                  <div>每周备份</div>
                  <div className="text-[10px] opacity-75 font-normal">周日凌晨 03:00</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleFrequencyChange('monthly')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border text-center ${
                    localConfig.frequency === 'monthly'
                      ? 'bg-[#0071E3] text-white border-[#0071E3] shadow-xs'
                      : 'bg-[#F5F5F7] text-[#424245] border-black/[0.06] hover:bg-black/[0.04]'
                  }`}
                >
                  <div>每月备份</div>
                  <div className="text-[10px] opacity-75 font-normal">每月1日凌晨 03:00</div>
                </button>
              </div>
            </div>

            {/* 2. 历史保留限制 */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1D1D1F] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#0071E3]" />
                <span>历史快照保留上限 (Retention Policy)</span>
              </label>
              <select
                value={localConfig.keepHistoryCount}
                onChange={(e) =>
                  setLocalConfig({ ...localConfig, keepHistoryCount: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#F5F5F7] border border-black/[0.08]"
              >
                <option value={7}>保留最近 7 份历史快照 (推荐)</option>
                <option value={14}>保留最近 14 份历史快照</option>
                <option value={30}>保留最近 30 份历史快照</option>
                <option value={999}>永久保留全部历史快照</option>
              </select>
              <p className="text-[11px] text-[#86868B]">
                超过保留数量的旧备份压缩包将被系统自动清理，以节省磁盘空间。
              </p>
            </div>
          </div>

          {/* 3. 备份路径 */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#1D1D1F] flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-[#0071E3]" />
              <span>Windows 本地备份存储路径 (Target Directory)</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <HardDrive className="w-3.5 h-3.5 text-[#86868B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={localConfig.backupPath}
                  onChange={(e) => handlePathChange(e.target.value)}
                  placeholder="例如: D:\OmniKnowledge\Backups\"
                  className="omni-input pl-9 text-xs font-mono"
                  required
                />
              </div>
              <button
                type="submit"
                className="omni-btn omni-btn-subtle px-4 py-1.5 text-xs shrink-0"
              >
                保存配置
              </button>
            </div>
          </div>

          {/* 4. 选项复选框 */}
          <div className="pt-2 border-t border-black/[0.05] grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-[#1D1D1F]">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={localConfig.includeMedia}
                onChange={(e) =>
                  setLocalConfig({ ...localConfig, includeMedia: e.target.checked })
                }
                className="rounded border-black/20 text-[#0071E3] focus:ring-[#0071E3]"
              />
              <span>包含高清工程文件与音视频二进制原件 (.dxf, .flac, .psd)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={localConfig.autoCompress}
                onChange={(e) =>
                  setLocalConfig({ ...localConfig, autoCompress: e.target.checked })
                }
                className="rounded border-black/20 text-[#0071E3] focus:ring-[#0071E3]"
              />
              <span>启用标准 ZIP 实体数据包无损压缩</span>
            </label>
          </div>
        </form>
      </div>

      {/* 备份快照历史列表 */}
      <div className="apple-card rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#34C759]" />
            <h3 className="text-sm font-bold text-[#1D1D1F]">
              已校验的本地历史备份快照 ({snapshots.length})
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#86868B]">
              总大小: {formatBytes(snapshots.reduce((acc, s) => acc + s.sizeBytes, 0))}
            </span>
            <button
              type="button"
              onClick={handleExportLogs}
              className="text-[#0071E3] hover:underline text-xs font-medium inline-flex items-center gap-1"
              title="导出文本格式的操作日志"
            >
              <Download className="w-3.5 h-3.5" />
              <span>导出日志 (.txt)</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] text-[#86868B] font-semibold">
                <th className="pb-2.5">快照文件名</th>
                <th className="pb-2.5">类型</th>
                <th className="pb-2.5">生成时间</th>
                <th className="pb-2.5">大小</th>
                <th className="pb-2.5">资产数量</th>
                <th className="pb-2.5">状态</th>
                <th className="pb-2.5 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {snapshots.map((snap) => (
                <tr key={snap.id} className="hover:bg-black/[0.02] transition-colors">
                  <td className="py-3 font-mono font-bold text-[#1D1D1F]">
                    {snap.fileName}
                  </td>
                  <td className="py-3">
                    <span
                      className={`omni-badge ${
                        snap.type === 'auto'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-purple-50 text-purple-700'
                      }`}
                    >
                      {snap.type === 'auto' ? '定时自动' : '手动发起'}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-[#86868B] tabular-nums">
                    {snap.createdAt}
                  </td>
                  <td className="py-3 font-mono text-[#1D1D1F] tabular-nums">
                    {formatBytes(snap.sizeBytes)}
                  </td>
                  <td className="py-3 font-mono text-[#86868B] tabular-nums">
                    {snap.itemCount} 项
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#34C759] font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>已校验</span>
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleCopyPath(snap.path)}
                      className="text-[#0071E3] hover:underline font-medium inline-flex items-center gap-1 ml-2"
                      title="复制完整路径"
                    >
                      <Copy className="w-3 h-3" />
                      <span>路径</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

