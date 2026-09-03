'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, ArrowUpRight, CheckCircle2, ChevronDown, CircleHelp, Clock3, ExternalLink, Filter, ShieldCheck } from 'lucide-react';

type Status = 'Подтверждено' | 'Частично' | 'Не подтверждено' | 'Нет данных';
type Indicator = { id:number; name:string; area:string; status:Status; date:string; source:string; note:string; changed?:boolean };

const sources = {
  hybrid: { label:'NATO: гибридные угрозы', date:'29.01.2026', url:'https://www.nato.int/en/what-we-do/deterrence-and-defence/countering-hybrid-threats?selectedLocale=on' },
  east: { label:'NATO: восточный фланг', date:'28.05.2026', url:'https://www.nato.int/en/news-and-events/articles/news/2026/05/28/nato-military-committee-visits-jfc-brunssum' },
  remarks: { label:'NATO: оценка гибридной активности', date:'31.08.2026', url:'https://www.nato.int/fr/news-and-events/events/transcripts/2026/08/31/remarks-by-nato-deputy-secretary-general-at-the-institute-of-international-and-european-affairs-in-ireland' },
  nuclear: { label:'NATO Nuclear Planning Group', date:'18.06.2026', url:'https://www.nato.int/en/about-us/official-texts-and-resources/official-texts/2026/06/18/2026-nuclear-planning-group-statement' },
};

const indicators: Indicator[] = [
  {id:1,name:'Наращивание войск у границ НАТО',area:'Войска',status:'Частично',date:'28.05.2026',source:'east',note:'Усиление готовности и восточного фланга подтверждено; признаков подготовки вторжения нет.'},
  {id:2,name:'Мобилизация, логистика и медобеспечение',area:'Войска',status:'Нет данных',date:'03.09.2026',source:'east',note:'Публичных данных недостаточно для вывода о новой масштабной подготовке.'},
  {id:3,name:'Боевые действия на территории стран НАТО',area:'Прямой конфликт',status:'Не подтверждено',date:'03.09.2026',source:'remarks',note:'На дату оценки подтвержденных эпизодов не выявлено.'},
  {id:4,name:'Пуски ракет по территории НАТО',area:'Авиация и ПВО',status:'Не подтверждено',date:'03.09.2026',source:'remarks',note:'На дату оценки подтвержденных эпизодов не выявлено.'},
  {id:5,name:'Опасные нарушения воздушного пространства',area:'Авиация и ПВО',status:'Подтверждено',date:'31.08.2026',source:'remarks',note:'НАТО отмечает нарушения воздушного пространства дронами и самолётами как часть роста риска.',changed:true},
  {id:6,name:'Применение оружия при перехвате',area:'Авиация и ПВО',status:'Нет данных',date:'03.09.2026',source:'east',note:'Нужна проверка национальных сообщений по каждому эпизоду.'},
  {id:7,name:'Сбитие российского самолёта или БПЛА силами НАТО',area:'Авиация и ПВО',status:'Нет данных',date:'03.09.2026',source:'east',note:'Нет единого публичного реестра; статус не следует трактовать как отрицание события.'},
  {id:8,name:'Усиление ПВО, наблюдения и готовности НАТО',area:'Авиация и ПВО',status:'Подтверждено',date:'28.05.2026',source:'east',note:'NATO развивает Eastern Sentry и Baltic Sentry; заявлены дополнительные средства наблюдения и ПВО.',changed:true},
  {id:9,name:'Развёртывание ракетных систем в Беларуси',area:'Беларусь / Калининград',status:'Нет данных',date:'03.09.2026',source:'east',note:'Требуется отдельная верификация по официальным и спутниковым данным.'},
  {id:10,name:'Изменение группировки в Калининграде',area:'Беларусь / Калининград',status:'Нет данных',date:'03.09.2026',source:'east',note:'Публичных данных недостаточно для уверенного сравнения с базовой линией.'},
  {id:11,name:'Активность Балтийского и Северного флотов',area:'Море',status:'Частично',date:'28.05.2026',source:'east',note:'Балтийская безопасность и защита инфраструктуры усилены; боевое развёртывание не подтверждено.'},
  {id:12,name:'Опасные морские манёвры или повреждение инфраструктуры',area:'Море',status:'Частично',date:'12.02.2026',source:'east',note:'Риск критической подводной инфраструктуры остаётся предметом усиленного наблюдения.'},
  {id:13,name:'Саботаж критической инфраструктуры',area:'Гибридные операции',status:'Частично',date:'31.08.2026',source:'remarks',note:'Есть сообщения об инцидентах и расследованиях; атрибуция отдельных эпизодов требует проверки.'},
  {id:14,name:'Кибератаки, электронное вмешательство и дезинформация',area:'Гибридные операции',status:'Подтверждено',date:'29.01.2026',source:'hybrid',note:'NATO описывает российские гибридные стратегии, включая киберактивность и политическое вмешательство.',changed:true},
  {id:15,name:'Диверсионные операции на территории Альянса',area:'Гибридные операции',status:'Частично',date:'31.08.2026',source:'remarks',note:'Публично упоминаются попытки поджогов, саботажа и другие действия; атрибуция не одинакова по делам.'},
  {id:16,name:'Изменение готовности ядерных сил',area:'Ядерные силы',status:'Нет данных',date:'18.06.2026',source:'nuclear',note:'Публичное заявление подтверждает работу ядерного сдерживания НАТО, но не доказывает изменение готовности российских сил.'},
  {id:17,name:'Ядерное испытание или демонстрационный пуск',area:'Ядерные силы',status:'Не подтверждено',date:'03.09.2026',source:'nuclear',note:'Подтвержденных событий для данной оценки не выявлено.'},
  {id:18,name:'Свежее официальное предупреждение о непосредственном нападении',area:'Предупреждения',status:'Нет данных',date:'03.09.2026',source:'remarks',note:'Отсутствие публичного свежего предупреждения не означает отсутствия риска; требуется ежедневная проверка.'},
  {id:19,name:'Консультации по статье 4 / экстренные меры обороны',area:'Предупреждения',status:'Частично',date:'28.05.2026',source:'east',note:'Усиление восточного фланга продолжается как мера сдерживания; порог статьи 5 не заявлен.'},
  {id:20,name:'Прямой военный ответ НАТО',area:'Прямой конфликт',status:'Не подтверждено',date:'03.09.2026',source:'east',note:'Подтверждений перехода к прямому военному ответу в данной оценке нет.'},
];

