// ========================================================================
// 提示词管理页面完整诊断脚本
// 在浏览器控制台运行此脚本，全面检查所有按钮和交互元素
// ========================================================================

console.log('='.repeat(80));
console.log('🔍 提示词管理页面完整诊断工具');
console.log('='.repeat(80));

// 1. 检查弹窗是否存在
console.log('\n1️⃣ 检查弹窗容器:');
const $overlay = $('.g-ov');
if ($overlay.length > 0) {
    console.log(`✅ 找到 ${$overlay.length} 个弹窗容器`);
    console.log('   弹窗是否可见:', $overlay.is(':visible'));
    console.log('   弹窗z-index:', $overlay.css('z-index'));
} else {
    console.error('❌ 未找到弹窗容器 (.g-ov)');
}

// 2. 检查所有按钮元素
console.log('\n2️⃣ 检查按钮元素:');
const buttons = {
    '保存设置': '#gg_save_pmt',
    '恢复默认': '#gg_reset_pmt'
};

for (const [name, selector] of Object.entries(buttons)) {
    const $btn = $(selector);
    if ($btn.length > 0) {
        console.log(`✅ ${name} (${selector}): 找到`);
        console.log(`   - 是否可见: ${$btn.is(':visible')}`);
        console.log(`   - 是否禁用: ${$btn.prop('disabled')}`);
        console.log(`   - CSS pointer-events: ${$btn.css('pointer-events')}`);
        console.log(`   - 位置: top=${$btn.offset()?.top}, left=${$btn.offset()?.left}`);
        console.log(`   - 尺寸: width=${$btn.outerWidth()}, height=${$btn.outerHeight()}`);

        // 检查事件绑定
        const events = $._data($btn[0], 'events');
        if (events && events.click) {
            console.log(`   - ✅ 已绑定 ${events.click.length} 个点击事件`);
        } else {
            console.error(`   - ❌ 没有绑定点击事件！`);
        }
    } else {
        console.error(`❌ ${name} (${selector}): 未找到`);
    }
}

// 3. 检查标签切换按钮
console.log('\n3️⃣ 检查提示词类型切换标签:');
const $tabs = $('input[name="pmt-sum-type"]');
console.log(`找到 ${$tabs.length} 个标签`);
$tabs.each(function(i) {
    const val = $(this).val();
    const checked = $(this).is(':checked');
    const $label = $(this).parent('label');
    console.log(`  [${checked ? '✓' : ' '}] ${val}`);
    console.log(`      - label ID: ${$label.attr('id')}`);
    console.log(`      - label 是否可见: ${$label.is(':visible')}`);
    console.log(`      - label CSS pointer-events: ${$label.css('pointer-events')}`);

    // 检查事件
    const radioEvents = $._data(this, 'events');
    if (radioEvents && radioEvents.change) {
        console.log(`      - ✅ radio已绑定change事件`);
    } else {
        console.error(`      - ❌ radio未绑定change事件`);
    }
});

// 4. 检查是否有遮挡层
console.log('\n4️⃣ 检查可能的遮挡元素:');
const $saveBtn = $('#gg_save_pmt');
if ($saveBtn.length > 0) {
    const btnPos = $saveBtn.offset();
    const btnCenterX = btnPos.left + $saveBtn.outerWidth() / 2;
    const btnCenterY = btnPos.top + $saveBtn.outerHeight() / 2;

    const elemAtPoint = document.elementFromPoint(btnCenterX, btnCenterY);
    if (elemAtPoint) {
        const $elemAtPoint = $(elemAtPoint);
        if ($elemAtPoint.is($saveBtn) || $saveBtn.has(elemAtPoint).length > 0) {
            console.log('✅ 保存按钮位置没有被遮挡');
        } else {
            console.warn('⚠️ 保存按钮位置被其他元素遮挡:');
            console.log(`   遮挡元素: ${elemAtPoint.tagName}${elemAtPoint.id ? '#' + elemAtPoint.id : ''}${elemAtPoint.className ? '.' + elemAtPoint.className.split(' ').join('.') : ''}`);
        }
    }
}

// 5. 检查jQuery版本和兼容性
console.log('\n5️⃣ 检查jQuery环境:');
if (typeof $ !== 'undefined') {
    console.log(`✅ jQuery版本: ${$.fn.jquery || '未知'}`);
} else {
    console.error('❌ jQuery未加载');
}

// 6. 检查console错误
console.log('\n6️⃣ 测试手动触发事件:');
console.log('请在控制台依次执行以下命令测试:');
console.log('');
console.log('// 测试保存按钮');
console.log('$("#gg_save_pmt").trigger("click");');
console.log('');
console.log('// 测试标签切换');
console.log('$("input[name=\'pmt-sum-type\'][value=\'chat\']").prop("checked", true).trigger("change");');
console.log('');
console.log('// 检查是否有JavaScript错误（打开Console查看）');

// 7. 监听点击事件
console.log('\n7️⃣ 启动点击监听器（30秒）:');
let clickCount = 0;
const clickListener = function(e) {
    clickCount++;
    console.log(`🖱️ 检测到点击 #${clickCount}:`, {
        target: e.target.tagName + (e.target.id ? '#' + e.target.id : ''),
        offsetX: e.offsetX,
        offsetY: e.offsetY,
        button: e.button
    });
};

$(document).on('click', clickListener);
console.log('✅ 点击监听器已启动，请尝试点击按钮...');

setTimeout(() => {
    $(document).off('click', clickListener);
    console.log(`\n⏰ 监听结束，共检测到 ${clickCount} 次点击`);
}, 30000);

console.log('\n' + '='.repeat(80));
console.log('📋 诊断完成！请查看上述信息，并尝试手动触发命令');
console.log('='.repeat(80));
