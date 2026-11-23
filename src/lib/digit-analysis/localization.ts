type Mode = 'single' | 'double' | 'triple';
type Guide = [term: string, explanation: string][];
const labels = ['title','back','chooseProvider','providerOptions','modeLabel','filterLabel','drawLabel','noDate','guide','results','empty','close','loading','error','retry','locked','guest','signIn','account','disclaimer'] as const;
const metricKeys = ['current','recentPerformance','averageComparison','recentAppearance','lastAppearance','historicalRange','occurrences','state','streak','gap','averageGap','longest','lastDate','lastDraw','median','p80','p90','p95'] as const;
function keyed<const K extends string>(keys:readonly K[], values: readonly string[]):Record<K,string>{
 return Object.fromEntries(keys.map((k,i)=>[k,values[i]])) as Record<K,string>;
}
function makeCopy(ui:string[], m:string[], modeNames:[string,string,string], filterNames:string[], stateNames:string[], rounds:string, times:string, windows:[(n:number)=>string,(n:number)=>string,(n:number)=>string], guideTitles:[string,string,string], guides:Record<Mode,Guide>){
 return {...keyed(labels,ui),metrics:keyed(metricKeys,m),modes:keyed(['single','double','triple'],modeNames),filters:keyed(['all23','top3','special','consolation'],filterNames),states:keyed(['average','hot','cold','extreme_hot','extreme_cold'],stateNames),rounds,times,recent:windows[0],expected:windows[1],comparison:windows[2],guideTitles:keyed(['single','double','triple'],guideTitles),guides};
}
const zhGap:[string,string]=['已经几期没出现','这个组合从上一次出现到现在，连续多少期没有再出现。'];
const zhAvg:[string,string]=['平均隔几期','历史上这个组合两次出现之间，平均相隔多少期。'];
const zhLong:[string,string]=['历史最长没出现','历史记录中，这个组合最长曾连续多少期没有出现。'];
const zhRecent='表示这个组合在最近这些期开奖中出现了多少次。';
const enGap:[string,string]=['Draws since last seen','The number of consecutive draws since this pattern last appeared.'];
const enAvg:[string,string]=['Average gap','The historical average number of draws between appearances of this pattern.'];
const enLong:[string,string]=['Longest gap','The longest historical run of draws without this pattern appearing.'];
const enRecent='How many times this pattern appeared in these recent draws.';
const msGap:[string,string]=['Cabutan sejak kali terakhir','Bilangan cabutan berturut-turut sejak pola ini kali terakhir muncul.'];
const msAvg:[string,string]=['Purata sela','Purata bilangan cabutan antara dua kemunculan pola ini dalam rekod lalu.'];
const msLong:[string,string]=['Sela terpanjang','Bilangan cabutan berturut-turut paling lama tanpa kemunculan pola ini dalam rekod lalu.'];
const msRecent='Bilangan kali pola ini muncul dalam cabutan terkini ini.';
export const trackerCopy = {
 zh:makeCopy(
 ['数字分析 Pro','工具首页','选择博彩公司','博彩公司选项','分析类型','奖项范围','期号','资料日期未提供','指标说明','数字分析结果','暂无数据','关闭','载入数字分析数据…','无法加载数字分析数据','重试','此功能需要有效的 Pro 或试用权益。','请登录以查看你的权益。','登录','账号设置','这些资料只用来了解历史情况，不表示号码下一期一定会怎样。'],
 ['当前资料','最近表现','平均比较','最近出现','上次出现','历史范围','本期出现几次','目前状态','状态连续期数',zhGap[0],zhAvg[0],zhLong[0],'上次出现日期','上次出现期号','多数情况隔几期','80%出现范围','90%出现范围','95%出现范围'],
 ['单个数字','两个相同','三个相同'],['全部奖项','头二三奖','特别奖','安慰奖'],['正常','偏热','偏冷','极热','极冷'],' 期',' 次',
 [n=>'近'+n+'期',n=>'近'+n+'期 平均次数',n=>'近'+n+'期 比平均次数'],['单个数字指标说明','两个相同指标说明','三个相同指标说明'],{
 single:[
 ['本期出现几次','表示这个数字在本期开奖结果所有开奖号码中，一共出现了多少次。'],
 ['目前状态','目前状态是根据这个数字在本期开奖结果中的“本期出现几次”划分。'],
 ['五种状态次数范围','极冷 0-5 次，偏冷 6-7 次，正常 8-10 次，偏热 11-12 次，极热 13 次或以上。'],
 ['状态连续期数','表示这个数字已经连续多少期处于目前这个状态；不是表示这个号码连续每期都有出现。'],
 ['近3期 / 近5期 / 近10期','表示这个数字在最近这些期开奖的所有开奖号码中，总共出现了多少次。'],
 ['平均次数','表示按照历史正常平均情况，在相同统计范围内，这个数字平均会出现多少次。'],
 ['比平均次数','表示实际出现次数和平均次数相比，多了或少了多少。']],
 double:[['两个相同','这里统计的是一个数字重复两次，另外两个数字不同。例如：1123 统计 11；5667 统计 66。像 1122 这种有两组相同数字的号码，目前不包括在这里。'],zhGap,zhAvg,zhLong,['近5期 / 近10期 / 近30期',zhRecent],['近20期 / 近50期 / 近100期',zhRecent],['上次出现日期 / 上次出现期号','最近一次出现这个组合的开奖日期和期号。']],
 triple:[['三个相同','这里统计的是一个数字出现三次，另外一个数字不同。例如：1112 统计 111；7773 统计 777；0005 统计 000。'],zhGap,zhAvg,
 ['多数情况隔几期','把历史间隔从小到大排列后，看中间位置的数值；它比较不容易被特别长的间隔影响。'],
 ['80%出现范围','历史上大约80%的出现间隔没有超过这个期数。'],
 ['90%出现范围','历史上大约90%的出现间隔没有超过这个期数。'],
 ['95%出现范围','例如 95%出现范围，表示历史上约95%的出现间隔不超过这个数值。'],
 zhLong,['已经几期没出现 / 95%出现范围','列表会优先显示目前较久没有出现、且相对历史情况更靠前的组合。']]}),
 en:makeCopy(
 ['Digit Analysis Pro','Toolbox','Choose an operator','Operator options','Analysis type','Prize category','Draw number','Data date unavailable','Metric Guide','Digit analysis results','No data available','Close','Loading digit analysis…','Could not load digit analysis','Retry','This feature requires an active Pro membership or trial.','Sign in to check your access.','Sign in','Account settings','These figures describe historical results only and do not predict the next draw.'],
 ['Current data','Recent performance','Compared with average','Recent appearances','Last appearance','Historical range','This draw count','Current state','State streak',enGap[0],enAvg[0],enLong[0],'Last appearance date','Last appearance draw number','Median gap','80% gap threshold','90% gap threshold','95% gap threshold'],
 ['Single','Double','Triple'],['All prizes','Top 3','Special','Consolation'],['Normal','Warm','Cool','Very hot','Very cold'],' draws',' times',
 [n=>'Last '+n+' draws',n=>'Last '+n+' draws: average count',n=>'Last '+n+' draws: vs. average'],['Single Metric Guide','Double Metric Guide','Triple Metric Guide'],{
 single:[
 ['This draw count','How many times this digit appeared across all winning numbers in this draw.'],['Current state','Based on the number of appearances of this digit in the current draw.'],
 ['Five state thresholds','Very cold: 0–5, cool: 6–7, normal: 8–10, warm: 11–12, very hot: 13 or more.'],['State streak','Consecutive draws in the current state. It does not mean the digit appeared in every draw.'],
 ['Last 3 / 5 / 10 draws','Total appearances of this digit across all winning numbers in those draws.'],['Average count','Historically expected number of appearances over the same window.'],['Vs. average','How much higher or lower the actual count was than the average.']],
 double:[['Double','One digit appears twice and the other two digits are different. For example, 1123 counts as 11 and 5667 as 66. Two pairs, like 1122, are not included.'],enGap,enAvg,enLong,['Last 5 / 10 / 30 draws',enRecent],['Last 20 / 50 / 100 draws',enRecent],['Last appearance date / draw number','The date and draw number of the most recent appearance.']],
 triple:[['Triple','One digit appears three times and the fourth digit is different. For example, 1112 counts as 111, 7773 as 777 and 0005 as 000.'],enGap,enAvg,['Median gap','The middle value of the historical gaps, less affected by very long gaps.'],...([80,90,95].map((n):[string,string]=>[n+'% gap threshold','About '+n+'% of past gaps did not exceed this number of draws.'])),enLong,['Draws since last seen / 95% gap threshold','Patterns rank higher when their current gap is longer relative to their own historical gaps.']]}),
 ms:makeCopy(
 ['Analisis Digit Pro','Kotak alat','Pilih pengendali','Pilihan pengendali','Jenis analisis','Kategori hadiah','Nombor cabutan','Tarikh data tidak tersedia','Panduan metrik','Hasil analisis digit','Tiada data','Tutup','Memuatkan analisis digit…','Analisis digit tidak dapat dimuatkan','Cuba lagi','Fungsi ini memerlukan akses Pro atau percubaan yang aktif.','Log masuk untuk menyemak akses anda.','Log masuk','Tetapan akaun','Angka ini menerangkan keputusan lalu sahaja dan tidak meramalkan cabutan seterusnya.'],
 ['Data semasa','Prestasi terkini','Perbandingan dengan purata','Kemunculan terkini','Kemunculan terakhir','Julat sejarah','Bilangan dalam cabutan ini','Keadaan semasa','Cabutan berturut dalam keadaan ini',msGap[0],msAvg[0],msLong[0],'Tarikh kemunculan terakhir','Nombor cabutan kemunculan terakhir','Median sela','Ambang sela 80%','Ambang sela 90%','Ambang sela 95%'],
 ['Satu digit','Dua digit sama','Tiga digit sama'],['Semua hadiah','3 teratas','Khas','Saguhati'],['Normal','Agak panas','Agak sejuk','Sangat panas','Sangat sejuk'],' cabutan',' kali',
 [n=>n+' cabutan terakhir',n=>n+' cabutan terakhir: purata',n=>n+' cabutan terakhir: beza daripada purata'],['Panduan metrik satu digit','Panduan metrik dua digit sama','Panduan metrik tiga digit sama'],{
 single:[['Bilangan dalam cabutan ini','Bilangan kali digit ini muncul dalam semua nombor kemenangan cabutan ini.'],['Keadaan semasa','Ditentukan berdasarkan bilangan kemunculan digit ini dalam cabutan semasa.'],['Ambang lima keadaan','Sangat sejuk: 0–5, agak sejuk: 6–7, normal: 8–10, agak panas: 11–12, sangat panas: 13 kali atau lebih.'],['Cabutan berturut dalam keadaan ini','Bilangan cabutan berturut-turut dalam keadaan semasa. Ini tidak bermakna digit itu muncul dalam setiap cabutan.'],['3 / 5 / 10 cabutan terakhir','Jumlah kemunculan digit ini dalam semua nombor kemenangan bagi cabutan berkenaan.'],['Purata kemunculan','Purata sejarah untuk bilangan kemunculan dalam tempoh yang sama.'],['Beza daripada purata','Perbezaan antara bilangan kemunculan sebenar dengan purata.']],
 double:[['Dua digit sama','Satu digit muncul dua kali dan dua digit lain berbeza. Contohnya, 1123 dikira sebagai 11 dan 5667 sebagai 66. Dua pasangan seperti 1122 tidak dikira.'],msGap,msAvg,msLong,['5 / 10 / 30 cabutan terakhir',msRecent],['20 / 50 / 100 cabutan terakhir',msRecent],['Tarikh / nombor cabutan terakhir','Tarikh dan nombor cabutan apabila pola ini kali terakhir muncul.']],
 triple:[['Tiga digit sama','Satu digit muncul tiga kali dan digit keempat berbeza. Contohnya, 1112 dikira sebagai 111, 7773 sebagai 777 dan 0005 sebagai 000.'],msGap,msAvg,['Median sela','Nilai pertengahan sela sejarah, kurang dipengaruhi sela yang sangat panjang.'],...([80,90,95].map((n):[string,string]=>['Ambang sela '+n+'%','Kira-kira '+n+'% sela dalam rekod lalu tidak melebihi bilangan cabutan ini.'])),msLong,['Cabutan sejak kali terakhir / ambang sela 95%','Pola diberi kedudukan lebih tinggi apabila sela semasa lebih panjang berbanding sela sejarahnya sendiri.']]})
} as const;
export type TrackerCopy=(typeof trackerCopy)[keyof typeof trackerCopy];
