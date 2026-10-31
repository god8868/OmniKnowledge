import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  Plus,
  Trash2,
  FolderOpen,
  Tag,
  Clock,
  FileCode,
  Layers,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import {
  AutomationRule,
  AutomationConditionTarget,
  AutomationConditionOperator,
  AutomationActionType,
  KnowledgeItem,
  matchesAutomationRule,
} from '../utils/knowledgeEngine';

interface AutomationRulesConfigProps {
  rules: AutomationRule[];
  items: KnowledgeItem[];
  onUpdateRules: (newRules: AutomationRule[]) => void;
  onApplyRulesNow: () => void;
}

export const AutomationRulesConfig: React.FC<AutomationRulesConfigProps> = ({
  rules,
  items,
  onUpdateRules,
  onApplyRulesNow,
}) => {
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState<AutomationConditionTarget>('ext');
  const [operator, setOperator] = useState<AutomationConditionOperator>('in');
  const [conditionValue, setConditionValue] = useState('');
  const [actionType, setActionType] = useState<AutomationActionType>('assignTags');
  const [actionValue, setActionValue] = useState('');

  const handleToggleRule = (ruleId: string) => {
    onUpdateRules(
      rules.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleDeleteRule = (ruleId: string) => {
    onUpdateRules(rules.filter((r) => r.id !== ruleId));
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !conditionValue.trim() || !actionValue.trim()) return;

    const newRule: AutomationRule = {
      id: `rule-${Date.now()}`,
      name: name.trim(),
      enabled: true,
      target,
      operator,
      conditionValue: conditionValue.trim(),
      actionType,
      actionValue: actionValue.trim(),
    };

    onUpdateRules([...rules, newRule]);
    setName('');
    setConditionValue('');
    setActionValue('');
    setIsAddingRule(false);
  };

  const enabledRulesCount = rules.filter((r) => r.enabled).length;

  return (
    <div className="space-y-6">
      <div className="apple-card rounded-3xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-[#0071E3] tracking-wide">
                AUTOMATION ENGINE
              </span>
              <span className="omni-badge bg-[#0071E3]/10 text-[#0071E3]">
                {enabledRulesCount}/{rules.length} 启用
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[#1D1D1F] flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#0071E3]" />
              <span>知识资产自动化分流与标引规则</span>
            </h2>
            <p className="text-xs text-[#86868B] mt-1">
              依据文件扩展名、模态类别或创建时间，自动执行打标、归档目录分流及重要度加权，降低知识库整理维护成本。
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onApplyRulesNow}
              className="omni-btn omni-btn-primary px-4 py-2 text-xs shadow-xs"
              title="立即对全量资产运行全部启用规则"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>立即执行规则</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAddingRule((v) => !v)}
              className="omni-btn omni-btn-subtle px-3 py-2 text-xs"
              title="创建新自动化规则"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新增规则</span>
            </button>
          </div>
        </div>

        {isAddingRule && (
          <form
            onSubmit={handleCreateRule}
            className="p-5 rounded-2xl bg-[#F5F5F7] border border-black/[0.06] space-y-4 animate-in fade-in duration-150"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-[#1D1D1F] pb-2 border-b border-black/[0.06]">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#0071E3]" />
                <span>配置新规则触发器与执行动作</span>
              </span>
              <button
                type="button"
                onClick={() => setIsAddingRule(false)}
                className="text-[#86868B] hover:text-[#1D1D1F]"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-12">
                <label className="block text-xs font-medium text-[#424245] mb-1">
                  规则名称
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例如：3D与CAD工程图纸自动分流到独立目录"
                  className="omni-input text-xs"
                  required
                />
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs font-medium text-[#424245] mb-1">
                  条件触发维度 (Target)
                </label>
                <select
                  value={target}
                  onChange={(e) => {
                    const nextTarget = e.target.value as AutomationConditionTarget;
                    setTarget(nextTarget);
                    if (nextTarget === 'createdAgeDays') {
                      setOperator('newerThanDays');
                      setConditionValue('14');
                    } else if (nextTarget === 'ext') {
                      setOperator('in');
                      setConditionValue('dxf, step, dwg');
                    } else {
                      setOperator('equals');
                      setConditionValue('image');
                    }
                  }}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-black/[0.08]"
                >
                  <option value="ext">文件扩展名 (.ext)</option>
                  <option value="category">多模态类别 (Category)</option>
                  <option value="createdAgeDays">创建时间距今 (Age Days)</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-[#424245] mb-1">
                  运算符 (Operator)
                </label>
                <select
                  value={operator}
                  onChange={(e) => setOperator(e.target.value as AutomationConditionOperator)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-black/[0.08]"
                >
                  {target === 'createdAgeDays' ? (
                    <>
                      <option value="newerThanDays">≤ N 天以内 (近期)</option>
                      <option value="olderThanDays">≥ N 天以前 (陈旧)</option>
                    </>
                  ) : (
                    <>
                      <option value="in">包含在列表之中 (in)</option>
                      <option value="equals">精确相等 (equals)</option>
                    </>
                  )}
                </select>
              </div>

              <div className="md:col-span-5">
                <label className="block text-xs font-medium text-[#424245] mb-1">
                  条件匹配值 (Condition Value)
                </label>
                <input
                  type="text"
                  value={conditionValue}
                  onChange={(e) => setConditionValue(e.target.value)}
                  placeholder={
                    target === 'createdAgeDays'
                      ? '例如：7 (天数)'
                      : target === 'ext'
                      ? '例如：dxf, dwg, step, iges'
                      : '例如：media 或 code'
                  }
                  className="omni-input text-xs"
                  required
                />
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs font-medium text-[#424245] mb-1">
                  执行动作类型 (Action)
                </label>
                <select
                  value={actionType}
                  onChange={(e) => {
                    const nextAct = e.target.value as AutomationActionType;
                    setActionType(nextAct);
                    if (nextAct === 'setDirectory') {
                      setActionValue('D:\\OmniKnowledge\\01_Engineering_CAD\\');
                    } else if (nextAct === 'assignTags') {
                      setActionValue('工程图档, 待审核');
                    } else {
                      setActionValue('true');
                    }
                  }}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-black/[0.08]"
                >
                  <option value="assignTags">自动追加标签 (assignTags)</option>
                  <option value="setDirectory">归类到 Windows 目录 (setDirectory)</option>
                  <option value="markImportant">标记为重要条目 (markImportant)</option>
                </select>
              </div>

              <div className="md:col-span-8">
                <label className="block text-xs font-medium text-[#424245] mb-1">
                  动作目标值 (Action Value)
                </label>
                <input
                  type="text"
                  value={actionValue}
                  onChange={(e) => setActionValue(e.target.value)}
                  placeholder={
                    actionType === 'setDirectory'
                      ? '例如：D:\\OmniKnowledge\\01_Engineering_CAD\\'
                      : actionType === 'assignTags'
                      ? '例如：工程图档, 工业设计, CAD标准'
                      : 'true'
                  }
                  className="omni-input text-xs"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingRule(false)}
                className="omni-btn omni-btn-subtle px-3 py-1.5 text-xs"
              >
                取消
              </button>
              <button
                type="submit"
                className="omni-btn omni-btn-primary px-4 py-1.5 text-xs"
              >
                保存规则
              </button>
            </div>
          </form>
        )}

        <div className="divide-y divide-black/[0.05] rounded-2xl border border-black/[0.06] overflow-hidden bg-white">
          {rules.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#86868B]">
              暂未配置任何自动化规则，可点击右上角「新增规则」添加。
            </div>
          ) : (
            rules.map((rule) => {
              const matchedCount = items.filter((it) => matchesAutomationRule(it, rule)).length;
              return (
                <div
                  key={rule.id}
                  className={`p-4 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    rule.enabled ? 'hover:bg-[#F5F5F7]/60' : 'bg-black/[0.02] opacity-70'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      type="button"
                      aria-label={rule.enabled ? '停用规则' : '启用规则'}
                      onClick={() => handleToggleRule(rule.id)}
                      className={`mt-0.5 w-8 h-5 rounded-full transition-colors relative shrink-0 ${
                        rule.enabled ? 'bg-[#0071E3]' : 'bg-black/[0.18]'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                          rule.enabled ? 'translate-x-3' : 'translate-x-0'
                        }`}
                      />
                    </button>

                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-xs text-[#1D1D1F]">
                          {rule.name}
                        </span>
                        <span className="omni-badge bg-black/[0.05] text-[#86868B] font-mono">
                          匹配 {matchedCount} 条资产
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[#86868B]">
                          {rule.target === 'ext' && <FileCode className="w-3 h-3 text-[#0071E3]" />}
                          {rule.target === 'category' && <Layers className="w-3 h-3 text-[#5856D6]" />}
                          {rule.target === 'createdAgeDays' && <Clock className="w-3 h-3 text-[#FF9500]" />}
                          <span className="font-medium text-[#1D1D1F]">
                            {rule.target === 'ext'
                              ? '扩展名'
                              : rule.target === 'category'
                              ? '文件模态'
                              : '创建时间'}
                          </span>
                          <span className="text-[#86868B] font-mono">
                            {rule.operator === 'in'
                              ? '∈'
                              : rule.operator === 'equals'
                              ? '='
                              : rule.operator === 'newerThanDays'
                              ? '≤'
                              : '≥'}
                          </span>
                          <span className="font-mono font-semibold text-[#1D1D1F] bg-black/[0.04] px-1.5 py-0.5 rounded">
                            {rule.conditionValue}
                            {rule.target === 'createdAgeDays' ? ' 天' : ''}
                          </span>
                        </span>

                        <span className="text-black/20">→</span>

                        <span className="inline-flex items-center gap-1 text-[#86868B]">
                          {rule.actionType === 'setDirectory' && (
                            <>
                              <FolderOpen className="w-3 h-3 text-[#34C759]" />
                              <span className="font-medium text-[#1D1D1F]">归集至</span>
                              <span className="font-mono text-[#34C759] font-medium bg-[#34C759]/10 px-1.5 py-0.5 rounded truncate max-w-xs">
                                {rule.actionValue}
                              </span>
                            </>
                          )}
                          {rule.actionType === 'assignTags' && (
                            <>
                              <Tag className="w-3 h-3 text-[#0071E3]" />
                              <span className="font-medium text-[#1D1D1F]">追加标签</span>
                              <span className="font-medium text-[#0071E3] bg-[#0071E3]/10 px-1.5 py-0.5 rounded">
                                {rule.actionValue.split(/[\s,，、|]+/).map((t) => `#${t}`).join(' ')}
                              </span>
                            </>
                          )}
                          {rule.actionType === 'markImportant' && (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-amber-500" />
                              <span className="font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                                标为重要 ★
                              </span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 self-end md:self-center">
                    <button
                      type="button"
                      aria-label="删除规则"
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1.5 text-[#86868B] hover:text-[#FF3B30] transition-colors rounded-lg hover:bg-black/[0.04]"
                      title="删除此规则"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
