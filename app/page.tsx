'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowUpRight, Bell, CheckCircle2, ChevronDown, CircleHelp, Clock3, ExternalLink, Filter, MailPlus, ShieldCheck, X } from 'lucide-react';
import assessment from '../data/assessment.json';

type Status = 'Подтверждено' | 'Частично' | 'Не подтверждено' | 'Нет данных';
type Indicator = { id:number; name:string; area:string; status:Status; date:string; source:string; note:string; changed?:boolean };

const sources = {
  hybrid: { label:'NATO: гибридные угрозы', date:'29.01.2026', url:'https://www.nato.int/en/what-we-do/deterrence-and-defence/countering-hybrid-threats?selectedLocale=on' },
  east: { label:'NATO: восточный фланг', date:'28.05.2026', url:'https://www.nato.int/en/news-and-events/articles/news/2026/05/28/nato-military-committee-visits-jfc-brunssum' },
  remarks: { label:'NATO: оценка гибридной активности', date:'31.08.2026', url:'https://www.nato.int/fr/news-and-events/events/transcripts/2026/08/31/remarks-by-nato-deputy-secretary-general-at-the-institute-of-international-and-european-affairs-in-ireland' },
  leipzig: { label:'ФРГ: атрибуция атаки в Лейпциге', date:'02.09.2026', url:'https://www.auswaertiges-amt.de/de/newsroom/regierungspressekonferenz-2800710' },
  berlin: { label:'НАТО: солидарность с Германией и Eastern Sentry', date:'10.09.2026', url:'https://www.nato.int/en/news-and-events/articles/news/2026/09/10/nato-secretary-general-in-berlin-germany-and-nato-30-strengthening-europe-delivering-for-the-alliance' },
  nuclear: { label:'NATO Nuclear Planning Group', date:'18.06.2026', url:'https://www.nato.int/en/about-us/official-texts-and-resources/official-texts/2026/06/18/2026-nuclear-planning-group-statement' },
  denmark: { label:'ВС Дании: уточнённая хронология инцидента с Fennec', date:'25.09.2026', url:'https://www.forsvaret.dk/da/nyheder/2026/fakta-om-handelse-med-russisk-chikane-af-dansk-helikopter/' },
  lithuania: { label:'МИД Литвы: нарушение воздушного пространства', date:'18.09.2026', url:'https://www.mfa.lt/en/news/928/statement-by-foreign-minister-kestutis-budrys-on-the-violation-of-lithuanias-airspace%3A46457' },
  italy: { label:'Минобороны Италии: нейтрализация БПЛА', date:'15.09.2026', url:'https://www.difesa.it/primopiano/velivoli-italiani-intercettano-drone-nello-spazio-aereo-lituano/111915.html' },
  poland: { label:'Сейм Польши: сообщение замминистра обороны', date:'17.09.2026', url:'https://www.sejm.gov.pl/sejm10.nsf/wypowiedz.xsp?dzien=3&posiedzenie=65&wyp=044' },
  latvia: { label:'Минобороны Латвии: усиление ПВО', date:'17.09.2026', url:'https://www.mod.gov.lv/en/news/allied-fighter-jets-strengthen-protection-latvias-airspace-during-elections' },
  latviaAlert: { label:'ВС Латвии: воздушная тревога и активация авиации НАТО', date:'21.09.2026', url:'https://www.mil.lv/lv/zinas/iespejams-apdraudejums-latvijas-gaisa-telpa-kraslavas-novada' },
  latviaClear: { label:'ВС Латвии: завершение воздушной тревоги', date:'21.09.2026', url:'https://www.mil.lv/lv/zinas/iespejams-apdraudejums-latvijas-gaisa-telpa-nosledzies-plkst-2350' },
  denmarkThreat: { label:'Разведслужба Дании: оценка угрозы со стороны России', date:'24.09.2026', url:'https://www.fe-ddis.dk/da/nyheder/2026/vurdering-af-truslen-fra-rusland/' },
  nato24: { label:'НАТО: оценка риска после доклада Дании', date:'24.09.2026', url:'https://www.nato.int/en/news-and-events/events/transcripts/2026/09/24/keynote-speech' },
};

