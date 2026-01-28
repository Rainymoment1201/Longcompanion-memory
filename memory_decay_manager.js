// ========================================================================
// 记忆衰减与权重管理系统
// Memory Decay & Weight Management System
// ========================================================================

(function () {
    'use strict';

    // ==================== 配置常量 ====================
    const MEMORY_CONFIG = {
        enableMemoryDecay: true,
        enableMemoryCompression: true,
        enableAutoCleanup: false,

        dormancyThresholds: {
            core: 90,
            important: 60,
            normal: 30,
            trivial: 14
        },

        deleteThreshold: 20,
        clarityMode: 'auto',
        showWeightInUI: false
    };

    // ==================== 记忆元数据存储 ====================
    const METADATA_KEY = 'gg_memory_metadata';
    let memoryMetadata = {};

    /**
     * 加载记忆元数据
     */
    function loadMetadata() {
        try {
            const stored = localStorage.getItem(METADATA_KEY);
            if (stored) {
                memoryMetadata = JSON.parse(stored);
            }
        } catch (e) {
            console.error('❌ 加载记忆元数据失败:', e);
            memoryMetadata = {};
        }
    }

    /**
     * 保存记忆元数据
     */
    function saveMetadata() {
        try {
            localStorage.setItem(METADATA_KEY, JSON.stringify(memoryMetadata));
        } catch (e) {
            console.error('❌ 保存记忆元数据失败:', e);
        }
    }

    /**
     * 获取记忆的唯一ID
     */
    function getMemoryId(tableIndex, rowIndex) {
        return `${tableIndex}_${rowIndex}`;
    }

    /**
     * 初始化记忆元数据
     */
    function initMemoryMetadata(tableIndex, rowIndex, importance = 'normal', emotional = 0) {
        const id = getMemoryId(tableIndex, rowIndex);
        const now = Date.now();

        if (!memoryMetadata[id]) {
            memoryMetadata[id] = {
                tableIndex: tableIndex,
                rowIndex: rowIndex,

                // 权重相关
                initialWeight: 50,
                currentWeight: 50,

                // 时间追踪
                createTime: now,
                lastAccessTime: now,
                lastUpdateTime: now,

                // 频率统计
                accessCount: 1,
                updateCount: 0,
                mentionCount: 0,

                // 重要性评估
                importanceLevel: importance,
                emotionalIntensity: emotional,
                userConfirmed: false,

                // 记忆状态
                memoryPhase: 'short',
                clarity: 100,
                compressed: false,
                originalContent: null,

                // 休眠管理
                dormantDays: 0,
                isDormant: false,
                canBeDeleted: false
            };

            saveMetadata();
        }

        return memoryMetadata[id];
    }

    // ==================== 权重计算 ====================

    /**
     * 计算记忆的当前权重
     */
    function calculateMemoryWeight(metadata) {
        const now = Date.now();
        const daysSinceCreate = (now - metadata.createTime) / (1000 * 60 * 60 * 24);
        const daysSinceAccess = (now - metadata.lastAccessTime) / (1000 * 60 * 60 * 24);

        let weight = metadata.initialWeight;

        // 重要性系数
        const importanceMultiplier = {
            'core': 2.0,
            'important': 1.5,
            'normal': 1.0,
            'trivial': 0.5
        };
        weight *= importanceMultiplier[metadata.importanceLevel] || 1.0;

        // 频率加成
        const frequencyBonus = Math.min(metadata.accessCount * 2, 30);
        weight += frequencyBonus;

        // 情感强度加成
        const emotionalBonus = metadata.emotionalIntensity * 3;
        weight += emotionalBonus;

        // 用户确认加成
        if (metadata.userConfirmed) {
            weight += 20;
        }

        // 时间衰减 (艾宾浩斯遗忘曲线)
        const memoryStrength = weight / 10;
        const retentionRate = Math.exp(-daysSinceAccess / memoryStrength);
        weight *= retentionRate;

        // 更新频率加成
        const updateBonus = Math.min(metadata.updateCount * 3, 15);
        weight += updateBonus;

        // 记忆阶段调整
        const phaseMultiplier = {
            'short': 0.8,
            'medium': 1.0,
            'long': 1.2
        };
        weight *= phaseMultiplier[metadata.memoryPhase] || 1.0;

        // 限制范围
        weight = Math.max(0, Math.min(100, weight));

        metadata.currentWeight = weight;
        return weight;
    }

    // ==================== 清晰度处理 ====================

    /**
     * 移除次要细节
     */
    function removeMinorDetails(content) {
        if (!content) return content;

        return content
            .replace(/(.{2,4}?)区/g, '') // 去掉区县
            .replace(/；[^；]{0,10}$/g, '') // 去掉最后一个短句
            .replace(/、[^、]{1,5}/g, ''); // 简化并列项
    }

    /**
     * 获取概要
     */
    function getSummary(content) {
        if (!content) return content;

        const parts = content.split(/[,，；]/);
        if (parts.length <= 2) return content;

        return parts.slice(0, 2).join(',') + '...';
    }

    /**
     * 获取模糊描述
     */
    function getVagueDescription(content) {
        if (!content) return content;

        const firstPart = content.split(/[,，；]/)[0];
        return `好像${firstPart},具体记不清了`;
    }

    /**
     * 计算记忆清晰度并返回对应内容
     */
    function getMemoryClarity(metadata, originalContent) {
        if (!MEMORY_CONFIG.enableMemoryDecay) {
            return {
                clarity: 100,
                level: 'very_clear',
                content: originalContent
            };
        }

        const currentWeight = calculateMemoryWeight(metadata);
        let clarity = currentWeight;

        let clarityLevel, modifiedContent;

        if (clarity >= 80) {
            clarityLevel = 'very_clear';
            modifiedContent = originalContent;
        } else if (clarity >= 60) {
            clarityLevel = 'clear';
            modifiedContent = removeMinorDetails(originalContent);
        } else if (clarity >= 30) {
            clarityLevel = 'blurry';
            modifiedContent = getSummary(originalContent);
        } else {
            clarityLevel = 'very_blurry';
            modifiedContent = getVagueDescription(originalContent);
        }

        // 根据配置返回
        if (MEMORY_CONFIG.clarityMode === 'full') {
            modifiedContent = originalContent;
        } else if (MEMORY_CONFIG.clarityMode === 'summary') {
            modifiedContent = getSummary(originalContent);
        }

        return {
            clarity: clarity,
            level: clarityLevel,
            content: modifiedContent
        };
    }

    // ==================== 记忆阶段管理 ====================

    /**
     * 更新记忆阶段
     */
    function updateMemoryPhase(metadata) {
        const now = Date.now();
        const daysSinceCreate = (now - metadata.createTime) / (1000 * 60 * 60 * 24);
        const currentWeight = calculateMemoryWeight(metadata);

        if (currentWeight >= 70 || daysSinceCreate >= 30) {
            metadata.memoryPhase = 'long';
        } else if (currentWeight >= 50 || daysSinceCreate >= 7) {
            metadata.memoryPhase = 'medium';
        } else {
            metadata.memoryPhase = 'short';
        }

        return metadata.memoryPhase;
    }

    // ==================== 休眠与清理 ====================

    /**
     * 检查休眠状态
     */
    function checkDormancy(metadata) {
        const now = Date.now();
        const daysSinceAccess = (now - metadata.lastAccessTime) / (1000 * 60 * 60 * 24);

        metadata.dormantDays = Math.floor(daysSinceAccess);

        const threshold = MEMORY_CONFIG.dormancyThresholds[metadata.importanceLevel] || 30;

        if (daysSinceAccess >= threshold) {
            metadata.isDormant = true;

            const currentWeight = calculateMemoryWeight(metadata);
            if (currentWeight < MEMORY_CONFIG.deleteThreshold && metadata.importanceLevel === 'trivial') {
                metadata.canBeDeleted = true;
            }
        } else {
            metadata.isDormant = false;
            metadata.canBeDeleted = false;
        }

        return metadata;
    }

    /**
     * 压缩记忆
     */
    function compressMemory(metadata, originalContent) {
        if (!MEMORY_CONFIG.enableMemoryCompression) return originalContent;
        if (metadata.compressed) return originalContent;

        const currentWeight = calculateMemoryWeight(metadata);

        if (currentWeight < 40 && metadata.dormantDays > 60) {
            metadata.compressed = true;
            metadata.originalContent = originalContent; // 备份原始内容
            saveMetadata();
            return getSummary(originalContent);
        }

        return originalContent;
    }

    // ==================== 记忆激活 ====================

    /**
     * 激活记忆 (用户提醒时)
     */
    function activateMemory(tableIndex, rowIndex, reminderStrength = 5) {
        const id = getMemoryId(tableIndex, rowIndex);
        let metadata = memoryMetadata[id];

        if (!metadata) {
            metadata = initMemoryMetadata(tableIndex, rowIndex);
        }

        const now = Date.now();

        // 更新访问时间
        metadata.lastAccessTime = now;
        metadata.accessCount += 1;

        // 提升权重
        const weightBoost = reminderStrength * 5;
        metadata.initialWeight = Math.min(100, metadata.initialWeight + weightBoost);

        // 恢复清晰度
        if (metadata.compressed && metadata.originalContent) {
            metadata.compressed = false;
            // 返回完整内容的标志
        }

        // 标记为用户确认
        metadata.userConfirmed = true;

        // 解除休眠
        metadata.isDormant = false;
        metadata.dormantDays = 0;
        metadata.canBeDeleted = false;

        // 重新评估阶段
        updateMemoryPhase(metadata);

        saveMetadata();

        console.log(`✅ 记忆已激活 [${tableIndex},${rowIndex}]: 权重 ${metadata.initialWeight.toFixed(1)}`);

        return metadata;
    }

    /**
     * 记录访问
     */
    function recordAccess(tableIndex, rowIndex) {
        const id = getMemoryId(tableIndex, rowIndex);
        let metadata = memoryMetadata[id];

        if (!metadata) {
            metadata = initMemoryMetadata(tableIndex, rowIndex);
        }

        metadata.lastAccessTime = Date.now();
        metadata.accessCount += 1;

        updateMemoryPhase(metadata);
        checkDormancy(metadata);

        saveMetadata();
    }

    /**
     * 记录更新
     */
    function recordUpdate(tableIndex, rowIndex) {
        const id = getMemoryId(tableIndex, rowIndex);
        let metadata = memoryMetadata[id];

        if (!metadata) {
            metadata = initMemoryMetadata(tableIndex, rowIndex);
        }

        metadata.lastUpdateTime = Date.now();
        metadata.updateCount += 1;

        // 更新会提升初始权重
        metadata.initialWeight = Math.min(100, metadata.initialWeight + 5);

        updateMemoryPhase(metadata);

        saveMetadata();
    }

    // ==================== 批量处理 ====================

    /**
     * 批量更新所有记忆的状态
     */
    function updateAllMemories() {
        console.log('🔄 开始批量更新记忆状态...');

        let total = 0;
        let dormant = 0;
        let deletable = 0;
        let compressed = 0;

        for (const id in memoryMetadata) {
            const metadata = memoryMetadata[id];
            total++;

            calculateMemoryWeight(metadata);
            updateMemoryPhase(metadata);
            checkDormancy(metadata);

            if (metadata.isDormant) dormant++;
            if (metadata.canBeDeleted) deletable++;
            if (metadata.compressed) compressed++;
        }

        saveMetadata();

        console.log(`✅ 记忆状态更新完成:
    总计: ${total}
    休眠: ${dormant}
    可删除: ${deletable}
    已压缩: ${compressed}`);

        return { total, dormant, deletable, compressed };
    }

    /**
     * 获取所有可删除的记忆
     */
    function getDeletableMemories() {
        const deletable = [];

        for (const id in memoryMetadata) {
            const metadata = memoryMetadata[id];
            if (metadata.canBeDeleted) {
                deletable.push({
                    id: id,
                    tableIndex: metadata.tableIndex,
                    rowIndex: metadata.rowIndex,
                    weight: metadata.currentWeight,
                    dormantDays: metadata.dormantDays
                });
            }
        }

        return deletable;
    }

    // ==================== 导出API ====================

    window.Gaigai = window.Gaigai || {};
    window.Gaigai.MemoryDecay = {
        // 配置
        config: MEMORY_CONFIG,

        // 核心功能
        initMetadata: initMemoryMetadata,
        calculateWeight: calculateMemoryWeight,
        getClarity: getMemoryClarity,
        activateMemory: activateMemory,

        // 记录操作
        recordAccess: recordAccess,
        recordUpdate: recordUpdate,

        // 批量操作
        updateAll: updateAllMemories,
        getDeletable: getDeletableMemories,

        // 工具函数
        getMetadata: (tableIndex, rowIndex) => memoryMetadata[getMemoryId(tableIndex, rowIndex)],
        saveMetadata: saveMetadata,
        loadMetadata: loadMetadata
    };

    // 初始化
    loadMetadata();
    console.log('✅ 记忆衰减系统已加载');

})();
