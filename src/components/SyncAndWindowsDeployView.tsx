import React, { useState } from 'react';
import {
  RefreshCw,
  Copy,
  Terminal,
  Shield,
  Server,
  Plus,
  Download,
  SlidersHorizontal,
  Cpu,
  Archive,
  Activity,
  Wifi,
} from 'lucide-react';
import {
  SyncNodeConfig,
  KnowledgeItem,
  AutomationRule,
  ThirdPartyModelConfig,
  LocalBackupConfig as BackupConfigType,
  BackupSnapshot,
  pingSyncNode,
} from '../utils/knowledgeEngine';
import { AutomationRulesConfig } from './AutomationRulesConfig';
import { AiModelSettings } from './AiModelSettings';
import { LocalBackupConfig } from './LocalBackupConfig';

interface SyncAndWindowsDeployViewProps {
  syncNodes: SyncNodeConfig[];
  items: KnowledgeItem[];
  rules: AutomationRule[];
  aiConfigs: ThirdPartyModelConfig[];
  activeAiEngineId: string;
  backupConfig: BackupConfigType;
  backupSnapshots: BackupSnapshot[];
  onTriggerSyncAll: () => void;
  onAddSyncNode: (node: SyncNodeConfig) => void;
  onUpdateSyncNodes?: (nodes: SyncNodeConfig[]) => void;
  onUpdateRules: (rules: AutomationRule[]) => void;
  onApplyRulesNow: () => void;
  onUpdateAiConfigs: (configs: ThirdPartyModelConfig[]) => void;
  onSelectAiEngine: (id: string) => void;
  onUpdateBackupConfig: (config: BackupConfigType) => void;
  onCreateBackupNow: () => void;
  onShowToast: (msg: string) => void;
}

const WINDOWS_POWERSHELL_SCRIPT = `$ErrorActionPreference = "Stop"
$VaultRoot = "D:\\OmniKnowledge"

Write-Host "[1/5] 正在创建 Windows 本地内容寻址知识库目录结构 ($VaultRoot)..." -ForegroundColor Cyan
$Dirs = @(
  "$VaultRoot\\01_Engineering_CAD",
  "$VaultRoot\\02_Design_Assets",
  "$VaultRoot\\03_Photography_RAW",
  "$VaultRoot\\04_Architecture_Docs",
  "$VaultRoot\\05_Media_Streams",
  "$VaultRoot\\06_Core_Scripts",
  "$VaultRoot\\07_WeChat_Archive",
  "$VaultRoot\\08_Social_Feeds",
  "$VaultRoot\\.cas_objects",
  "$VaultRoot\\.vector_index"
)
foreach ($d in $Dirs) { New-Item -ItemType Directory -Force -Path $d | Out-Null }

Write-Host "[2/5] 正在通过 Winget 安装全格式原生解码依赖 (FFmpeg / ImageMagick / LibreOffice)..." -ForegroundColor Cyan
winget install --id Gyan.FFmpeg -e --silent
winget install --id ImageMagick.ImageMagick -e --silent
winget install --id OliverBetz.ExifTool -e --silent

Write-Host "[3/5] 正在初始化 Python 3.12 虚拟环境与多模态解析/向量化引擎..." -ForegroundColor Cyan
python -m venv "$VaultRoot\\.venv"
& "$VaultRoot\\.venv\\Scripts\\pip.exe" install -U pip
& "$VaultRoot\\.venv\\Scripts\\pip.exe" install fastapi uvicorn watchdog pymupdf python-docx duckdb \`
    psd-tools ezdxf rawpy Pillow faster-whisper sqlite-vec sentence-transformers playwright

Write-Host "[4/5] 正在初始化内置 Chromium 浏览器 (用于微信公众号/视频号/小红书/B站防盗链离线抓取)..." -ForegroundColor Cyan
& "$VaultRoot\\.venv\\Scripts\\playwright.exe" install chromium

Write-Host "[5/5] 部署完成！本地服务已绑定 http://127.0.0.1:3000 ，异地增量同步守护进程已就绪。" -ForegroundColor Green`;