const indicators: Indicator[] = [
  {id:1,name:'Наращивание войск у границ НАТО',area:'Войска',status:'Частично',date:'10.09.2026',source:'berlin',note:'НАТО подтверждает усиление восточного фланга; публичных признаков подготовки вторжения не представлено.'},
  {id:2,name:'Мобилизация, логистика и медобеспечение',area:'Войска',status:'Нет данных',date:'03.09.2026',source:'east',note:'Публичных данных недостаточно для вывода о новой масштабной подготовке.'},
  {id:3,name:'Боевые действия на территории стран НАТО',area:'Прямой конфликт',status:'Частично',date:'18.09.2026',source:'lithuania',note:'Над Литвой применена сила для нейтрализации БПЛА со взрывным устройством; происхождение, принадлежность и цель аппарата расследуются.',changed:true},
  {id:4,name:'Попадание ракеты на территорию НАТО',area:'Авиация и ПВО',status:'Подтверждено',date:'17.09.2026',source:'poland',note:'Замминистра обороны Польши подтвердил: 30 июля в Люблинском воеводстве упала российская крылатая ракета с боевой частью. По его словам, анализ оперативного командования указывает на запланированный характер эпизода; публичных данных о цели ракеты нет. Событие ретроспективное и само по себе не доказывает текущую оперативную подготовку.',changed:true},
  {id:5,name:'Опасные нарушения воздушного пространства',area:'Авиация и ПВО',status:'Подтверждено',date:'18.09.2026',source:'lithuania',note:'МИД Литвы подтвердил вход БПЛА со стороны Беларуси и грубое нарушение литовского воздушного пространства.',changed:true},
  {id:6,name:'Применение оружия при перехвате',area:'Авиация и ПВО',status:'Подтверждено',date:'15.09.2026',source:'italy',note:'Итальянские Eurofighter миссии НАТО перехватили и нейтрализовали БПЛА над Литвой по процедурам Альянса.',changed:true},
  {id:7,name:'Сбитие российского самолёта или БПЛА силами НАТО',area:'Авиация и ПВО',status:'Частично',date:'18.09.2026',source:'lithuania',note:'Факт уничтожения БПЛА подтверждён; его происхождение, принадлежность и возможная цель официально ещё устанавливаются.',changed:true},
  {id:8,name:'Усиление ПВО, наблюдения и готовности НАТО',area:'Авиация и ПВО',status:'Подтверждено',date:'21.09.2026',source:'latviaAlert',note:'При возможной воздушной угрозе в Краславском крае Латвии активированы истребители миссии НАТО и направлены дополнительные подразделения ПВО к восточной границе. Нарушение воздушного пространства, происхождение и намерение предполагаемой цели не подтверждены; тревога завершилась в 23:50. Это оборонительное реагирование, а не признак развёртывания России.',changed:true},
  {id:9,name:'Развёртывание ракетных систем в Беларуси',area:'Беларусь / Калининград',status:'Нет данных',date:'03.09.2026',source:'east',note:'Требуется отдельная верификация по официальным и спутниковым данным.'},
  {id:10,name:'Изменение группировки в Калининграде',area:'Беларусь / Калининград',status:'Нет данных',date:'03.09.2026',source:'east',note:'Публичных данных недостаточно для уверенного сравнения с базовой линией.'},
  {id:11,name:'Активность Балтийского и Северного флотов',area:'Море',status:'Подтверждено',date:'25.09.2026',source:'denmark',note:'ВС Дании идентифицировали российский фрегат Soobrazitelny в международных водах юго-восточнее Гедсера и опубликовали уточнённую хронологию его взаимодействия с датским Fennec.',changed:true},
  {id:12,name:'Опасные морские манёвры или повреждение инфраструктуры',area:'Море',status:'Подтверждено',date:'25.09.2026',source:'denmark',note:'ВС Дании уточнили: сигнальная ракета, выпущенная фрегатом в направлении Fennec без предшествующей попытки связи, прошла примерно в 10–15 метрах; экипаж прекратил фотосъёмку и покинул район.',changed:true},
  {id:13,name:'Саботаж критической инфраструктуры',area:'Гибридные операции',status:'Частично',date:'31.08.2026',source:'remarks',note:'Есть сообщения об инцидентах и расследованиях; атрибуция отдельных эпизодов требует проверки.'},
  {id:14,name:'Кибератаки, электронное вмешательство и дезинформация',area:'Гибридные операции',status:'Подтверждено',date:'29.01.2026',source:'hybrid',note:'NATO описывает российские гибридные стратегии, включая киберактивность и политическое вмешательство.',changed:true},
  {id:15,name:'Диверсионные операции на территории Альянса',area:'Гибридные операции',status:'Подтверждено',date:'10.09.2026',source:'berlin',note:'НАТО вновь подтвердило поддержку Германии после официальной атрибуции гибридной атаки в Лейпциге; это подтверждает конкретный эпизод, а не все сообщения о диверсиях.',changed:true},
  {id:16,name:'Изменение готовности ядерных сил',area:'Ядерные силы',status:'Нет данных',date:'18.06.2026',source:'nuclear',note:'Публичное заявление подтверждает работу ядерного сдерживания НАТО, но не доказывает изменение готовности российских сил.'},
  {id:17,name:'Ядерное испытание или демонстрационный пуск',area:'Ядерные силы',status:'Не подтверждено',date:'03.09.2026',source:'nuclear',note:'Подтвержденных событий для данной оценки не выявлено.'},
  {id:18,name:'Свежее официальное предупреждение о военной угрозе',area:'Предупреждения',status:'Частично',date:'24.09.2026',source:'denmarkThreat',note:'Разведслужба Дании оценивает риск ограниченных военных атак на страну НАТО как низкий, но растущий. Полномасштабное вторжение названо маловероятным; предупреждения о непосредственном нападении нет.',changed:true},
  {id:19,name:'Консультации по статье 4 / экстренные меры обороны',area:'Предупреждения',status:'Частично',date:'10.09.2026',source:'berlin',note:'НАТО продолжает меры сдерживания на восточном фланге; подтверждения перехода к статье 5 нет.'},
  {id:20,name:'Прямой военный ответ НАТО',area:'Прямой конфликт',status:'Частично',date:'15.09.2026',source:'italy',note:'Подтверждено оперативное применение силы НАТО против воздушной цели; подтверждения целенаправленной российской атаки на Литву нет.',changed:true},
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
  const [emailOpen,setEmailOpen]=useState(false);
  const [emails,setEmails]=useState<{email:string; token?:string}[]>([]);
  const [emailInput,setEmailInput]=useState('');
  const [emailError,setEmailError]=useState('');

  useEffect(()=>{
    const saved=window.localStorage.getItem('russia-nato-notification-emails');
    if (saved) {
      try {
        const parsed=JSON.parse(saved);
        setEmails(Array.isArray(parsed) ? parsed.map(item=>typeof item==='string'?{email:item}:item).filter(item=>item?.email) : []);
      } catch { window.localStorage.removeItem('russia-nato-notification-emails'); }
    }
  },[]);

  const saveEmails=(next:{email:string; token?:string}[])=>{
    setEmails(next);
    window.localStorage.setItem('russia-nato-notification-emails',JSON.stringify(next));
  };
  const addEmail=async(event:FormEvent)=>{
    event.preventDefault();
    const email=emailInput.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError('Введите корректный электронный адрес.'); return; }
    if (emails.some(item=>item.email===email&&item.token)) { setEmailError('Этот адрес уже подключён к рассылке.'); return; }
    try {
      const response=await fetch('/api/subscriptions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})});
      const result=await response.json() as {token?:string; error?:string};
      if (!response.ok || !result.token) throw new Error(result.error||'Не удалось сохранить адрес.');
      saveEmails([...emails.filter(item=>item.email!==email),{email,token:result.token}]);
      setEmailInput(''); setEmailError('');
    } catch (error) { setEmailError(error instanceof Error ? error.message : 'Не удалось сохранить адрес.'); }
  };
  const removeEmail=async(item:{email:string;token?:string})=>{
    if (!item.token) { saveEmails(emails.filter(current=>current.email!==item.email)); return; }
    try {
      const response=await fetch('/api/subscriptions',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:item.token})});
      if (!response.ok) throw new Error();
      saveEmails(emails.filter(current=>current.email!==item.email));
    } catch { setEmailError('Не удалось отключить адрес. Попробуйте ещё раз.'); }
  };
  const filtered=useMemo(()=>indicators.filter(x=>(statusFilter==='Все'||x.status===statusFilter)&&(areaFilter==='Все направления'||x.area===areaFilter)&&(!changedOnly||x.changed)),[statusFilter,areaFilter,changedOnly]);
  return <main>
    <div className="topline"/>
    <header><div><p className="eyebrow">Ситуационный мониторинг · доказательная модель</p><h1>Россия — НАТО</h1></div><div className="header-tools"><div className="updated"><Clock3/><span>Оценка на <strong>{assessment.asOf}</strong><br/>{assessment.checkStatus}: <strong>{assessment.lastChecked}</strong> · {assessment.checkedSources} первоисточников</span></div><div className="quick-actions"><button className="primary-button" onClick={()=>setEmailOpen(true)}><Bell/>Подписаться на уведомления{emails.length>0&&<b>{emails.length}</b>}</button></div></div></header>

    <section className="hero">
      <article className={`level-card level-${assessment.level}`}><div><p className="eyebrow">Текущая оценка</p><h2>Уровень {assessment.level} <small>из 7</small></h2><h3>{assessment.label}</h3><p>Подтверждены два военно-оперативных пограничных эпизода. Признаков устойчивой оперативной эскалации и изменения конфигурации сил для уровня 5 пока недостаточно.</p><div className="meta"><span>Уверенность: <b>{assessment.confidence}</b></span><span>Последний инцидент: <b>{assessment.lastFact}</b></span></div></div><div className="score"><b>{assessment.score}</b><span>/ 7</span><i>{assessment.color}</i></div></article>
      <article className="trend"><p className="eyebrow">Динамика и журнал</p><div className="trend-value"><ArrowUpRight/> Повышение на одну ступень <small>уровень 4</small></div><div className="events"><span><b>10.09</b> Гибридное давление</span><span><b>14.09</b> Инцидент у Дании</span><span className="now"><b>15.09</b> БПЛА над Литвой</span></div><p className="trend-note">До перехода на уровень 4: 3,6 <b>↑ +0,6</b><br/>Уточнение об июльском эпизоде в Польше не изменило текущий балл.</p></article>
    </section>

    <section className="legend"><div className="legend-heading"><p className="eyebrow">Шкала эскалации</p><h2>Легенда уровней</h2></div><div className="legend-content"><div className="levels">{levels.map(([n,name,cls])=><div key={n} className={`level ${cls} ${n===String(assessment.level)?'active':''}`} title={name}><b>{n}</b><span>{name}</span></div>)}</div><figure className="scale-art"><img src="/escalation-scale-compact.png" alt="Семь иллюстрированных ступеней: от спокойного наблюдения до широкомасштабного конфликта"/><figcaption>Визуальная шкала: сцены показывают характер риска, а не прогноз событий.</figcaption></figure></div></section>

    <section className="factors"><article className="rise"><h3><AlertTriangle/> Что повышает оценку</h3><ul><li>ВС Дании уточнили, что сигнальная ракета российского фрегата прошла примерно в 10–15 метрах от военного вертолёта Fennec.</li><li>Истребители миссии НАТО нейтрализовали БПЛА со взрывным устройством над Литвой.</li><li>Два подтверждённых военно-оперативных эпизода пересекли порог уровня 4.</li><li>Польша ретроспективно подтвердила попадание российской крылатой ракеты с боевой частью 30 июля; это укрепляет оценку риска, но не доказывает новую текущую операцию.</li><li>Разведслужба Дании оценила риск ограниченных российских военных атак на страну НАТО как низкий, но растущий.</li></ul></article><article className="restraint"><h3><ShieldCheck/> Что удерживает уровень ниже 5</h3><ul><li>Принадлежность и намерение сбитого БПЛА официально ещё расследуются.</li><li>Нет подтверждённой крупной ударной группировки и обеспечивающей логистики у границ НАТО.</li><li>Датская разведка считает полномасштабное вторжение маловероятным и не предупреждает о непосредственном нападении.</li><li>Нет публично подтверждённого качественного скачка ядерной готовности.</li></ul></article></section>

    <section className="method"><button onClick={()=>setMethodOpen(!methodOpen)} aria-expanded={methodOpen}><span><p className="eyebrow">Прозрачность расчёта</p><h2>Как формируется оценка 4,2 / 7</h2></span><ChevronDown className={methodOpen?'up':''}/></button>{methodOpen&&<div className="method-body"><div><b>1. Порог уровня 4</b><p>Два подтверждённых эпизода получили повышенный вес: опасное действие российского военного корабля и применение силы истребителями НАТО над территорией Альянса.</p></div><div><b>2. Почему 4,2</b><p>Базовый уровень 4 установлен за сочетание морского и воздушного инцидентов; ещё 0,2 отражает наличие взрывного устройства. Неустановленные происхождение и намерение БПЛА ограничивают оценку.</p></div><div><b>3. Почему не 5</b><p>Нет подтверждённой связанной картины концентрации войск, логистики, авиации, ПВО и ракетных сил для устойчивой операции против НАТО.</p></div></div>}</section>

    <section className="section-head"><div><p className="eyebrow">Операционная картина</p><h2>Направления наблюдения</h2></div><p>Статус агрегирует подтверждённые признаки по направлению.</p></section>
    <section className="domains">{domainOrder.slice(0,7).map(area=>{const rows=indicators.filter(x=>x.area===area);const status=rows.some(x=>x.status==='Подтверждено')?'Подтверждено':rows.some(x=>x.status==='Частично')?'Частично':rows.some(x=>x.status==='Нет данных')?'Нет данных':'Не подтверждено';return <article key={area}><Badge status={status}/><h3>{area}</h3><p>{rows.filter(x=>x.status==='Подтверждено'||x.status==='Частично').length} из {rows.length} признаков требуют внимания</p></article>})}</section>

    <section className="section-head matrix-title"><div><p className="eyebrow">Проверяемые признаки</p><h2>Матрица из 20 индикаторов</h2></div><p>{filtered.length} из {indicators.length} показано</p></section>
    <section className="controls" aria-label="Фильтры матрицы"><Filter/><select value={statusFilter} onChange={e=>setStatusFilter(e.target.value as 'Все'|Status)} aria-label="Статус"><option>Все</option><option>Подтверждено</option><option>Частично</option><option>Не подтверждено</option><option>Нет данных</option></select><select value={areaFilter} onChange={e=>setAreaFilter(e.target.value)} aria-label="Направление"><option>Все направления</option>{domainOrder.map(x=><option key={x}>{x}</option>)}</select><label><input type="checkbox" checked={changedOnly} onChange={e=>setChangedOnly(e.target.checked)}/> Только изменившиеся</label></section>
    <section className="matrix">{filtered.map(x=><article key={x.id}><span className="number">{String(x.id).padStart(2,'0')}</span><div><div className="indicator-top"><h3>{x.name}</h3>{x.changed&&<span className="change">изменён</span>}</div><p>{x.note}</p><div className="evidence"><time>Источник: {x.date}</time><span>Проверено: {assessment.lastChecked}</span><Source id={x.source}/></div></div><Badge status={x.status}/></article>)}</section>

    <section className="sources"><div><p className="eyebrow">Журнал проверок</p><h2>Ключевые события</h2></div><div className="source-list"><div><time>25.09.2026 — уточнение инцидента у Дании</time><p>ВС Дании опубликовали подробную хронологию события 14 сентября: российский фрегат Soobrazitelny не пытался связаться с Fennec по аварийным каналам, а выпущенная в направлении вертолёта сигнальная ракета прошла примерно в 10–15 метрах. Это усиливает подтверждение опасности уже учтённого эпизода, но не создаёт нового инцидента и не меняет оценку 4,2.</p><Source id="denmark"/></div><div><time>24.09.2026 — новая оценка разведслужбы</time><p>Разведслужба Дании оценила риск ограниченных российских военных атак на страну НАТО как низкий, но растущий, а полномасштабное вторжение — как маловероятное. НАТО публично сослалось на эту оценку. Это значимый предупреждающий индикатор, но не подтверждение подготовки непосредственного нападения; уровень и балл не изменены.</p><Source id="denmarkThreat"/> <Source id="nato24"/></div><div><time>21.09.2026 — воздушная тревога</time><p>ВС Латвии объявили о возможной угрозе в Краславском крае, активации истребителей НАТО и усилении ПВО у восточной границы. Тревога закончилась в 23:50. Факт нарушения воздушного пространства, принадлежность объекта и его намерение не установлены; оценка 4,2 не повышена.</p><Source id="latviaAlert"/> <Source id="latviaClear"/></div><div><time>18.09.2026</time><p>МИД Литвы подтвердил наличие взрывного устройства и продолжающееся расследование происхождения и цели БПЛА.</p><Source id="lithuania"/></div><div><time>17.09.2026 — ретроспективное подтверждение</time><p>Замминистра обороны Польши сообщил, что 30 июля в стране упала российская крылатая ракета с боевой частью; он сослался на оценку оперативного командования о запланированном характере эпизода. Это не новое попадание 17 сентября.</p><Source id="poland"/></div><div><time>15.09.2026</time><p>Итальянские Eurofighter миссии НАТО нейтрализовали БПЛА, нарушивший воздушное пространство Литвы.</p><Source id="italy"/></div><div><time>14.09.2026</time><p>Российский фрегат выпустил две flares в направлении датского Fennec; одна прошла рядом с вертолётом.</p><Source id="denmark"/></div></div></section>
    <footer><div><p className="eyebrow">Правило интерпретации</p><p>Жёсткая риторика сама по себе не повышает уровень. Отсутствие публичных данных не является доказательством отсутствия события.</p></div><div><p className="eyebrow">Ежедневное обновление</p><p>Проверка выполняется в 09:00 МСК. Время и статус последней проверки обновляются ежедневно; уровень меняется только при существенных подтверждённых фактах.</p></div></footer>
    {emailOpen&&<div className="modal-backdrop" role="presentation" onMouseDown={()=>setEmailOpen(false)}><section className="email-modal" role="dialog" aria-modal="true" aria-labelledby="email-title" onMouseDown={event=>event.stopPropagation()}><button className="modal-close" onClick={()=>setEmailOpen(false)} aria-label="Закрыть"><X/></button><div className="modal-icon"><MailPlus/></div><p className="eyebrow">Уведомления об изменении статуса</p><h2 id="email-title">Адреса получателей</h2><p className="modal-copy">Добавленный адрес подключается к рассылке об изменении оценки. Адреса не публикуются и не отображаются другим посетителям.</p><form onSubmit={addEmail}><label htmlFor="notification-email">Электронный адрес</label><div className="email-form"><input id="notification-email" value={emailInput} onChange={event=>{setEmailInput(event.target.value);setEmailError('')}} type="email" autoComplete="email" placeholder="name@example.com"/><button type="submit">Добавить</button></div>{emailError&&<p className="form-error" role="alert">{emailError}</p>}</form><div className="email-list">{emails.length===0?<p>Адреса пока не добавлены.</p>:emails.map(item=><div key={item.email}><span>{item.email}</span>{!item.token&&<small>Добавьте заново, чтобы подключить к рассылке.</small>}<button onClick={()=>removeEmail(item)} aria-label={`Удалить ${item.email}`}><X/>Удалить</button></div>)}</div><p className="local-note">Список виден только в этом браузере; сам адрес хранится защищённо для рассылки. Удаление отключает его от будущих уведомлений.</p></section></div>}
  </main>;
}
