import test from 'node:test';
import assert from 'node:assert/strict';
import {metricSections,metricValue} from '../src/lib/digit-analysis/presentation.ts';
import {trackerCopy} from '../src/lib/digit-analysis/localization.ts';
const {guides:GUIDE,guideTitles:GUIDE_TITLE}=trackerCopy.zh;
test('each mode has its own guide title and distinct app definitions',()=>{
 assert.deepEqual(Object.values(GUIDE_TITLE),['单个数字指标说明','两个相同指标说明','三个相同指标说明']);
 assert.deepEqual(Object.values(GUIDE).map(rows=>rows.length),[7,7,9]);
 assert.match(GUIDE.double[0][1],/1122/);
 assert.match(GUIDE.triple[0][1],/0005/);
 assert.match(GUIDE.single[2][1],/13 次或以上/);
});
test('Single popup follows the three exact sections and preserves zero & missing',()=>{
 const data={current_occurrences:0,current_state:'extreme_cold',current_streak:2,heat:{last_3:{occurrences:18,expected:19.543,vs_expected_pct:-7.9}}};
 const result=metricSections(data,'single','all23');
 assert.deepEqual(result.map(s=>s.title),['当前资料','最近表现','平均比较']);
 assert.deepEqual(result[0].rows,[['本期出现几次','0 次'],['目前状态','极冷'],['状态连续期数','2 期']]);
 assert.deepEqual(result[1].rows,[['近3期','18 次'],['近5期','--'],['近10期','--']]);
 assert.deepEqual(result[2].rows.map(r=>r[1]),['19.54 次','--','--','-7.9%','--','--']);
});
test('Double popup Top3 windows differ from all other scopes',()=>{
 const data={current_gap:1,average_gap:3.5,historical_max_gap:7,last_hit_date:'2026-01-01',last_hit_draw_no:'DEMO'};
 for (const filter of ['all23','top3','special','consolation']){
  const sections=metricSections(data,'double',filter);
  assert.deepEqual(sections.map(s=>s.title),['当前资料','最近出现','上次出现']);
  assert.deepEqual(sections[1].rows.map(r=>r[0]),filter==='top3'?['近20期','近50期','近100期']:['近5期','近10期','近30期']);
  assert.deepEqual(sections[2].rows,[['上次出现日期','2026-01-01'],['上次出现期号','DEMO']]);
 }
});
test('Triple popup only shows the Android gap and percentile fields',()=>{
 const sections=metricSections({p80:8,p90:10,p95:19,historical_max:30,total_hits:999,current_over_max:999},'triple','all23');
 assert.deepEqual(sections.map(s=>s.title),['当前资料','历史范围','上次出现']);
 assert.deepEqual(sections[1].rows,[['80%出现范围','8 期'],['90%出现范围','10 期'],['95%出现范围','19 期'],['历史最长没出现','30 期']]);
 assert.ok(!JSON.stringify(sections).includes('999'));
 assert.equal(metricValue(0,' 期'),'0 期');
 assert.equal(metricValue(null,' 期'),'--');
});
test('all copy, guides and per-mode popup sections render in each locale',()=>{
 for(const locale of ['zh','en','ms']){
  const copy=trackerCopy[locale];
  for(const mode of ['single','double','triple']){
   assert.equal(copy.guides[mode].length,mode==='triple'?9:7);
   assert.ok(copy.guideTitles[mode]);
   const sections=metricSections({},mode,'top3',locale);
   assert.equal(sections.length,3);
   assert.ok(sections.every(s=>s.title&&s.rows.every(([label,value])=>label&&value)));
  }
 }
});