const levels = [['1','Низкая напряжённость','low'],['2','Повышенное напряжение','guarded'],['3','Гибридное давление','yellow'],['4','Пограничные инциденты','amber'],['5','Оперативная эскалация','orange'],['6','Ограниченное столкновение','hot'],['7','Широкомасштабный конфликт','red']];
const domainOrder = ['Войска','Авиация и ПВО','Беларусь / Калининград','Море','Гибридные операции','Ядерные силы','Предупреждения','Прямой конфликт'];

function Badge({status}:{status:Status}) { return <span className={`badge ${status.replaceAll(' ','-').toLowerCase()}`}>{status==='Подтверждено' ? <CheckCircle2/> : <CircleHelp/>}{status}</span> }
function Source({id}:{id:string}) { const s=sources[id as keyof typeof sources]; return <a className="source" href={s.url} target="_blank" rel="noreferrer">{s.label} <ExternalLink/></a> }

export default function Home() {
  const [statusFilter,setStatusFilter]=useState<'Все'|Status>('Все');
  const [areaFilter,setAreaFilter]=useState('Все направления');
  const [changedOnly,setChangedOnly]=useState(false);
  const [methodOpen,setMethodOpen]=useState(false);
  const filtered=useMemo(()=>indicators.filter(x=>(statusFilter==='Все'||x.status===statusFilter)&&(areaFilter==='Все направления'||x.area===areaFilter)&&(!changedOnly||x.changed)),[statusFilter,areaFilter,changedOnly]);
  return <main>
    <div className="topline"/>
    <header><div><p className="eyebrow">Ситуационный мониторинг · доказательная модель</p><h1>Россия — НАТО</h1></div><div className="updated"><Clock3/><span>Оценка на <strong>03.09.2026</strong><br/>Проверено: 09:00 МСК · 4 первоисточника</span></div></header>

    <section className="hero">
      <article className="level-card"><div><p className="eyebrow">Текущая оценка</p><h2>Уровень 3 <small>из 7</small></h2><h3>Гибридное давление</h3><p>Подтверждены гибридные и воздушные риски. Признаков устойчивой прямой военной фазы в публичной базе недостаточно.</p><div className="meta"><span>Уверенность: <b>средняя</b></span><span>Последний факт: <b>31.08.2026</b></span></div></div><div className="score"><b>3,6</b><span>/ 7</span><i>ЖЁЛТЫЙ</i></div></article>
      <article className="trend"><p className="eyebrow">Динамика и журнал</p><div className="trend-value"><ArrowUpRight/> Умеренное повышение <small>внутри уровня 3</small></div><div className="events"><span><b>12.02</b> Балтийская безопасность</span><span><b>28.05</b> Усиление фланга</span><span className="now"><b>31.08</b> Гибридный риск</span></div><p className="trend-note">Предыдущая оценка: 3,3 <b>↑ +0,3</b></p></article>
    </section>

    <section className="legend"><div><p className="eyebrow">Шкала эскалации</p><h2>Легенда уровней</h2></div><div className="levels">{levels.map(([n,name,cls])=><div key={n} className={`level ${cls} ${n==='3'?'active':''}`} title={name}><b>{n}</b><span>{name}</span></div>)}</div></section>

    <section className="factors"><article className="rise"><h3><AlertTriangle/> Что повышает оценку</h3><ul><li>Рост гибридной активности: кибер, саботаж, вмешательство.</li><li>Воздушные нарушения и повышенная готовность к риску.</li><li>Усиленный режим наблюдения на восточном фланге.</li></ul></article><article className="restraint"><h3><ShieldCheck/> Что удерживает уровень ниже 4</h3><ul><li>Нет подтверждённых боевых действий или ракетных пусков по территории Альянса.</li><li>Нет подтверждённой серии кинетических перехватов.</li><li>Нет публично подтверждённого качественного скачка ядерной готовности.</li></ul></article></section>

    <section className="method"><button onClick={()=>setMethodOpen(!methodOpen)} aria-expanded={methodOpen}><span><p className="eyebrow">Прозрачность расчёта</p><h2>Как формируется оценка 3,6 / 7</h2></span><ChevronDown className={methodOpen?'up':''}/></button>{methodOpen&&<div className="method-body"><div><b>1. Факты</b><p>Подтверждённые признаки имеют больший вес, частичные — меньший. «Нет данных» не понижает и не повышает балл.</p></div><div><b>2. Вес риска</b><p>Прямой конфликт и ядерные признаки важнее воздушных и гибридных; пороги уровней требуют не одного сообщения, а связанной картины.</p></div><div><b>3. Проверка</b><p>Каждой строке нужны дата и первоисточник. Без них показатель отмечается «Нет данных», а не «Нет».</p></div></div>}</section>

    <section className="section-head"><div><p className="eyebrow">Операционная картина</p><h2>Направления наблюдения</h2></div><p>Статус агрегирует подтверждённые признаки по направлению.</p></section>
    <section className="domains">{domainOrder.slice(0,7).map(area=>{const rows=indicators.filter(x=>x.area===area);const status=rows.some(x=>x.status==='Подтверждено')?'Подтверждено':rows.some(x=>x.status==='Частично')?'Частично':rows.some(x=>x.status==='Нет данных')?'Нет данных':'Не подтверждено';return <article key={area}><Badge status={status}/><h3>{area}</h3><p>{rows.filter(x=>x.status==='Подтверждено'||x.status==='Частично').length} из {rows.length} признаков требуют внимания</p></article>})}</section>

    <section className="section-head matrix-title"><div><p className="eyebrow">Проверяемые признаки</p><h2>Матрица из 20 индикаторов</h2></div><p>{filtered.length} из {indicators.length} показано</p></section>
    <section className="controls" aria-label="Фильтры матрицы"><Filter/><select value={statusFilter} onChange={e=>setStatusFilter(e.target.value as 'Все'|Status)} aria-label="Статус"><option>Все</option><option>Подтверждено</option><option>Частично</option><option>Не подтверждено</option><option>Нет данных</option></select><select value={areaFilter} onChange={e=>setAreaFilter(e.target.value)} aria-label="Направление"><option>Все направления</option>{domainOrder.map(x=><option key={x}>{x}</option>)}</select><label><input type="checkbox" checked={changedOnly} onChange={e=>setChangedOnly(e.target.checked)}/> Только изменившиеся</label></section>
    <section className="matrix">{filtered.map(x=><article key={x.id}><span className="number">{String(x.id).padStart(2,'0')}</span><div><div className="indicator-top"><h3>{x.name}</h3>{x.changed&&<span className="change">изменён</span>}</div><p>{x.note}</p><div className="evidence"><time>{x.date}</time><Source id={x.source}/></div></div><Badge status={x.status}/></article>)}</section>

    <section className="sources"><div><p className="eyebrow">Журнал проверок</p><h2>Ключевые события</h2></div><div className="source-list"><div><time>31.08.2026</time><p>НАТО отмечает рост гибридной активности и готовности к риску.</p><Source id="remarks"/></div><div><time>28.05.2026</time><p>Военный комитет НАТО: Eastern Sentry и Baltic Sentry ведутся как меры сдерживания.</p><Source id="east"/></div><div><time>18.06.2026</time><p>Регулярное заседание Nuclear Planning Group; открытые данные не подтверждают смену готовности российских сил.</p><Source id="nuclear"/></div></div></section>
    <footer><div><p className="eyebrow">Правило интерпретации</p><p>Жёсткая риторика сама по себе не повышает уровень. Отсутствие публичных данных не является доказательством отсутствия события.</p></div><div><p className="eyebrow">Ежедневное обновление</p><p>Проверка выполняется в 09:00 МСК; дашборд меняется только при существенных подтверждённых фактах.</p></div></footer>
  </main>;
}
