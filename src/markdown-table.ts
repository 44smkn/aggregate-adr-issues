export function markdownTable(arr: string[][]): string {
    if (!arr || arr.length === 0) return '';

    // ヘッダー行を作成
    let table = '| ' + arr[0].join(' | ') + ' |\n';

    // 区切り行を作成
    table += '| ' + arr[0].map(col => '-'.repeat(col.length)).join(' | ') + ' |\n';

    // データ行を作成
    for (let i = 1; i < arr.length; i++) {
        table += '| ' + arr[i].join(' | ') + ' |\n';
    }

    return table;
}