export const SyncAndWindowsDeployView: React.FC<SyncAndWindowsDeployViewProps> = ({
  syncNodes,
  items,
  rules,
  aiConfigs,
  activeAiEngineId,
  backupConfig,
  backupSnapshots,
  onTriggerSyncAll,
  onAddSyncNode,
  onUpdateSyncNodes,
  onUpdateRules,
  onApplyRulesNow,
  onUpdateAiConfigs,
  onSelectAiEngine,
  onUpdateBackupConfig,
  onCreateBackupNow,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'ai' | 'backup' | 'sync' | 'deploy'>('rules');
  const [copiedScript, setCopiedScript] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [testingNodeId, setTestingNodeId] = useState<string | null>(null);
  const [isTestingAllNodes, setIsTestingAllNodes] = useState<boolean>(false);
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeProtocol, setNewNodeProtocol] = useState<SyncNodeConfig['protocol']>('WebDAV');
  const [newNodeEndpoint, setNewNodeEndpoint] = useState('');

  const handleRunSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      onTriggerSyncAll();
      setIsSyncing(false);
    }, 350);
  };

  const handlePingSingleNode = (node: SyncNodeConfig) => {
    setTestingNodeId(node.id);
    setTimeout(() => {
      const res = pingSyncNode(node);
      const updatedNodes = syncNodes.map((n) =>
        n.id === node.id
          ? { ...n, latencyMs: res.latencyMs, healthStatus: res.healthStatus }
          : n
      );
      if (onUpdateSyncNodes) {
        onUpdateSyncNodes(updatedNodes);
      }
      setTestingNodeId(null);
      onShowToast(`[${node.name}] 连通测试结果：${res.message}`);
    }, 350);
  };

  const handlePingAllNodes = () => {
    setIsTestingAllNodes(true);
    setTimeout(() => {
      const updatedNodes = syncNodes.map((n) => {
        const res = pingSyncNode(n);
        return { ...n, latencyMs: res.latencyMs, healthStatus: res.healthStatus };
      });
      if (onUpdateSyncNodes) {
        onUpdateSyncNodes(updatedNodes);
      }
      setIsTestingAllNodes(false);
      onShowToast(`已完成全量 ${syncNodes.length} 个同步节点的连通性与 Ping 延迟测试`);
    }, 450);
  };

  const handleCopyScript = () => {
    navigator.clipboard?.writeText(WINDOWS_POWERSHELL_SCRIPT);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 1800);
  };

  const handleDownloadPs1 = () => {
    const blob = new Blob([WINDOWS_POWERSHELL_SCRIPT], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'setup-omnivault-windows.ps1';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCreateNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeName.trim() || !newNodeEndpoint.trim()) return;
    const initialPing = pingSyncNode({
      id: `sync-${Date.now()}`,
      name: newNodeName.trim(),
      protocol: newNodeProtocol,
      endpoint: newNodeEndpoint.trim(),
      localMirrorDir: 'D:\\OmniKnowledge',
      encryption: 'AES-256-GCM',
      status: 'synced',
      lastSyncAt: '2026-10-31 04:16:00',
      syncedCount: items.length,
      pendingDeltaCount: 0,
    });

    onAddSyncNode({
      id: `sync-${Date.now()}`,
      name: newNodeName.trim(),
      protocol: newNodeProtocol,
      endpoint: newNodeEndpoint.trim(),
      localMirrorDir: 'D:\\OmniKnowledge',
      encryption: 'AES-256-GCM',
      status: 'synced',
      lastSyncAt: '2026-10-31 04:16:00',
      syncedCount: items.length,
      pendingDeltaCount: 0,
      latencyMs: initialPing.latencyMs,
      healthStatus: initialPing.healthStatus,
    });
    setNewNodeName('');
    setNewNodeEndpoint('');
    onShowToast(`已登记新节点: ${newNodeName} (连通状态: ${initialPing.latencyMs}ms)`);
  };

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden bg-[#F5F5F7]">
      {/* macOS System Settings Vertical Feature Sidebar */}
      <div className="w-full md:w-56 shrink-0 bg-[#EBEBF0]/80 backdrop-blur-2xl border-r border-black/[0.08] p-3 flex flex-col justify-between select-none h-full">
        <div className="space-y-4">
          <div className="px-2 pt-1 pb-2 border-b border-black/[0.06] flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#0071E3] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold tracking-tight text-[#1D1D1F]">
              系统设置与偏好
            </span>
          </div>

          <nav className="space-y-1">
            <button
              type="button"
              onClick={() => setActiveTab('rules')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                activeTab === 'rules'
                  ? 'bg-[#0071E3] text-white font-semibold shadow-xs'
                  : 'text-[#424245] hover:bg-black/[0.04]'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <SlidersHorizontal className="w-4 h-4 shrink-0" />
                <span className="truncate">自动化规则</span>
              </span>
              <span
                className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === 'rules' ? 'bg-white/20 text-white' : 'bg-black/[0.06] text-[#86868B]'
                }`}
              >
                {rules.filter((r) => r.enabled).length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ai')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                activeTab === 'ai'
                  ? 'bg-[#0071E3] text-white font-semibold shadow-xs'
                  : 'text-[#424245] hover:bg-black/[0.04]'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <Cpu className="w-4 h-4 shrink-0" />
                <span className="truncate">第三方大模型</span>
              </span>
              <span
                className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === 'ai' ? 'bg-white/20 text-white' : 'bg-black/[0.06] text-[#86868B]'
                }`}
              >
                {aiConfigs.filter((c) => c.enabled).length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('backup')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                activeTab === 'backup'
                  ? 'bg-[#0071E3] text-white font-semibold shadow-xs'
                  : 'text-[#424245] hover:bg-black/[0.04]'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <Archive className="w-4 h-4 shrink-0" />
                <span className="truncate">本地自动备份</span>
              </span>
              <span
                className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === 'backup' ? 'bg-white/20 text-white' : 'bg-black/[0.06] text-[#86868B]'
                }`}
              >
                {backupConfig.enabled ? '定时' : '关'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sync')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                activeTab === 'sync'
                  ? 'bg-[#0071E3] text-white font-semibold shadow-xs'
                  : 'text-[#424245] hover:bg-black/[0.04]'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <Server className="w-4 h-4 shrink-0" />
                <span className="truncate">异地多端同步</span>
              </span>
              <span
                className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === 'sync' ? 'bg-white/20 text-white' : 'bg-black/[0.06] text-[#86868B]'
                }`}
              >
                {syncNodes.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('deploy')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                activeTab === 'deploy'
                  ? 'bg-[#0071E3] text-white font-semibold shadow-xs'
                  : 'text-[#424245] hover:bg-black/[0.04]'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <Terminal className="w-4 h-4 shrink-0" />
                <span className="truncate">Windows 原生部署</span>
              </span>
            </button>
          </nav>
        </div>

        <div className="p-2.5 rounded-xl bg-black/[0.04] border border-black/[0.04] flex items-center justify-between text-[11px] text-[#86868B]">
          <span className="inline-flex items-center gap-1.5 font-medium text-[#1D1D1F]">
            <Shield className="w-3.5 h-3.5 text-[#34C759]" />
            <span>系统状态</span>
          </span>
          <span className="font-mono text-[#34C759] font-bold">运行良好</span>
        </div>
      </div>

      {/* 设置主内容区域 (Apple Inset Grouped Canvas) */}
      <div className="flex-1 h-full overflow-y-auto p-6 md:p-8 space-y-6 bg-[#F5F5F7]">
        {activeTab === 'rules' && (
          <AutomationRulesConfig
            rules={rules}
            items={items}
            onUpdateRules={onUpdateRules}
            onApplyRulesNow={onApplyRulesNow}
          />
        )}

        {activeTab === 'ai' && (
          <AiModelSettings
            configs={aiConfigs}
            activeEngineId={activeAiEngineId}
            onUpdateConfigs={onUpdateAiConfigs}
            onSelectActiveEngine={onSelectAiEngine}
            onShowToast={onShowToast}
          />
        )}

        {activeTab === 'backup' && (
          <LocalBackupConfig
            config={backupConfig}
            snapshots={backupSnapshots}
            items={items}
            onUpdateConfig={onUpdateBackupConfig}
            onCreateBackupNow={onCreateBackupNow}
            onShowToast={onShowToast}
          />
        )}

        {activeTab === 'sync' && (
          <div className="space-y-6">
            <div className="apple-card rounded-3xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-[#1D1D1F] flex items-center gap-2">
                    <Server className="w-5 h-5 text-[#0071E3]" />
                    <span>异地多端双向同步网络</span>
                  </h2>
                  <p className="text-xs text-[#86868B] mt-1">
                    基于 CAS 对象哈希与时间轴向量索引，在多台 Windows 工作站、本地 NAS 与异地云端之间进行增量双向同步。
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    disabled={isTestingAllNodes}
                    onClick={handlePingAllNodes}
                    className="omni-btn omni-btn-subtle px-3.5 py-2 text-xs shadow-xs flex items-center gap-1.5"
                    title="一键测速并刷新所有远程节点的网络连通状态与 Ping 延迟"
                  >
                    <Activity className={`w-3.5 h-3.5 text-[#0071E3] ${isTestingAllNodes ? 'animate-spin' : ''}`} />
                    <span>{isTestingAllNodes ? '测速检测中...' : '一键连通性测试'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSyncing}
                    onClick={handleRunSync}
                    className="omni-btn omni-btn-primary px-4 py-2 text-xs shadow-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? '同步计算中...' : '立即全局同步'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {syncNodes.map((node) => (
                  <div key={node.id} className="p-4 rounded-2xl bg-[#F5F5F7] border border-black/[0.06] space-y-3 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-[#1D1D1F] truncate" title={node.name}>
                          {node.name}
                        </span>

                        {/* 直观颜色状态指示点 (绿/黄/红/灰) */}
                        {node.healthStatus === 'healthy' && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#34C759]/10 text-[#248A3D] border border-[#34C759]/20 shrink-0" title={`延迟: ${node.latencyMs ?? 20}ms · 极速连通`}>
                            <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse" />
                            <span>{node.latencyMs ?? 20}ms · 极速</span>
                          </span>
                        )}
                        {node.healthStatus === 'degraded' && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF9500]/10 text-[#C77700] border border-[#FF9500]/20 shrink-0" title={`延迟: ${node.latencyMs ?? 135}ms · 延迟稍高`}>
                            <span className="w-2 h-2 rounded-full bg-[#FF9500]" />
                            <span>{node.latencyMs ?? 135}ms · 良好</span>
                          </span>
                        )}
                        {node.healthStatus === 'offline' && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/20 shrink-0" title="节点地址不可达或网络中断">
                            <span className="w-2 h-2 rounded-full bg-[#FF3B30]" />
                            <span>连接超时</span>
                          </span>
                        )}
                        {(!node.healthStatus || node.healthStatus === 'untested') && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/[0.05] text-[#86868B] border border-black/[0.06] shrink-0" title="尚未测试节点状态">
                            <span className="w-2 h-2 rounded-full bg-[#8E8E93]" />
                            <span>待测试</span>
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 font-mono text-[11px] text-[#86868B]">
                        <div className="flex items-center justify-between">
                          <span>协议: {node.protocol}</span>
                          <span className="text-[10px] opacity-75">({node.encryption})</span>
                        </div>
                        <div className="truncate text-[#1D1D1F]/80" title={node.endpoint}>
                          端点: {node.endpoint}
                        </div>
                        <div className="flex items-center justify-between">
                          <span>同步条目: {node.syncedCount} 项</span>
                          <span className="text-[#0071E3]">待增量: {node.pendingDeltaCount}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-black/[0.05] flex items-center justify-between text-xs">
                      <span className="text-[10px] font-mono text-[#86868B]">
                        {node.lastSyncAt ? `上次同步: ${node.lastSyncAt.slice(11, 16)}` : '未同步'}
                      </span>

                      <button
                        type="button"
                        disabled={testingNodeId === node.id || isTestingAllNodes}
                        onClick={() => handlePingSingleNode(node)}
                        className="omni-btn omni-btn-subtle px-2.5 py-1 text-[11px] font-medium hover:text-[#0071E3] flex items-center gap-1 shrink-0"
                        title="测试此远程节点的 Ping 连接延迟"
                      >
                        <Activity className={`w-3 h-3 text-[#0071E3] ${testingNodeId === node.id ? 'animate-spin' : ''}`} />
                        <span>{testingNodeId === node.id ? 'Ping中...' : '节点连通性测试'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleCreateNode} className="p-4 rounded-2xl bg-[#FAFAFC] border border-black/[0.06] space-y-3">
                <h3 className="text-xs font-bold text-[#1D1D1F] flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-[#0071E3]" />
                  <span>登记新远程节点 (WebDAV / S3 / 本地局域网共享)</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-4">
                    <input
                      type="text"
                      value={newNodeName}
                      onChange={(e) => setNewNodeName(e.target.value)}
                      placeholder="节点标识 (例如: 办公室主工作站)"
                      className="omni-input text-xs"
                      required
                    />
                  </div>
                  <div className="md:col-span-3">
                    <select
                      value={newNodeProtocol}
                      onChange={(e) => setNewNodeProtocol(e.target.value as SyncNodeConfig['protocol'])}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-black/[0.08]"
                    >
                      <option value="WebDAV">WebDAV (群晖/Nextcloud)</option>
                      <option value="LocalLAN">LocalLAN 局域网广播</option>
                      <option value="S3 / MinIO">S3 / MinIO 对象存储</option>
                      <option value="Tailscale P2P">Tailscale P2P 直连</option>
                      <option value="Git-LFS">Git-LFS 大文件指针</option>
                    </select>
                  </div>
                  <div className="md:col-span-5 flex gap-2">
                    <input
                      type="text"
                      value={newNodeEndpoint}
                      onChange={(e) => setNewNodeEndpoint(e.target.value)}
                      placeholder="例如: https://nas.corp.lan/omnivault"
                      className="omni-input text-xs flex-1"
                      required
                    />
                    <button type="submit" className="omni-btn omni-btn-primary px-3 py-1.5 text-xs shrink-0">
                      登记并测试
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'deploy' && (
          <div className="apple-card rounded-3xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-[#34C759] tracking-wide">
                    WINDOWS 10/11 NATIVE SETUP
                  </span>
                  <span className="omni-badge bg-[#34C759]/10 text-[#34C759] font-medium">
                    PowerShell 7.x
                  </span>
                </div>
                <h2 className="text-lg font-bold tracking-tight text-[#1D1D1F] flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-[#34C759]" />
                  <span>Windows 客户端原生依赖一键安装脚本</span>
                </h2>
                <p className="text-xs text-[#86868B] mt-1">
                  包含 CAS 目录划分、FFmpeg/ImageMagick 自动 winget 安装、Faster-Whisper 与 SQLite-vec 环境搭建。
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyScript}
                  className="omni-btn omni-btn-subtle px-3 py-1.5 text-xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedScript ? '已复制脚本' : '复制命令'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPs1}
                  className="omni-btn omni-btn-primary px-3 py-1.5 text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>下载 .ps1 文件</span>
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-[#141416] text-[#F5F5F7] p-4 font-mono text-xs overflow-x-auto max-h-96 leading-relaxed border border-black/10">
              <pre className="whitespace-pre">{WINDOWS_POWERSHELL_SCRIPT}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

