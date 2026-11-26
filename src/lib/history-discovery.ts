// A bounded navigation allowlist, verified against public result pages on 2026-11-26.
// This is not an upstream history index and must not change latest30 or draw navigation.
export const historyDiscovery = [
  {
    region: 'east-malaysia', provider: 'sabah88',
    dates: ['2026-11-18', '2026-10-18', '2026-08-16', '2026-07-22', '2026-07-19', '2026-07-18', '2026-07-12', '2026-07-05', '2026-06-28', '2026-06-21', '2026-06-17', '2026-05-23', '2026-05-09', '2026-05-02']
  },
  {
    region: 'east-malaysia', provider: 'sandakan',
    dates: ['2026-07-28', '2026-07-12', '2026-07-11', '2026-07-04', '2026-07-01', '2026-06-24', '2026-06-21', '2026-06-17', '2026-06-10', '2026-05-31', '2026-05-20', '2026-05-17', '2026-05-10', '2026-04-26', '2026-04-18', '2026-04-08']
  }
] as const;

export function getHistoryDiscovery(region: string, provider: string) {
  return historyDiscovery.find((item) => item.region === region && item.provider === provider);
}

export const historyDiscoveryCopy = {
  en: {title: 'Selected past results', intro: 'Browse selected past draw dates. This directory is a selection, not a complete archive. The latest 30 results remain in company history.', back: 'Back to company history', open: 'View result'},
  zh: {title: '往期开奖结果选录', intro: '浏览部分往期开奖日期。本目录为选录，并非完整历史档案。最新 30 期仍在公司历史页面查看。', back: '返回公司历史', open: '查看成绩'},
  ms: {title: 'Pilihan keputusan terdahulu', intro: 'Lihat pilihan tarikh cabutan terdahulu. Direktori ini bukan arkib lengkap. 30 keputusan terkini kekal pada halaman sejarah syarikat.', back: 'Kembali ke sejarah syarikat', open: 'Lihat keputusan'}
} as const;
