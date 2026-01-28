// 在浏览器控制台运行此脚本，诊断提示词管理页面按钮问题
console.log('='.repeat(60));
console.log('📋 提示词管理UI诊断工具');
console.log('='.repeat(60));

// 检查按钮是否存在
console.log('\n1. 检查按钮元素:');
const buttons = {
    save: $('#gg_save_pmt'),
    reset: $('#gg_reset_pmt'),
    newProfile: $('#gg_new_profile_btn'),
    openTableEditor: $('#gg_open_table_editor_btn')
};

for (const [name, $btn] of Object.entries(buttons)) {
    if ($btn.length > 0) {
        console.log(`✅ ${name}: 找到`);
        // 检查是否有点击事件
        const events = $._data($btn[0], 'events');
        if (events && events.click) {
            console.log(`   - 已绑定 ${events.click.length} 个点击事件`);
        } else {
            console.log(`   - ❌ 没有绑定点击事件！`);
        }
    } else {
        console.log(`❌ ${name}: 未找到`);
    }
}

// 检查总结/批量提示词标签
console.log('\n2. 检查提示词标签:');
const tabs = $('input[name="pmt-sum-type"]');
console.log(`找到 ${tabs.length} 个标签`);
tabs.each(function() {
    const val = $(this).val();
    const checked = $(this).is(':checked') ? '✓' : ' ';
    console.log(`  [${checked}] ${val}`);
});

// 检查事件监听
console.log('\n3. 检查标签切换事件:');
const tabEvents = $._data($('input[name="pmt-sum-type"]')[0], 'events');
if (tabEvents && tabEvents.change) {
    console.log(`✅ 标签切换事件已绑定`);
} else {
    console.log(`❌ 标签切换事件未绑定`);
}

// 尝试手动触发保存按钮
console.log('\n4. 测试保存按钮:');
console.log('请在控制台输入以下命令手动触发保存:');
console.log('$("#gg_save_pmt").click();');

console.log('\n' + '='.repeat(60));
console.log('诊断完成！');
console.log('='.repeat(60));
